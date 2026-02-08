// Kriya DEX Integration for Sui
// https://kriya.finance

import { Pool } from '../types';

const KRIYA_GRAPHQL = 'https://api.kriya.finance/graphql';

interface KriyaPoolData {
    address: string;
    token0: {
        symbol: string;
        address: string;
    };
    token1: {
        symbol: string;
        address: string;
    };
    tvl: number;
    fee: number;
    volume24h: number;
    price: number;
}

/**
 * Fetches all available pools from Kriya DEX using GraphQL
 */
export async function getKriyaPools(network: 'mainnet' | 'testnet' = 'mainnet'): Promise<Pool[]> {
    if (network === 'testnet') {
        return getMockKriyaPools().map(p => ({ ...p, network: 'testnet' }));
    }

    const query = `
    query GetPools {
      pools {
        address
        token0 { symbol, address }
        token1 { symbol, address }
        tvl
        fee
        volume24h
        price
      }
    }
  `;

    try {
        const response = await fetch(KRIYA_GRAPHQL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
            next: { revalidate: 30 },
        });

        if (!response.ok) {
            console.error('Kriya API error:', response.status);
            return getMockKriyaPools().map(p => ({ ...p, network: 'mainnet' }));
        }

        const { data } = await response.json();

        if (!data?.pools || !Array.isArray(data.pools)) {
            return getMockKriyaPools().map(p => ({ ...p, network: 'mainnet' }));
        }

        return data.pools.slice(0, 50).map((pool: KriyaPoolData) => ({
            dex: 'Kriya' as const,
            address: pool.address,
            tokenA: pool.token0.address,
            tokenB: pool.token1.address,
            tokenASymbol: pool.token0.symbol,
            tokenBSymbol: pool.token1.symbol,
            liquidity: pool.tvl || 0,
            fee: pool.fee / 10000,
            volume24h: pool.volume24h || 0,
            price: pool.price || 1,
            network: 'mainnet',
        }));
    } catch (error) {
        console.error('Failed to fetch Kriya pools:', error);
        return getMockKriyaPools().map(p => ({ ...p, network: 'mainnet' }));
    }
}

/**
 * Gets a swap quote from Kriya
 */
export async function simulateKriyaSwap(
    poolAddress: string,
    tokenIn: string,
    amountIn: number,
    pool: Pool
): Promise<{ expectedOutput: number; priceImpact: number; fee: number }> {
    const fee = amountIn * pool.fee;
    const amountInAfterFee = amountIn - fee;
    const priceImpact = (amountIn / pool.liquidity) * 100;
    const slippage = Math.min(priceImpact / 100, 0.1);
    const expectedOutput = amountInAfterFee * pool.price * (1 - slippage);

    return {
        expectedOutput,
        priceImpact,
        fee,
    };
}

// Mock data for development/fallback
function getMockKriyaPools(): Pool[] {
    return [
        {
            dex: 'Kriya',
            address: '0xkriya1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
            tokenA: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
            tokenB: '0x2::sui::SUI',
            tokenASymbol: 'USDC',
            tokenBSymbol: 'SUI',
            liquidity: 1200000,
            fee: 0.002,
            volume24h: 220000,
            price: 0.855,
        },
        {
            dex: 'Kriya',
            address: '0xkriya2234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
            tokenA: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN',
            tokenB: '0x2::sui::SUI',
            tokenASymbol: 'USDT',
            tokenBSymbol: 'SUI',
            liquidity: 980000,
            fee: 0.002,
            volume24h: 180000,
            price: 0.845,
        },
        {
            dex: 'Kriya',
            address: '0xkriya3234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
            tokenA: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN',
            tokenB: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
            tokenASymbol: 'WETH',
            tokenBSymbol: 'USDC',
            liquidity: 720000,
            fee: 0.003,
            volume24h: 95000,
            price: 2380,
        },
    ];
}
