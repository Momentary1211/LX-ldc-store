import type { Metadata } from "next";
import { Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { getCustomersSpendLeaderboard } from "@/lib/actions/customers";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "顾客消费榜",
};

function formatAmount(value: string): string {
  const num = Number.parseFloat(value || "0");
  if (!Number.isFinite(num)) return "0.00";
  return num.toFixed(2);
}

export default async function CustomersLeaderboardPage() {
  const items = await getCustomersSpendLeaderboard({ limit: 50 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          顾客消费榜
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          统计口径：仅统计已完成订单
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5" />
            TOP 50
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">排名</TableHead>
                    <TableHead>顾客</TableHead>
                    <TableHead className="text-right">完成订单</TableHead>
                    <TableHead className="text-right">累计消费</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row, index) => {
                    const rank = index + 1;
                    const badgeVariant =
                      rank === 1 ? "default" : rank <= 3 ? "secondary" : "outline";

                    return (
                      <TableRow key={row.userId}>
                        <TableCell className="font-medium tabular-nums">
                          <div className="flex items-center gap-2">
                            <Badge variant={badgeVariant}>#{rank}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {row.username ? `@${row.username}` : "-"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.orderCount}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatAmount(row.totalSpent)} LDC
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-lg border py-12 text-center text-sm text-muted-foreground">
              暂无数据
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

