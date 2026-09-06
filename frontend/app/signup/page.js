import { Suspense } from "react";
import SignupForm from "@/app/components/auth/SignupForm";
import { RedirectIfAuthed } from "@/app/shared/AuthGuard";

export const metadata = {
  title: "Create account · Cloth Software",
};

export default function SignupPage() {
  return (
    <RedirectIfAuthed>
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </RedirectIfAuthed>
  );
}
