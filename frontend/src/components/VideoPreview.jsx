import React from 'react'

export default function VideoPreview({ videoUrl, onReplace, disabled }) {
  return (
    <div className="video-preview">
      <video src={videoUrl} className="video-preview-video" muted playsInline />
      <button type="button" className="video-preview-replace" onClick={onReplace} disabled={disabled}>
        Replace video
      </button>
    </div>
  )
}
