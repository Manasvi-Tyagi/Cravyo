import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { FOOD_PARTNER_ID_KEY } from '../../components/FoodPartnerBottomNav'
import BottomNav from '../../components/BottomNav'
import { TextInput, PasswordInput, Button, InlineError } from '../../components/ui'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function UserLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [fieldErrors, setFieldErrors] = React.useState({})
  const [formError, setFormError] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  const validate = () => {
    const errors = {}
    if (!email.trim()) errors.email = 'Email is required'
    else if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address'
    if (!password) errors.password = 'Password is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      await api.post('/api/auth/user/login', { email: email.trim(), password })
      localStorage.removeItem(FOOD_PARTNER_ID_KEY)
      navigate('/')
    } catch (err) {
      const status = err.response?.status
      if (status === 401) setFormError("That email and password don't match.")
      else setFormError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-brand-logo">Cravyo</div>
        <div className="auth-brand-tagline">Discover food like never before</div>
      </div>

      <div className="auth-card">
        <div className="auth-head-row">
          <h1 className="auth-head">Sign in</h1>
          <p className="auth-sub">Sign in to save, comment, and order.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextInput
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            autoComplete="email"
          />
          <PasswordInput
            label="Password"
            name="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            autoComplete="current-password"
          />
          <InlineError>{formError}</InlineError>
          <Button type="submit" fullWidth loading={submitting} loadingLabel="Signing in…">
            Sign in
          </Button>
          <p className="small-note">
            New to Cravyo? <Link to="/user/register">Create an account</Link>
          </p>
          <p className="small-note">
            Are you a Food Partner? <Link to="/food-partner/login">Sign in here</Link>
          </p>
        </form>
      </div>
      <BottomNav />
    </div>
  )
}
