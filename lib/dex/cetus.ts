// Cetus DEX Integration for Sui
// https://cetus-1.gitbook.io/cetus-docs

import { Pool } from '../types';

const CETUS_API_BASE = 'https://api-sui.cetus.zone';

interface CetusPoolData {
    pool_address: string;
    coin_type_a: string;
    coin_type_b: string;
    liquidity: string;
    fee_rate: number;
    volume_24h: string;
    current_sqrt_price: string;
    coin_a_symbol: string;
    coin_b_symbol: string;
}

/**
 * Fetches all available pools from Cetus DEX
 */
export async function getCetusPools(): Promise<Pool[]> {
    try {
        const response = await fetch(`${CETUS_API_BASE}/v2/sui/pools`, {
            headers: {
                'Content-Type': 'application/json',
            },
            next: { revalidate: 30 }, // Cache for 30 seconds
        });

        if (!response.ok) {
            console.error('Cetus API error:', response.status);
            return getMockCetusPools(); // Fallback to mock data
        }

        const data = await response.json();

        if (!data.data || !Array.isArray(data.data)) {
            return getMockCetusPools();
        }

        return data.data.slice(0, 50).map((pool: CetusPoolData) => ({
            dex: 'Cetus' as const,
            address: pool.pool_address,
            tokenA: pool.coin_type_a,
            tokenB: pool.coin_type_b,
            tokenASymbol: pool.coin_a_symbol || extractSymbol(pool.coin_type_a),
            tokenBSymbol: pool.coin_b_symbol || extractSymbol(pool.coin_type_b),
            liquidity: parseFloat(pool.liquidity) || 0,
            fee: pool.fee_rate / 10000, // Convert basis points to percentage
            volume24h: parseFloat(pool.volume_24h) || 0,
            price: sqrtPriceToPrice(pool.current_sqrt_price),
        }));
    } catch (error) {
        console.error('Failed to fetch Cetus pools:', error);
        return getMockCetusPools();
    }
}

/**
 * Simulates a swap on Cetus to get expected output
 */
export async function simulateCetusSwap(
    poolAddress: string,
    tokenIn: string,
    amountIn: number,
    pool: Pool
): Promise<{ expectedOutput: number; priceImpact: number; fee: number }> {
    // Use constant product formula for simulation
    // In production, use Cetus SDK for accurate CLMM calculations

    const fee = amountIn * pool.fee;
    const amountInAfterFee = amountIn - fee;

    // Price impact based on liquidity
    const priceImpact = (amountIn / pool.liquidity) * 100;

    // Simplified output calculation (real implementation would use CLMM math)
    const slippage = Math.min(priceImpact / 100, 0.1);
    const expectedOutput = amountInAfterFee * pool.price * (1 - slippage);

    return {
        expectedOutput,
        priceImpact,
        fee,
    };
}

/**
 * Gets a specific pool by address
 */
export async function getCetusPool(poolAddress: string): Promise<Pool | null> {
    const pools = await getCetusPools();
    return pools.find(p => p.address === poolAddress) || null;
}

// Helper functions

function extractSymbol(coinType: string): string {
    const parts = coinType.split('::');
    return parts[parts.length - 1]?.toUpperCase() || 'UNKNOWN';
}

function sqrtPriceToPrice(sqrtPrice: string): number {
    try {
        const sqrt = parseFloat(sqrtPrice) / Math.pow(2, 64);
        return sqrt * sqrt;
    } catch {
        return 1;
    }
}

// Mock data for development/fallback
function getMockCetusPools(): Pool[] {
    return [
        {
            dex: 'Cetus',
            address: '0xcf994611fd4c48e277ce3ffd4d4364c914af2c3cbb05f7bf6facd371de688630',
            tokenA: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
            tokenB: '0x2::sui::SUI',
            tokenASymbol: 'USDC',
            tokenBSymbol: 'SUI',
            liquidity: 2500000,
            fee: 0.003,
            volume24h: 450000,
            price: 0.85,
        },
        {
            dex: 'Cetus',
            address: '0x2e041f3fd93646dcc877f783c1f2b7fa62d30271bdef1f21f001ace39ea55298',
            tokenA: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN',
            tokenB: '0x2::sui::SUI',
            tokenASymbol: 'USDT',
            tokenBSymbol: 'SUI',
            liquidity: 1800000,
            fee: 0.003,
            volume24h: 320000,
            price: 0.84,
        },
        {
            dex: 'Cetus',
            address: '0x5af4976b871fa9a5ce6b0a3f3e9a8e4b2fcb7d5e8c1a3b6d9e2f4a7c0b3d6e9f',
            tokenA: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
            tokenB: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN',
            tokenASymbol: 'USDC',
            tokenBSymbol: 'USDT',
            liquidity: 3200000,
            fee: 0.0005,
            volume24h: 890000,
            price: 1.0,
        },
        {
            dex: 'Cetus',
            address: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
            tokenA: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN',
            tokenB: '0x2::sui::SUI',
            tokenASymbol: 'WETH',
            tokenBSymbol: 'SUI',
            liquidity: 950000,
            fee: 0.003,
            volume24h: 180000,
            price: 2450,
        },
    ];
}
