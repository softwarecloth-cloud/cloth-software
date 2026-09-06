import { RequireAuth } from "@/app/shared/AuthGuard";
import DashboardShell from "./components/DashboardShell";

export default function DashboardLayout({ children }) {
  return (
    <RequireAuth>
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  );
}
