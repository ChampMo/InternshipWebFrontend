import Port from '@/port';

type PermissionsResult = {
      roleId: string;
      roleName: string;
      jira: boolean;
      cyberNews: boolean;
      ti: boolean;
      admin: boolean;
    }

export const GetPermissions = async (
    userId: string
): Promise<PermissionsResult> => {
  const response = await fetch(`${Port.BASE_URL}/user/permissions?userId=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })

  const result = await response.json()
  return result
}

