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

export const PutCompany = async (
  data: { companyId: string; companyName: string }
): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/user/company?companyId=${data.companyId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      companyId: data.companyId,
      companyName: data.companyName
    })
  })

  const result = await response.json()
  return result
}
export const PostCompany = async (
  data: { companyName: string }
): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/user/company`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ companyName: data.companyName })
  });

  const result = await response.json();
  return result;
}

export const DeleteCompany = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/user/company`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ companyId: id }) // ส่งใน body
  });

  const result = await response.json();
  return result;
}