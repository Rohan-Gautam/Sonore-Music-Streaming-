import React, { useState } from 'react';
import axios from 'axios'; // Or use fetch if you prefer
import { Link, useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [name, setName] = useState(''); // Added name state
    const [username, setUsername] = useState(''); // Added username state
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Send data to backend
            const response = await axios.post('/api/auth/register', {
                name,
                username,
                email,
                password,
            });
            setMessage(response.data.message); // Show success message
            console.log('Registered user:', response.data.user);
            setTimeout(() => navigate('/home'), 1000);
        } catch (error: any) {
            setMessage(error.response?.data.message || 'Registration failed');
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>Register for Sonore</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Register</button>
                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </form>
            <p>{message}</p>
        </div>
    );
};

export default Register;

