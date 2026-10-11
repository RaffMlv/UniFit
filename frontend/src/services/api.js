export async function api(path, options = {}) {
    const res = await fetch(`/api${path}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.error || 'Erro desconhecido')
    }
    return data 
}