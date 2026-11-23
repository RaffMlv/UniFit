const API_URL = 'https://unifit-production-8008f252.up.railway.app'

export async function api(path, options = {}) {
    const res = await fetch(`${API_URL}/api${path}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
        throw new Error(data.erro || data.error || 'Erro desconhecido')
    }

    return data
}