import OverviewDashboard from "./components/OverviewDashboard";
import { SHOP } from "@/app/shared/shop";

export const metadata = {
  title: `Overview · ${SHOP.name}`,
};

export default function DashboardPage() {
  return <OverviewDashboard />;
}
