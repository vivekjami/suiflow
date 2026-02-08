// Turbos DEX Integration for Sui
// https://turbos.finance

import { Pool } from '../types';

const TURBOS_API_BASE = 'https://api.turbos.finance';

interface TurbosPoolData {
    address: string;
    token0: {
        address: string;
        symbol: string;
        decimals: number;
    };
    token1: {
        address: string;
        symbol: string;
        decimals: number;
    };
    tvl: string;
    fee: number;
    volume24h: string;
    price: string;
}

/**
 * Fetches all available pools from Turbos DEX
 */
export async function getTurbosPools(): Promise<Pool[]> {
    try {
        const response = await fetch(`${TURBOS_API_BASE}/pools`, {
            headers: {
                'Content-Type': 'application/json',
            },
            next: { revalidate: 30 },
        });

        if (!response.ok) {
            console.error('Turbos API error:', response.status);
            return getMockTurbosPools();
        }

        const data = await response.json();

        if (!data.pools || !Array.isArray(data.pools)) {
            return getMockTurbosPools();
        }

        return data.pools.slice(0, 50).map((pool: TurbosPoolData) => ({
            dex: 'Turbos' as const,
            address: pool.address,
            tokenA: pool.token0.address,
            tokenB: pool.token1.address,
            tokenASymbol: pool.token0.symbol,
            tokenBSymbol: pool.token1.symbol,
            liquidity: parseFloat(pool.tvl) || 0,
            fee: pool.fee / 10000,
            volume24h: parseFloat(pool.volume24h) || 0,
            price: parseFloat(pool.price) || 1,
        }));
    } catch (error) {
        console.error('Failed to fetch Turbos pools:', error);
        return getMockTurbosPools();
    }
}

/**
 * Gets a swap quote from Turbos
 */
export async function simulateTurbosSwap(
    poolAddress: string,
    tokenIn: string,
    amountIn: number,
    pool: Pool
): Promise<{ expectedOutput: number; priceImpact: number; fee: number }> {
    // Simplified simulation - in production use Turbos SDK
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
function getMockTurbosPools(): Pool[] {
    return [
        {
            dex: 'Turbos',
            address: '0xturb0s1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            tokenA: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
            tokenB: '0x2::sui::SUI',
            tokenASymbol: 'USDC',
            tokenBSymbol: 'SUI',
            liquidity: 1900000,
            fee: 0.0025,
            volume24h: 380000,
            price: 0.86,
        },
        {
            dex: 'Turbos',
            address: '0xturb0s2234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            tokenA: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN',
            tokenB: '0x2::sui::SUI',
            tokenASymbol: 'USDT',
            tokenBSymbol: 'SUI',
            liquidity: 1600000,
            fee: 0.0025,
            volume24h: 290000,
            price: 0.85,
        },
        {
            dex: 'Turbos',
            address: '0xturb0s3234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            tokenA: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
            tokenB: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN',
            tokenASymbol: 'USDC',
            tokenBSymbol: 'USDT',
            liquidity: 2800000,
            fee: 0.0005,
            volume24h: 750000,
            price: 0.9998,
        },
        {
            dex: 'Turbos',
            address: '0xturb0s4234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            tokenA: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS',
            tokenB: '0x2::sui::SUI',
            tokenASymbol: 'CETUS',
            tokenBSymbol: 'SUI',
            liquidity: 650000,
            fee: 0.003,
            volume24h: 120000,
            price: 0.12,
        },
    ];
}
