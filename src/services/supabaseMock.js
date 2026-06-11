/**
 * Mock Supabase Service
 * Used when VITE_SUPABASE_MOCK=true
 * Provides in-memory mock implementations of Supabase methods
 */

class SupabaseMock {
  constructor() {
    this.users = {}
    this.sessions = {}
    this.data = {}
  }

  auth = {
    signUp: async ({ email, password }) => {
      const id = `user_${Date.now()}`
      this.users[id] = { id, email, password, created_at: new Date() }
      const sessionToken = `session_${Date.now()}`
      this.sessions[sessionToken] = { userId: id, createdAt: new Date() }
      return { data: { user: this.users[id], session: { access_token: sessionToken } }, error: null }
    },

    signIn: async ({ email, password }) => {
      const user = Object.values(this.users).find(u => u.email === email && u.password === password)
      if (!user) return { data: null, error: { message: 'Invalid credentials' } }
      const sessionToken = `session_${Date.now()}`
      this.sessions[sessionToken] = { userId: user.id, createdAt: new Date() }
      return { data: { user, session: { access_token: sessionToken } }, error: null }
    },

    signOut: async () => {
      return { error: null }
    },

    getSession: async () => {
      const token = localStorage.getItem('supabase_session')
      return { data: { session: this.sessions[token] || null }, error: null }
    }
  }

  from = (table) => {
    return {
      insert: async (data) => {
        if (!Array.isArray(data)) data = [data]
        const records = data.map(d => ({ ...d, id: `${table}_${Date.now()}_${Math.random()}` }))
        if (!this.data[table]) this.data[table] = []
        this.data[table].push(...records)
        return { data: records, error: null }
      },

      select: async (cols = '*') => {
        return {
          data: this.data[table] || [],
          error: null,
          eq: (column, value) => ({
            data: (this.data[table] || []).filter(r => r[column] === value),
            error: null
          }),
          order: (column, { ascending = true }) => ({
            data: [...(this.data[table] || [])].sort((a, b) => {
              const aVal = a[column], bVal = b[column]
              return ascending ? aVal - bVal : bVal - aVal
            }),
            error: null
          })
        }
      },

      update: async (updates) => {
        return { data: updates, error: null }
      },

      delete: async () => {
        this.data[table] = []
        return { error: null }
      }
    }
  }

  rpc = async (functionName, params) => {
    // Mock RPC calls
    return { data: null, error: null }
  }
}

export default new SupabaseMock()
