import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FollowButton = ({ foodPartnerId, onFollowChange }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkFollowStatus();
    }, [foodPartnerId]);

    const checkFollowStatus = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/follow/status/${foodPartnerId}`,
                { withCredentials: true }
            );
            setIsFollowing(response.data.isFollowing);
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    };

    const handleFollow = async () => {
        setLoading(true);
        try {
            if (isFollowing) {
                await axios.delete(
                    `${import.meta.env.VITE_API_URL}/api/follow/${foodPartnerId}`,
                    { withCredentials: true }
                );
                setIsFollowing(false);
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/follow/${foodPartnerId}`,
                    {},
                    { withCredentials: true }
                );
                setIsFollowing(true);
            }
            onFollowChange && onFollowChange(!isFollowing);
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleFollow}
            disabled={loading}
            style={{
                padding: '8px 16px',
                backgroundColor: isFollowing ? '#f0f0f0' : '#e74c3c',
                color: isFollowing ? '#333' : '#fff',
                border: isFollowing ? '1px solid #ddd' : 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.3s ease'
            }}
        >
            {loading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
        </button>
    );
};

export default FollowButton;
