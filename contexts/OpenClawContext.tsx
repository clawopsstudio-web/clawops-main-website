"use client";

import React, { createContext, useContext, type ReactNode } from "react";
import { useOpenClawGateway } from "@/hooks/use-openclaw-gateway";
import type {
  GatewayConnectionState,
  HelloOk,
  GatewayEventName,
  GatewayEventMap,
  RPCMethodMap,
  RPCParams,
  RPCResult,
  Snapshot,
} from "@/lib/types";

interface OpenClawContextValue {
  state: GatewayConnectionState;
  isConnected: boolean;
  hello: HelloOk | null;
  snapshot: Snapshot | null;
  error: Error | null;
  rpc: <M extends keyof RPCMethodMap>(
    method: M,
    ...args: RPCParams<M> extends void ? [] : [RPCParams<M>]
  ) => Promise<RPCResult<M>>;
  subscribe: <E extends GatewayEventName>(
    event: E,
    callback: (payload: GatewayEventMap[E]) => void
  ) => () => void;
  connect: () => void;
  disconnect: () => void;
}

const OpenClawContext = createContext<OpenClawContextValue | undefined>(undefined);

export function OpenClawProvider({ children }: { children: ReactNode }) {
  // Use Tailscale Funnel URL for public access
  const gateway = useOpenClawGateway({
    url: process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL ?? 'https://app.clawops.studio',
    token: process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_TOKEN ?? 'a1a9f317b073ff79360260354ba6a83781e59eb2e134b495',
    autoConnect: true,
  });

  const value: OpenClawContextValue = {
    ...gateway,
    snapshot: gateway.hello?.snapshot ?? null,
  };

  return (
    <OpenClawContext.Provider value={value}>
      {children}
    </OpenClawContext.Provider>
  );
}

export function useOpenClaw() {
  const context = useContext(OpenClawContext);
  if (context === undefined) {
    // During SSR/static generation, return a safe fallback
    return {
      state: 'disconnected' as const,
      isConnected: false,
      hello: null,
      snapshot: null,
      error: null,
      rpc: (async () => null) as any,
      subscribe: () => () => {},
      connect: () => {},
      disconnect: () => {},
    };
  }
  return context;
}
