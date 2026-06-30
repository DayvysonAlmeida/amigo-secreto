const API_BASE = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.detail || 'Algo deu errado. Tente novamente.')
  }

  return data
}

export function createGroup(payload) {
  return request('/groups/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getGroup(adminToken) {
  return request(`/groups/${adminToken}/`)
}

export function addParticipant(adminToken, payload) {
  return request(`/groups/${adminToken}/participants/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function removeParticipant(adminToken, participantId) {
  return request(`/groups/${adminToken}/participants/${participantId}/`, {
    method: 'DELETE',
  })
}

export function drawGroup(adminToken) {
  return request(`/groups/${adminToken}/draw/`, {
    method: 'POST',
  })
}

export function revealParticipant(participantToken) {
  return request(`/reveal/${participantToken}/`)
}
