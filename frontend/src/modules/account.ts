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

export const ReCreateAccount = async (
  data: { email: string, role: string, company: string }
): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/resignup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()
  return result
}

export const GetAccount = async (
): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })

  const result = await response.json()
  return result
}

export const UpdateAccount = async (
  data: { userId:string, roleId: string, companyId: string }
): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/user`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()
  return result
}

export const DeleteAccount = async (
  data: { userId:string }
): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/user`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()
  return result
}


