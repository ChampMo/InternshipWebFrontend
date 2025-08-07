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
export const PostRole = async (
  data: { roleName: string; jira?: boolean; cyberNews?: boolean; ti?: boolean; admin?: boolean }
): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/user/role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  return result;
};

export const PutRole = async (
  id: string,
  data: { roleName: string; jira?: boolean; cyberNews?: boolean; ti?: boolean; admin?: boolean }
): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/user/role?roleId=${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  return result;
};

export const GetRoleById = async (
  roleId: string
): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/user/role?roleId=${roleId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  const result = await response.json();
  return result;
};
