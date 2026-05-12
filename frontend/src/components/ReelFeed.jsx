import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// Reusable feed for vertical reels
// Props:
// - items: Array of video items { _id, video, description, likeCount, savesCount, commentsCount, comments, foodPartner }
// - onLike: (item) => void | Promise<void>
// - onSave: (item) => void | Promise<void>
// - onLoadComments: (item) => Promise<Array>
// - onAddComment: (item, text) => Promise<Comment>
// - emptyMessage: string
const ReelFeed = ({ items = [], onLike, onSave, onLoadComments, onAddComment, emptyMessage = 'No videos yet.', feedRef, lastReelRef }) => {
  const videoRefs = useRef(new Map())
  const commentInputRefs = useRef(new Map())
  const [openCommentsId, setOpenCommentsId] = useState(null)
  const [commentsByItem, setCommentsByItem] = useState({})
  const [commentDrafts, setCommentDrafts] = useState({})
  const [commentsLoading, setCommentsLoading] = useState({})
  const [commentErrors, setCommentErrors] = useState({})
  const [heartAnimationFor, setHeartAnimationFor] = useState(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (!(video instanceof HTMLVideoElement)) return
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.play().catch(() => { /* ignore autoplay errors */ })
          } else {
            video.pause()
          }
        })
      },
      { threshold: [0, 0.25, 0.6, 0.9, 1] }
    )

    videoRefs.current.forEach((vid) => observer.observe(vid))
    return () => observer.disconnect()
  }, [items])

  const setVideoRef = (id) => (el) => {
    if (!el) { videoRefs.current.delete(id); return }
    videoRefs.current.set(id, el)
  }

  const setCommentInputRef = (id) => (el) => {
    if (!el) { commentInputRefs.current.delete(id); return }
    commentInputRefs.current.set(id, el)
  }

  useEffect(() => {
    if (!openCommentsId) { return }
    const input = commentInputRefs.current.get(openCommentsId)
    input?.focus()
  }, [openCommentsId])

  const toggleComments = async (item) => {
    if (openCommentsId === item._id) {
      setOpenCommentsId(null)
      return
    }

    setOpenCommentsId(item._id)
    setCommentErrors((current) => ({ ...current, [item._id]: '' }))

    if (!onLoadComments) {
      return
    }

    setCommentsLoading((current) => ({ ...current, [item._id]: true }))
    try {
      const comments = await onLoadComments(item)
      setCommentsByItem((current) => ({ ...current, [item._id]: comments }))
    } catch {
      setCommentErrors((current) => ({ ...current, [item._id]: 'Unable to load comments.' }))
    } finally {
      setCommentsLoading((current) => ({ ...current, [item._id]: false }))
    }
  }

  async function handleDoubleTap(item) {

    // like only if not already liked
    if (!item.isLiked && onLike) {

      await onLike(item)
    }

    // show animation
    setHeartAnimationFor(item._id)

    // hide animation
    setTimeout(() => {

      setHeartAnimationFor(null)

    }, 900)
  }

  const submitComment = async (event, item) => {
    event.preventDefault()
    const text = (commentDrafts[item._id] || '').trim()
    if (!text || !onAddComment) { return }

    setCommentErrors((current) => ({ ...current, [item._id]: '' }))
    try {
      const comment = await onAddComment(item, text)
      setCommentsByItem((current) => ({
        ...current,
        [item._id]: [comment, ...(current[item._id] || [])]
      }))
      setCommentDrafts((current) => ({ ...current, [item._id]: '' }))
    } catch {
      setCommentErrors((current) => ({ ...current, [item._id]: 'Unable to post comment.' }))
    }
  }

  return (
    <div className="reels-page">
      <div className="reels-feed" role="list" ref={feedRef}>
        {items.length === 0 && (
          <div className="empty-state">
            <p>{emptyMessage}</p>
          </div>
        )}

        {items.map((item, index) => (
          <section
            ref={
              index === items.length - 1
                ? lastReelRef
                : null
            }
            key={item._id}
            className="reel"
            role="listitem"
            onDoubleClick={() => handleDoubleTap(item)}
          >
            <video
              ref={setVideoRef(item._id)}
              className="reel-video"
              src={item.video}
              muted
              playsInline
              loop
              preload="metadata"
            />

            {heartAnimationFor === item._id && (

              <div className="double-like-heart">

                ❤️

              </div>
            )}

            <div className="reel-overlay"
              style={{
                pointerEvents: 'none'
              }}
            >
              <div className="reel-overlay-gradient" aria-hidden="true" />
              <div className="reel-actions"
                style={{
                  pointerEvents: 'auto',
                  zIndex: 20,
                }}
              >
                <div style={{ height: '48px' }} />
                <div className="reel-action-group">
                  <button
                    type="button"
                    onClick={onLike ? () => onLike(item) : undefined}
                    className={`reel-action reel-action--like ${item.isLiked ? 'is-active' : ''}`}
                    aria-label="Like"
                    aria-pressed={Boolean(item.isLiked)}
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill={item.isLiked ? "red" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                    </svg>
                  </button>
                  <div className="reel-action__count">{item.likeCount ?? item.likesCount ?? item.likes ?? 0}</div>
                </div>

                <div className="reel-action-group">
                  <button
                    type="button"
                    className={`reel-action reel-action--save ${item.isSaved ? 'is-active' : ''}`}
                    onClick={onSave ? () => onSave(item) : undefined}
                    aria-label="Bookmark"
                    aria-pressed={Boolean(item.isSaved)}
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill={item.isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                    </svg>
                  </button>
                  <div className="reel-action__count">{item.savesCount ?? item.bookmarks ?? item.saves ?? 0}</div>
                </div>

                <div style={{ height: '48px' }} />
              </div>

              <div className="reel-content"
                style={{
                  position: 'relative',
                  zIndex: 20
                }}
              >
                <p className="reel-description" style={{ pointerEvents: 'none' }} title={item.description}>{item.description}</p>
                {typeof item.foodPartner === 'object' && item.foodPartner?.name && (
                  <p
                    style={{

                      pointerEvents: 'none',

                      display: 'flex',

                      alignItems: 'center',

                      gap: '6px',

                      fontSize: '13px',

                      color: 'rgba(255,255,255,0.72)',

                      marginTop: '2px',

                      marginBottom: '10px',

                      fontWeight: '500',

                      letterSpacing: '.2px'
                    }}
                  >
                    <span
                      style={{
                        color: '#fff',
                        fontWeight: '600'
                      }}
                    >
                      @{item.foodPartner.name}
                    </span>
                    <span
                      style={{
                        opacity: .7
                      }}
                    >
                      •
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        opacity: .82
                      }}
                    >
                      {(item.foodPartner.followersCount || 0).toLocaleString()} followers
                    </span>
                  </p>
                )}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
                  {item.foodPartner && (
                    <Link className="reel-btn" to={"/food-partner/" + (typeof item.foodPartner === 'object' ? item.foodPartner._id : item.foodPartner)} aria-label="Visit store">Visit store</Link>
                  )}
                  <button
                    type="button"
                    className="reel-btn comment-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                    aria-label="Comments"
                    aria-expanded={openCommentsId === item._id}
                    onClick={() => toggleComments(item)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                    </svg>
                    Comments
                    <span style={{ fontWeight: 400, marginLeft: 2, fontSize: '0.95em' }}>{item.commentsCount ?? (Array.isArray(item.comments) ? item.comments.length : 0)}</span>
                  </button>
                </div>
              </div>

            </div>

            {openCommentsId === item._id && (
              <aside
                className="comments-panel"
                aria-label="Comments"
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
              >
                <div className="comments-panel__header">
                  <h2>Comments</h2>
                  <button type="button" className="comments-panel__close" onClick={() => setOpenCommentsId(null)} aria-label="Close comments">x</button>
                </div>

                <div className="comments-panel__list">
                  {commentsLoading[item._id] && <p className="comments-panel__note">Loading comments...</p>}
                  {commentErrors[item._id] && <p className="comments-panel__error">{commentErrors[item._id]}</p>}
                  {!commentsLoading[item._id] && !commentErrors[item._id] && (commentsByItem[item._id] || []).length === 0 && (
                    <p className="comments-panel__note">No comments yet.</p>
                  )}
                  {(commentsByItem[item._id] || []).map((comment) => (
                    <article key={comment._id} className="comment-item">
                      <strong>{comment.user?.fullName || 'User'}</strong>
                      <p>{comment.text}</p>
                    </article>
                  ))}
                </div>

                <form className="comments-panel__form" onSubmit={(event) => submitComment(event, item)}>
                  <input
                    ref={setCommentInputRef(item._id)}
                    type="text"
                    value={commentDrafts[item._id] || ''}
                    onChange={(event) => setCommentDrafts((current) => ({ ...current, [item._id]: event.target.value }))}
                    placeholder="Add a comment"
                    maxLength={500}
                  />
                  <button type="submit" disabled={!((commentDrafts[item._id] || '').trim())}>Post</button>
                </form>
              </aside>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

export default ReelFeed
