import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { FOOD_PARTNER_ID_KEY } from '../../components/FoodPartnerBottomNav'
import { TextInput, PasswordInput, Button, InlineError } from '../../components/ui'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function FoodPartnerLogin() {
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
      const res = await api.post('/api/auth/merchant/login', { email: email.trim(), password })
      const merchant = res.data?.data
      if (merchant?.id != null) localStorage.setItem(FOOD_PARTNER_ID_KEY, String(merchant.id))
      navigate('/food-partner/home', { replace: true })
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
      <div className="auth-card">
        <div className="auth-card-partner-band">
          <span className="partner-role-chip">FOOD PARTNER</span>
          <h1 className="auth-head">Sign in to your kitchen</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextInput
            label="Email"
            name="email"
            type="email"
            placeholder="restaurant@example.com"
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
            New Food Partner? <Link to="/food-partner/register">Register your restaurant</Link>
          </p>
          <p className="small-note">
            Customer? <Link to="/user/login">Sign in here</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
