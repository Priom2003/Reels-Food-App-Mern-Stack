import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../styles/create-food.css';

const Followers = () => {
    const [followers, setFollowers] = useState([]);
    const [followerCount, setFollowerCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchFollowers();
    }, []);

    const fetchFollowers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/follow/me/followers`,
                { withCredentials: true }
            );
            setFollowers(response.data.followers || []);
            setFollowerCount(response.data.followerCount || 0);
            if (!response.data.followers || response.data.followers.length === 0) {
                setMessage('You have no followers yet.');
            }
        } catch (error) {
            console.error('Error fetching followers:', error);
            setMessage('Unable to load your followers.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-food-page">
            <Link to="/update-profile" className="back-link" style={{ 
                display: 'inline-block', 
                marginBottom: '20px',
                padding: '8px 16px',
                backgroundColor: '#f0f0f0',
                color: '#333',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600'
            }}>
                ← Back to Profile
            </Link>

            <div className="create-food-card">
                <section style={{ padding: '20px' }}>
                    <header style={{ marginBottom: '30px' }}>
                        <h1 style={{ marginBottom: '8px', fontSize: '28px' }}>Followers</h1>
                        <p style={{ color: '#666', margin: '0' }}>Total followers: <strong>{followerCount}</strong></p>
                    </header>

                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>Loading followers...</p>
                    ) : message ? (
                        <p style={{ textAlign: 'center', color: '#999', fontSize: '16px', padding: '40px 0' }}>
                            {message}
                        </p>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '16px'
                        }}>
                            {followers.map((follower) => (
                                <div
                                    key={follower._id}
                                    style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                        backgroundColor: '#f9f9f9',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                        e.currentTarget.style.backgroundColor = '#fff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.backgroundColor = '#f9f9f9';
                                    }}
                                >
                                    <div>
                                        <h3 style={{ 
                                            margin: '0 0 4px 0', 
                                            fontSize: '16px', 
                                            color: '#333',
                                            fontWeight: '600'
                                        }}>
                                            {follower.fullName}
                                        </h3>
                                        <p style={{ 
                                            margin: '0', 
                                            color: '#666', 
                                            fontSize: '13px',
                                            wordBreak: 'break-word'
                                        }}>
                                            {follower.email}
                                        </p>
                                    </div>
                                    <div style={{
                                        paddingTop: '8px',
                                        borderTop: '1px solid #eee',
                                        fontSize: '12px',
                                        color: '#999'
                                    }}>
                                        Follower
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Followers;
