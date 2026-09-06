import { Suspense } from "react";
import LoginForm from "@/app/components/auth/LoginForm";
import { RedirectIfAuthed } from "@/app/shared/AuthGuard";

export const metadata = {
  title: "Sign in · Cloth Software",
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
