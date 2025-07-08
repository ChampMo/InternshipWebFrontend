
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
