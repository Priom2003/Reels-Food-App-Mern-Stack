import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../styles/reels.css';

const Following = () => {
    const [followedFoodPartners, setFollowedFoodPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchFollowing();
    }, []);

    const fetchFollowing = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                'http://localhost:3000/api/follow/user/following',
                { withCredentials: true }
            );
            setFollowedFoodPartners(response.data.foodPartners || []);
            setMessage(response.data.foodPartners.length === 0 ? 'You are not following anyone yet.' : '');
        } catch (error) {
            console.error('Error fetching following list:', error);
            setMessage('Unable to load your following list.');
        } finally {

            setTimeout(() => {

                setLoading(false)

            }, 1500)
        }
    };

    const handleUnfollow = async (foodPartnerId) => {
        try {
            await axios.delete(
                `http://localhost:3000/api/follow/${foodPartnerId}`,
                { withCredentials: true }
            );
            setFollowedFoodPartners((prev) =>
                prev.filter((fp) => fp._id !== foodPartnerId)
            );
            if (followedFoodPartners.length - 1 === 0) {
                setMessage('You are not following anyone yet.');
            }
        } catch (error) {
            console.error('Error unfollowing:', error);
        }
    };

    if (loading) {

        return (

            <div className="page-loader">

                <div className="loader-card">

                    <div className="loader-spinner"></div>

                    <h2>
                        Following
                    </h2>

                    <p>
                        Loading your favorite stores...
                    </p>

                </div>

            </div>
        )
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '30px', color: '#333' }}>Following</h1>

            {message ? (
                <p style={{ textAlign: 'center', color: '#999', fontSize: '16px' }}>
                    {message}
                </p>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {followedFoodPartners.map((foodPartner) => (
                        <div
                            key={foodPartner._id}
                            style={{
                                border: '1px solid #eee',
                                borderRadius: '8px',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {foodPartner.avatar && (
                                <img
                                    src={foodPartner.avatar}
                                    alt={foodPartner.name}
                                    style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'cover',
                                        borderRadius: '6px'
                                    }}
                                />
                            )}
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#333' }}>
                                    {foodPartner.name}
                                </h3>
                                <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                                    {foodPartner.followersCount || 0} Followers
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Link
                                    to={`/food-partner/${foodPartner._id}`}
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        backgroundColor: '#2563eb',
                                        color: '#fff',
                                        textDecoration: 'none',
                                        borderRadius: '6px',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                >
                                    Visit Store
                                </Link>
                                <button
                                    onClick={() => handleUnfollow(foodPartner._id)}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#f0f0f0',
                                        color: '#333',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                >
                                    Unfollow
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Following;
