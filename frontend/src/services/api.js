import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
})

export const dashboardApi = {
  getStats:        () => api.get('/dashboard/stats'),
  getLeaderboard:  () => api.get('/dashboard/leaderboard'),
  getTopPlayers:   () => api.get('/dashboard/top-players'),
  getGameBreakdown:() => api.get('/dashboard/game-breakdown'),
}

export const playerApi = {
  getAll:  ()      => api.get('/players'),
  getById: (id)    => api.get(`/players/${id}`),
  create:  (data)  => api.post('/players', data),
  update:  (id, d) => api.put(`/players/${id}`, d),
  delete:  (id)    => api.delete(`/players/${id}`),
}

export const coachApi = {
  getAll:  ()      => api.get('/coaches'),
  getById: (id)    => api.get(`/coaches/${id}`),
  create:  (data)  => api.post('/coaches', data),
  update:  (id, d) => api.put(`/coaches/${id}`, d),
  delete:  (id)    => api.delete(`/coaches/${id}`),
}

export const teamApi = {
  getAll:  ()      => api.get('/teams'),
  getById: (id)    => api.get(`/teams/${id}`),
  create:  (data)  => api.post('/teams', data),
  update:  (id, d) => api.put(`/teams/${id}`, d),
  delete:  (id)    => api.delete(`/teams/${id}`),
}

export const tournamentApi = {
  getAll:  ()      => api.get('/tournaments'),
  getById: (id)    => api.get(`/tournaments/${id}`),
  create:  (data)  => api.post('/tournaments', data),
  update:  (id, d) => api.put(`/tournaments/${id}`, d),
  delete:  (id)    => api.delete(`/tournaments/${id}`),
}

export const matchApi = {
  getAll:        ()            => api.get('/matches'),
  getById:       (id)          => api.get(`/matches/${id}`),
  schedule:      (data)        => api.post('/matches', data),
  recordResult:  (id, sA, sB) => api.put(`/matches/${id}/result`, { scoreA: sA, scoreB: sB }),
  delete:        (id)          => api.delete(`/matches/${id}`),
}

export default api
