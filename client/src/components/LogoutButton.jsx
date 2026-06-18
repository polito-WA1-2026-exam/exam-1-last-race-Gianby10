import { Button } from "react-bootstrap";
import { logout } from "../api";
import { useNavigate } from "react-router";

export default function LogoutButton({ user, setUser }) {
  const navigate = useNavigate();
  const handleLogout = async (e) => {
    try {
      if (user) {
        await logout();
        setUser(null);
        navigate("/");
      }
    } catch (e) {
      setUser(null);
      navigate("/");
      console.error("Cannot logout: ", e);
    }
  };
  return (
    <Button variant="outline-light" onClick={handleLogout}>
      Logout
    </Button>
  );
}
