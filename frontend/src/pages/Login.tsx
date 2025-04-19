import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * Login page component
 * Connects to /api/auth/login, handles cookie-based authentication
 */
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { email, password };
        console.log('Submitting:', payload);
        try {
            const response = await axios.post('/api/auth/login', payload, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true, // Send/receive cookies
            });
            setMessage(response.data.message);
            console.log('Success:', response.data);
            setTimeout(() => navigate('/home'), 1000); // Redirect to home (adjust as needed)
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error('Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                });
            } else {
                console.error('An unexpected error occurred:', error);
                setMessage('Login failed');
            }

        }
    };

    return (
        <div className="auth-container">
            <h2>Login to Sonore</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn">Login</button>
            </form>
            <p>{message}</p>
            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
}

export default Login;

/**
 * Notes:
 * - Uses axios to match Register.tsx; set `withCredentials` for cookies.
 * - Redirects to /home (create a Home.tsx or adjust to /dashboard).
 * - Keeps your auth-container/form-group styling.
 * - Add Formik for validation or a spinner for UX later.
 */