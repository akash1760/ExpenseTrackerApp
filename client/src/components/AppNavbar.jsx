// client/src/components/AppNavbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

const AppNavbar = () => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <Navbar bg="primary" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/dashboard">Expense Tracker</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto"> {/* ms-auto pushes items to the right */}
                        {isAuthenticated ? (
                            <>
                                <Nav.Link as={Link} to="/add-expense">Add Expense</Nav.Link>
                                <Nav.Link as={Link} to="/reports">Reports</Nav.Link>
                                <Nav.Link as={Link} to="/categories">Categories</Nav.Link>
                                <Nav.Link as={Link} to="/business-credit">Business Credit</Nav.Link>
                                <Navbar.Text className="mx-2">
                                    Logged in as: {user?.username}
                                </Navbar.Text>
                                <Button variant="outline-light" onClick={logout}>Logout</Button>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                <Nav.Link as={Link} to="/register">Register</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;