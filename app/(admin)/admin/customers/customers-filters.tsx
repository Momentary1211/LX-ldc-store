"use client";

import type { ReactNode } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { buildAdminCustomersHref, DEFAULT_ADMIN_CUSTOMERS_PAGE_SIZE } from "./customers-url";

function Select({
  name,
  defaultValue,
  ariaLabel,
  children,
}: {
  name: string;
  defaultValue?: string;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      aria-label={ariaLabel}
      className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </select>
  );
}

function normalizePageSize(value: FormDataEntryValue | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.min(200, Math.max(1, Math.floor(parsed)));
}

export function CustomersFilters({
  q,
  pageSize,
}: {
  q: string;
  pageSize: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const hasActiveFilters = Boolean(q || pageSize !== DEFAULT_ADMIN_CUSTOMERS_PAGE_SIZE);

  const submit = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const nextQ = String(formData.get("q") || "").trim();
    const nextPageSize = normalizePageSize(formData.get("pageSize"));

    const nextHref = buildAdminCustomersHref({
      q: nextQ || undefined,
      pageSize: nextPageSize ?? pageSize,
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
              placeholder="搜索用户ID/用户名…"
              className="pl-9 pr-9"
              aria-label="搜索顾客"
            />
            {q ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => router.push(buildAdminCustomersHref({ pageSize }))}
                aria-label="清空搜索"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
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
              onClick={() => router.push("/admin/customers")}
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
