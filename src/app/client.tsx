"use client"

import { FC, PropsWithChildren } from "react"
import { env } from "@/env.mjs"
import { ConnectKitProvider, getDefaultConfig } from "connectkit"
import { createConfig, WagmiConfig } from "wagmi"

import { APP_NAME } from "@/lib/constants"

const config = createConfig(
  getDefaultConfig({
    appName: APP_NAME,
    alchemyId: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    walletConnectProjectId: env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  })
)

const ClientLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>{children}</ConnectKitProvider>
    </WagmiConfig>
  )
}

export default ClientLayout
export { config as wagmiConfig }
