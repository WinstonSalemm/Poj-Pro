"use client";

import React, { createContext, useContext } from "react";

// Holds CSP nonce for client components that need to inject inline <script>
// Value is provided from app/layout.tsx using headers().get('x-nonce')
export const NonceContext = createContext<string | undefined>(undefined);

export const NonceProvider = ({ nonce, children }: { nonce?: string; children: React.ReactNode }) => {
  return <NonceContext.Provider value={nonce}>{children}</NonceContext.Provider>;
};

export const useCspNonce = () => useContext(NonceContext);
