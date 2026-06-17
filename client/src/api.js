const BASE_URL = "http://localhost:3001/api";

async function login(email, password) {
  const response = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    body: JSON.stringify({
      email: email,
      password: password,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  let body = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (response.ok) {
    return body;
  }

  if (response.status == 401) {
    const error = body?.error?.message || "Invalid credentials";
    console.log(error);
    throw new Error(error);
  }

  throw new Error("Login failed");
}

async function logout() {
  const response = await fetch(`${BASE_URL}/sessions/current`, {
    method: "DELETE",
    credentials: "include",
  });

  if (response.ok) {
    return true;
  } else {
    throw new Error("Logout failed");
  }
}

async function getCurrentSession() {
  const response = await fetch(`${BASE_URL}/sessions/current`, {
    credentials: "include",
  });
  if (response.ok) {
    return await response.json();
  } else {
    return null;
  }
}

export { login, logout, getCurrentSession };
