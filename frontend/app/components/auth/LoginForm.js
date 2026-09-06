"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/AuthContext/AuthContext";
import AuthCard from "@/app/shared/AuthCard";
import { Field, PasswordField } from "@/app/shared/Field";
import Button from "@/app/shared/Button";
import Notice from "@/app/shared/Notice";
import { validate } from "@/app/shared/validation";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/dashboard";

  const [values, setValues] = useState({ email: "", password: "" });
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
    const nextErrors = validate(["email", "password"], values);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    const result = await login({
      email: values.email.trim(),
      password: values.password,
    });
    setSubmitting(false);

    if (result.success) {
      router.replace(redirectTo);
    } else {
      // Generic message straight from the API — never leaks which field failed.
      setFormError(result.message || "Invalid email or password");
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account to continue."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-neutral-900 underline dark:text-neutral-100"
          >
            Create one
          </Link>
        </>
      }
    >
      <Notice type="error">{formError}</Notice>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={onChange}
          error={errors.email}
        />

        <div>
          <PasswordField
            label="Password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={values.password}
            onChange={onChange}
            error={errors.password}
          />
          <div className="mt-1.5 text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" loading={submitting}>
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}
