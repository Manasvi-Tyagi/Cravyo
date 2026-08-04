import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui'

const MAX_LENGTH = 500

export default function CommentComposer({ isAuthenticated, value, onChange, onSubmit, submitting }) {
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return (
      <div className="comment-composer comment-composer--signed-out">
        <p>Sign in to join the conversation</p>
        <Button size="sm" variant="primary" onClick={() => navigate('/user/login')}>Sign in</Button>
      </div>
    )
  }

  const nearLimit = value.length >= MAX_LENGTH - 50

  return (
    <form
      className="comment-composer"
      onSubmit={(e) => { e.preventDefault(); onSubmit() }}
    >
      <input
        className="comment-composer-input"
        placeholder="Add a comment…"
        value={value}
        maxLength={MAX_LENGTH}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Add a comment"
      />
      {nearLimit && (
        <span className={['field-counter', value.length >= MAX_LENGTH ? 'at-limit' : 'near-limit'].join(' ')}>
          {value.length}/{MAX_LENGTH}
        </span>
      )}
      <button
        type="submit"
        className="comment-composer-send"
        disabled={!value.trim() || submitting}
        aria-label="Post comment"
      >
        {submitting ? <span className="btn-spinner" aria-hidden="true" /> : '→'}
      </button>
    </form>
  )
}
