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
            let url = '/api/expenses/reports'; // Base URL for reports
            let params = {};

            if (reportType === 'daily') {
                url += `/daily/${format(startDate, 'yyyy-MM-dd')}`;
            } else if (reportType === 'monthly') {
                // Assuming you'll add a monthly report endpoint on backend later
                // For now, this might hit a 404 if not implemented
                url += `/monthly/${format(startDate, 'yyyy-MM')}`;
            } else { // custom
                url += '/summary'; // Using the existing summary endpoint for custom range
                params = {
                    startDate: format(startDate, 'yyyy-MM-dd'),
                    endDate: format(endDate, 'yyyy-MM-dd'),
                    // You might want to add groupBy: 'category' or 'type' for custom summary
                    groupBy: 'category' // Defaulting for custom range for now
                };
            }

            // CORRECTED: Added '/api' prefix to the base URL for reports
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
                                {reportData.dailyExpenses.map((group, index) => ( // Added index for key if _id not unique for group
                                    <tr key={group._id?.categoryId || index}>
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
            // This part assumes you will implement a specific monthly report endpoint
            // For now, it might show a generic message or error if backend route is not ready
            return (
                <div>
                    <h3 className="h5 mb-3">Monthly Report Summary</h3>
                    {reportData.report?.length === 0 ? ( // Assuming structure similar to summary
                        <p className="text-muted">No expenses for this month.</p>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Year-Month</th>
                                    <th>Type</th>
                                    <th>Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.report.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.year}-{item.month.toString().padStart(2, '0')}</td>
                                        <td>{item.type}</td>
                                        <td>${item.totalAmount.toFixed(2)}</td>
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
                    <h3 className="h5 mb-3">Total Spent: ${reportData.totalOverallSpend?.toFixed(2) || '0.00'}</h3>
                    {reportData.report?.length === 0 ? ( // Assuming structure similar to summary
                        <p className="text-muted">No expenses for this period.</p>
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
                                {reportData.report.map((item, index) => (
                                    <tr key={item.categoryId || index}>
                                        <td>{item.categoryName}</td>
                                        <td>{item.categoryType}</td>
                                        <td>${item.totalAmount.toFixed(2)}</td>
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