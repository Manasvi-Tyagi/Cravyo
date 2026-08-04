import React from 'react'
import api from '../api/axios'
import CommentRow from './comments/CommentRow'
import CommentComposer from './comments/CommentComposer'
import { ConfirmDialog, LoadingSkeleton, PageLevelError } from './ui'
import '../styles/comments.css'

function toViewModel(comment) {
  return {
    _id: comment._id,
    user: {
      id: comment.user?.id || comment.user?._id,
      name: comment.user?.name || 'Cravyo user',
      avatar: comment.user?.profileImage || '',
      role: comment.user?.role,
    },
    text: comment.text,
    timestamp: new Date(comment.createdAt).toLocaleString(),
    likes: comment.likeCount || 0,
    isLiked: Boolean(comment.isLikedByUser),
    isOwn: Boolean(comment.isOwnComment),
  }
}

export default function CommentsModal({ isOpen, productId, onClose, onCommentAdded }) {
  const [comments, setComments] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState(false)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)

  const [composerValue, setComposerValue] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  const [editingId, setEditingId] = React.useState(null)
  const [editValue, setEditValue] = React.useState('')
  const [savingEdit, setSavingEdit] = React.useState(false)

  const [pendingDeleteId, setPendingDeleteId] = React.useState(null)
  const [deleting, setDeleting] = React.useState(false)

  const [actionError, setActionError] = React.useState('')

  const dialogRef = React.useRef(null)
  const triggerRef = React.useRef(null)

  const loadComments = React.useCallback(() => {
    if (!productId) return
    setLoading(true)
    setLoadError(false)
    api.get(`/api/product/comment/${productId}`)
      .then((response) => setComments((response.data.data?.comments || []).map(toViewModel)))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [productId])

  React.useEffect(() => {
    if (!isOpen || !productId) return
    triggerRef.current = document.activeElement
    loadComments()
    setComposerValue('')
    setEditingId(null)
    setActionError('')

    let cancelled = false
    api.get('/api/auth/user/me')
      .then(() => { if (!cancelled) setIsAuthenticated(true) })
      .catch(() => api.get('/api/auth/merchant/me')
        .then(() => { if (!cancelled) setIsAuthenticated(true) })
        .catch(() => { if (!cancelled) setIsAuthenticated(false) }))
    return () => { cancelled = true }
  }, [isOpen, productId, loadComments])

  React.useEffect(() => {
    if (!isOpen) return undefined
    dialogRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      triggerRef.current?.focus?.()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handlePostComment = async () => {
    const text = composerValue.trim()
    if (!text || submitting) return
    setSubmitting(true)
    setActionError('')
    try {
      const response = await api.post('/api/product/comment', { productId, text })
      setComments((current) => [toViewModel(response.data.data.comment), ...current])
      setComposerValue('')
      onCommentAdded?.(productId)
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Could not post your comment. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleLikeComment = async (commentId) => {
    setActionError('')
    try {
      const response = await api.post('/api/product/comment/like', { commentId })
      setComments((current) => current.map((c) => (c._id === commentId
        ? { ...c, isLiked: response.data.data.isLiked, likes: response.data.data.likeCount }
        : c)))
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Sign in to like comments.')
    }
  }

  const startEdit = (comment) => {
    setEditingId(comment._id)
    setEditValue(comment.text)
  }

  const saveEdit = async () => {
    const text = editValue.trim()
    if (!text) return
    setSavingEdit(true)
    setActionError('')
    try {
      const response = await api.patch(`/api/product/comment/${editingId}`, { text })
      setComments((current) => current.map((c) => (c._id === editingId ? { ...c, text: response.data.data.comment.text } : c)))
      setEditingId(null)
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Could not save your edit.')
    } finally {
      setSavingEdit(false)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/product/comment/${pendingDeleteId}`)
      setComments((current) => current.filter((c) => c._id !== pendingDeleteId))
      onCommentAdded?.(productId, -1)
      setPendingDeleteId(null)
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Could not delete this comment.')
      setPendingDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <button className="comments-overlay" onClick={onClose} aria-label="Close comments" type="button" />
      <section
        ref={dialogRef}
        className="comments-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Comments"
        tabIndex={-1}
      >
        <div className="comments-header">
          <h2>{loading ? 'Comments' : `${comments.length} comment${comments.length === 1 ? '' : 's'}`}</h2>
          <button className="comments-close-btn" onClick={onClose} aria-label="Close comments" type="button">✕</button>
        </div>

        <div className="comments-list">
          {loading ? (
            <div style={{ padding: '14px 18px' }}>
              <LoadingSkeleton variant="list" count={3} />
            </div>
          ) : loadError ? (
            <PageLevelError message="Could not load comments." onRetry={loadComments} />
          ) : comments.length === 0 ? (
            <div className="comments-empty">
              <p>No comments yet</p>
              <p className="comments-empty-sub">Be the first to say something.</p>
            </div>
          ) : comments.map((comment) => (
            <CommentRow
              key={comment._id}
              comment={comment}
              isEditing={editingId === comment._id}
              editValue={editValue}
              onEditValueChange={setEditValue}
              onStartEdit={() => startEdit(comment)}
              onSaveEdit={saveEdit}
              onCancelEdit={() => setEditingId(null)}
              savingEdit={savingEdit && editingId === comment._id}
              onToggleLike={() => toggleLikeComment(comment._id)}
              onRequestDelete={() => setPendingDeleteId(comment._id)}
            />
          ))}
        </div>

        <div className="comments-input-section">
          {actionError && <p className="comments-error" role="alert">{actionError}</p>}
          <CommentComposer
            isAuthenticated={isAuthenticated}
            value={composerValue}
            onChange={setComposerValue}
            onSubmit={handlePostComment}
            submitting={submitting}
          />
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Delete this comment?"
        description="This can't be undone once confirmed."
        confirmLabel="Delete"
        cancelLabel="Keep comment"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </>
  )
}
