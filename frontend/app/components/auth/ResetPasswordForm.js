"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/AuthContext/AuthContext";
import AuthCard from "@/app/shared/AuthCard";
import { PasswordField } from "@/app/shared/Field";
import Button from "@/app/shared/Button";
import Notice from "@/app/shared/Notice";
import { validate } from "@/app/shared/validation";

export default function ResetPasswordForm() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const token = useSearchParams().get("token") || "";

  const [values, setValues] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((err) => ({ ...err, [name]: "" }));
    setFormError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(["password"], values);
    if (values.confirm !== values.password) {
      nextErrors.confirm = "Passwords do not match";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    const result = await resetPassword({ token, password: values.password });
    setSubmitting(false);

    if (result.success) {
      router.replace("/dashboard");
    } else {
      setFormError(result.message || "Could not reset your password");
    }
  };

  if (!token) {
    return (
      <AuthCard title="Reset your password">
        <Notice type="error">
          This reset link is missing its token. Please request a new one.
        </Notice>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-neutral-900 underline dark:text-neutral-100"
        >
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Enter a new password for your account."
      footer={
        <Link
          href="/"
          className="font-medium text-neutral-900 underline dark:text-neutral-100"
        >
          Back to sign in
        </Link>
      }
    >
      <Notice type="error">{formError}</Notice>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <PasswordField
          label="New password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={values.password}
          onChange={onChange}
          error={errors.password}
        />
        <PasswordField
          label="Confirm new password"
          name="confirm"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={values.confirm}
          onChange={onChange}
          error={errors.confirm}
        />
        <Button type="submit" loading={submitting}>
          Update password
        </Button>
      </form>
    </AuthCard>
  );
}
