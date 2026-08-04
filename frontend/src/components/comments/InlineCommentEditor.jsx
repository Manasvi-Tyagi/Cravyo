import React from 'react'
import { Button } from '../ui'

const MAX_LENGTH = 500

export default function InlineCommentEditor({ value, onChange, onSave, onCancel, saving }) {
  const textareaRef = React.useRef(null)

  React.useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  return (
    <div className="comment-inline-editor">
      <textarea
        ref={textareaRef}
        className="comment-edit-input"
        value={value}
        maxLength={MAX_LENGTH}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
      />
      <div className="comment-edit-actions">
        <Button size="sm" variant="primary" onClick={onSave} loading={saving} disabled={!value.trim()}>
          Save
        </Button>
        <Button size="sm" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
