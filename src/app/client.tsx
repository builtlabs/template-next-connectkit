"use client"

import { FC, PropsWithChildren } from "react"
import { env } from "@/env.mjs"
import { ConnectKitProvider, getDefaultConfig, SIWEConfig, SIWEProvider } from "connectkit"
import { getCsrfToken, getSession, SessionProvider, signIn, signOut } from "next-auth/react"
import { SiweMessage } from "siwe"
import { createConfig, WagmiConfig } from "wagmi"

import { APP_NAME } from "@/lib/constants"

const config = createConfig(
  getDefaultConfig({
    appName: APP_NAME,
    alchemyId: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    walletConnectProjectId: env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  })
)

const siweConfig: SIWEConfig = {
  getNonce: async () => {
    const token = await getCsrfToken()
    if (!token) throw new Error("Failed to fetch CSRF token")

    return token
  },
  createMessage: ({ nonce, address, chainId }) => {
    return new SiweMessage({
      nonce,
      chainId,
      address,
      version: "1",
      uri: window.location.origin,
      domain: window.location.host,
      statement: "Sign In With Ethereum to prove you control this wallet.",
    }).prepareMessage()
  },
  verifyMessage: async ({ message, signature }) => {
    const response = await signIn("credentials", {
      message: JSON.stringify(message),
      signature,
      redirect: false,
      callbackUrl: "/",
    })
    return response !== undefined && response.ok
  },
  getSession: async () => {
    const session = await getSession()

    if (session) {
      return {
        address: session.user.id,
        chainId: session.user.chainId,
      }
    }

    return session
  },
  signOut: () => signOut().then(() => true),
  signOutOnDisconnect: true,
  signOutOnAccountChange: true,
  signOutOnNetworkChange: true,
}

const ClientLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <WagmiConfig config={config}>
      <SessionProvider>
        <SIWEProvider {...siweConfig}>
          <ConnectKitProvider>{children}</ConnectKitProvider>
        </SIWEProvider>
      </SessionProvider>
    </WagmiConfig>
  )
}

export default ClientLayout
export { config as wagmiConfig }
