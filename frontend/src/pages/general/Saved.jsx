import React, { useEffect, useState } from 'react'
import '../../styles/reels.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import ReelFeed from '../../components/ReelFeed'

const Saved = () => {

    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {

        axios.get(
            `${import.meta.env.VITE_API_URL}/api/food/save`,
            { withCredentials: true }
        )
            .then(response => {

                const savedFoods = response.data.savedFoods.map((item) => ({

                    _id: item.food._id,
                    video: item.food.video,
                    description: item.food.description,

                    likeCount: item.food.likeCount,
                    savesCount: item.food.savesCount,
                    commentsCount: item.food.commentsCount,

                    foodPartner: item.food.foodPartner,

                    isSaved: true,
                    isLiked: item.food.isLiked || false,

                }))

                setVideos(savedFoods)
                setTimeout(() => {

                    setLoading(false)

                }, 1500)

            })
            .catch((error) => {

                console.error(error)
                setTimeout(() => {

                    setLoading(false)

                }, 1500)

            })

    }, [])

    async function likeVideo(item) {

        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/food/like`,
            { foodId: item._id },
            { withCredentials: true }
        )

        if (response.data.like) {

            console.log("Video liked")

            setVideos((prev) =>
                prev.map((v) =>
                    v._id === item._id
                        ? {
                            ...v,
                            isLiked: true,
                            likeCount: (v.likeCount || 0) + 1
                        }
                        : v
                )
            )

        } else {

            console.log("Video unliked")

            setVideos((prev) =>
                prev.map((v) =>
                    v._id === item._id
                        ? {
                            ...v,
                            isLiked: false,
                            likeCount: Math.max(
                                0,
                                (v.likeCount || 0) - 1
                            )
                        }
                        : v
                )
            )

        }
    }

    const removeSaved = async (item) => {

        try {

            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/food/save`,
                { foodId: item._id },
                { withCredentials: true }
            )

            console.log("Video unsaved")

            // instantly remove from saved page
            setVideos((prev) =>
                prev.filter((v) =>
                    v._id !== item._id
                )
            )

        } catch (error) {

            console.error(error)
        }
    }

    async function loadComments(item) {

        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/food/${item._id}/comments`,
            { withCredentials: true }
        )

        return response.data.comments || []
    }

    async function addComment(item, text) {

        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/food/${item._id}/comments`,
            { text },
            { withCredentials: true }
        )

        setVideos((prev) =>
            prev.map((v) =>
                v._id === item._id
                    ? {
                        ...v,
                        commentsCount: (v.commentsCount || 0) + 1
                    }
                    : v
            )
        )

        return response.data.comment
    }

    const handleLogout = async () => {

        try {

            await axios.get(
                `${import.meta.env.VITE_API_URL}/api/auth/user/logout`,
                { withCredentials: true }
            )

        } catch (error) {

            console.error('Logout error:', error)
        }

        navigate("/user/login")
    }

    if (loading) {

        return (

            <div className="page-loader">

                <div className="loader-card">

                    <div className="loader-spinner"></div>

                    <h2>
                        Saved Reels
                    </h2>

                    <p>
                        Loading your collection...
                    </p>

                </div>

            </div>
        )
    }

    return (

        <div style={{ position: 'relative' }}>

            <button
                onClick={handleLogout}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 100,
                    padding: '8px 16px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
            >
                Logout
            </button>

            <ReelFeed
                items={videos}
                onLike={likeVideo}
                onSave={removeSaved}
                onLoadComments={loadComments}
                onAddComment={addComment}
                emptyMessage="No saved videos yet."
            />

        </div>
    )
}

export default Saved