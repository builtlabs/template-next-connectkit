import NextAuth from "next-auth"

type Role = "ADMIN" | "USER"

declare module "next-auth" {
  interface AdapterUser {
    id: string
  }

  interface User {
    id: string
    chainId: number
    role: Role
  }

  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    chainId: number
    role: Role
  }
}
