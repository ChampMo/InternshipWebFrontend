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
  const response = await fetch(`${Port.BASE_URL}/user/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ roleId: id, ...data }) // <<--- ตรงนี้สำคัญ
  });

  const result = await response.json();
  return result;
};

type RoleData = {
  roleName: string;
  jira?: boolean;
  cyberNews?: boolean;
  ti?: boolean;
  admin?: boolean;
};

export const GetRoleById = async (
  roleId: string
): Promise<{ message: string; data?: RoleData }> => {
  const response = await fetch(`${Port.BASE_URL}/user/role?roleId=${roleId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  const result = await response.json();
  return result;
};

export const DeleteRole = async (roleId: string): Promise<{ message: string }> => {
  const response = await fetch(`${Port.BASE_URL}/user/role`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ roleId })
  });

  const result = await response.json();
  return result;
};
