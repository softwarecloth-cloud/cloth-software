"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/AuthContext/AuthContext";
import AuthCard from "@/app/shared/AuthCard";
import { Field, PasswordField, SelectField } from "@/app/shared/Field";
import Button from "@/app/shared/Button";
import Notice from "@/app/shared/Notice";
import { validate } from "@/app/shared/validation";

const FIELDS = ["name", "email", "number", "gender", "password"];

export default function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();

  const [values, setValues] = useState({
    name: "",
    email: "",
    number: "",
    gender: "",
    password: "",
  });
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
    const nextErrors = validate(FIELDS, values);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    const result = await signup({
      name: values.name.trim(),
      email: values.email.trim(),
      number: values.number.trim(),
      gender: values.gender,
      password: values.password,
    });
    setSubmitting(false);

    if (result.success) {
      router.replace("/dashboard");
    } else {
      setFormError(result.message || "Could not create your account");
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="It only takes a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/"
            className="font-medium text-neutral-900 underline dark:text-neutral-100"
          >
            Sign in
          </Link>
        </>
      }
    >
      <Notice type="error">{formError}</Notice>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Jane Doe"
          value={values.name}
          onChange={onChange}
          error={errors.name}
        />
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
        <Field
          label="Phone number"
          name="number"
          type="tel"
          autoComplete="tel"
          placeholder="+1 555 123 4567"
          value={values.number}
          onChange={onChange}
          error={errors.number}
        />
        <SelectField
          label="Gender"
          name="gender"
          value={values.gender}
          onChange={onChange}
          error={errors.gender}
        >
          <option value="">Select…</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </SelectField>
        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={values.password}
          onChange={onChange}
          error={errors.password}
        />

        <Button type="submit" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
