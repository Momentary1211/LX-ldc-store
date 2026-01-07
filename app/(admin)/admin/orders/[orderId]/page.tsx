export const dynamic = "force-dynamic";

import { getAdminOrderDetail } from "@/lib/actions/admin-orders";

import { OrderDetailView } from "./order-detail-view";

interface AdminOrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { orderId } = await params;
  const result = await getAdminOrderDetail(orderId);
  return <OrderDetailView result={result} />;
}

