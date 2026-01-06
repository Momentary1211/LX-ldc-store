"use server";

import {
  db,
  cards,
  orders,
  type Order,
  type OrderStatus,
  type PaymentMethod,
} from "@/lib/db";
import { requireAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { and, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";

export interface AdminOrdersFilters {
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  query?: string;
}

export interface AdminOrderListItem {
  id: string;
  orderNo: string;
  productName: string;
  quantity: number;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  email: string | null;
  username: string | null;
  userId: string | null;
  status: OrderStatus;
  tradeNo: string | null;
  refundReason: string | null;
  createdAt: string;
}

export interface AdminOrdersStats {
  pending: number;
  completed: number;
  refund_pending: number;
}

export interface AdminOrdersPageResult {
  items: AdminOrderListItem[];
  total: number;
  stats: AdminOrdersStats;
}

export interface DeleteAdminOrdersResult {
  success: boolean;
  message: string;
  deletedCount?: number;
  skippedCount?: number;
  skippedIds?: string[];
}

type AdminOrdersRow = Pick<
  Order,
  | "id"
  | "orderNo"
  | "productName"
  | "quantity"
  | "totalAmount"
  | "paymentMethod"
  | "email"
  | "username"
  | "userId"
  | "status"
  | "tradeNo"
  | "refundReason"
  | "createdAt"
>;

function toIsoString(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function buildAdminOrdersWhere(filters: AdminOrdersFilters) {
  const conditions: Array<SQL | undefined> = [];

  if (filters.status) {
    conditions.push(eq(orders.status, filters.status));
  }

  if (filters.paymentMethod) {
    conditions.push(eq(orders.paymentMethod, filters.paymentMethod));
  }

  const q = filters.query?.trim();
  if (q) {
    const pattern = `%${q}%`;
    // 为什么这样做：后台查单通常需要“一次输入，覆盖多个字段”，减少管理员反复切换筛选器的成本。
    conditions.push(
      or(
        ilike(orders.orderNo, pattern),
        ilike(orders.email, pattern),
        ilike(orders.username, pattern),
        ilike(orders.userId, pattern),
        ilike(orders.tradeNo, pattern),
        ilike(orders.productName, pattern)
      )
    );
  }

  const normalized = conditions.filter((condition): condition is SQL =>
    Boolean(condition)
  );
  if (normalized.length === 0) return undefined;
  return and(...normalized);
}

function serializeAdminOrdersRow(row: AdminOrdersRow): AdminOrderListItem {
  return {
    id: row.id,
    orderNo: row.orderNo,
    productName: row.productName,
    quantity: row.quantity,
    totalAmount: row.totalAmount,
    paymentMethod: row.paymentMethod,
    email: row.email ?? null,
    username: row.username ?? null,
    userId: row.userId ?? null,
    status: row.status,
    tradeNo: row.tradeNo ?? null,
    refundReason: row.refundReason ?? null,
    createdAt: toIsoString(row.createdAt) ?? "",
  };
}

function pickStatsFromGroupedCounts(
  grouped: Array<{ status: OrderStatus; count: number }>
): AdminOrdersStats {
  const map = new Map<OrderStatus, number>(
    grouped.map((row) => [row.status, row.count])
  );
  return {
    pending: map.get("pending") ?? 0,
    completed: map.get("completed") ?? 0,
    refund_pending: map.get("refund_pending") ?? 0,
  };
}

export async function getAdminOrdersPage(input: {
  page: number;
  pageSize: number;
  filters?: AdminOrdersFilters;
}): Promise<AdminOrdersPageResult> {
  await requireAdmin();

  const page = Math.max(1, Math.floor(input.page || 1));
  const pageSize = Math.min(200, Math.max(1, Math.floor(input.pageSize || 20)));
  const offset = (page - 1) * pageSize;

  const where = buildAdminOrdersWhere(input.filters ?? {});

  const [items, totalRow, groupedCounts] = await Promise.all([
    db.query.orders.findMany({
      columns: {
        id: true,
        orderNo: true,
        productName: true,
        quantity: true,
        totalAmount: true,
        paymentMethod: true,
        email: true,
        username: true,
        userId: true,
        status: true,
        tradeNo: true,
        refundReason: true,
        createdAt: true,
      },
      where,
      orderBy: (o, { desc }) => [desc(o.createdAt)],
      limit: pageSize,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(where)
      .then((rows) => rows[0]),
    db
      .select({
        status: orders.status,
        count: sql<number>`count(*)::int`,
      })
      .from(orders)
      .where(where)
      .groupBy(orders.status),
  ]);

  const total = totalRow?.count ?? 0;
  const stats = pickStatsFromGroupedCounts(groupedCounts);

  return {
    items: items.map(serializeAdminOrdersRow),
    total,
    stats,
  };
}

function isDeletableOrderStatus(status: OrderStatus): boolean {
  // 为什么这样做：已支付/已完成订单涉及资金与履约记录，删除会破坏审计链路；仅允许删除未支付/已过期的“可回收”订单。
  return status === "pending" || status === "expired";
}

export async function deleteAdminOrders(orderIds: string[]): Promise<DeleteAdminOrdersResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "需要管理员权限" };
  }

  const uniqueIds = Array.from(new Set(orderIds.map((id) => id.trim()).filter(Boolean)));
  if (uniqueIds.length === 0) {
    return { success: false, message: "未选择任何订单" };
  }

  if (uniqueIds.length > 200) {
    return { success: false, message: "单次最多删除 200 笔订单" };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const found = await tx
        .select({ id: orders.id, status: orders.status })
        .from(orders)
        .where(inArray(orders.id, uniqueIds));

      const deletableIds = found
        .filter((row) => isDeletableOrderStatus(row.status))
        .map((row) => row.id);

      const skippedIds = found
        .filter((row) => !isDeletableOrderStatus(row.status))
        .map((row) => row.id);

      if (deletableIds.length === 0) {
        return {
          deletedCount: 0,
          skippedIds,
        };
      }

      // 释放未支付订单占用的卡密，避免删除后库存被“锁死”
      await tx
        .update(cards)
        .set({
          status: "available",
          orderId: null,
          lockedAt: null,
        })
        .where(and(eq(cards.status, "locked"), inArray(cards.orderId, deletableIds)));

      const deleted = await tx
        .delete(orders)
        .where(inArray(orders.id, deletableIds))
        .returning({ id: orders.id });

      return {
        deletedCount: deleted.length,
        skippedIds,
      };
    });

    // 动态页通常无需 revalidate，但保留可兼容未来改为缓存页面的场景
    revalidatePath("/admin/orders");

    const skippedCount = result.skippedIds.length;
    const deletedCount = result.deletedCount;

    if (deletedCount === 0 && skippedCount > 0) {
      return {
        success: false,
        message: `所选订单均不可删除（已支付/已完成/退款相关等状态将被保护）`,
        deletedCount,
        skippedCount,
        skippedIds: result.skippedIds,
      };
    }

    return {
      success: true,
      message:
        skippedCount > 0
          ? `已删除 ${deletedCount} 笔订单（跳过 ${skippedCount} 笔不可删除订单）`
          : `已删除 ${deletedCount} 笔订单`,
      deletedCount,
      skippedCount,
      skippedIds: result.skippedIds,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "删除订单失败，请稍后重试",
    };
  }
}
