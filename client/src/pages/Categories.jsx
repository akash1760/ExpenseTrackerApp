// client/src/pages/Categories.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Card, Alert, Spinner, Table, Modal } from 'react-bootstrap';

const Categories = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState('personal'); // 'personal' or 'business'
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [editName, setEditName] = useState('');
    const [editType, setEditType] = useState('');

    const fetchCategories = async () => {
        setLoading(true);
        setError('');
        try {
            // CORRECTED: Added '/api' prefix
            const res = await axios.get('/api/categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Failed to fetch categories.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        if (!name) {
            setError('Category name is required.');
            return;
        }
        try {
            // CORRECTED: Added '/api' prefix
            await axios.post('/api/categories', { name, type });
            setMessage('Category added successfully!');
            setName('');
            setType('personal');
            fetchCategories(); // Refresh the list
        } catch (err) {
            console.error('Error adding category:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to add category.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            setMessage('');
            setError('');
            try {
                // CORRECTED: Added '/api' prefix
                await axios.delete(`/api/categories/${id}`);
                setMessage('Category deleted successfully!');
                fetchCategories(); // Refresh the list
            } catch (err) {
                console.error('Error deleting category:', err.response?.data?.message || err.message);
                setError(err.response?.data?.message || 'Failed to delete category.');
            }
        }
    };

    const handleEditClick = (category) => {
        setCurrentCategory(category);
        setEditName(category.name);
        setEditType(category.type);
        setShowEditModal(true);
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        if (!editName) {
            setError('Category name cannot be empty.');
            return;
        }
        try {
            // CORRECTED: Added '/api' prefix
            await axios.put(`/api/categories/${currentCategory._id}`, { name: editName, type: editType });
            setMessage('Category updated successfully!');
            setShowEditModal(false);
            fetchCategories(); // Refresh the list
        } catch (err) {
            console.error('Error updating category:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to update category.');
        }
    };

    return (
        <div className="row justify-content-center mt-5">
            <div className="col-md-6 mb-4">
                <Card className="p-4">
                    <h2 className="text-center mb-4">Add New Category</h2>
                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="categoryName">
                            <Form.Label>Category Name:</Form.Label>
                            <Form.Control
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Category Type:</Form.Label>
                            <div>
                                <Form.Check
                                    inline
                                    type="radio"
                                    label="Personal"
                                    name="categoryType"
                                    id="typePersonal"
                                    value="personal"
                                    checked={type === 'personal'}
                                    onChange={() => setType('personal')}
                                />
                                <Form.Check
                                    inline
                                    type="radio"
                                    label="Business"
                                    name="categoryType"
                                    id="typeBusiness"
                                    value="business"
                                    checked={type === 'business'}
                                    onChange={() => setType('business')}
                                />
                            </div>
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button variant="primary" type="submit">
                                Add Category
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>

            <div className="col-md-8">
                <Card className="p-4">
                    <h2 className="text-center mb-4">Existing Categories</h2>
                    {loading ? (
                        <div className="text-center"><Spinner animation="border" /> <p>Loading categories...</p></div>
                    ) : categories.length === 0 ? (
                        <p className="text-muted text-center">No categories added yet.</p>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat._id}>
                                        <td>{cat.name}</td>
                                        <td>{cat.type}</td>
                                        <td>
                                            <Button
                                                variant="info"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEditClick(cat)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(cat._id)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card>
            </div>

            {/* Edit Category Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleUpdateCategory}>
                        <Form.Group className="mb-3" controlId="editCategoryName">
                            <Form.Label>Category Name:</Form.Label>
                            <Form.Control
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Category Type:</Form.Label>
                            <div>
                                <Form.Check
                                    inline
                                    type="radio"
                                    label="Personal"
                                    name="editCategoryType"
                                    id="editTypePersonal"
                                    value="personal"
                                    checked={editType === 'personal'}
                                    onChange={() => setEditType('personal')}
                                />
                                <Form.Check
                                    inline
                                    type="radio"
                                    label="Business"
                                    name="editCategoryType"
                                    id="editTypeBusiness"
                                    value="business"
                                    checked={editType === 'business'}
                                    onChange={() => setEditType('business')}
                                />
                            </div>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Update Category
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Categories;