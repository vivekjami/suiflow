// ENS (Ethereum Name Service) Integration
// Used for displaying human-readable names for tokens and addresses

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

// Initialize Ethereum client for ENS resolution
const getClient = () => {
    const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
    const rpcUrl = alchemyKey
        ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`
        : 'https://eth.public-rpc.com';

    return createPublicClient({
        chain: mainnet,
        transport: http(rpcUrl),
    });
};

// Well-known token ENS names
export const TOKEN_ENS_MAP: Record<string, string> = {
    // Ethereum addresses
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'dai.eth',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'usdc.eth',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'usdt.eth',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 'weth.eth',
    // Sui token addresses (mapped to common names)
    '0x2::sui::SUI': 'sui.coin',
    '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN': 'usdc.sui',
    '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN': 'usdt.sui',
};

// ENS resolution cache
const ensCache = new Map<string, { name: string | null; timestamp: number }>();
const CACHE_TTL = 300000; // 5 minutes

/**
 * Resolves an Ethereum address to its ENS name
 */
export async function resolveENSName(address: string): Promise<string | null> {
    // Check local mapping first
    if (TOKEN_ENS_MAP[address]) {
        return TOKEN_ENS_MAP[address];
    }

    // Check cache
    const cached = ensCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.name;
    }

    // Skip ENS lookup for non-Ethereum addresses (like Sui addresses)
    if (!address.startsWith('0x') || address.includes('::')) {
        return null;
    }

    try {
        const client = getClient();
        const ensName = await client.getEnsName({
            address: address as `0x${string}`
        });

        // Cache the result
        ensCache.set(address, { name: ensName, timestamp: Date.now() });

        return ensName;
    } catch (error) {
        console.error('ENS resolution failed:', error);
        // Cache the failure to avoid repeated lookups
        ensCache.set(address, { name: null, timestamp: Date.now() });
        return null;
    }
}

/**
 * Resolves an ENS name to an Ethereum address
 */
export async function resolveENSAddress(name: string): Promise<string | null> {
    // Check if already an address
    if (name.startsWith('0x') && name.length === 42) {
        return name;
    }

    // Check reverse mapping
    for (const [address, ensName] of Object.entries(TOKEN_ENS_MAP)) {
        if (ensName === name) {
            return address;
        }
    }

    try {
        const client = getClient();
        const normalizedName = normalize(name);
        const address = await client.getEnsAddress({ name: normalizedName });
        return address;
    } catch (error) {
        console.error('ENS address resolution failed:', error);
        return null;
    }
}

/**
 * Gets ENS avatar URL for an address
 */
export async function getENSAvatar(addressOrName: string): Promise<string | null> {
    try {
        const client = getClient();

        // If it's an address, first get the name
        let name = addressOrName;
        if (addressOrName.startsWith('0x')) {
            const resolvedName = await resolveENSName(addressOrName);
            if (!resolvedName) return null;
            name = resolvedName;
        }

        const avatar = await client.getEnsAvatar({ name: normalize(name) });
        return avatar;
    } catch {
        return null;
    }
}

/**
 * Formats an address with ENS name if available
 */
export async function formatAddressWithENS(address: string): Promise<string> {
    const ensName = await resolveENSName(address);
    if (ensName) {
        return ensName;
    }
    // Return shortened address
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Gets display name for a token (prefers ENS names)
 */
export function getTokenDisplayName(address: string, symbol?: string): string {
    const ensName = TOKEN_ENS_MAP[address];
    if (ensName) {
        return ensName;
    }
    if (symbol) {
        return symbol;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Gets a text record for an ENS name.
 */
export async function getENSTextRecord(name: string, key: string): Promise<string | null> {
    try {
        const client = getClient();
        return await client.getEnsText({
            name: normalize(name),
            key
        });
    } catch {
        return null; // Return null silently on failure
    }
}

/**
 * Tries to find a Sui address in an ENS name's text records.
 * Prioritizes 'suiflow.address', then checks 'description' for valid Sui address format.
 */
export async function getSuiAddressFromENS(name: string): Promise<string | null> {
    try {
        // 1. Check specific key
        const specialized = await getENSTextRecord(name, 'suiflow.address');
        if (specialized && isValidSuiAddress(specialized)) {
            return specialized;
        }

        // 2. Check description as fallback
        const description = await getENSTextRecord(name, 'description');
        if (description && isValidSuiAddress(description)) {
            return description;
        }

        return null;
    } catch {
        return null;
    }
}

function isValidSuiAddress(address: string): boolean {
    return address.startsWith('0x') && address.length >= 64; // Sui addresses are approx 32 bytes hex
}

export function clearENSCache(): void {
    ensCache.clear();
}
