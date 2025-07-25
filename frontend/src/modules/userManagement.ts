import Port from '@/port';

export const CreateAccount = async (
  data: { email: string, role: string, company: string }
): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()
  return result
}


export const GetRole = async (
): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/user/role`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })

  const result = await response.json()
  return result
}

