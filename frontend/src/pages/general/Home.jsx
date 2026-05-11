import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import '../../styles/reels.css'

import ReelFeed from '../../components/ReelFeed'

const Home = () => {

    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)
    const [recommendedItems, setRecommendedItems] = useState([])
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('')
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    const navigate = useNavigate()
    const feedRef = useRef(null)
    const observerRef = useRef(null)

    // fetch reels
    useEffect(() => {

        async function fetchReels() {

            try {

                if (page === 1) {

                    setLoading(true)
                }

                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/food?page=${page}&limit=5&search=${search}&sort=${sort}`,

                    {
                        withCredentials: true
                    }

                )

                console.log(response.data)

                setVideos((prev) => (

                    page === 1

                        ? response.data.foodItems

                        : [...prev, ...response.data.foodItems]

                ))

                setRecommendedItems(
                    response.data.recommendedItems || []
                )

                setHasMore(response.data.hasMore)

                // scroll after reels update
                // scroll to top ONLY for new search/sort
                if (page === 1) {

                    setTimeout(() => {

                        if (feedRef.current) {

                            feedRef.current.scrollTo({

                                top: 0,
                                behavior: 'smooth'

                            })
                        }

                    }, 100)
                }

            } catch (error) {

                console.error(error)

            } finally {

                setLoadingMore(false)

                if (page === 1) {

                    setTimeout(() => {

                        setLoading(false)

                    }, 1500)
                }
            }
        }

        fetchReels()

    }, [page, search, sort])

    useEffect(() => {

        setPage(1)

    }, [search, sort])

    // like reel
    async function likeVideo(item) {

        const response = await axios.post(

            `${import.meta.env.VITE_API_URL}/api/food/like`,

            {
                foodId: item._id
            },

            {
                withCredentials: true
            }

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

    // save reel
    async function saveVideo(item) {

        console.log("SAVE CLICKED");

        try {

            const response = await axios.post(

                `${import.meta.env.VITE_API_URL}/api/food/save`,

                {
                    foodId: item._id
                },

                {
                    withCredentials: true
                }

            );

            console.log("SAVE RESPONSE:", response.data);

            if (response.data.saved) {

                console.log("Video Saved");

                setVideos((prev) =>

                    prev.map((v) =>

                        v._id === item._id

                            ? {
                                ...v,
                                isSaved: true,
                                savesCount: (v.savesCount || 0) + 1
                            }

                            : v
                    )
                )

            } else {

                console.log("Video Unsaved");

                setVideos((prev) =>

                    prev.map((v) =>

                        v._id === item._id

                            ? {
                                ...v,
                                isSaved: false,
                                savesCount: Math.max(
                                    0,
                                    (v.savesCount || 0) - 1
                                )
                            }

                            : v
                    )
                )
            }

        } catch (error) {

            console.error("SAVE ERROR:", error);

        }
    }

    // load comments
    async function loadComments(item) {

        const response = await axios.get(

            `${import.meta.env.VITE_API_URL}/api/food/${item._id}/comments`,

            {
                withCredentials: true
            }

        )

        return response.data.comments || []
    }

    // add comment
    async function addComment(item, text) {

        const response = await axios.post(

            `${import.meta.env.VITE_API_URL}/api/food/${item._id}/comments`,

            {
                text
            },

            {
                withCredentials: true
            }

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

    // logout
    const handleLogout = async () => {

        try {

            await axios.get(

                `${import.meta.env.VITE_API_URL}/api/auth/user/logout`,

                {
                    withCredentials: true
                }

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
                        Zomato Reels
                    </h2>

                    <p>
                        Loading delicious reels...
                    </p>

                </div>

            </div>
        )
    }

    const lastReelRef = (node) => {

        if (loadingMore) return

        if (observerRef.current) {

            observerRef.current.disconnect()
        }

        observerRef.current = new IntersectionObserver(

            (entries) => {

                if (

                    entries[0].isIntersecting &&

                    hasMore

                ) {

                    setLoadingMore(true)

                    setPage((prev) => prev + 1)
                }
            },

            {
                threshold: 0.5
            }
        )

        if (node) {

            observerRef.current.observe(node)
        }
    }

    return (
        <div style={{ position: 'relative' }}>
            {/* logout */}
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
            {/* search + sorting */}
            <div className="feed-controls">
                <input
                    type="text"
                    placeholder="Search food reels..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="feed-search"
                />
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="feed-sort"
                >
                    <option value="" disabled>
                        Sort By
                    </option>
                    <option value="latest">
                        Latest
                    </option>
                    <option value="likes">
                        Most Liked
                    </option>
                    <option value="saves">
                        Most Saved
                    </option>
                    <option value="comments">
                        Most Commented
                    </option>
                </select>
            </div>
            {/* AI Recommended */}
            <div className="discover-section">

                <div className="discover-header">
                    🤖 Recommended For You
                </div>

                <div className="discover-scroll">

                    {recommendedItems.map((item) => (

                        <div
                            key={item._id}
                            className="discover-card"
                        >

                            <video
                                src={item.video}
                                muted
                                playsInline
                                preload="metadata"
                                className="discover-video"
                            />

                            <div className="discover-overlay">

                                <p className="discover-title">
                                    {item.description}
                                </p>

                                <div className="discover-meta">
                                    ❤️ {item.likeCount || 0}
                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>
            {/* reels feed */}
            <ReelFeed
                items={videos}
                onLike={likeVideo}
                onSave={saveVideo}
                onLoadComments={loadComments}
                onAddComment={addComment}
                emptyMessage="No videos available."
                feedRef={feedRef}
                lastReelRef={lastReelRef}
            />
            {loadingMore && (

                <div className="feed-loading-more">

                    <div className="feed-loading-spinner"></div>

                </div>
            )}
        </div>
    )
}

export default Home