// // client/src/pages/AddExpense.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { useNavigate, Link } from 'react-router-dom';
// import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';

// const AddExpense = () => {
//     const navigate = useNavigate();
//     const [amount, setAmount] = useState('');
//     const [description, setDescription] = useState('');
//     const [category, setCategory] = useState('');
//     const [type, setType] = useState('personal'); // 'personal' or 'business'
//     const [date, setDate] = useState(new Date());
//     const [paymentMethod, setPaymentMethod] = useState('Cash');
//     const [isBusinessCreditPaid, setIsBusinessCreditPaid] = useState(true); // Default to paid
//     const [categories, setCategories] = useState([]);
//     const [loadingCategories, setLoadingCategories] = useState(true);
//     const [message, setMessage] = useState('');
//     const [error, setError] = useState('');

//     useEffect(() => {
//         const fetchCategories = async () => {
//             setLoadingCategories(true);
//             try {
//                 const res = await axios.get('/api/categories');
//                 setCategories(res.data);
//             } catch (err) {
//                 console.error('Error fetching categories:', err);
//                 setError('Failed to load categories.');
//             } finally {
//                 setLoadingCategories(false);
//             }
//         };
//         fetchCategories();
//     }, []);

//     useEffect(() => {
//         // Update isBusinessCreditPaid based on type and payment method
//         if (type === 'business' && paymentMethod === 'Store Credit') {
//             setIsBusinessCreditPaid(false);
//         } else {
//             setIsBusinessCreditPaid(true);
//         }
//     }, [type, paymentMethod]);


//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setMessage('');
//         setError('');

//         if (!amount || !category) {
//             setError('Amount and Category are required.');
//             return;
//         }

//         try {
//             await axios.post('http://localhost:5000/api/expenses', {
//                 amount: parseFloat(amount),
//                 description,
//                 category,
//                 type,
//                 date,
//                 paymentMethod,
//                 isBusinessCreditPaid
//             });
//             setMessage('Expense added successfully!');
//             // Reset form
//             setAmount('');
//             setDescription('');
//             setCategory('');
//             setType('personal');
//             setDate(new Date());
//             setPaymentMethod('Cash');
//             setIsBusinessCreditPaid(true);
//             navigate('/'); // Navigate to dashboard after adding
//         } catch (err) {
//             console.error('Error adding expense:', err.response?.data?.message || err.message);
//             setError(err.response?.data?.message || 'Failed to add expense.');
//         }
//     };

//     if (loadingCategories) return <div className="text-center mt-5"><Spinner animation="border" /> <p>Loading categories...</p></div>;

//     const filteredCategories = categories.filter(cat => cat.type === type);

//     return (
//         <Card className="mx-auto mt-5 p-4" style={{ maxWidth: '35rem' }}>
//             <h2 className="text-center mb-4">Add New Expense</h2>
//             {message && <Alert variant="success">{message}</Alert>}
//             {error && <Alert variant="danger">{error}</Alert>}
//             <Form onSubmit={handleSubmit}>
//                 <Form.Group className="mb-3" controlId="formAmount">
//                     <Form.Label>Amount:</Form.Label>
//                     <Form.Control
//                         type="number"
//                         step="0.01"
//                         value={amount}
//                         onChange={(e) => setAmount(e.target.value)}
//                         required
//                     />
//                 </Form.Group>

//                 <Form.Group className="mb-3" controlId="formDescription">
//                     <Form.Label>Description (Optional):</Form.Label>
//                     <Form.Control
//                         type="text"
//                         value={description}
//                         onChange={(e) => setDescription(e.target.value)}
//                     />
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                     <Form.Label>Expense Type:</Form.Label>
//                     <div>
//                         <Form.Check
//                             inline
//                             type="radio"
//                             label="Personal"
//                             name="expenseType"
//                             id="typePersonal"
//                             value="personal"
//                             checked={type === 'personal'}
//                             onChange={() => setType('personal')}
//                         />
//                         <Form.Check
//                             inline
//                             type="radio"
//                             label="Business"
//                             name="expenseType"
//                             id="typeBusiness"
//                             value="business"
//                             checked={type === 'business'}
//                             onChange={() => setType('business')}
//                         />
//                     </div>
//                 </Form.Group>

//                 <Form.Group className="mb-3" controlId="formCategory">
//                     <Form.Label>Category:</Form.Label>
//                     <Form.Select
//                         value={category}
//                         onChange={(e) => setCategory(e.target.value)}
//                         required
//                     >
//                         <option value="">Select a category</option>
//                         {filteredCategories.length > 0 ? (
//                             filteredCategories.map((cat) => (
//                                 <option key={cat._id} value={cat._id}>
//                                     {cat.name}
//                                 </option>
//                             ))
//                         ) : (
//                             <option disabled>No categories available. Please add some.</option>
//                         )}
//                     </Form.Select>
//                     {filteredCategories.length === 0 && (
//                         <Form.Text className="text-danger">
//                             No {type} categories found. Please add a new category on the <Link to="/categories" className="text-primary">Categories page</Link>.
//                         </Form.Text>
//                     )}
//                 </Form.Group>

//                 <Form.Group className="mb-3" controlId="formDate">
//                     <Form.Label>Date:</Form.Label>
//                     <DatePicker
//                         selected={date}
//                         onChange={(d) => setDate(d)}
//                         dateFormat="PPP"
//                         className="form-control" // Apply Bootstrap form-control class
//                     />
//                 </Form.Group>

//                 <Form.Group className="mb-4" controlId="formPaymentMethod">
//                     <Form.Label>Payment Method:</Form.Label>
//                     <Form.Select
//                         value={paymentMethod}
//                         onChange={(e) => setPaymentMethod(e.target.value)}
//                     >
//                         <option value="Cash">Cash</option>
//                         <option value="Card">Card</option>
//                         <option value="UPI">UPI</option>
//                         <option value="Bank Transfer">Bank Transfer</option>
//                         <option value="Store Credit">Store Credit (for business)</option>
//                     </Form.Select>
//                 </Form.Group>

//                 {type === 'business' && paymentMethod === 'Store Credit' && (
//                     <Alert variant="warning" className="mb-4">
//                         This will be recorded as an unpaid business credit. You can settle it later on the "Business Credit" page.
//                     </Alert>
//                 )}

//                 <div className="d-grid gap-2"> {/* d-grid for full-width button */}
//                     <Button variant="primary" type="submit">
//                         Add Expense
//                     </Button>
//                 </div>
//             </Form>
//         </Card>
//     );
// };

// export default AddExpense;



// client/src/pages/AddExpense.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';

const AddExpense = () => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState('personal'); // 'personal' or 'business'
    const [date, setDate] = useState(new Date());
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [isBusinessCreditPaid, setIsBusinessCreditPaid] = useState(true); // Default to paid
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                // *** CRITICAL FIX: Changed from 'http://localhost:5000/api/categories' to '/api/categories' ***
                const res = await axios.get('/api/categories');
                setCategories(res.data);
                // Set initial category if available
                if (res.data.length > 0) {
                    // Try to find a personal category first, otherwise just pick the first one matching the type
                    const defaultCategory = res.data.find(cat => cat.type === type) || res.data[0];
                    setCategory(defaultCategory._id);
                } else {
                    setCategory(''); // No categories, so clear selected category
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                // More specific error for the user
                setError('Failed to load categories. Please check your internet connection or try logging in again.');
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []); // Empty dependency array means this runs once on mount

    // This useEffect will run when `type` changes, re-fetching categories specific to the new type
    // This ensures the category dropdown updates correctly for Personal vs Business
    useEffect(() => {
        const fetchCategoriesByType = async () => {
            setLoadingCategories(true);
            try {
                const res = await axios.get('/api/categories');
                const filtered = res.data.filter(cat => cat.type === type);
                setCategories(filtered);
                // Set initial category for the new type
                if (filtered.length > 0) {
                    setCategory(filtered[0]._id);
                } else {
                    setCategory(''); // No categories for this type
                }
            } catch (err) {
                console.error('Error fetching categories by type:', err);
                setError('Failed to load categories for the selected type.');
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategoriesByType();
    }, [type]); // Dependency on 'type'

    useEffect(() => {
        // Update isBusinessCreditPaid based on type and payment method
        if (type === 'business' && paymentMethod === 'Store Credit') {
            setIsBusinessCreditPaid(false);
        } else {
            setIsBusinessCreditPaid(true);
        }
    }, [type, paymentMethod]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!amount || !category) {
            setError('Amount and Category are required.');
            return;
        }

        // Ensure category is a valid ID from the filtered list
        const selectedCat = categories.find(cat => cat._id === category);
        if (!selectedCat) {
            setError('Please select a valid category.');
            return;
        }

        try {
            // No change needed here, it's already using a relative path that should be handled by proxy
            await axios.post('/api/expenses', {
                amount: parseFloat(amount),
                description,
                category, // This is already the category ID
                type,
                date,
                paymentMethod,
                isBusinessCreditPaid
            });
            setMessage('Expense added successfully!');
            // Reset form
            setAmount('');
            setDescription('');
            setCategory(''); // Reset category state
            setType('personal'); // Reset type to default
            setDate(new Date());
            setPaymentMethod('Cash');
            setIsBusinessCreditPaid(true);
            navigate('/'); // Navigate to dashboard after adding
        } catch (err) {
            console.error('Error adding expense:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to add expense. Please try again.');
        }
    };

    if (loadingCategories) return <div className="text-center mt-5"><Spinner animation="border" /> <p>Loading categories...</p></div>;

    // Filter categories based on the current type selected for the expense
    const currentTypeCategories = categories.filter(cat => cat.type === type);

    return (
        <Card className="mx-auto mt-5 p-4" style={{ maxWidth: '35rem' }}>
            <h2 className="text-center mb-4">Add New Expense</h2>
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formAmount">
                    <Form.Label>Amount:</Form.Label>
                    <Form.Control
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDescription">
                    <Form.Label>Description (Optional):</Form.Label>
                    <Form.Control
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Expense Type:</Form.Label>
                    <div>
                        <Form.Check
                            inline
                            type="radio"
                            label="Personal"
                            name="expenseType"
                            id="typePersonal"
                            value="personal"
                            checked={type === 'personal'}
                            onChange={() => setType('personal')}
                        />
                        <Form.Check
                            inline
                            type="radio"
                            label="Business"
                            name="expenseType"
                            id="typeBusiness"
                            value="business"
                            checked={type === 'business'}
                            onChange={() => setType('business')}
                        />
                    </div>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formCategory">
                    <Form.Label>Category:</Form.Label>
                    <Form.Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="">Select a category</option>
                        {currentTypeCategories.length > 0 ? (
                            currentTypeCategories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))
                        ) : (
                            <option disabled>No {type} categories available.</option>
                        )}
                    </Form.Select>
                    {currentTypeCategories.length === 0 && (
                        <Form.Text className="text-danger">
                            No {type} categories found. Please add a new category on the <Link to="/categories" className="text-primary">Categories page</Link>.
                        </Form.Text>
                    )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDate">
                    <Form.Label>Date:</Form.Label>
                    <DatePicker
                        selected={date}
                        onChange={(d) => setDate(d)}
                        dateFormat="PPP"
                        className="form-control" // Apply Bootstrap form-control class
                    />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPaymentMethod">
                    <Form.Label>Payment Method:</Form.Label>
                    <Form.Select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Store Credit">Store Credit (for business)</option>
                    </Form.Select>
                </Form.Group>

                {type === 'business' && paymentMethod === 'Store Credit' && (
                    <Alert variant="warning" className="mb-4">
                        This will be recorded as an unpaid business credit. You can settle it later on the "Business Credit" page.
                    </Alert>
                )}

                <div className="d-grid gap-2"> {/* d-grid for full-width button */}
                    <Button variant="primary" type="submit">
                        Add Expense
                    </Button>
                </div>
            </Form>
        </Card>
    );
};

export default AddExpense;