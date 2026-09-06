import { Suspense } from "react";
import ResetPasswordForm from "@/app/components/auth/ResetPasswordForm";
import { RedirectIfAuthed } from "@/app/shared/AuthGuard";

export const metadata = {
  title: "Reset password · Cloth Software",
};

export default function ResetPasswordPage() {
  return (
    <RedirectIfAuthed>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </RedirectIfAuthed>
  );
}
