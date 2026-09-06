// Shared client-side validators. The backend re-validates everything — these
// only exist to give fast, friendly feedback before a request goes out.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;

export const validators = {
  name: (v) =>
    !v?.trim()
      ? "Name is required"
      : v.trim().length < 2
        ? "Name must be at least 2 characters"
        : "",
  email: (v) =>
    !v?.trim()
      ? "Email is required"
      : !EMAIL_REGEX.test(v.trim())
        ? "Enter a valid email address"
        : "",
  password: (v) =>
    !v
      ? "Password is required"
      : v.length < 6
        ? "Password must be at least 6 characters"
        : "",
  number: (v) =>
    !v?.trim()
      ? "Phone number is required"
      : !PHONE_REGEX.test(v.trim())
        ? "Enter a valid phone number"
        : "",
  gender: (v) => (!v ? "Please select a gender" : ""),
};

/** Runs the named validators over `values`, returns an { field: message } map. */
export function validate(fields, values) {
  const errors = {};
  for (const field of fields) {
    const message = validators[field]?.(values[field]);
    if (message) errors[field] = message;
  }
  return errors;
}
