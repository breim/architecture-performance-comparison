export const handleAsyncErrors = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export const handleError = (err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'An unexpected error occurred' })
}
