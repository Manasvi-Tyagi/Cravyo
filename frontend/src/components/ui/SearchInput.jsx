import React from 'react'

function SearchGlyph() {
  return (
    <svg className="search-field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function SearchInput({ value, onChange, onClear, loading, placeholder, className = '', ...rest }) {
  return (
    <label className={['search-field', className].filter(Boolean).join(' ')} role="search">
      {loading ? <span className="search-field-spinner" aria-hidden="true" /> : <SearchGlyph />}
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder || 'Search'}
        {...rest}
      />
      {value && (
        <button type="button" className="search-field-clear" aria-label="Clear search" onClick={onClear}>
          ✕
        </button>
      )}
    </label>
  )
}
