import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      phone: string
      role: string
      level: string
    }
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    phone: string
    role: string
    level: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    level: string
    phone: string
  }
}

