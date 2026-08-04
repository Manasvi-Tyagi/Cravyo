import React from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import '../../styles/create-food.css'
import VideoUploader from '../../components/VideoUploader'
import VideoPreview from '../../components/VideoPreview'
import { PageHeader, TextInput, TextArea, Button, InlineError } from '../../components/ui'

const MAX_SIZE_BYTES = 50 * 1024 * 1024

export default function CreateFood() {
  const navigate = useNavigate()
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [price, setPrice] = React.useState('')
  const [videoFile, setVideoFile] = React.useState(null)
  const [videoUrl, setVideoUrl] = React.useState(null)
  const [fieldErrors, setFieldErrors] = React.useState({})
  const [phase, setPhase] = React.useState('idle') // idle | uploading | processing
  const [formError, setFormError] = React.useState('')

  React.useEffect(() => () => { if (videoUrl) URL.revokeObjectURL(videoUrl) }, [videoUrl])

  const selectFile = (file) => {
    setFieldErrors((prev) => ({ ...prev, video: undefined }))
    if (file.size > MAX_SIZE_BYTES) {
      setFieldErrors((prev) => ({ ...prev, video: 'Video must be 50MB or smaller.' }))
      return
    }
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    setVideoFile(file)
    setVideoUrl(URL.createObjectURL(file))
  }

  const validate = () => {
    const errors = {}
    if (!videoFile) errors.video = 'A video is required'
    if (!name.trim()) errors.name = 'Product name is required'
    const priceNumber = Number(price)
    if (price === '' || Number.isNaN(priceNumber) || priceNumber <= 0) errors.price = 'Enter a price greater than 0'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (phase !== 'idle') return
    if (!validate()) return

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('description', description.trim())
    formData.append('price', price)
    formData.append('video', videoFile)

    setPhase('uploading')
    try {
      await api.post('/api/product/create', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && progressEvent.loaded >= progressEvent.total) setPhase('processing')
        },
      })
      navigate('/food-partner/home')
    } catch (err) {
      setFormError(err.response?.data?.message || 'Upload failed. Your details are still here — try again.')
      setPhase('idle')
    }
  }

  const isSubmitting = phase !== 'idle'
  const canSubmit = name.trim() && videoFile && price !== ''

  if (phase !== 'idle') {
    return (
      <div className="create-food-shell">
        <div className="create-food-progress">
          <span className="create-food-spinner" aria-hidden="true" />
          <div className="create-food-progress-title">
            {phase === 'uploading' ? 'Uploading video…' : 'Processing video…'}
          </div>
          <p className="create-food-progress-sub">This can take a moment on slower connections. Don't close the app.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="create-food-shell">
      <PageHeader title="Add a product" />

      <form className="create-food-form" onSubmit={handleSubmit} noValidate>
        <div className="create-food-media">
          {videoUrl ? (
            <VideoPreview videoUrl={videoUrl} onReplace={() => { setVideoFile(null); setVideoUrl(null) }} />
          ) : (
            <VideoUploader onFileSelected={selectFile} error={fieldErrors.video} />
          )}
        </div>

        <div className="create-food-fields">
          <TextInput
            label="Product name"
            placeholder="e.g. Butter Chicken Bowl"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
          />

          <TextArea
            label="Description"
            placeholder="Describe the dish…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <TextInput
            label="Price (₹)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={fieldErrors.price}
          />

          <InlineError>{formError}</InlineError>

          <Button type="submit" fullWidth disabled={!canSubmit} loading={isSubmitting}>
            Publish product
          </Button>
        </div>
      </form>
    </div>
  )
}
