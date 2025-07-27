// client/src/pages/BusinessCredit.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Alert, Spinner, Table, Modal, Form } from 'react-bootstrap';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BusinessCredit = () => {
    const [businessCredits, setBusinessCredits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedCredit, setSelectedCredit] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [paymentDate, setPaymentDate] = useState(new Date());

    const fetchBusinessCredits = async () => {
        setLoading(true);
        setError('');
        try {
            // CORRECTED: Added '/api' prefix
            const res = await axios.get('/api/business-credits');
            setBusinessCredits(res.data);
            setMessage(''); // Clear any previous success message on re-fetch
        } catch (err) {
            console.error('Error fetching business credits:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to fetch business credits. Please ensure you are logged in and the server is running.');
            setBusinessCredits([]); // Clear previous data on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusinessCredits();
    }, []);

    const handlePayClick = (credit) => {
        setSelectedCredit(credit);
        setPaymentMethod('Cash'); // Reset to default
        setPaymentDate(new Date()); // Reset to current date
        setShowPayModal(true);
    };

    const handleConfirmPayment = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        if (!selectedCredit) return;

        try {
            // CORRECTED: Added '/api' prefix
            await axios.put(`/api/business-credits/pay/${selectedCredit._id}`, {
                paymentMethod,
                paymentDate
            });
            setMessage('Business credit marked as paid successfully!');
            setShowPayModal(false);
            fetchBusinessCredits(); // Refresh the list
        } catch (err) {
            console.error('Error marking business credit as paid:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to mark credit as paid. Please try again.');
        }
    };

    return (
        <Card className="mx-auto mt-5 p-4" style={{ maxWidth: '70rem' }}>
            <h1 className="text-center mb-4">Business Credit Management</h1>

            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center mt-4"><Spinner animation="border" /> <p>Loading business credits...</p></div>
            ) : businessCredits.length === 0 ? (
                <p className="text-muted text-center">No outstanding business credits.</p>
            ) : (
                <Table striped bordered hover responsive className="mt-4">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {businessCredits.map((credit) => (
                            <tr key={credit._id}>
                                <td>{format(new Date(credit.date), 'PPP')}</td>
                                <td>{credit.description || 'N/A'}</td>
                                <td>{credit.category?.name || 'Unknown'}</td>
                                <td>${credit.amount.toFixed(2)}</td>
                                <td>
                                    {credit.isBusinessCreditPaid ? (
                                        <span className="badge bg-success">Paid</span>
                                    ) : (
                                        <span className="badge bg-warning text-dark">Unpaid</span>
                                    )}
                                </td>
                                <td>
                                    {!credit.isBusinessCreditPaid && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handlePayClick(credit)}
                                        >
                                            Mark as Paid
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Pay Credit Modal */}
            <Modal show={showPayModal} onHide={() => setShowPayModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Mark Credit as Paid</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>} {/* Show modal specific error */}
                    {selectedCredit && (
                        <>
                            <p>Are you sure you want to mark the following credit as paid?</p>
                            <ul>
                                <li><strong>Amount:</strong> ${selectedCredit.amount?.toFixed(2)}</li>
                                <li><strong>Description:</strong> {selectedCredit.description || 'N/A'}</li>
                                <li><strong>Date:</strong> {format(new Date(selectedCredit.date), 'PPP')}</li>
                            </ul>
                            <Form onSubmit={handleConfirmPayment}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Payment Method:</Form.Label>
                                    <Form.Select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        required
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Card">Card</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Payment Date:</Form.Label>
                                    <DatePicker
                                        selected={paymentDate}
                                        onChange={(date) => setPaymentDate(date)}
                                        dateFormat="PPP"
                                        className="form-control"
                                    />
                                </Form.Group>
                                <Button variant="success" type="submit" className="w-100">
                                    Confirm Payment
                                </Button>
                            </Form>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </Card>
    );
};

export default BusinessCredit;