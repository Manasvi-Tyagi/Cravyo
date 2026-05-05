import React, { useState, useEffect } from 'react'
import api from '../api/axios'
import '../styles/comments.css'

const CommentsModal = ({ isOpen, productId, foodId, onClose, reelData, onCommentAdded }) => {
  // Accept both productId (new) and foodId (legacy) for backward compat
  const itemId = productId || foodId
  const [comments, setComments] = useState([
    // {
    //   _id: '1',
    //   user: { name: 'Sarah Chef', avatar: '👩‍🍳' },
    //   text: 'Looks absolutely delicious! 😋',
    //   timestamp: '2 hours ago',
    //   likes: 24
    // },
    // {
    //   _id: '2',
    //   user: { name: 'Food Lover', avatar: '🍽️' },
    //   text: 'Just saved this! Gonna make it this weekend',
    //   timestamp: '1 hour ago',
    //   likes: 8
    // },
    // {
    //   _id: '3',
    //   user: { name: 'Spice King', avatar: '🌶️' },
    //   text: 'Add more spice! 🔥🔥🔥',
    //   timestamp: '45 min ago',
    //   likes: 15
    // }
  ])

  const [inputValue, setInputValue] = useState('')
  const [likedComments, setLikedComments] = useState(new Set())
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editInputValue, setEditInputValue] = useState('')
  const [currentUserId, setCurrentUserId] = useState(null)

  const fetchComments = async () => {
    try {
      const response = await api.get(`/api/product/comment/${itemId}`)
      const fetchedComments = response.data.data?.comments?.map(comment => ({
        _id: comment._id,
        user: { 
          id: comment.user._id,
          name: comment.user.name, 
          avatar: comment.user.profileImage || '👤' 
        },
        text: comment.text,
        timestamp: new Date(comment.createdAt).toLocaleString(),
        likes: comment.likeCount
      }))
      setComments(fetchedComments)
      
      // Initialize liked comments based on server response
      const likedCommentIds = new Set(
        (response.data.data?.comments || [])
          .filter(comment => comment.isLikedByUser)
          .map(comment => comment._id)
      )
      setLikedComments(likedCommentIds)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  useEffect(() => {
    if (itemId) fetchComments()
  }, [itemId])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/api/auth/user/me')
        setCurrentUserId(response.data.data?.id)
      } catch (error) {
        console.error('Error fetching current user:', error)
      }
    }
    fetchCurrentUser()
  }, [])

  const handlePostComment = async () => {
    if (inputValue.trim() === '') return

    try {
      const response = await api.post('/api/product/comment', { productId: itemId, text: inputValue })
      const newComment = {
        _id: response.data.data?.comment?._id || response.data.comment?._id,
        user: { name: response.data.data?.comment?.user?.name || response.data.comment?.user?.name, avatar: '👤' },
        text: inputValue,
        timestamp: 'now',
        likes: 0
      }
      setComments([newComment, ...comments])
      setInputValue('')
      if (onCommentAdded) onCommentAdded(itemId)
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  const toggleLikeComment = async (commentId) => {
    console.log('Toggling like for comment:', commentId)
    console.log('Currently liked:', likedComments.has(commentId))
    
    try {
      const response = await api.post('/api/product/comment/like', { commentId })
      
      console.log('API response:', response.data)
      
      // Update local state based on response
      const newLiked = new Set(likedComments)
      if (response.data.data?.isLiked) {
        newLiked.add(commentId)
        console.log('Added to liked comments')
      } else {
        newLiked.delete(commentId)
        console.log('Removed from liked comments')
      }
      setLikedComments(newLiked)
      console.log('New liked comments:', Array.from(newLiked))

      // Update comment like count
      setComments(prevComments => 
        prevComments.map(comment => 
          comment._id === commentId 
            ? { ...comment, likes: response.data.data?.likeCount }
            : comment
        )
      )
      console.log('Updated comment like count to:', response.data.likeCount)
    } catch (error) {
      console.error('Error toggling comment like:', error)
    }
  }

  const startEditingComment = (commentId, currentText) => {
    setEditingCommentId(commentId)
    setEditInputValue(currentText)
  }

  const cancelEditingComment = () => {
    setEditingCommentId(null)
    setEditInputValue('')
  }

  const saveEditedComment = async () => {
    if (editInputValue.trim() === '') return

    try {
      const response = await api.patch(`/api/product/comment/${editingCommentId}`, 
        { text: editInputValue }
      )
      
      // Update the comment in local state
      setComments(prevComments => 
        prevComments.map(comment => 
          comment._id === editingCommentId 
            ? { ...comment, text: response.data.data?.comment?.text }
            : comment
        )
      )
      
      setEditingCommentId(null)
      setEditInputValue('')
    } catch (error) {
      console.error('Error editing comment:', error)
    }
  }

  const deleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await api.delete(`/api/product/comment/${commentId}`)
      
      // Remove the comment from local state
      setComments(prevComments => prevComments.filter(comment => comment._id !== commentId))
      
      // Also remove from liked comments if it was liked
      setLikedComments(prevLiked => {
        const newLiked = new Set(prevLiked)
        newLiked.delete(commentId)
        return newLiked
      })
      
      // Notify parent component to update comment count
      if (onCommentAdded) onCommentAdded(itemId, -1)
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handlePostComment()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="comments-overlay" onClick={onClose} />

      {/* Modal */}
      <div className="comments-modal">
        {/* Header */}
        <div className="comments-header">
          <h2>Comments</h2>
          <button className="comments-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Divider */}
        <div className="comments-divider" />

        {/* Comments List */}
        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="comments-empty">
              <p>No comments yet</p>
              <p className="comments-empty-sub">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="comment-item">
                {/* Comment Avatar */}
                <div className="comment-avatar">{comment.user.avatar}</div>

                {/* Comment Content */}
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-username">{comment.user.name}</span>
                    <span className="comment-timestamp">{comment.timestamp}</span>
                    {currentUserId === comment.user.id && (
                      <div className="comment-actions">
                        {editingCommentId === comment._id ? (
                          <>
                            <button 
                              className="comment-action-btn save-btn"
                              onClick={saveEditedComment}
                            >
                              Save
                            </button>
                            <button 
                              className="comment-action-btn cancel-btn"
                              onClick={cancelEditingComment}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              className="comment-action-btn edit-btn"
                              onClick={() => startEditingComment(comment._id, comment.text)}
                            >
                              Edit
                            </button>
                            <button 
                              className="comment-action-btn delete-btn"
                              onClick={() => deleteComment(comment._id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {editingCommentId === comment._id ? (
                    <textarea
                      className="comment-edit-input"
                      value={editInputValue}
                      onChange={(e) => setEditInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          saveEditedComment()
                        } else if (e.key === 'Escape') {
                          cancelEditingComment()
                        }
                      }}
                      rows={2}
                    />
                  ) : (
                    <p className="comment-text">{comment.text}</p>
                  )}
                  <div className="comment-meta">
                    <span className="comment-likes">{comment.likes} likes</span>
                  </div>
                </div>

                {/* Like Button */}
                <button
                  className={`comment-like-btn ${
                    likedComments.has(comment._id) ? 'liked' : ''
                  }`}
                  onClick={() => toggleLikeComment(comment._id)}
                  aria-label="Like comment"
                >
                  ❤️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Input Section */}
        <div className="comments-input-section">
          <div className="comments-input-container">
            <div className="input-avatar">👤</div>
            <input
              type="text"
              className="comments-input"
              placeholder="Add a comment..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className="comments-post-btn"
              onClick={handlePostComment}
              disabled={inputValue.trim() === ''}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CommentsModal
