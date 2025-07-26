// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AddExpense from './pages/AddExpense.jsx';
import Reports from './pages/Reports.jsx';
import Categories from './pages/Categories.jsx';
import BusinessCredit from './pages/BusinessCredit.jsx';
import AppNavbar from './components/AppNavbar.jsx'; // Renamed from Navbar to AppNavbar to avoid conflict
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppNavbar /> {/* Use AppNavbar */}
        <div className="container mt-4"> {/* Bootstrap container with top margin */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add-expense" element={<AddExpense />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/business-credit" element={<BusinessCredit />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;