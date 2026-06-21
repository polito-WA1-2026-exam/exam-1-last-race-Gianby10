import { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router";
import { login } from "../api.js";
export default function LoginPage({ user, setUser }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" />;
  }
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const loggedUser = await login(email, password);
      setUser(loggedUser);
      navigate("/game");
    } catch (ex) {
      setError(ex.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <h2>Login to continue</h2>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            required
            onChange={(ev) => setEmail(ev.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          Log in
        </Button>
        {error && (
          <Alert className="mt-3" variant="danger">
            {error}
          </Alert>
        )}
      </Form>
    </Container>
  );
}
