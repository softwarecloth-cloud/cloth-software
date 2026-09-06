import { Suspense } from "react";
import ForgotPasswordForm from "@/app/components/auth/ForgotPasswordForm";
import { RedirectIfAuthed } from "@/app/shared/AuthGuard";

export const metadata = {
  title: "Forgot password · Cloth Software",
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
