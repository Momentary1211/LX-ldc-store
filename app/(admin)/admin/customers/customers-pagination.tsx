import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { buildAdminCustomersHref } from "./customers-url";

export function CustomersPagination({
  q,
  page,
  totalPages,
  pageSize,
}: {
  q: string;
  page: number;
  totalPages: number;
  pageSize: number;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      {page <= 1 ? (
        <Button variant="outline" disabled className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          上一页
        </Button>
      ) : (
        <Button asChild variant="outline" className="gap-2">
          <Link
            href={buildAdminCustomersHref({
              q: q || undefined,
              page: page - 1,
              pageSize,
            })}
          >
            <ArrowLeft className="h-4 w-4" />
            上一页
          </Link>
        </Button>
      )}

      {page >= totalPages ? (
        <Button variant="outline" disabled className="gap-2">
          下一页
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button asChild variant="outline" className="gap-2">
          <Link
            href={buildAdminCustomersHref({
              q: q || undefined,
              page: page + 1,
              pageSize,
            })}
          >
            下一页
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}

