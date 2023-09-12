import { env } from "@/env.mjs"
import { prisma } from "@/server/db"
import { getServerSession as getServerSessionInternal, type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getCsrfToken } from "next-auth/react"
import { SiweMessage } from "siwe"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "siwe",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials) throw new Error("No credentials")

          const siwe = new SiweMessage(JSON.parse(credentials.message))
          const nonce = await getCsrfToken({ req: { headers: req.headers } })
          const nextAuthUrl = new URL(env.NEXTAUTH_URL)

          const result = await siwe.verify({
            signature: credentials.signature,
            domain: nextAuthUrl.host,
            nonce,
          })

          if (result.success) {
            const dbUser = await prisma.user.upsert({
              where: {
                id: siwe.address,
              },
              update: {
                chainId: siwe.chainId,
              },
              create: {
                id: siwe.address,
                chainId: siwe.chainId,
              },
              select: {
                role: true,
              },
            })

            return {
              id: siwe.address,
              chainId: siwe.chainId,
              role: dbUser.role,
            }
          } else {
            return null
          }
        } catch (e) {
          console.error(e)
          return null
        }
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      session.user = token
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        // Persist the id and role to the token right after authentication
        token.id = user.id
        token.chainId = user.chainId
        token.role = user.role
      } else {
        const dbUser = await prisma.user.findUniqueOrThrow({
          where: {
            id: token.id,
          },
          select: {
            chainId: true,
            role: true,
          },
        })

        token.chainId = dbUser.chainId
        token.role = dbUser.role
      }

      return token
    },
  },
  secret: env.NEXTAUTH_SECRET,
}

export async function getServerSession() {
  const session = await getServerSessionInternal(authOptions)

  return session
}
