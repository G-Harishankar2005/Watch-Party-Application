import React, { useState } from 'react';

export default function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            // Changed from /api/auth/signup to match your friend's backend endpoint: /auth/register
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            if (response.ok) {
                setIsError(false);
                setMessage('User registered successfully!'); 
                setUsername('');
                setEmail('');
                setPassword('');
            } else {
                // Since the backend returns a response object, handle errors safely
                const errorData = await response.json().catch(() => null);
                setIsError(true);
                setMessage(errorData?.message || 'Registration failed. Please try again.'); 
            }
        } catch (error) {
            setIsError(true);
            setMessage('Unable to connect to the server.');
            console.error('Error:', error);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'Arial' }}>
            <h2>Create an Account</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Username:</label><br />
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email:</label><br />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password:</label><br />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 15px', cursor: 'pointer' }}>
                    Sign Up
                </button>
            </form>

            {message && (
                <p style={{ color: isError ? 'red' : 'green', marginTop: '15px', fontWeight: 'bold' }}>
                    {message}
                </p>
            )}
        </div>
    );
}