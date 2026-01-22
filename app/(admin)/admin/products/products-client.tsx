import Link from "next/link";
import { Package, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { AdminCategoryOption } from "@/lib/actions/categories";
import type { AdminProductListItem } from "@/lib/actions/products";

import { ProductsFilters } from "./products-filters";
import { ProductsPagination } from "./products-pagination";
import { ProductsTable } from "./products-table";
import type { ProductStatusFilter } from "./products-url";

export function ProductsClient({
  items,
  total,
  page,
  pageSize,
  totalPages,
  q,
  categoryId,
  status,
  categories,
}: {
  items: AdminProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  q: string;
  categoryId?: string;
  status?: ProductStatusFilter;
  categories: AdminCategoryOption[];
}) {
  const hasActiveFilters = Boolean(q || categoryId || status);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <ProductsFilters
        q={q}
        categoryId={categoryId}
        status={status}
        pageSize={pageSize}
        categories={categories}
      />

      {/* Info Bar */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          共 {total} 条 · 第 {page}/{totalPages || 1} 页
        </span>
        {hasActiveFilters ? (
          <span className="text-xs">已启用筛选条件</span>
        ) : null}
      </div>

      {/* Table or Empty State */}
      {items.length > 0 ? (
        <ProductsTable
          key={`${page}:${pageSize}:${q}:${categoryId ?? ""}:${status ?? ""}`}
          items={items}
        />
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-zinc-500">
                {hasActiveFilters ? "没有匹配的商品" : "暂无商品"}
              </p>
              {hasActiveFilters ? (
                <div className="mt-3">
                  <Button asChild variant="outline">
                    <Link href="/admin/products">清除筛选</Link>
                  </Button>
                </div>
              ) : (
                <Link href="/admin/products/new" className="mt-4 inline-block">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    添加第一个商品
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <ProductsPagination
          q={q}
          categoryId={categoryId}
          status={status}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
        />
      )}
    </div>
  );
}
