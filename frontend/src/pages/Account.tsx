import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


interface User {
    name: string;
    username: string;
    email: string;
    createdAt: string;
}

const Account: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ name: '', username: '', password: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/account', { withCredentials: true });
            console.log('API response:', res.data); // Debug
            setUser(res.data.user);
            setFormData({
                name: res.data.user.name || '',
                username: res.data.user.username || '',
                password: '',
            });
            setEditMode(false);
            setError('');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error('Fetch error:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                });
                setError(error.response?.data?.message || 'Failed to load account details');
            } else {
                console.error('Unknown error:', error);
                setError('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const res = await axios.put('/api/account', formData, { withCredentials: true });
            setUser(res.data.user);
            setEditMode(false);
            setMessage('Account updated successfully');
            setFormData({ ...formData, password: '' });
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.message || 'Failed to update account');
            } else {
                setMessage('An unknown error occurred');
            }
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading account...</div>;
    }

    if (error && !user) {
        return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <button
                onClick={() => navigate('/home')}
                style={{marginBottom: '20px'}}
            >
                Back to Home
            </button>
            <h1>Account Settings</h1>
            {message && (
                <div
                    style={{
                        padding: '10px',
                        backgroundColor: message.includes('Failed') ? '#ffcccc' : '#ccffcc',
                        borderRadius: '5px',
                        margin: '10px 0',
                    }}
                >
                    {message}
                </div>
            )}

            {!editMode && user ? (
                <div>
                    <p><strong>Name:</strong> {user.name || 'Not set'}</p>
                    <p><strong>Username:</strong> {user.username || 'Not set'}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                    <button
                        onClick={() => setEditMode(true)}
                        style={{padding: '10px 20px', marginTop: '10px'}}
                    >
                        Edit Profile
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            style={{width: '100%', padding: '8px', marginTop: '5px'}}
                        />
                    </div>
                    <div>
                        <label>Username:</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            style={{width: '100%', padding: '8px', marginTop: '5px'}}
                        />
                    </div>
                    <div>
                        <label>New Password (optional):</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            style={{width: '100%', padding: '8px', marginTop: '5px'}}
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            style={{padding: '10px 20px', marginRight: '10px'}}
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEditMode(false);
                                setFormData({
                                    name: user?.name || '',
                                    username: user?.username || '',
                                    password: '',
                                });
                                setMessage('');
                            }}
                            style={{padding: '10px 20px'}}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Account;