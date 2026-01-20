"use client";

import type { ReactNode } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import type { AdminCategoryOption } from "@/lib/actions/categories";

import {
  buildAdminProductsHref,
  productStatusLabels,
  type ProductStatusFilter,
  DEFAULT_ADMIN_PRODUCTS_PAGE_SIZE,
} from "./products-url";

function Select({
  name,
  defaultValue,
  children,
  className,
  ariaLabel,
}: {
  name: string;
  defaultValue?: string;
  children: ReactNode;
  className?: string;
  ariaLabel: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      aria-label={ariaLabel}
      className={
        className ??
        "h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      {children}
    </select>
  );
}

export function ProductsFilters({
  q,
  categoryId,
  status,
  pageSize,
  categories,
}: {
  q: string;
  categoryId?: string;
  status?: ProductStatusFilter;
  pageSize: number;
  categories: AdminCategoryOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const hasActiveFilters = Boolean(q || categoryId || status);

  const submit = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const nextQ = String(formData.get("q") || "").trim();
    const nextCategoryId = String(formData.get("categoryId") || "").trim();
    const nextStatus = String(formData.get("status") || "").trim();
    const nextPageSize = Number.parseInt(
      String(formData.get("pageSize") || ""),
      10
    );

    const normalizedStatus =
      nextStatus && nextStatus in productStatusLabels
        ? (nextStatus as ProductStatusFilter)
        : undefined;

    const nextHref = buildAdminProductsHref({
      q: nextQ || undefined,
      categoryId: nextCategoryId || undefined,
      status: normalizedStatus,
      pageSize: Number.isFinite(nextPageSize) ? nextPageSize : pageSize,
    });

    startTransition(() => {
      router.push(nextHref);
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form
          className="flex flex-col gap-3 lg:flex-row lg:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            submit(e.currentTarget);
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="搜索商品名称/URL标识…"
              className="pl-9 pr-9"
              aria-label="搜索商品"
            />
            {q ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() =>
                  router.push(
                    buildAdminProductsHref({ categoryId, status, pageSize })
                  )
                }
                aria-label="清空搜索"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Select
              name="categoryId"
              defaultValue={categoryId ?? ""}
              ariaLabel="按分类筛选"
            >
              <option value="">全部分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>

            <Select
              name="status"
              defaultValue={status ?? ""}
              ariaLabel="按状态筛选"
            >
              <option value="">全部状态</option>
              {Object.entries(productStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>

            <Select
              name="pageSize"
              defaultValue={String(pageSize)}
              ariaLabel="每页条数"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={String(size)}>
                  {size}/页
                </option>
              ))}
            </Select>

            <Button type="submit" disabled={isPending}>
              应用筛选
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
              disabled={isPending || !hasActiveFilters}
            >
              重置
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
