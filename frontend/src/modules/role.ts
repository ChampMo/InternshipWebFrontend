import Port from '@/port';

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

