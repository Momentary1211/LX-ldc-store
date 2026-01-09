export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getAdminCustomersPage } from "@/lib/actions/admin-customers";

import { CustomersClient } from "./customers-client";
import { buildAdminCustomersHref, DEFAULT_ADMIN_CUSTOMERS_PAGE_SIZE } from "./customers-url";

function normalizePage(value?: string): number {
  return Math.max(1, Number.parseInt(value || "1", 10) || 1);
}

function normalizePageSize(value?: string): number {
  const parsed = Number.parseInt(value || String(DEFAULT_ADMIN_CUSTOMERS_PAGE_SIZE), 10);
  const safe = Number.isFinite(parsed) ? parsed : DEFAULT_ADMIN_CUSTOMERS_PAGE_SIZE;
  return Math.min(200, Math.max(1, safe));
}

interface CustomersPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;

  const q = (params.q || "").trim();
  const page = normalizePage(params.page);
  const pageSize = normalizePageSize(params.pageSize);

  const result = await getAdminCustomersPage({
    page,
    pageSize,
    filters: { query: q || undefined },
  });

  const totalPages = Math.max(1, Math.ceil(result.total / pageSize));
  if (result.total > 0 && page > totalPages) {
    redirect(
      buildAdminCustomersHref({
        q: q || undefined,
        page: totalPages,
        pageSize,
      })
    );
  }

  const safePage = Math.min(page, totalPages);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            顾客管理
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            基于已完成订单汇总顾客消费数据
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5" />
            顾客列表 ({result.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CustomersClient
            items={result.items}
            total={result.total}
            page={safePage}
            pageSize={pageSize}
            totalPages={totalPages}
            q={q}
          />
        </CardContent>
      </Card>
    </div>
  );
}

