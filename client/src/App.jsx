import { Routes, Route, Outlet } from "react-router";
import Header from "./components/Header";
import { getCurrentSession } from "./api.js";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import GamePage from "./pages/GamePage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import { Spinner } from "react-bootstrap";

function MainLayout({ user, setUser }) {
  return (
    <>
      <Header user={user} setUser={setUser} />
      <main className="container mt-4">
        <Outlet />
      </main>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  useEffect(() => {
    getCurrentSession()
      .then((res) => {
        if (res) {
          setUser({ id: res.id, email: res.email, name: res.name });
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setIsAuthLoading(false));
  }, []);

  if (isAuthLoading) {
    return (
      <div className="d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<MainLayout user={user} setUser={setUser} />}>
        <Route index element={<HomePage user={user} />} />
        <Route
          path="/login"
          element={<LoginPage user={user} setUser={setUser} />}
        />

        <Route path="/game" element={<GamePage user={user} />} />
        <Route path="/leaderboard" element={<LeaderboardPage user={user} />} />
      </Route>
    </Routes>
  );
}

export default App;
