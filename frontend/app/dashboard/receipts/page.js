import ReceiptsView from "../components/ReceiptsView";
import { SHOP } from "@/app/shared/shop";

export const metadata = { title: `Cloth received · ${SHOP.name}` };

export default function ReceiptsPage() {
  return <ReceiptsView />;
}
