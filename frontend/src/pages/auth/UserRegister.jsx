import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { FOOD_PARTNER_ID_KEY } from '../../components/FoodPartnerBottomNav'
import BottomNav from '../../components/BottomNav'
import { TextInput, PasswordInput, Button, InlineError } from '../../components/ui'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function UserRegister() {
  const navigate = useNavigate()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [fieldErrors, setFieldErrors] = React.useState({})
  const [formError, setFormError] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  const validate = () => {
    const errors = {}
    if (!name.trim()) errors.name = 'Name is required'
    if (!email.trim()) errors.email = 'Email is required'
    else if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address'
    if (!password) errors.password = 'Password is required'
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      await api.post('/api/auth/user/register', { name: name.trim(), email: email.trim(), password })
      localStorage.removeItem(FOOD_PARTNER_ID_KEY)
      navigate('/')
    } catch (err) {
      const status = err.response?.status
      if (status === 409) setFormError('An account with this email already exists.')
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
          <h1 className="auth-head">Create your account</h1>
          <p className="auth-sub">Save dishes, comment, and order from Cravyo.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextInput
            label="Name"
            name="name"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
            autoComplete="name"
            disabled={submitting}
          />
          <TextInput
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            autoComplete="email"
            disabled={submitting}
          />
          <PasswordInput
            label="Password"
            name="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            autoComplete="new-password"
            disabled={submitting}
          />
          <InlineError>{formError}</InlineError>
          <Button type="submit" fullWidth loading={submitting} loadingLabel="Creating account…">
            Create account
          </Button>
          <p className="small-note">
            Already have an account? <Link to="/user/login">Sign in</Link>
          </p>
          <p className="small-note">
            Are you a Food Partner? <Link to="/food-partner/register">Register your restaurant</Link>
          </p>
        </form>
      </div>
      <BottomNav />
    </div>
  )
}
