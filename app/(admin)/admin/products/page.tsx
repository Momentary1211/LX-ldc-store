export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { getAdminProductsPage } from "@/lib/actions/products";
import { getAdminCategories } from "@/lib/actions/categories";

import { ProductsClient } from "./products-client";
import {
  parseProductsSearchParams,
  DEFAULT_ADMIN_PRODUCTS_PAGE_SIZE,
} from "./products-url";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { page, pageSize, q, categoryId, status } =
    parseProductsSearchParams(params);

  // 并行获取商品列表和分类列表
  const [productsResult, categories] = await Promise.all([
    getAdminProductsPage({
      page,
      pageSize,
      filters: {
        query: q || undefined,
        categoryId: categoryId || undefined,
        status,
      },
    }),
    getAdminCategories(),
  ]);

  const totalPages = Math.ceil(productsResult.total / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            商品管理
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            管理您的商品信息和库存
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            添加商品
          </Button>
        </Link>
      </div>

      {/* Products Client */}
      <ProductsClient
        items={productsResult.items}
        total={productsResult.total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        q={q}
        categoryId={categoryId}
        status={status}
        categories={categories}
      />
    </div>
  );
}
