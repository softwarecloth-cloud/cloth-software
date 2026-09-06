import { Suspense } from "react";
import InvoiceDetail from "../../components/InvoiceDetail";

export const metadata = { title: "Invoice · Cloth Shop" };

export default async function InvoicePage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <InvoiceDetail id={id} />
    </Suspense>
  );
}
