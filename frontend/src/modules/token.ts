import Port from '@/port';

export const CreateToken = async (
    data: { name: string, token: string, type: string }
  ): Promise<{ message: string }> => {
    const response = await fetch(`${Port.BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  
    const result = await response.json()
    return result
  }

export const GetToken = async (
  ): Promise<{ message: string, data: any[] }> => {
    const response = await fetch(`${Port.BASE_URL}/token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
  
    const result = await response.json()
    return result
  }

export const UpdateToken = async (
    data: { tokenId: string | undefined, name: string | undefined, type: string | undefined }
  ): Promise<{ message: string }> => {
    const response = await fetch(`${Port.BASE_URL}/token`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  
    const result = await response.json()
    return result
  }

export const DeleteToken = async (
    data: { tokenId: string | undefined }
  ): Promise<{ message: string }> => {
    const response = await fetch(`${Port.BASE_URL}/token`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  
    const result = await response.json()
    return result
  }

  export const UpdateTokenInuse = async (
    data: { tokenId: string | undefined, status: boolean | undefined }
  ): Promise<{ message: string }> => {
    const response = await fetch(`${Port.BASE_URL}/token/inuse`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  
    const result = await response.json()
    return result
  }