export const DEFAULT_ADMIN_CUSTOMERS_PAGE_SIZE = 20;

export function buildAdminCustomersHref(input: {
  q?: string;
  page?: number;
  pageSize?: number;
}): string {
  const params = new URLSearchParams();
  if (input.q) params.set("q", input.q);
  if (
    input.pageSize &&
    input.pageSize !== DEFAULT_ADMIN_CUSTOMERS_PAGE_SIZE
  ) {
    params.set("pageSize", String(input.pageSize));
  }
  if (input.page && input.page > 1) params.set("page", String(input.page));
  const queryString = params.toString();
  return queryString ? `/admin/customers?${queryString}` : "/admin/customers";
}

