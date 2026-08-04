import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { FOOD_PARTNER_ID_KEY } from '../../components/FoodPartnerBottomNav'
import { TextInput, PasswordInput, Button, InlineError } from '../../components/ui'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function FoodPartnerRegister() {
  const navigate = useNavigate()
  const [fields, setFields] = React.useState({ name: '', restaurantName: '', address: '', email: '', phone: '', password: '' })
  const [fieldErrors, setFieldErrors] = React.useState({})
  const [formError, setFormError] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  const update = (key) => (e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))

  const validate = () => {
    const errors = {}
    if (!fields.name.trim()) errors.name = 'Owner name is required'
    if (!fields.restaurantName.trim()) errors.restaurantName = 'Restaurant name is required'
    if (!fields.email.trim()) errors.email = 'Email is required'
    else if (!EMAIL_RE.test(fields.email.trim())) errors.email = 'Enter a valid email address'
    if (!fields.password) errors.password = 'Password is required'
    else if (fields.password.length < 6) errors.password = 'Password must be at least 6 characters'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      const response = await api.post('/api/auth/merchant/register', {
        name: fields.name.trim(),
        restaurantName: fields.restaurantName.trim(),
        address: fields.address.trim(),
        email: fields.email.trim(),
        phone: fields.phone.trim(),
        password: fields.password,
      })
      const merchant = response.data?.data
      if (merchant?.id != null) localStorage.setItem(FOOD_PARTNER_ID_KEY, String(merchant.id))
      navigate('/food-partner/home')
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
      <div className="auth-card">
        <div className="auth-card-partner-band">
          <span className="partner-role-chip">FOOD PARTNER</span>
          <h1 className="auth-head">Register your restaurant</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextInput label="Owner name" placeholder="Your name" value={fields.name} onChange={update('name')} error={fieldErrors.name} disabled={submitting} autoComplete="name" />
          <TextInput label="Restaurant name" placeholder="Your restaurant name" value={fields.restaurantName} onChange={update('restaurantName')} error={fieldErrors.restaurantName} disabled={submitting} />
          <TextInput label="Address" placeholder="Street, city, pincode" value={fields.address} onChange={update('address')} disabled={submitting} autoComplete="street-address" />
          <TextInput label="Phone" placeholder="+91 98765 43210" value={fields.phone} onChange={update('phone')} disabled={submitting} autoComplete="tel" />
          <TextInput label="Email" type="email" placeholder="partner@example.com" value={fields.email} onChange={update('email')} error={fieldErrors.email} disabled={submitting} autoComplete="email" />
          <PasswordInput label="Password" placeholder="Set a strong password" value={fields.password} onChange={update('password')} error={fieldErrors.password} disabled={submitting} autoComplete="new-password" />
          <InlineError>{formError}</InlineError>
          <Button type="submit" fullWidth loading={submitting} loadingLabel="Creating account…">
            Create Food Partner account
          </Button>
          <p className="small-note">
            Already have an account? <Link to="/food-partner/login">Sign in</Link>
          </p>
          <p className="small-note">
            <Link to="/user/register">Register as a customer instead</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
