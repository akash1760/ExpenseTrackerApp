// client/src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Card, Button, ListGroup, Spinner, Alert } from 'react-bootstrap';

const Dashboard = () => {
  const [dailyReport, setDailyReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchDailyReport = useCallback(async (date) => {
    setLoading(true);
    setError('');
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const res = await axios.get(
        `http://172.20.10.4:5000/api/expenses/reports/daily/${formattedDate}`
      );
      setDailyReport(res.data);
    } catch (err) {
      console.error('Error fetching daily report:', err);
      setError('Failed to fetch daily report.');
      setDailyReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyReport(currentDate);
  }, [currentDate, fetchDailyReport]);

  const handleDateChange = (days) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" /> <p>Loading daily report...</p>
      </div>
    );

  if (error)
    return (
      <Alert variant="danger" className="mt-5 text-center">
        {error}
      </Alert>
    );

  return (
    <div className="container-fluid py-4">
      <h1 className="text-center mb-4">Dashboard</h1>

      {/* Sticky date navigation */}
      <div
        className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light shadow-sm"
        style={{ position: 'sticky', top: 0, zIndex: 1020 }}
      >
        <Button variant="primary" onClick={() => handleDateChange(-1)}>
          &larr; Previous Day
        </Button>
        <h2 className="h5 mb-0">
          Report for: {format(currentDate, 'PPP')}
        </h2>
        <Button variant="primary" onClick={() => handleDateChange(1)}>
          Next Day &rarr;
        </Button>
      </div>

      {dailyReport && (
        <>
          <h3 className="h5 mb-3 text-center">
            Total Spent Today: ${dailyReport.totalDailySpend.toFixed(2)}
          </h3>

          {dailyReport.dailyExpenses.length === 0 ? (
            <p className="text-muted text-center">
              No expenses recorded for this day.
            </p>
          ) : (
            <div className="row justify-content-center">
              {dailyReport.dailyExpenses.map((catGroup, index) => (
                <div key={index} className="col-md-6 col-lg-4 mb-4">
                  <Card className="shadow-sm h-100">
                    <Card.Header className="h6 text-capitalize">
                      {catGroup.categoryName} ({catGroup.categoryType}) – Total: $
                      {catGroup.totalAmount.toFixed(2)}
                    </Card.Header>
                    <ListGroup variant="flush">
                      {catGroup.expenses.map((exp) => (
                        <ListGroup.Item key={exp._id}>
                          ${exp.amount.toFixed(2)} – {exp.description} (Paid via{' '}
                          {exp.paymentMethod})
                          {exp.type === 'business' && !exp.isBusinessCreditPaid && (
                            <span className="ms-2 badge bg-warning text-dark">
                              Business Credit – Unpaid
                            </span>
                          )}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Footer buttons */}
      <div className="text-center mt-4">
        <Button as={Link} to="/add-expense" variant="success" className="me-3">
          Add New Expense
        </Button>
        <Button as={Link} to="/reports" variant="info">
          View Detailed Reports
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
