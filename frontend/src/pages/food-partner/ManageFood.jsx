import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/create-food.css';

const ManageFood = () => {

    const [foodItems, setFoodItems] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [managerMessage, setManagerMessage] = useState('');
    const [analytics, setAnalytics] = useState(null)
    const [openCommentsId, setOpenCommentsId] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {

        axios.get(
            "${import.meta.env.VITE_API_URL}/api/food/mine",
            { withCredentials: true }
        )
            .then((response) => {
                setFoodItems(response.data.foodItems || []);
            })
            .catch(() => {
                setManagerMessage('Unable to load your food reels.');
            });

    }, []);

    useEffect(() => {

        axios.get(

            "${import.meta.env.VITE_API_URL}/api/food/analytics",

            {
                withCredentials: true
            }

        )

            .then((response) => {

                console.log(response.data)

                setAnalytics(response.data)

            })

            .catch((error) => {

                console.error(error)

            })

    }, [])

    const startEditing = (item) => {

        setEditingId(item._id);
        setEditName(item.name || '');
        setEditDescription(item.description || '');
        setManagerMessage('');
    };

    const cancelEditing = () => {

        setEditingId(null);
        setEditName('');
        setEditDescription('');
    };

    const saveFoodEdit = async (item) => {

        const response = await axios.patch(
            `${import.meta.env.VITE_API_URL}/api/food/${item._id}`,
            {
                name: editName,
                description: editDescription,
            },
            {
                withCredentials: true,
            }
        );

        setFoodItems((currentItems) =>
            currentItems.map((food) => (
                food._id === item._id
                    ? response.data.food
                    : food
            ))
        );

        cancelEditing();

        setManagerMessage('Food reel updated.');
    };

    const deleteFoodItem = async (item) => {

        const shouldDelete = window.confirm(
            `Delete "${item.name}"? This cannot be undone.`
        );

        if (!shouldDelete) {
            return;
        }

        await axios.delete(
            `${import.meta.env.VITE_API_URL}/api/food/${item._id}`,
            {
                withCredentials: true,
            }
        );

        setFoodItems((currentItems) =>
            currentItems.filter((food) =>
                food._id !== item._id
            )
        );

        if (editingId === item._id) {
            cancelEditing();
        }

        if (openCommentsId === item._id) {
            setOpenCommentsId(null);
            setComments([]);
        }

        setManagerMessage('Food reel deleted.');
    };

    const loadComments = async (item) => {

        try {

            setCommentsLoading(true);

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/food/${item._id}/comments`,
                { withCredentials: true }
            );

            setComments(response.data.comments || []);
            setOpenCommentsId(item._id);

        } catch (error) {

            console.error(error);
            setManagerMessage('Unable to load comments.');

        } finally {

            setCommentsLoading(false);
        }
    };

    const deleteComment = async (commentId) => {

        const shouldDelete = window.confirm(
            "Delete this comment?"
        );

        if (!shouldDelete) {
            return;
        }

        try {

            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/food/${commentId}/comments`,
                {
                    withCredentials: true
                }
            );

            setComments((prev) =>
                prev.filter((c) =>
                    c._id !== commentId
                )
            );

            setFoodItems((prev) =>
                prev.map((food) =>
                    food._id === openCommentsId
                        ? {
                            ...food,
                            commentsCount: Math.max(
                                0,
                                (food.commentsCount || 0) - 1
                            )
                        }
                        : food
                )
            );

        } catch (error) {

            console.error(error);
            setManagerMessage('Unable to delete comment.');
        }
    };

    const handleLogout = async () => {

        try {

            await axios.get(
                "${import.meta.env.VITE_API_URL}/api/auth/food-partner/logout",
                { withCredentials: true }
            );

        } catch (error) {

            console.error('Logout error:', error);
        }

        navigate("/food-partner/login");
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
                    <Link className="btn-ghost" to="/create-food">
                        Create food
                    </Link>

                    <Link className="btn-ghost" to="/update-profile">
                        Update profile
                    </Link>
                </div>

                <section
                    className="food-manager"
                    aria-labelledby="food-manager-title"
                >

                    <header className="create-food-header">

                        <h1
                            id="food-manager-title"
                            className="create-food-title"
                        >
                            Manage Food Reels
                        </h1>

                        <p className="create-food-subtitle">
                            Edit reels, moderate comments, or delete content.
                        </p>

                    </header>

                    {analytics && (

                        <section className="analytics-section">

                            <div className="analytics-header">

                                📊 Creator Analytics

                            </div>

                            <div className="analytics-grid">

                                <div className="analytics-card">

                                    <h3>Total Reels</h3>

                                    <p>
                                        {analytics.totalReels}
                                    </p>

                                </div>

                                <div className="analytics-card">

                                    <h3>Total Likes</h3>

                                    <p>
                                        ❤️ {analytics.totalLikes}
                                    </p>

                                </div>

                                <div className="analytics-card">

                                    <h3>Total Saves</h3>

                                    <p>
                                        🔖 {analytics.totalSaves}
                                    </p>

                                </div>

                                <div className="analytics-card">

                                    <h3>Total Comments</h3>

                                    <p>
                                        💬 {analytics.totalComments}
                                    </p>

                                </div>

                                <div className="analytics-card analytics-card--wide">

                                    <h3>Average Engagement</h3>

                                    <p>
                                        🔥 {analytics.averageEngagement}
                                    </p>

                                </div>

                            </div>

                            {analytics.topReel && (

                                <div className="top-reel-card">

                                    <div className="top-reel-label">

                                        🏆 Top Performing Reel

                                    </div>

                                    <video
                                        src={analytics.topReel.video}
                                        muted
                                        playsInline
                                        autoPlay
                                        loop
                                        preload="metadata"
                                    />

                                    <div className="top-reel-info">

                                        <p>
                                            {analytics.topReel.description}
                                        </p>

                                        <div>

                                            ❤️ {analytics.topReel.likeCount || 0}

                                            ·

                                            🔖 {analytics.topReel.savesCount || 0}

                                            ·

                                            💬 {analytics.topReel.commentsCount || 0}

                                        </div>

                                    </div>

                                </div>
                            )}

                        </section>
                    )}

                    {managerMessage && (
                        <p className="profile-message">
                            {managerMessage}
                        </p>
                    )}

                    {foodItems.length === 0 ? (

                        <div className="food-manager-empty">
                            No food reels posted yet.
                        </div>

                    ) : (

                        <div className="food-manager-list">

                            {foodItems.map((item) => {

                                const isEditing =
                                    editingId === item._id;

                                return (

                                    <article
                                        key={item._id}
                                        className="food-manager-item"
                                    >

                                        <video
                                            className="food-manager-video"
                                            src={item.video}
                                            muted
                                            playsInline
                                            preload="metadata"
                                        />

                                        {isEditing ? (

                                            <div className="food-manager-edit">

                                                <div className="field-group">

                                                    <label htmlFor={`edit-name-${item._id}`}>
                                                        Name
                                                    </label>

                                                    <input
                                                        id={`edit-name-${item._id}`}
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) =>
                                                            setEditName(e.target.value)
                                                        }
                                                    />

                                                </div>

                                                <div className="field-group">

                                                    <label htmlFor={`edit-description-${item._id}`}>
                                                        Description
                                                    </label>

                                                    <textarea
                                                        id={`edit-description-${item._id}`}
                                                        rows={3}
                                                        value={editDescription}
                                                        onChange={(e) =>
                                                            setEditDescription(e.target.value)
                                                        }
                                                    />

                                                </div>

                                                <div className="food-manager-actions">

                                                    <button
                                                        className="btn-primary"
                                                        type="button"
                                                        onClick={() => saveFoodEdit(item)}
                                                        disabled={!editName.trim()}
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        className="btn-ghost"
                                                        type="button"
                                                        onClick={cancelEditing}
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>

                                            </div>

                                        ) : (

                                            <div className="food-manager-content">

                                                <div>

                                                    <h3 className="food-manager-name">
                                                        {item.name}
                                                    </h3>

                                                    <p className="food-manager-description">
                                                        {item.description || 'No description added.'}
                                                    </p>

                                                </div>

                                                <div className="food-manager-meta">

                                                    <span>
                                                        {item.likeCount ?? 0} likes
                                                    </span>

                                                    <span>
                                                        {item.savesCount ?? 0} saves
                                                    </span>

                                                    <span>
                                                        {item.commentsCount ?? 0} comments
                                                    </span>

                                                </div>

                                                <div className="food-manager-actions">

                                                    <button
                                                        className="btn-ghost"
                                                        type="button"
                                                        onClick={() => startEditing(item)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="btn-ghost"
                                                        type="button"
                                                        onClick={() => loadComments(item)}
                                                    >
                                                        Comments
                                                    </button>

                                                    <button
                                                        className="btn-ghost danger"
                                                        type="button"
                                                        onClick={() => deleteFoodItem(item)}
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                                {openCommentsId === item._id && (

                                                    <div className="food-comments-overlay">

                                                        <div className="food-comments-panel">

                                                            <div className="food-comments-header">

                                                                <div>
                                                                    <h3>Comments</h3>
                                                                    <span>
                                                                        {comments.length} total
                                                                    </span>
                                                                </div>

                                                                <button
                                                                    className="comments-close-btn"
                                                                    onClick={() => {
                                                                        setOpenCommentsId(null);
                                                                        setComments([]);
                                                                    }}
                                                                >
                                                                    ✕
                                                                </button>

                                                            </div>

                                                            {commentsLoading ? (

                                                                <div className="comments-loading">
                                                                    Loading comments...
                                                                </div>

                                                            ) : comments.length === 0 ? (

                                                                <div className="comments-empty">
                                                                    No comments yet.
                                                                </div>

                                                            ) : (

                                                                <div className="food-comments-list">

                                                                    {comments.map((comment) => (

                                                                        <div
                                                                            key={comment._id}
                                                                            className="food-comment-item"
                                                                        >

                                                                            <div className="food-comment-content">

                                                                                <div className="food-comment-top">

                                                                                    <strong>
                                                                                        {comment.user?.fullName || 'User'}
                                                                                    </strong>

                                                                                    <span className="comment-date">
                                                                                        {new Date(comment.createdAt)
                                                                                            .toLocaleDateString()}
                                                                                    </span>

                                                                                </div>

                                                                                <p>
                                                                                    {comment.text}
                                                                                </p>

                                                                            </div>

                                                                            <button
                                                                                className="delete-comment-btn"
                                                                                type="button"
                                                                                onClick={() => deleteComment(comment._id)}
                                                                            >
                                                                                Delete
                                                                            </button>

                                                                        </div>

                                                                    ))}

                                                                </div>

                                                            )}

                                                        </div>

                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    </article>
                                );
                            })}

                        </div>
                    )}

                </section>

            </div>

        </div>
    );
};

export default ManageFood;
