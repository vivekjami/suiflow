// Core types for SuiFlow DEX Aggregator

export interface Pool {
    dex: 'Cetus' | 'Turbos' | 'Kriya';
    address: string;
    tokenA: string;
    tokenB: string;
    tokenASymbol: string;
    tokenBSymbol: string;
    liquidity: number;
    fee: number;
    volume24h: number;
    price: number;
    estimatedSlippage?: number;
}

export interface RouteStep {
    from: string;
    to: string;
    dex: string;
    pool: string;
    expectedOutput: number;
    fee: number;
    slippageEstimate: number;
}

export interface OptimizedRoute {
    recommended: {
        type: 'direct' | 'multi_hop' | 'cross_chain';
        confidence: number;
        steps: RouteStep[];
        totalOutput: string;
        savingsVsDirect: string;
        gasEstimate: string;
        riskLevel: 'low' | 'medium' | 'high';
    };
    alternatives: Array<{
        steps: RouteStep[];
        totalOutput: string;
        tradeOff: string;
    }>;
    explanation: string;
}

export interface OptimizationRequest {
    tokenA: string;
    tokenB: string;
    amount: number;
    pools: Pool[];
    userPreferences?: {
        maxSlippage?: number;
        prioritize?: 'speed' | 'cost' | 'safety';
    };
}

export interface CrossChainRoute {
    id: string;
    fromChain: string;
    toChain: string;
    fromAmount: string;
    toAmount: string;
    estimatedTime: number;
    gasCost: string;
    steps: Array<{
        tool: string;
        action: string;
    }>;
}

export interface SwapQuote {
    inputAmount: number;
    outputAmount: number;
    priceImpact: number;
    fee: number;
    route: RouteStep[];
}

export interface Token {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoUrl?: string;
    ensName?: string;
}

// Supported tokens on Sui
export const SUPPORTED_TOKENS: Token[] = [
    {
        symbol: 'SUI',
        name: 'Sui',
        address: '0x2::sui::SUI',
        decimals: 9,
        logoUrl: '/tokens/sui.png',
    },
    {
        symbol: 'USDC',
        name: 'USD Coin',
        address: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
        decimals: 6,
        logoUrl: '/tokens/usdc.png',
        ensName: 'usdc.eth',
    },
    {
        symbol: 'USDT',
        name: 'Tether USD',
        address: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN',
        decimals: 6,
        logoUrl: '/tokens/usdt.png',
        ensName: 'usdt.eth',
    },
    {
        symbol: 'WETH',
        name: 'Wrapped Ether',
        address: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN',
        decimals: 8,
        logoUrl: '/tokens/weth.png',
        ensName: 'weth.eth',
    },
    {
        symbol: 'CETUS',
        name: 'Cetus Token',
        address: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS',
        decimals: 9,
        logoUrl: '/tokens/cetus.png',
    },
];

// Chain IDs for cross-chain
export const CHAIN_IDS = {
    ETHEREUM: 1,
    POLYGON: 137,
    ARBITRUM: 42161,
    SUI: 'sui',
} as const;
