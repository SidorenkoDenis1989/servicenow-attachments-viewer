import authService from './auth.service';

export const graphqlQuery = async (operations) => {
    const res = await fetch('/api/now/graphql', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-UserToken': authService.token
        },
        body: JSON.stringify(operations)
    });

    if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`);
    
    const json = await res.json();
    if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join(', '));
    
    return json;
};