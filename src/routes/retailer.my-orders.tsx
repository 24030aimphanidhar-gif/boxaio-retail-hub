import { createFileRoute } from "@tanstack/react-router";
import { PurchaseOrders } from "@/features/wholesale/pages/PurchaseOrders";
export const Route = createFileRoute("/retailer/my-orders")({ component: PurchaseOrders });
