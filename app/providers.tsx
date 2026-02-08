'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    createNetworkConfig,
    SuiClientProvider,
    WalletProvider
} from '@mysten/dapp-kit';
import { useState, type ReactNode } from 'react';
import '@mysten/dapp-kit/dist/index.css';

// Network configuration
const { networkConfig } = createNetworkConfig({
    mainnet: { url: 'https://fullnode.mainnet.sui.io', network: 'mainnet' },
    testnet: { url: 'https://fullnode.testnet.sui.io', network: 'testnet' },
    devnet: { url: 'https://fullnode.devnet.sui.io', network: 'devnet' },
});

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30 * 1000, // 30 seconds
                retry: 2,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
                <WalletProvider autoConnect>
                    {children}
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    );
}
