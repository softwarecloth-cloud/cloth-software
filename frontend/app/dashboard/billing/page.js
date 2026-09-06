import { Suspense } from "react";
import BillingView from "../components/BillingView";

export const metadata = { title: "New bill · Cloth Shop" };

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingView />
    </Suspense>
  );
}
