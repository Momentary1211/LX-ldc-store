export type ProductStatusFilter = "active" | "inactive" | "out_of_stock";

export const DEFAULT_ADMIN_PRODUCTS_PAGE_SIZE = 20;

export const productStatusLabels: Record<ProductStatusFilter, string> = {
  active: "上架中",
  inactive: "已下架",
  out_of_stock: "缺货",
};

export interface ProductsUrlParams {
  q?: string;
  categoryId?: string;
  status?: ProductStatusFilter;
  page?: number;
  pageSize?: number;
}

export interface ParsedProductsUrlParams {
  q: string;
  categoryId?: string;
  status?: ProductStatusFilter;
  page: number;
  pageSize: number;
}

export function buildAdminProductsHref(input: ProductsUrlParams): string {
  const params = new URLSearchParams();
  if (input.q) params.set("q", input.q);
  if (input.categoryId) params.set("categoryId", input.categoryId);
  if (input.status) params.set("status", input.status);
  if (input.pageSize && input.pageSize !== DEFAULT_ADMIN_PRODUCTS_PAGE_SIZE) {
    params.set("pageSize", String(input.pageSize));
  }
  if (input.page && input.page > 1) params.set("page", String(input.page));
  const queryString = params.toString();
  return queryString ? `/admin/products?${queryString}` : "/admin/products";
}

export function parseProductsSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): ParsedProductsUrlParams {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const categoryId =
    typeof searchParams.categoryId === "string" ? searchParams.categoryId : "";
  const statusRaw = typeof searchParams.status === "string" ? searchParams.status : "";
  const status =
    statusRaw in productStatusLabels ? (statusRaw as ProductStatusFilter) : undefined;
  const pageRaw = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const pageSizeRaw =
    typeof searchParams.pageSize === "string" ? parseInt(searchParams.pageSize, 10) : DEFAULT_ADMIN_PRODUCTS_PAGE_SIZE;
  const pageSize =
    Number.isFinite(pageSizeRaw) && pageSizeRaw > 0
      ? pageSizeRaw
      : DEFAULT_ADMIN_PRODUCTS_PAGE_SIZE;

  return {
    q,
    categoryId: categoryId || undefined,
    status,
    page,
    pageSize,
  };
}
