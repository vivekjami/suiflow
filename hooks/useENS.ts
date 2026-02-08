// React hook for ENS resolution
'use client';

import { useState, useEffect } from 'react';
import { TOKEN_ENS_MAP, resolveENSName, getSuiAddressFromENS } from '@/lib/ens';

interface UseENSResult {
    name: string | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Hook to resolve an address to its ENS name
 */
export function useENS(address: string | undefined): UseENSResult {
    const [name, setName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!address) {
            setName(null);
            setLoading(false);
            return;
        }

        // Check static mapping first (instant)
        if (TOKEN_ENS_MAP[address]) {
            setName(TOKEN_ENS_MAP[address]);
            setLoading(false);
            return;
        }

        // Otherwise, perform async resolution
        let cancelled = false;

        async function resolve() {
            try {
                setLoading(true);
                setError(null);

                const ensName = await resolveENSName(address!);

                if (!cancelled) {
                    setName(ensName);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err : new Error('ENS resolution failed'));
                    setName(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        resolve();

        return () => {
            cancelled = true;
        };
    }, [address]);

    return { name, loading, error };
}

/**
 * Hook to format an address with ENS name
 */
export function useFormattedAddress(address: string | undefined): string {
    const { name, loading } = useENS(address);

    if (!address) return '';
    if (loading) return `${address.slice(0, 6)}...${address.slice(-4)}`;
    if (name) return name;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Hook to resolve a Sui address from an ENS name (using text records)
 */
export function useSuiAddressFromENS(name: string): { address: string | null; loading: boolean } {
    const [address, setAddress] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!name || !name.includes('.')) {
            setAddress(null);
            return;
        }

        let active = true;
        setLoading(true);

        getSuiAddressFromENS(name)
            .then((addr) => {
                if (active) {
                    setAddress(addr);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (active) {
                    setAddress(null);
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [name]);

    return { address, loading };
}
