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

  if (response.status === 401) {
    const error = body?.error?.message || "Invalid credentials";
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
  if (response.status === 401) {
    return null;
  }

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Cannot get current session");
  }
}

async function getLeaderboard() {
  const response = await fetch(`${BASE_URL}/leaderboard`, {
    credentials: "include",
  });
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Cannot load leaderboard");
  }
}

async function getFullNetwork() {
  const response = await fetch(`${BASE_URL}/network/complete`, {
    credentials: "include",
  });
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Cannot load network");
  }
}

async function getNetworkSegments() {
  const response = await fetch(`${BASE_URL}/network/segments`, {
    credentials: "include",
  });
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Cannot load network segments");
  }
}

async function startNewGame() {
  const response = await fetch(`${BASE_URL}/games/start`, {
    credentials: "include",
    method: "POST",
  });
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Cannot start new game");
  }
}

async function validateGame(gameId, segments) {
  const response = await fetch(`${BASE_URL}/games/${gameId}/validate`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({ segments: segments }),
  });
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Cannot validate game");
  }
}

export {
  login,
  logout,
  getCurrentSession,
  getLeaderboard,
  getFullNetwork,
  getNetworkSegments,
  startNewGame,
  validateGame,
};
