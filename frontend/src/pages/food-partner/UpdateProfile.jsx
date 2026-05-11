import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/create-food.css';

const UpdateProfile = () => {
    const [ profile, setProfile ] = useState(null);
    const [ businessName, setBusinessName ] = useState('');
    const [ address, setAddress ] = useState('');
    const [ avatarFile, setAvatarFile ] = useState(null);
    const [ avatarPreview, setAvatarPreview ] = useState('');
    const [ profileMessage, setProfileMessage ] = useState('');
    const [ isRefreshingFollowers, setIsRefreshingFollowers ] = useState(false);
    const avatarInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("${import.meta.env.VITE_API_URL}/api/food-partner/me", { withCredentials: true })
            .then((response) => {
                const foodPartner = response.data.foodPartner;
                setProfile(foodPartner);
                setBusinessName(foodPartner.name || '');
                setAddress(foodPartner.address || '');
                setAvatarPreview(foodPartner.avatar || '');
            })
            .catch(() => {
                setProfileMessage('Unable to load profile details.');
            });
    }, []);

    const onAvatarChange = (e) => {
        const file = e.target.files && e.target.files[ 0 ];
        if (!file) { return; }
        if (!file.type.startsWith('image/')) {
            setProfileMessage('Please select a valid image file.');
            return;
        }

        setProfileMessage('');
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const saveProfile = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', businessName);
        formData.append('address', address);
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        const response = await axios.patch("${import.meta.env.VITE_API_URL}/api/food-partner/me", formData, {
            withCredentials: true,
        });

        const foodPartner = response.data.foodPartner;
        setProfile(foodPartner);
        setBusinessName(foodPartner.name || '');
        setAddress(foodPartner.address || '');
        setAvatarPreview(foodPartner.avatar || '');
        setAvatarFile(null);
        setProfileMessage('Profile updated.');
    };

    const handleLogout = async () => {
        try {
            await axios.get("${import.meta.env.VITE_API_URL}/api/auth/food-partner/logout", { withCredentials: true });
        } catch (error) {
            console.error('Logout error:', error);
        }
        navigate("/food-partner/login");
    };

    const refreshFollowersCount = async () => {
        try {
            setIsRefreshingFollowers(true);
            const response = await axios.get("${import.meta.env.VITE_API_URL}/api/food-partner/me", { withCredentials: true });
            const updatedProfile = response.data.foodPartner;
            setProfile(updatedProfile);
        } catch (error) {
            console.error('Error refreshing followers count:', error);
        } finally {
            setIsRefreshingFollowers(false);
        }
    };

    return (
        <div className="create-food-page">
            <button
                onClick={handleLogout}
                className="logout-btn-create-food"
            >
                Logout
            </button>
            <div className="create-food-card">
                <div className="partner-page-actions">
                    <Link className="btn-ghost" to="/create-food">Create food</Link>
                    <Link className="btn-ghost" to="/manage-food">Manage food</Link>
                    <Link className="btn-ghost" to="/followers">View Followers</Link>
                </div>

                <section className="partner-profile-panel" aria-labelledby="partner-profile-title">
                    <header className="create-food-header">
                        <h1 id="partner-profile-title" className="create-food-title">Store Profile</h1>
                        <p className="create-food-subtitle">These details are shown to users when they visit your store.</p>
                    </header>

                    <form className="partner-profile-form" onSubmit={saveProfile}>
                        <div className="partner-profile-avatar-row">
                            {avatarPreview ? (
                            <img
                            className="partner-profile-avatar"
                            src={avatarPreview}
                            alt="Profile"
                        />
                    ) : (
                        <div className="partner-profile-avatar placeholder-avatar">
                        No Image
                        </div>
                    )}
                            <div className="partner-profile-avatar-actions">
                                <input
                                    ref={avatarInputRef}
                                    className="file-input-hidden"
                                    type="file"
                                    accept="image/*"
                                    onChange={onAvatarChange}
                                />
                                <button type="button" className="btn-ghost" onClick={() => avatarInputRef.current?.click()}>
                                    Change avatar
                                </button>
                                <span className="small-note">{profile?.totalMeals ?? 0} meals posted</span>
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="small-note">
                                        {profile?.followersCount ?? 0} followers
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={refreshFollowersCount}
                                        disabled={isRefreshingFollowers}
                                        style={{
                                            padding: '4px 8px',
                                            fontSize: '12px',
                                            backgroundColor: 'transparent',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            cursor: isRefreshingFollowers ? 'not-allowed' : 'pointer',
                                            opacity: isRefreshingFollowers ? 0.6 : 1
                                        }}
                                    >
                                        {isRefreshingFollowers ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="two-col-profile">
                            <div className="field-group">
                                <label htmlFor="businessName">Business Name</label>
                                <input
                                    id="businessName"
                                    type="text"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="field-group">
                                <label htmlFor="partnerAddress">Address</label>
                                <input
                                    id="partnerAddress"
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button className="btn-primary" type="submit">Save Profile</button>
                            {profileMessage && <p className="profile-message">{profileMessage}</p>}
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default UpdateProfile;
