import { Button } from "react-bootstrap";
import { logout } from "../api";
import { useNavigate } from "react-router";

export default function LogoutButton({ setUser }) {
  const navigate = useNavigate();
  const handleLogout = async (e) => {
    try {
      await logout();
      setUser(null);
      navigate("/");
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <Button variant="outline-light" onClick={handleLogout}>
      Logout
    </Button>
  );
}
