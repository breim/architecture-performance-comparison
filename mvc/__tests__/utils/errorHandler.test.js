import { handleAsyncErrors, handleError } from '../../src/utils/errorHandler.js'

describe('Error Handler Utils', () => {
  let req, res, next

  beforeEach(() => {
    req = {}
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    next = jest.fn()
  })

  describe('handleAsyncErrors', () => {
    test('should call the wrapped function and handle success', async () => {
      const mockFn = jest.fn().mockResolvedValue('success')
      const wrappedFn = handleAsyncErrors(mockFn)

      await wrappedFn(req, res, next)

      expect(mockFn).toHaveBeenCalledWith(req, res, next)
      expect(next).not.toHaveBeenCalled()
    })

    test('should catch an error and pass it to next', async () => {
      const error = new Error('Test error')
      const mockFn = jest.fn().mockRejectedValue(error)
      const wrappedFn = handleAsyncErrors(mockFn)

      await wrappedFn(req, res, next)

      expect(mockFn).toHaveBeenCalledWith(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('handleError', () => {
    test('should return a 500 status and a generic error message', () => {
      const error = new Error('Something went wrong')

      handleError(error, req, res, next)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'An unexpected error occurred',
      })
    })
  })
})
