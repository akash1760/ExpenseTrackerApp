// client/src/pages/Register.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const result = await register(username, email, password);
        if (!result.success) {
            setMessage(result.message);
        }
    };

    return (
        <Card className="mx-auto mt-5" style={{ maxWidth: '28rem' }}>
            <Card.Body>
                <h2 className="text-center mb-4">Register</h2>
                {message && <Alert variant="danger">{message}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBasicUsername">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </Form.Group>

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

                    <Button variant="success" type="submit" className="w-100">
                        Register
                    </Button>
                </Form>
                <div className="text-center mt-3">
                    <Link to="/login">Already have an account? Login</Link>
                </div>
            </Card.Body>
        </Card>
    );
};

export default Register;