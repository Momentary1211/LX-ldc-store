import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { AdminCustomerListItem } from "@/lib/actions/admin-customers";

import { CustomersFilters } from "./customers-filters";
import { CustomersPagination } from "./customers-pagination";
import { CustomersTable } from "./customers-table";

export function CustomersClient({
  items,
  total,
  page,
  pageSize,
  totalPages,
  q,
}: {
  items: AdminCustomerListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  q: string;
}) {
  const hasActiveFilters = Boolean(q);
  const startRank = (page - 1) * pageSize + 1;

  return (
    <div className="space-y-4">
      <CustomersFilters q={q} pageSize={pageSize} />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          共 {total} 条 · 第 {page}/{totalPages} 页
        </span>
        {hasActiveFilters ? <span className="text-xs">已启用筛选条件</span> : null}
      </div>

      {items.length > 0 ? (
        <CustomersTable key={`${page}:${pageSize}:${q}`} items={items} startRank={startRank} />
      ) : (
        <div className="rounded-lg border py-12 text-center text-sm text-muted-foreground">
          <p>{hasActiveFilters ? "没有匹配的顾客" : "暂无顾客数据"}</p>
          {hasActiveFilters ? (
            <div className="mt-3">
              <Button asChild variant="outline">
                <Link href="/admin/customers">清除筛选</Link>
              </Button>
            </div>
          ) : null}
        </div>
      )}

      <CustomersPagination q={q} page={page} totalPages={totalPages} pageSize={pageSize} />
    </div>
  );
}

