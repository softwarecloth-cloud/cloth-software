import InvoicesView from "../components/InvoicesView";
import { SHOP } from "@/app/shared/shop";

export const metadata = { title: `Invoices · ${SHOP.name}` };

export default function InvoicesPage() {
  return <InvoicesView />;
}
