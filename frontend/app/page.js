import { Suspense } from "react";
import LoginForm from "@/app/components/auth/LoginForm";
import { RedirectIfAuthed } from "@/app/shared/AuthGuard";
import { SHOP } from "@/app/shared/shop";

export const metadata = {
  title: `Sign in · ${SHOP.name}`,
};

export default function Home() {
  return (
    <RedirectIfAuthed>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </RedirectIfAuthed>
  );
}
