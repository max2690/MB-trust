// Soft-typed config for current next-auth version
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'

// Revert to lenient typing to satisfy NextAuth v4 callbacks in this project
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authOptions: any = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            phone: credentials.phone
          }
        })

        if (!user) {
          return null
        }

        // Для MVP пока без паролей, только телефон
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          level: user.level
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.sub = (user as any).id ?? token.sub
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.level = (user as any).level
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.phone = (user as any).phone
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(session.user ||= {} as any).id = token.sub as string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(session.user as any).role = token.role as string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(session.user as any).level = token.level as string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(session.user as any).phone = token.phone as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}

