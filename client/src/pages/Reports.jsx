// client/src/pages/Reports.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Form, Button, Card, Alert, Spinner, Table } from 'react-bootstrap';
import { format } from 'date-fns';

const Reports = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [reportType, setReportType] = useState('daily'); // daily, monthly, custom
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        try {
            let url = 'http://localhost:5000/api/expenses/reports';
            let params = {};

            if (reportType === 'daily') {
                url += `/daily/${format(startDate, 'yyyy-MM-dd')}`;
            } else if (reportType === 'monthly') {
                url += `/monthly/${format(startDate, 'yyyy-MM')}`;
            } else { // custom
                params = {
                    startDate: format(startDate, 'yyyy-MM-dd'),
                    endDate: format(endDate, 'yyyy-MM-dd'),
                };
            }

            const res = await axios.get(url, { params });
            setReportData(res.data);
        } catch (err) {
            console.error('Error fetching report:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to fetch report.');
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [reportType, startDate, endDate]); // Re-fetch on type or date change

    const renderReportContent = () => {
        if (!reportData) return null;

        if (reportType === 'daily') {
            return (
                <div>
                    <h3 className="h5 mb-3">Total Spent: ${reportData.totalDailySpend?.toFixed(2) || '0.00'}</h3>
                    {reportData.dailyExpenses?.length === 0 ? (
                        <p className="text-muted">No expenses for this day.</p>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th>Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.dailyExpenses.map((group) => (
                                    <tr key={group._id}>
                                        <td>{group.categoryName}</td>
                                        <td>{group.categoryType}</td>
                                        <td>${group.totalAmount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            );
        } else if (reportType === 'monthly') {
            return (
                <div>
                    <h3 className="h5 mb-3">Total Spent: ${reportData.totalMonthlySpend?.toFixed(2) || '0.00'}</h3>
                    {reportData.monthlyExpenses?.length === 0 ? (
                        <p className="text-muted">No expenses for this month.</p>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th>Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.monthlyExpenses.map((group) => (
                                    <tr key={group._id}>
                                        <td>{group.categoryName}</td>
                                        <td>{group.categoryType}</td>
                                        <td>${group.totalAmount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            );
        } else { // custom
            return (
                <div>
                    <h3 className="h5 mb-3">Total Spent: ${reportData.totalCustomSpend?.toFixed(2) || '0.00'}</h3>
                    {reportData.customExpenses?.length === 0 ? (
                        <p className="text-muted">No expenses for this period.</p>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Payment Method</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.customExpenses.map((expense) => (
                                    <tr key={expense._id}>
                                        <td>{format(new Date(expense.date), 'PPP')}</td>
                                        <td>{expense.categoryName} ({expense.type})</td>
                                        <td>{expense.description}</td>
                                        <td>${expense.amount.toFixed(2)}</td>
                                        <td>{expense.paymentMethod}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            );
        }
    };

    return (
        <Card className="mx-auto mt-5 p-4" style={{ maxWidth: '70rem' }}>
            <h1 className="text-center mb-4">Expense Reports</h1>

            <Form className="mb-4">
                <Form.Group className="mb-3">
                    <Form.Label>Select Report Type:</Form.Label>
                    <Form.Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                        <option value="daily">Daily Report</option>
                        <option value="monthly">Monthly Report</option>
                        <option value="custom">Custom Range Report</option>
                    </Form.Select>
                </Form.Group>

                {reportType === 'daily' && (
                    <Form.Group className="mb-3">
                        <Form.Label>Select Date:</Form.Label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            dateFormat="PPP"
                            className="form-control"
                        />
                    </Form.Group>
                )}

                {reportType === 'monthly' && (
                    <Form.Group className="mb-3">
                        <Form.Label>Select Month:</Form.Label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            dateFormat="MM/yyyy"
                            showMonthYearPicker
                            className="form-control"
                        />
                    </Form.Group>
                )}

                {reportType === 'custom' && (
                    <div className="row">
                        <Form.Group className="col-md-6 mb-3">
                            <Form.Label>Start Date:</Form.Label>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                dateFormat="PPP"
                                className="form-control"
                            />
                        </Form.Group>
                        <Form.Group className="col-md-6 mb-3">
                            <Form.Label>End Date:</Form.Label>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                dateFormat="PPP"
                                className="form-control"
                            />
                        </Form.Group>
                    </div>
                )}
            </Form>

            {loading ? (
                <div className="text-center mt-4"><Spinner animation="border" /> <p>Generating report...</p></div>
            ) : error ? (
                <Alert variant="danger" className="mt-4">{error}</Alert>
            ) : (
                <div className="mt-4">
                    {renderReportContent()}
                </div>
            )}
        </Card>
    );
};

export default Reports;