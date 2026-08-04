import React from 'react'

export default function VideoUploader({ onFileSelected, error, disabled }) {
  const inputRef = React.useRef(null)
  const [dragOver, setDragOver] = React.useState(false)

  const pick = () => !disabled && inputRef.current?.click()

  const handleFiles = (files) => {
    const file = files?.[0]
    if (file && file.type.startsWith('video/')) onFileSelected(file)
  }

  return (
    <div className="field">
      <div
        className={['video-drop-zone', dragOver ? 'drag-over' : '', error ? 'has-error' : ''].filter(Boolean).join(' ')}
        onClick={pick}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false) }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') pick() }}
        aria-label="Select a video, MP4 or MOV, up to 50MB"
      >
        <span className="video-drop-icon" aria-hidden="true">⬆</span>
        <span className="video-drop-primary">Tap to select a video</span>
        <span className="video-drop-secondary">MP4 or MOV, up to 50MB</span>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="visually-hidden-input"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
        />
      </div>
      {error && <span className="field-error" role="alert">{error}</span>}
    </div>
  )
}
