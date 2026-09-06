import { Suspense } from "react";
import InvoiceDetail from "../../components/InvoiceDetail";
import { SHOP } from "@/app/shared/shop";

export const metadata = { title: `Invoice · ${SHOP.name}` };

export default async function InvoicePage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <InvoiceDetail id={id} />
    </Suspense>
  );
}
