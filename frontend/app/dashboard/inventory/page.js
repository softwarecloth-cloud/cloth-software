import InventoryView from "../components/InventoryView";
import { SHOP } from "@/app/shared/shop";

export const metadata = { title: `Inventory · ${SHOP.name}` };

export default function InventoryPage() {
  return <InventoryView />;
}
