// we use any here as we actually won't need strict type checking here
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import ApiError from '../utils/ApiError'
import mongoose from 'mongoose'
import httpStatus from 'http-status'
import { IS_PRODUCTION } from '../config/config'

export const errorConverter = (err: any, req: any, res: any, next: any) => {
  let error = err
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR
    const message = error.message || httpStatus[statusCode]
    error = new ApiError(statusCode, message as string, true, err.stack)
  }
  next(error)
}

export const errorHandler = (err: any, req: any, res: any, next: any) => {
  let { statusCode, message } = err
  if (IS_PRODUCTION && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
  }

  res.locals.errorMessage = err.message

  const response = {
    code: statusCode,
    message,
    ...(!IS_PRODUCTION && { stack: err.stack }),
  }

  res.status(statusCode).send(response)
}
