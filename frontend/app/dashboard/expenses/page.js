import ExpensesView from "../components/ExpensesView";
import { SHOP } from "@/app/shared/shop";

export const metadata = { title: `Expenses · ${SHOP.name}` };

export default function ExpensesPage() {
  return <ExpensesView />;
}
