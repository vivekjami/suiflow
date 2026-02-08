// Routing logic for finding optimal swap paths
import { Pool, RouteStep } from './types';

interface Route {
    pools: Pool[];
    steps: RouteStep[];
    expectedOutput: number;
    totalFee: number;
    estimatedGas: number;
    priceImpact: number;
}

/**
 * Finds all direct routes (single hop) between two tokens
 */
export function findDirectRoutes(
    pools: Pool[],
    tokenASymbol: string,
    tokenBSymbol: string,
    amountIn: number
): Route[] {
    // Find pools that directly connect tokenA and tokenB
    const directPools = pools.filter(p =>
        (p.tokenASymbol === tokenASymbol && p.tokenBSymbol === tokenBSymbol) ||
        (p.tokenASymbol === tokenBSymbol && p.tokenBSymbol === tokenASymbol)
    );

    return directPools.map(pool => {
        const isReverse = pool.tokenASymbol === tokenBSymbol;
        const price = isReverse ? 1 / pool.price : pool.price;
        const output = calculateOutput(pool, amountIn, price);

        return {
            pools: [pool],
            steps: [{
                from: tokenASymbol,
                to: tokenBSymbol,
                dex: pool.dex,
                pool: pool.address,
                expectedOutput: output.amount,
                fee: pool.fee * amountIn,
                slippageEstimate: output.slippage,
            }],
            expectedOutput: output.amount,
            totalFee: pool.fee * amountIn,
            estimatedGas: 0.001, // Base gas cost in SUI
            priceImpact: output.priceImpact,
        };
    });
}

/**
 * Finds multi-hop routes through intermediate tokens
 */
export function findMultiHopRoutes(
    pools: Pool[],
    tokenASymbol: string,
    tokenBSymbol: string,
    amountIn: number,
    maxHops: number = 2
): Route[] {
    if (maxHops < 2) return [];

    const routes: Route[] = [];
    const intermediateTokens = getIntermediateTokens(pools, tokenASymbol, tokenBSymbol);

    for (const intermediate of intermediateTokens) {
        // Find pools for first hop: tokenA → intermediate
        const firstHopPools = pools.filter(p =>
            (p.tokenASymbol === tokenASymbol && p.tokenBSymbol === intermediate) ||
            (p.tokenASymbol === intermediate && p.tokenBSymbol === tokenASymbol)
        );

        // Find pools for second hop: intermediate → tokenB  
        const secondHopPools = pools.filter(p =>
            (p.tokenASymbol === intermediate && p.tokenBSymbol === tokenBSymbol) ||
            (p.tokenASymbol === tokenBSymbol && p.tokenBSymbol === intermediate)
        );

        for (const pool1 of firstHopPools) {
            for (const pool2 of secondHopPools) {
                // Calculate outputs for each hop
                const isReverse1 = pool1.tokenASymbol === intermediate;
                const price1 = isReverse1 ? 1 / pool1.price : pool1.price;
                const output1 = calculateOutput(pool1, amountIn, price1);

                const isReverse2 = pool2.tokenASymbol === tokenBSymbol;
                const price2 = isReverse2 ? 1 / pool2.price : pool2.price;
                const output2 = calculateOutput(pool2, output1.amount, price2);

                const totalFee = pool1.fee * amountIn + pool2.fee * output1.amount;
                const combinedPriceImpact = output1.priceImpact + output2.priceImpact;

                routes.push({
                    pools: [pool1, pool2],
                    steps: [
                        {
                            from: tokenASymbol,
                            to: intermediate,
                            dex: pool1.dex,
                            pool: pool1.address,
                            expectedOutput: output1.amount,
                            fee: pool1.fee * amountIn,
                            slippageEstimate: output1.slippage,
                        },
                        {
                            from: intermediate,
                            to: tokenBSymbol,
                            dex: pool2.dex,
                            pool: pool2.address,
                            expectedOutput: output2.amount,
                            fee: pool2.fee * output1.amount,
                            slippageEstimate: output2.slippage,
                        },
                    ],
                    expectedOutput: output2.amount,
                    totalFee,
                    estimatedGas: 0.002, // 2 hops = more gas
                    priceImpact: combinedPriceImpact,
                });
            }
        }
    }

    // Sort by expected output (highest first)
    routes.sort((a, b) => b.expectedOutput - a.expectedOutput);

    return routes.slice(0, 5); // Return top 5 multi-hop routes
}

/**
 * Gets all pools from all DEXs and combines them
 */
export async function getAllPools(): Promise<Pool[]> {
    const { getCetusPools } = await import('./dex/cetus');
    const { getTurbosPools } = await import('./dex/turbos');
    const { getKriyaPools } = await import('./dex/kriya');

    const [cetusPools, turbosPools, kriyaPools] = await Promise.all([
        getCetusPools(),
        getTurbosPools(),
        getKriyaPools(),
    ]);

    return [...cetusPools, ...turbosPools, ...kriyaPools];
}

/**
 * Finds the best route (direct or multi-hop) for a swap
 */
export async function findBestRoute(
    tokenASymbol: string,
    tokenBSymbol: string,
    amountIn: number
): Promise<Route | null> {
    const pools = await getAllPools();

    const directRoutes = findDirectRoutes(pools, tokenASymbol, tokenBSymbol, amountIn);
    const multiHopRoutes = findMultiHopRoutes(pools, tokenASymbol, tokenBSymbol, amountIn);

    const allRoutes = [...directRoutes, ...multiHopRoutes];

    if (allRoutes.length === 0) return null;

    // Sort by expected output (highest = best)
    allRoutes.sort((a, b) => b.expectedOutput - a.expectedOutput);

    return allRoutes[0];
}

// Helper functions

function calculateOutput(
    pool: Pool,
    amountIn: number,
    price: number
): { amount: number; slippage: number; priceImpact: number } {
    // Calculate price impact based on liquidity
    const priceImpact = (amountIn / pool.liquidity) * 100;

    // Slippage increases with price impact
    const slippage = Math.min(priceImpact / 50, 0.1); // Max 10%

    // Apply fee and slippage
    const amountAfterFee = amountIn * (1 - pool.fee);
    const amount = amountAfterFee * price * (1 - slippage);

    return { amount, slippage: slippage * 100, priceImpact };
}

function getIntermediateTokens(
    pools: Pool[],
    tokenA: string,
    tokenB: string
): string[] {
    // Common intermediate tokens for better routing
    const commonIntermediates = ['USDC', 'USDT', 'SUI', 'WETH'];

    // Get all unique tokens from pools
    const allTokens = new Set<string>();
    pools.forEach(p => {
        allTokens.add(p.tokenASymbol);
        allTokens.add(p.tokenBSymbol);
    });

    // Filter to valid intermediates (not input or output token)
    return commonIntermediates.filter(t =>
        t !== tokenA &&
        t !== tokenB &&
        allTokens.has(t)
    );
}

/**
 * Validates if a route is still valid (pools exist, liquidity sufficient)
 */
export function validateRoute(route: Route, currentPools: Pool[]): boolean {
    for (const routePool of route.pools) {
        const currentPool = currentPools.find(p => p.address === routePool.address);
        if (!currentPool) return false;
        // Check if liquidity dropped significantly (>50%)
        if (currentPool.liquidity < routePool.liquidity * 0.5) return false;
    }
    return true;
}
