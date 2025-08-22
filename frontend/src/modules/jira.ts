import Port from '@/port';

export const getAllJiraTickets = async (userId: string) => {
  const response = await fetch(`${Port.BASE_URL}/jira?userId=${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return await response.json();
};
