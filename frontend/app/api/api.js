// Tiny fetch wrapper with an axios-ish surface (`api.get`, `api.post`, …) so the
// rest of the app doesn't care about the transport.
//
// Security notes:
//  - `credentials: "include"` sends/receives the httpOnly auth cookie. The token
//    is never read or stored by JavaScript, so it can't be exfiltrated by XSS.
//  - Nothing here touches localStorage/sessionStorage for auth.

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    const err = new Error(
      "Network error — please check your connection and that the server is running."
    );
    err.response = { data: { message: err.message } };
    throw err;
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const err = new Error(
      (data && data.message) || `Request failed (${res.status})`
    );
    // Mirror the axios error shape the rest of the code expects.
    err.response = { status: res.status, data: data || {} };
    throw err;
  }

  return { data, status: res.status };
}

const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};

export default api;
