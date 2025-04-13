import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                // Only navigate after successful logout
                navigate('/login');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <button
            onClick={handleLogout}
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                padding: '10px 16px',
                backgroundColor: '#ff4d4f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                zIndex: 9999,
            }}
        >
            Logout
        </button>
    );
};

export default LogoutButton;
