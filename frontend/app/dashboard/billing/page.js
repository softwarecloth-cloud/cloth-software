import { Suspense } from "react";
import BillingView from "../components/BillingView";
import { SHOP } from "@/app/shared/shop";

export const metadata = { title: `New bill · ${SHOP.name}` };

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingView />
    </Suspense>
  );
}
