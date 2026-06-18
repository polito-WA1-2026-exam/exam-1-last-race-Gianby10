import { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router";
import { login } from "../api.js";
export default function LoginPage({ user, setUser }) {
  const navigate = useNavigate();
  if (user) {
    return <Navigate to="/" />;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errormsg, setErrormsg] = useState("");

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setErrormsg("");

    try {
      const loggedUser = await login(email, password);
      setUser(loggedUser);
      navigate("/game");
    } catch (ex) {
      setErrormsg(ex.message);
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
            onChange={(ev) => setEmail(ev.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Log in
        </Button>{" "}
        {errormsg && (
          <div class="alert alert-danger mt-3" role="alert">
            ERROR: {errormsg}
          </div>
        )}
      </Form>
    </Container>
  );
}
