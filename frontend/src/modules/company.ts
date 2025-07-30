import Port from '@/port';

export const GetCompany = async (
): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/user/company`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })

  const result = await response.json()
  return result
}
