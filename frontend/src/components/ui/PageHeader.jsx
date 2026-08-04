import React from 'react'
import { useNavigate } from 'react-router-dom'
import IconButton from './IconButton'

export default function PageHeader({ title, subtitle, showBack = true, rightAction }) {
  const navigate = useNavigate()

  return (
    <div className="page-header">
      {showBack && (
        <IconButton label="Back" onClick={() => navigate(-1)}>
          ←
        </IconButton>
      )}
      <div className="page-header-titles">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {rightAction && <div className="page-header-right">{rightAction}</div>}
    </div>
  )
}
