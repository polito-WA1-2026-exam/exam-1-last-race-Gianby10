import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { logout } from "../api";
import LoginButton from "./LoginButton";

function Header({ user, setUser }) {
  const handleLogout = async (e) => {
    try {
      if (user) {
        await logout();
        setUser(null);
      }
    } catch {}
  };

  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Last Race
        </Navbar.Brand>

        <Navbar.Toggle />

        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/">
              Rules
            </Nav.Link>

            <Nav.Link as={NavLink} to="/game">
              Play
            </Nav.Link>

            <Nav.Link as={NavLink} to="/leaderboard">
              Leaderboard
            </Nav.Link>
          </Nav>

          <Nav>
            {user ? (
              <Button variant="outline-light" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <LoginButton text="Login" />
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
