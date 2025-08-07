import Port from '@/port';

export const GetTag = async (
): Promise<{ message: string }> => {
    const response = await fetch(`${Port.BASE_URL}/cybernews/tag`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })

    const result = await response.json()
    return result
}

export async function PostTag(data: { tagName: string }): Promise<{ message: string }> {
    const response = await fetch(`${Port.BASE_URL}/cybernews/tag`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tagName: data.tagName })
    });

    const result = await response.json();
    return result;
}
export async function PutTag(id: string, data: { tagName: string }): Promise<{ message: string }> {
    const response = await fetch(`${Port.BASE_URL}/cybernews/tag?tagId=${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tagName: data.tagName })
    });

    const result = await response.json();
    return result;
}

export async function DeleteTag(id: string): Promise<{ message: string }> {
    const response = await fetch(`${Port.BASE_URL}/cybernews/tag?tagId=${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json();
    return result;
}