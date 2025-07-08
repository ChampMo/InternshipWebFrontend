// types.ts
export interface SigninRequest {
  email: string
  password: string
}

export interface User {
  id: string
  name: string
  email: string
}

export interface SigninResponse {
  token: string
  user: User
}
