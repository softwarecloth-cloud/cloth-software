import { Suspense } from "react";
import ForgotPasswordForm from "@/app/components/auth/ForgotPasswordForm";
import { RedirectIfAuthed } from "@/app/shared/AuthGuard";
import { SHOP } from "@/app/shared/shop";

export const metadata = {
  title: `Forgot password · ${SHOP.name}`,
};

export default function ForgotPasswordPage() {
  return (
    <RedirectIfAuthed>
      <Suspense fallback={null}>
        <ForgotPasswordForm />
      </Suspense>
    </RedirectIfAuthed>
  );
}
