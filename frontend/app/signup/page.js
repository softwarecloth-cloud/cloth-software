import { Suspense } from "react";
import SignupForm from "@/app/components/auth/SignupForm";
import { RedirectIfAuthed } from "@/app/shared/AuthGuard";
import { SHOP } from "@/app/shared/shop";

export const metadata = {
  title: `Create account · ${SHOP.name}`,
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
