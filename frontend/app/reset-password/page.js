import { Suspense } from "react";
import ResetPasswordForm from "@/app/components/auth/ResetPasswordForm";
import { RedirectIfAuthed } from "@/app/shared/AuthGuard";
import { SHOP } from "@/app/shared/shop";

export const metadata = {
  title: `Reset password · ${SHOP.name}`,
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
