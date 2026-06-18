import { Button } from "react-bootstrap";
import { Link } from "react-router";

export default function LoginButton({ text }) {
  return (
    <Button as={Link} to="/login" variant="primary">
      {text}
    </Button>
  );
}
