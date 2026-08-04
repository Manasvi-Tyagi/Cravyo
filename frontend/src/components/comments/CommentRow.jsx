import React from 'react'
import InlineCommentEditor from './InlineCommentEditor'

export default function CommentRow({
  comment,
  isEditing,
  editValue,
  onEditValueChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  savingEdit,
  onToggleLike,
  onRequestDelete,
}) {
  return (
    <article className="comment-row">
      {comment.user.avatar && /^https?:/.test(comment.user.avatar) ? (
        <img className="comment-avatar" src={comment.user.avatar} alt="" />
      ) : (
        <div className="comment-avatar" aria-hidden="true">{comment.user.avatar || '👤'}</div>
      )}
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-username">{comment.user.name}</span>
          {comment.user.role === 'merchant' && <span className="comment-role-chip">Food Partner</span>}
          {comment.isOwn && <span className="comment-you-chip">You</span>}
          <span className="comment-timestamp">{comment.timestamp}</span>
        </div>

        {isEditing ? (
          <InlineCommentEditor
            value={editValue}
            onChange={onEditValueChange}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
            saving={savingEdit}
          />
        ) : (
          <>
            <p className="comment-text">{comment.text}</p>
            <div className="comment-meta">
              <button
                type="button"
                className={['comment-like-btn', comment.isLiked ? 'liked' : ''].filter(Boolean).join(' ')}
                onClick={onToggleLike}
                aria-pressed={comment.isLiked}
                aria-label={comment.isLiked ? 'Unlike comment' : 'Like comment'}
              >
                ♥ {comment.likes}
              </button>
              {comment.isOwn && (
                <>
                  <button type="button" className="comment-action-link" onClick={onStartEdit}>Edit</button>
                  <button type="button" className="comment-action-link comment-action-link--danger" onClick={onRequestDelete}>Delete</button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  )
}
