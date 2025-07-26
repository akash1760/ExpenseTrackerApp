// client/src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap'; // Import Bootstrap components

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const result = await login(email, password);
        if (!result.success) {
            setMessage(result.message);
        }
    };

    return (
        <Card className="mx-auto mt-5" style={{ maxWidth: '28rem' }}> {/* Bootstrap Card for styling */}
            <Card.Body>
                <h2 className="text-center mb-4">Login</h2>
                {message && <Alert variant="danger">{message}</Alert>} {/* Bootstrap Alert for messages */}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100"> {/* w-100 for full width */}
                        Sign In
                    </Button>
                </Form>
                <div className="text-center mt-3">
                    <Link to="/register">Don't have an account? Register</Link>
                </div>
            </Card.Body>
        </Card>
    );
};

export default Login;