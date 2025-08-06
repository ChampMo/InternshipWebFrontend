
import { SigninRequest, SigninResponse } from '@/app/type'
import Port from '@/port';

export const signin = async (
  data: SigninRequest
): Promise<SigninResponse> => {
  const response = await fetch(`${Port.BASE_URL}/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result: SigninResponse = await response.json()
  return result
}

export const sendOTP = async (
  data: { email: string }
): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/signin/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()
  return result
}

export const verifyOTP = async (
  data: { email: string, otp: string }
): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/signin/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()
  return result
}

export const resetPassword = async (
  data: { email: string, password: string }
): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()
  return result
}

export const resetPasswordByOldPass = async (
  data: { userId: string, oldPassword: string, password: string }
): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/reset-password/old-pass`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()
  return result
}


