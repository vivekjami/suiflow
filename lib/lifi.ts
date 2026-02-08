// LI.FI SDK Integration for Cross-Chain Swaps
// https://docs.li.fi
import 'server-only';
import type { CrossChainRoute } from './types';
import { SUPPORTED_SOURCE_CHAINS } from './lifi-constants';

// LI.FI API Base URL
const LIFI_API_BASE = 'https://li.quest/v1';

// Native token addresses (zero address = native)
const NATIVE_TOKEN = '0x0000000000000000000000000000000000000000';

interface LiFiRoute {
    id: string;
    fromAmount: string;
    toAmount: string;
    toAmountMin: string;
    gasCostUSD: string;
    steps: Array<{
        tool: string;
        type: string;
        action: {
            fromToken: { symbol: string };
            toToken: { symbol: string };
        };
        estimate: {
            executionDuration: number;
        };
    }>;
}

/**
 * Gets cross-chain routes from LI.FI
 */
export async function getCrossChainQuote(
    fromChain: number,
    toChain: number | string,
    fromToken: string,
    toToken: string,
    amount: string,
    userAddress: string
): Promise<CrossChainRoute[]> {
    const apiKey = process.env.LIFI_API_KEY; // Server-side secret key

    // If no API key, return mock data
    if (!apiKey) {
        console.warn('No LIFI_API_KEY set, using mock routes');
        return getMockCrossChainRoutes(fromChain, amount);
    }

    try {
        const params = new URLSearchParams({
            fromChain: fromChain.toString(),
            toChain: toChain.toString(),
            fromToken,
            toToken,
            fromAmount: amount,
            fromAddress: userAddress,
            toAddress: userAddress,
            slippage: '0.03', // 3%
            order: 'RECOMMENDED',
        });

        const response = await fetch(`${LIFI_API_BASE}/routes?${params}`, {
            headers: {
                'x-lifi-api-key': apiKey,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('LI.FI API error:', response.status);
            return getMockCrossChainRoutes(fromChain, amount);
        }

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
            return getMockCrossChainRoutes(fromChain, amount);
        }

        return data.routes.slice(0, 5).map((route: LiFiRoute) => ({
            id: route.id,
            fromChain: getChainName(fromChain),
            toChain: 'Sui',
            fromAmount: route.fromAmount,
            toAmount: route.toAmount,
            estimatedTime: route.steps.reduce(
                (acc: number, step: { estimate: { executionDuration: number } }) => acc + (step.estimate?.executionDuration || 0),
                0
            ),
            gasCost: route.gasCostUSD,
            steps: route.steps.map((step: { tool: string; action: { fromToken: { symbol: string }; toToken: { symbol: string } } }) => ({
                tool: step.tool,
                action: `${step.action.fromToken.symbol} → ${step.action.toToken.symbol}`,
            })),
        }));
    } catch (error) {
        console.error('Failed to fetch LI.FI routes:', error);
        return getMockCrossChainRoutes(fromChain, amount);
    }
}

/**
 * Gets supported tokens for a chain from LI.FI
 */
export async function getSupportedTokens(chainId: number): Promise<Array<{
    address: string;
    symbol: string;
    name: string;
    decimals: number;
}>> {
    try {
        const response = await fetch(`${LIFI_API_BASE}/tokens?chains=${chainId}`);

        if (!response.ok) {
            return getDefaultTokens(chainId);
        }

        const data = await response.json();
        return data.tokens[chainId] || getDefaultTokens(chainId);
    } catch {
        return getDefaultTokens(chainId);
    }
}

/**
 * Checks bridge status for a transaction
 */
export async function checkBridgeStatus(
    txHash: string,
    fromChain: number
): Promise<{
    status: 'pending' | 'completed' | 'failed';
    substatus?: string;
    toTxHash?: string;
}> {
    try {
        const response = await fetch(
            `${LIFI_API_BASE}/status?txHash=${txHash}&fromChain=${fromChain}`
        );

        if (!response.ok) {
            return { status: 'pending' };
        }

        const data = await response.json();

        return {
            status: data.status === 'DONE' ? 'completed' :
                data.status === 'FAILED' ? 'failed' : 'pending',
            substatus: data.substatus,
            toTxHash: data.receiving?.txHash,
        };
    } catch {
        return { status: 'pending' };
    }
}

// Helper functions

function getChainName(chainId: number): string {
    const chain = Object.values(SUPPORTED_SOURCE_CHAINS).find(c => c.id === chainId);
    return chain?.name || 'Unknown';
}

function getDefaultTokens(chainId: number): Array<{
    address: string;
    symbol: string;
    name: string;
    decimals: number;
}> {
    // Common tokens across chains
    if (chainId === 1) { // Ethereum
        return [
            { address: NATIVE_TOKEN, symbol: 'ETH', name: 'Ethereum', decimals: 18 },
            { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
            { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
        ];
    }
    if (chainId === 137) { // Polygon
        return [
            { address: NATIVE_TOKEN, symbol: 'MATIC', name: 'Polygon', decimals: 18 },
            { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
        ];
    }
    if (chainId === 42161) { // Arbitrum
        return [
            { address: NATIVE_TOKEN, symbol: 'ETH', name: 'Ethereum', decimals: 18 },
            { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
        ];
    }
    return [];
}

function getMockCrossChainRoutes(fromChain: number, amount: string): CrossChainRoute[] {
    const amountNum = parseFloat(amount) / 1e18; // Assumes 18 decimals
    const chainName = getChainName(fromChain);

    return [
        {
            id: 'mock-route-1',
            fromChain: chainName,
            toChain: 'Sui',
            fromAmount: amount,
            toAmount: String(Math.floor(amountNum * 0.98 * 1e9)), // ~2% fee, 9 decimals for SUI
            estimatedTime: 300, // 5 minutes
            gasCost: '5.50',
            steps: [
                { tool: 'Wormhole', action: 'ETH → wETH (Sui)' },
                { tool: 'Cetus', action: 'wETH → SUI' },
            ],
        },
        {
            id: 'mock-route-2',
            fromChain: chainName,
            toChain: 'Sui',
            fromAmount: amount,
            toAmount: String(Math.floor(amountNum * 0.97 * 1e9)),
            estimatedTime: 180, // 3 minutes
            gasCost: '8.20',
            steps: [
                { tool: 'Portal Bridge', action: 'ETH → SUI' },
            ],
        },
    ];
}
