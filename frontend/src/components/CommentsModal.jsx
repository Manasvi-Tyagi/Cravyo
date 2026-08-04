import React from 'react'
import api from '../api/axios'
import '../styles/comments.css'

function toViewModel(comment) {
  return {
    _id: comment._id,
    user: {
      id: comment.user?.id || comment.user?._id,
      name: comment.user?.name || 'User',
      avatar: comment.user?.profileImage || '👤',
      role: comment.user?.role,
    },
    text: comment.text,
    timestamp: new Date(comment.createdAt).toLocaleString(),
    likes: comment.likeCount || 0,
    isLiked: Boolean(comment.isLikedByUser),
    isOwn: Boolean(comment.isOwnComment),
  }
}

export default function CommentsModal({ isOpen, productId, foodId, onClose, onCommentAdded }) {
  const itemId = productId || foodId
  const [comments, setComments] = React.useState([])
  const [inputValue, setInputValue] = React.useState('')
  const [editingCommentId, setEditingCommentId] = React.useState(null)
  const [editInputValue, setEditInputValue] = React.useState('')
  const [error, setError] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!isOpen || !itemId) return undefined
    let active = true
    api.get(`/api/product/comment/${itemId}`)
      .then((response) => {
        if (active) setComments((response.data.data?.comments || []).map(toViewModel))
      })
      .catch(() => { if (active) setError('Could not load comments.') })
    return () => { active = false }
  }, [isOpen, itemId])

  const handlePostComment = async () => {
    const text = inputValue.trim()
    if (!text || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const response = await api.post('/api/product/comment', { productId: itemId, text })
      setComments((current) => [toViewModel(response.data.data.comment), ...current])
      setInputValue('')
      onCommentAdded?.(itemId)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Sign in to post a comment.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleLikeComment = async (commentId) => {
    setError('')
    try {
      const response = await api.post('/api/product/comment/like', { commentId })
      setComments((current) => current.map((comment) => comment._id === commentId
        ? { ...comment, isLiked: response.data.data.isLiked, likes: response.data.data.likeCount }
        : comment))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Sign in to like comments.')
    }
  }

  const saveEditedComment = async () => {
    const text = editInputValue.trim()
    if (!text) return
    try {
      const response = await api.patch(`/api/product/comment/${editingCommentId}`, { text })
      setComments((current) => current.map((comment) => comment._id === editingCommentId
        ? { ...comment, text: response.data.data.comment.text }
        : comment))
      setEditingCommentId(null)
      setEditInputValue('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not edit this comment.')
    }
  }

  const deleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await api.delete(`/api/product/comment/${commentId}`)
      setComments((current) => current.filter((comment) => comment._id !== commentId))
      onCommentAdded?.(itemId, -1)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete this comment.')
    }
  }

  if (!isOpen) return null

  return (
    <>
      <button className="comments-overlay" onClick={onClose} aria-label="Close comments" type="button" />
      <section className="comments-modal" role="dialog" aria-modal="true" aria-label="Comments">
        <div className="comments-header">
          <h2>Comments</h2>
          <button className="comments-close-btn" onClick={onClose} aria-label="Close" type="button">✕</button>
        </div>
        <div className="comments-divider" />
        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="comments-empty"><p>No comments yet</p><p className="comments-empty-sub">Be the first to comment!</p></div>
          ) : comments.map((comment) => (
            <article key={comment._id} className="comment-item">
              <div className="comment-avatar">{comment.user.avatar}</div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-username">{comment.user.name}</span>
                  {comment.user.role === 'merchant' && <span className="comment-role">merchant</span>}
                  <span className="comment-timestamp">{comment.timestamp}</span>
                  {comment.isOwn && (
                    <div className="comment-actions">
                      {editingCommentId === comment._id ? <>
                        <button className="comment-action-btn save-btn" onClick={saveEditedComment} type="button">Save</button>
                        <button className="comment-action-btn cancel-btn" onClick={() => setEditingCommentId(null)} type="button">Cancel</button>
                      </> : <>
                        <button className="comment-action-btn edit-btn" onClick={() => { setEditingCommentId(comment._id); setEditInputValue(comment.text) }} type="button">Edit</button>
                        <button className="comment-action-btn delete-btn" onClick={() => deleteComment(comment._id)} type="button">Delete</button>
                      </>}
                    </div>
                  )}
                </div>
                {editingCommentId === comment._id ? (
                  <textarea className="comment-edit-input" value={editInputValue} onChange={(event) => setEditInputValue(event.target.value)} rows={2} />
                ) : <p className="comment-text">{comment.text}</p>}
                <div className="comment-meta"><span className="comment-likes">{comment.likes} likes</span></div>
              </div>
              <button className={`comment-like-btn ${comment.isLiked ? 'liked' : ''}`} onClick={() => toggleLikeComment(comment._id)} aria-label="Like comment" type="button">♥</button>
            </article>
          ))}
        </div>
        <div className="comments-input-section">
          {error && <p className="comments-error" role="alert">{error}</p>}
          <div className="comments-input-container">
            <div className="input-avatar">👤</div>
            <input className="comments-input" placeholder="Add a comment…" value={inputValue} onChange={(event) => setInputValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); handlePostComment() } }} />
            <button className="comments-post-btn" onClick={handlePostComment} disabled={!inputValue.trim() || submitting} type="button">{submitting ? 'Posting…' : 'Post'}</button>
          </div>
        </div>
      </section>
    </>
  )
}
