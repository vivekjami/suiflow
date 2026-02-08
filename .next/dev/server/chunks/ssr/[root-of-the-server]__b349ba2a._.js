module.exports = [
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/lib/ens.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TOKEN_ENS_MAP",
    ()=>TOKEN_ENS_MAP,
    "clearENSCache",
    ()=>clearENSCache,
    "formatAddressWithENS",
    ()=>formatAddressWithENS,
    "getENSAvatar",
    ()=>getENSAvatar,
    "getTokenDisplayName",
    ()=>getTokenDisplayName,
    "resolveENSAddress",
    ()=>resolveENSAddress,
    "resolveENSName",
    ()=>resolveENSName
]);
// ENS (Ethereum Name Service) Integration
// Used for displaying human-readable names for tokens and addresses
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$clients$2f$createPublicClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/viem/_esm/clients/createPublicClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$clients$2f$transports$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/viem/_esm/clients/transports/http.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$chains$2f$definitions$2f$mainnet$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/viem/_esm/chains/definitions/mainnet.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$utils$2f$ens$2f$normalize$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/viem/_esm/utils/ens/normalize.js [app-ssr] (ecmascript)");
;
;
;
// Initialize Ethereum client for ENS resolution
const getClient = ()=>{
    const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
    const rpcUrl = alchemyKey ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}` : 'https://eth.public-rpc.com';
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$clients$2f$createPublicClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPublicClient"])({
        chain: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$chains$2f$definitions$2f$mainnet$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mainnet"],
        transport: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$clients$2f$transports$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["http"])(rpcUrl)
    });
};
const TOKEN_ENS_MAP = {
    // Ethereum addresses
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'dai.eth',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'usdc.eth',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'usdt.eth',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 'weth.eth',
    // Sui token addresses (mapped to common names)
    '0x2::sui::SUI': 'sui.coin',
    '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN': 'usdc.sui',
    '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN': 'usdt.sui'
};
// ENS resolution cache
const ensCache = new Map();
const CACHE_TTL = 300000; // 5 minutes
async function resolveENSName(address) {
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
            address: address
        });
        // Cache the result
        ensCache.set(address, {
            name: ensName,
            timestamp: Date.now()
        });
        return ensName;
    } catch (error) {
        console.error('ENS resolution failed:', error);
        // Cache the failure to avoid repeated lookups
        ensCache.set(address, {
            name: null,
            timestamp: Date.now()
        });
        return null;
    }
}
async function resolveENSAddress(name) {
    // Check if already an address
    if (name.startsWith('0x') && name.length === 42) {
        return name;
    }
    // Check reverse mapping
    for (const [address, ensName] of Object.entries(TOKEN_ENS_MAP)){
        if (ensName === name) {
            return address;
        }
    }
    try {
        const client = getClient();
        const normalizedName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$utils$2f$ens$2f$normalize$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalize"])(name);
        const address = await client.getEnsAddress({
            name: normalizedName
        });
        return address;
    } catch (error) {
        console.error('ENS address resolution failed:', error);
        return null;
    }
}
async function getENSAvatar(addressOrName) {
    try {
        const client = getClient();
        // If it's an address, first get the name
        let name = addressOrName;
        if (addressOrName.startsWith('0x')) {
            const resolvedName = await resolveENSName(addressOrName);
            if (!resolvedName) return null;
            name = resolvedName;
        }
        const avatar = await client.getEnsAvatar({
            name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$viem$2f$_esm$2f$utils$2f$ens$2f$normalize$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalize"])(name)
        });
        return avatar;
    } catch  {
        return null;
    }
}
async function formatAddressWithENS(address) {
    const ensName = await resolveENSName(address);
    if (ensName) {
        return ensName;
    }
    // Return shortened address
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
function getTokenDisplayName(address, symbol) {
    const ensName = TOKEN_ENS_MAP[address];
    if (ensName) {
        return ensName;
    }
    if (symbol) {
        return symbol;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
function clearENSCache() {
    ensCache.clear();
}
}),
"[project]/hooks/useENS.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useENS",
    ()=>useENS,
    "useFormattedAddress",
    ()=>useFormattedAddress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ens.ts [app-ssr] (ecmascript)");
// React hook for ENS resolution
'use client';
;
;
function useENS(address) {
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!address) {
            setName(null);
            setLoading(false);
            return;
        }
        // Check static mapping first (instant)
        if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOKEN_ENS_MAP"][address]) {
            setName(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOKEN_ENS_MAP"][address]);
            setLoading(false);
            return;
        }
        // Otherwise, perform async resolution
        let cancelled = false;
        async function resolve() {
            try {
                setLoading(true);
                setError(null);
                const ensName = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ens$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveENSName"])(address);
                if (!cancelled) {
                    setName(ensName);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err : new Error('ENS resolution failed'));
                    setName(null);
                }
            } finally{
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }
        resolve();
        return ()=>{
            cancelled = true;
        };
    }, [
        address
    ]);
    return {
        name,
        loading,
        error
    };
}
function useFormattedAddress(address) {
    const { name, loading } = useENS(address);
    if (!address) return '';
    if (loading) return `${address.slice(0, 6)}...${address.slice(-4)}`;
    if (name) return name;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
}),
"[project]/components/WalletConnect.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WalletConnect",
    ()=>WalletConnect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mysten$2f$dapp$2d$kit$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mysten/dapp-kit/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useENS$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useENS.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function WalletConnect() {
    const account = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mysten$2f$dapp$2d$kit$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCurrentAccount"])();
    const formattedAddress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useENS$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFormattedAddress"])(account?.address);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-78a2601ce3efadbc" + " " + "wallet-connect",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mysten$2f$dapp$2d$kit$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectButton"], {
                connectText: "Connect Wallet"
            }, void 0, false, {
                fileName: "[project]/components/WalletConnect.tsx",
                lineNumber: 12,
                columnNumber: 13
            }, this),
            account && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-78a2601ce3efadbc" + " " + "wallet-info",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "jsx-78a2601ce3efadbc" + " " + "wallet-address",
                    children: formattedAddress
                }, void 0, false, {
                    fileName: "[project]/components/WalletConnect.tsx",
                    lineNumber: 17,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/WalletConnect.tsx",
                lineNumber: 16,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "78a2601ce3efadbc",
                children: ".wallet-connect.jsx-78a2601ce3efadbc{align-items:center;gap:12px;display:flex}.wallet-info.jsx-78a2601ce3efadbc{background:#ffffff1a;border-radius:8px;align-items:center;gap:8px;padding:8px 12px;font-size:14px;display:flex}.wallet-address.jsx-78a2601ce3efadbc{color:#e0e0e0;font-family:monospace}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/WalletConnect.tsx",
        lineNumber: 11,
        columnNumber: 9
    }, this);
}
}),
"[project]/lib/types.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Core types for SuiFlow DEX Aggregator
__turbopack_context__.s([
    "CHAIN_IDS",
    ()=>CHAIN_IDS,
    "SUPPORTED_TOKENS",
    ()=>SUPPORTED_TOKENS
]);
const SUPPORTED_TOKENS = [
    {
        symbol: 'SUI',
        name: 'Sui',
        address: '0x2::sui::SUI',
        decimals: 9,
        logoUrl: '/tokens/sui.png'
    },
    {
        symbol: 'USDC',
        name: 'USD Coin',
        address: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
        decimals: 6,
        logoUrl: '/tokens/usdc.png',
        ensName: 'usdc.eth'
    },
    {
        symbol: 'USDT',
        name: 'Tether USD',
        address: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN',
        decimals: 6,
        logoUrl: '/tokens/usdt.png',
        ensName: 'usdt.eth'
    },
    {
        symbol: 'WETH',
        name: 'Wrapped Ether',
        address: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN',
        decimals: 8,
        logoUrl: '/tokens/weth.png',
        ensName: 'weth.eth'
    },
    {
        symbol: 'CETUS',
        name: 'Cetus Token',
        address: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS',
        decimals: 9,
        logoUrl: '/tokens/cetus.png'
    }
];
const CHAIN_IDS = {
    ETHEREUM: 1,
    POLYGON: 137,
    ARBITRUM: 42161,
    SUI: 'sui'
};
}),
"[project]/components/TokenSelect.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TokenSelect",
    ()=>TokenSelect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
'use client';
;
;
;
;
;
function TokenSelect({ value, onChange, label, excludeToken }) {
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const selectedToken = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SUPPORTED_TOKENS"].find((t)=>t.symbol === value);
    const filteredTokens = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SUPPORTED_TOKENS"].filter((token)=>token.symbol !== excludeToken && (token.symbol.toLowerCase().includes(search.toLowerCase()) || token.name.toLowerCase().includes(search.toLowerCase())));
    const handleSelect = (token)=>{
        onChange(token.symbol);
        setIsOpen(false);
        setSearch('');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-e303f189929b75a5" + " " + "token-select-container",
        children: [
            label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "jsx-e303f189929b75a5" + " " + "token-label",
                children: label
            }, void 0, false, {
                fileName: "[project]/components/TokenSelect.tsx",
                lineNumber: 34,
                columnNumber: 23
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(!isOpen),
                type: "button",
                className: "jsx-e303f189929b75a5" + " " + "token-select-button",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-e303f189929b75a5" + " " + "token-info",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-e303f189929b75a5" + " " + "token-icon",
                                children: selectedToken?.symbol.charAt(0) || '?'
                            }, void 0, false, {
                                fileName: "[project]/components/TokenSelect.tsx",
                                lineNumber: 42,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-e303f189929b75a5" + " " + "token-symbol",
                                children: selectedToken?.symbol || 'Select'
                            }, void 0, false, {
                                fileName: "[project]/components/TokenSelect.tsx",
                                lineNumber: 45,
                                columnNumber: 21
                            }, this),
                            selectedToken?.ensName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-e303f189929b75a5" + " " + "token-ens",
                                children: selectedToken.ensName
                            }, void 0, false, {
                                fileName: "[project]/components/TokenSelect.tsx",
                                lineNumber: 47,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/TokenSelect.tsx",
                        lineNumber: 41,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                        className: `chevron ${isOpen ? 'open' : ''}`,
                        size: 20
                    }, void 0, false, {
                        fileName: "[project]/components/TokenSelect.tsx",
                        lineNumber: 50,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/TokenSelect.tsx",
                lineNumber: 36,
                columnNumber: 13
            }, this),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-e303f189929b75a5" + " " + "token-dropdown",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-e303f189929b75a5" + " " + "search-container",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                size: 16,
                                className: "search-icon"
                            }, void 0, false, {
                                fileName: "[project]/components/TokenSelect.tsx",
                                lineNumber: 56,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "Search tokens...",
                                value: search,
                                onChange: (e)=>setSearch(e.target.value),
                                autoFocus: true,
                                className: "jsx-e303f189929b75a5" + " " + "search-input"
                            }, void 0, false, {
                                fileName: "[project]/components/TokenSelect.tsx",
                                lineNumber: 57,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/TokenSelect.tsx",
                        lineNumber: 55,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-e303f189929b75a5" + " " + "token-list",
                        children: filteredTokens.map((token)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleSelect(token),
                                className: "jsx-e303f189929b75a5" + " " + `token-option ${token.symbol === value ? 'selected' : ''}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-e303f189929b75a5" + " " + "token-icon",
                                        children: token.symbol.charAt(0)
                                    }, void 0, false, {
                                        fileName: "[project]/components/TokenSelect.tsx",
                                        lineNumber: 74,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-e303f189929b75a5" + " " + "token-details",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-e303f189929b75a5" + " " + "token-symbol",
                                                children: token.symbol
                                            }, void 0, false, {
                                                fileName: "[project]/components/TokenSelect.tsx",
                                                lineNumber: 76,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-e303f189929b75a5" + " " + "token-name",
                                                children: token.name
                                            }, void 0, false, {
                                                fileName: "[project]/components/TokenSelect.tsx",
                                                lineNumber: 77,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/TokenSelect.tsx",
                                        lineNumber: 75,
                                        columnNumber: 33
                                    }, this),
                                    token.ensName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-e303f189929b75a5" + " " + "token-ens-badge",
                                        children: token.ensName
                                    }, void 0, false, {
                                        fileName: "[project]/components/TokenSelect.tsx",
                                        lineNumber: 80,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, token.symbol, true, {
                                fileName: "[project]/components/TokenSelect.tsx",
                                lineNumber: 69,
                                columnNumber: 29
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/TokenSelect.tsx",
                        lineNumber: 67,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/TokenSelect.tsx",
                lineNumber: 54,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "e303f189929b75a5",
                children: ".token-select-container.jsx-e303f189929b75a5{position:relative}.token-label.jsx-e303f189929b75a5{color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;font-size:12px;display:block}.token-select-button.jsx-e303f189929b75a5{cursor:pointer;background:#ffffff0d;border:1px solid #ffffff1a;border-radius:12px;justify-content:space-between;align-items:center;width:100%;padding:12px 16px;transition:all .2s;display:flex}.token-select-button.jsx-e303f189929b75a5:hover{background:#ffffff14;border-color:#fff3}.token-info.jsx-e303f189929b75a5{align-items:center;gap:10px;display:flex}.token-icon.jsx-e303f189929b75a5{color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%;justify-content:center;align-items:center;width:32px;height:32px;font-size:14px;font-weight:600;display:flex}.token-symbol.jsx-e303f189929b75a5{color:#fff;font-size:16px;font-weight:600}.token-ens.jsx-e303f189929b75a5{color:#888;background:#ffffff1a;border-radius:4px;padding:2px 8px;font-size:12px}.chevron.jsx-e303f189929b75a5{color:#888;transition:transform .2s}.chevron.open.jsx-e303f189929b75a5{transform:rotate(180deg)}.token-dropdown.jsx-e303f189929b75a5{z-index:100;background:#1a1a2e;border:1px solid #ffffff1a;border-radius:12px;margin-top:8px;position:absolute;top:100%;left:0;right:0;overflow:hidden;box-shadow:0 10px 40px #00000080}.search-container.jsx-e303f189929b75a5{border-bottom:1px solid #ffffff1a;align-items:center;padding:12px 16px;display:flex}.search-icon.jsx-e303f189929b75a5{color:#666;margin-right:10px}.search-input.jsx-e303f189929b75a5{color:#fff;background:0 0;border:none;outline:none;flex:1;font-size:14px}.search-input.jsx-e303f189929b75a5::placeholder{color:#666}.token-list.jsx-e303f189929b75a5{max-height:240px;overflow-y:auto}.token-option.jsx-e303f189929b75a5{cursor:pointer;text-align:left;background:0 0;border:none;align-items:center;gap:12px;width:100%;padding:12px 16px;transition:background .15s;display:flex}.token-option.jsx-e303f189929b75a5:hover{background:#ffffff0d}.token-option.selected.jsx-e303f189929b75a5{background:#6366f133}.token-details.jsx-e303f189929b75a5{flex-direction:column;flex:1;gap:2px;display:flex}.token-name.jsx-e303f189929b75a5{color:#888;font-size:12px}.token-ens-badge.jsx-e303f189929b75a5{color:#6366f1;background:#6366f133;border-radius:4px;padding:2px 6px;font-size:11px}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/TokenSelect.tsx",
        lineNumber: 33,
        columnNumber: 9
    }, this);
}
}),
"[project]/components/RouteDisplay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RouteDisplay",
    ()=>RouteDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-ssr] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-ssr] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-ssr] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-ssr] (ecmascript) <export default as Info>");
'use client';
;
;
;
function RouteDisplay({ route, onExecute, loading }) {
    const { recommended, alternatives, explanation } = route;
    const getRiskColor = (risk)=>{
        switch(risk){
            case 'low':
                return '#22c55e';
            case 'medium':
                return '#f59e0b';
            case 'high':
                return '#ef4444';
            default:
                return '#888';
        }
    };
    const getRiskIcon = (risk)=>{
        switch(risk){
            case 'low':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                    size: 14
                }, void 0, false, {
                    fileName: "[project]/components/RouteDisplay.tsx",
                    lineNumber: 26,
                    columnNumber: 32
                }, this);
            case 'medium':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                    size: 14
                }, void 0, false, {
                    fileName: "[project]/components/RouteDisplay.tsx",
                    lineNumber: 27,
                    columnNumber: 35
                }, this);
            case 'high':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                    size: 14
                }, void 0, false, {
                    fileName: "[project]/components/RouteDisplay.tsx",
                    lineNumber: 28,
                    columnNumber: 33
                }, this);
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                    size: 14
                }, void 0, false, {
                    fileName: "[project]/components/RouteDisplay.tsx",
                    lineNumber: 29,
                    columnNumber: 29
                }, this);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-a831b47b65e97e38" + " " + "route-display",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-a831b47b65e97e38" + " " + "ai-badge",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                        size: 14
                    }, void 0, false, {
                        fileName: "[project]/components/RouteDisplay.tsx",
                        lineNumber: 37,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "jsx-a831b47b65e97e38",
                        children: "AI Optimized"
                    }, void 0, false, {
                        fileName: "[project]/components/RouteDisplay.tsx",
                        lineNumber: 38,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/RouteDisplay.tsx",
                lineNumber: 36,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-a831b47b65e97e38" + " " + "route-card recommended",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-a831b47b65e97e38" + " " + "route-header",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "jsx-a831b47b65e97e38",
                                children: "Recommended Route"
                            }, void 0, false, {
                                fileName: "[project]/components/RouteDisplay.tsx",
                                lineNumber: 44,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-a831b47b65e97e38" + " " + "confidence",
                                children: [
                                    (recommended.confidence * 100).toFixed(0),
                                    "% confidence"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/RouteDisplay.tsx",
                                lineNumber: 45,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/RouteDisplay.tsx",
                        lineNumber: 43,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-a831b47b65e97e38" + " " + "route-steps",
                        children: recommended.steps.map((step, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-a831b47b65e97e38" + " " + "step-container",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-a831b47b65e97e38" + " " + "step-token",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-a831b47b65e97e38" + " " + "token-icon",
                                                children: step.from.charAt(0)
                                            }, void 0, false, {
                                                fileName: "[project]/components/RouteDisplay.tsx",
                                                lineNumber: 55,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-a831b47b65e97e38" + " " + "token-symbol",
                                                children: step.from
                                            }, void 0, false, {
                                                fileName: "[project]/components/RouteDisplay.tsx",
                                                lineNumber: 56,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/RouteDisplay.tsx",
                                        lineNumber: 54,
                                        columnNumber: 29
                                    }, this),
                                    idx < recommended.steps.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-a831b47b65e97e38" + " " + "step-arrow",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/components/RouteDisplay.tsx",
                                                lineNumber: 61,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-a831b47b65e97e38" + " " + "dex-label",
                                                children: step.dex
                                            }, void 0, false, {
                                                fileName: "[project]/components/RouteDisplay.tsx",
                                                lineNumber: 62,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/RouteDisplay.tsx",
                                        lineNumber: 60,
                                        columnNumber: 33
                                    }, this),
                                    idx === recommended.steps.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-a831b47b65e97e38" + " " + "step-arrow",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                        size: 16
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/RouteDisplay.tsx",
                                                        lineNumber: 69,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-a831b47b65e97e38" + " " + "dex-label",
                                                        children: step.dex
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/RouteDisplay.tsx",
                                                        lineNumber: 70,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/RouteDisplay.tsx",
                                                lineNumber: 68,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-a831b47b65e97e38" + " " + "step-token",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-a831b47b65e97e38" + " " + "token-icon",
                                                        children: step.to.charAt(0)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/RouteDisplay.tsx",
                                                        lineNumber: 73,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-a831b47b65e97e38" + " " + "token-symbol",
                                                        children: step.to
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/RouteDisplay.tsx",
                                                        lineNumber: 74,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/RouteDisplay.tsx",
                                                lineNumber: 72,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true)
                                ]
                            }, idx, true, {
                                fileName: "[project]/components/RouteDisplay.tsx",
                                lineNumber: 53,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/RouteDisplay.tsx",
                        lineNumber: 51,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-a831b47b65e97e38" + " " + "route-details",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-a831b47b65e97e38" + " " + "detail-row",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-a831b47b65e97e38" + " " + "label",
                                        children: "Expected Output"
                                    }, void 0, false, {
                                        fileName: "[project]/components/RouteDisplay.tsx",
                                        lineNumber: 85,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-a831b47b65e97e38" + " " + "value highlight",
                                        children: recommended.totalOutput
                                    }, void 0, false, {
                                        fileName: "[project]/components/RouteDisplay.tsx",
                                        lineNumber: 86,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/RouteDisplay.tsx",
                                lineNumber: 84,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-a831b47b65e97e38" + " " + "detail-row",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-a831b47b65e97e38" + " " + "label",
                                        children: "Savings vs Direct"
                                    }, void 0, false, {
                                        fileName: "[project]/components/RouteDisplay.tsx",
                                        lineNumber: 89,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-a831b47b65e97e38" + " " + "value savings",
                                        children: recommended.savingsVsDirect
                                    }, void 0, false, {
                                        fileName: "[project]/components/RouteDisplay.tsx",
                                        lineNumber: 90,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/RouteDisplay.tsx",
                                lineNumber: 88,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-a831b47b65e97e38" + " " + "detail-row",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-a831b47b65e97e38" + " " + "label",
                                        children: "Gas Estimate"
                                    }, void 0, false, {
                                        fileName: "[project]/components/RouteDisplay.tsx",
                                        lineNumber: 93,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-a831b47b65e97e38" + " " + "value",
                                        children: recommended.gasEstimate
                                    }, void 0, false, {
                                        fileName: "[project]/components/RouteDisplay.tsx",
                                        lineNumber: 94,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/RouteDisplay.tsx",
                                lineNumber: 92,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-a831b47b65e97e38" + " " + "detail-row",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-a831b47b65e97e38" + " " + "label",
                                        children: "Risk Level"
                                    }, void 0, false, {
                                        fileName: "[project]/components/RouteDisplay.tsx",
                                        lineNumber: 97,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: getRiskColor(recommended.riskLevel)
                                        },
                                        className: "jsx-a831b47b65e97e38" + " " + "value risk-badge",
                                        children: [
                                            getRiskIcon(recommended.riskLevel),
                                            recommended.riskLevel.toUpperCase()
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/RouteDisplay.tsx",
                                        lineNumber: 98,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/RouteDisplay.tsx",
                                lineNumber: 96,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/RouteDisplay.tsx",
                        lineNumber: 83,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-a831b47b65e97e38" + " " + "ai-explanation",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                size: 12
                            }, void 0, false, {
                                fileName: "[project]/components/RouteDisplay.tsx",
                                lineNumber: 110,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "jsx-a831b47b65e97e38",
                                children: explanation
                            }, void 0, false, {
                                fileName: "[project]/components/RouteDisplay.tsx",
                                lineNumber: 111,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/RouteDisplay.tsx",
                        lineNumber: 109,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onExecute,
                        disabled: loading,
                        className: "jsx-a831b47b65e97e38" + " " + "execute-button",
                        children: loading ? 'Executing...' : 'Execute Swap'
                    }, void 0, false, {
                        fileName: "[project]/components/RouteDisplay.tsx",
                        lineNumber: 115,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/RouteDisplay.tsx",
                lineNumber: 42,
                columnNumber: 13
            }, this),
            alternatives.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                className: "jsx-a831b47b65e97e38" + " " + "alternatives-section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                        className: "jsx-a831b47b65e97e38",
                        children: [
                            "View ",
                            alternatives.length,
                            " Alternative Routes"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/RouteDisplay.tsx",
                        lineNumber: 127,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-a831b47b65e97e38" + " " + "alternatives-list",
                        children: alternatives.map((alt, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-a831b47b65e97e38" + " " + "alt-route-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-a831b47b65e97e38" + " " + "alt-steps",
                                        children: alt.steps.map((step, stepIdx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-a831b47b65e97e38" + " " + "alt-step",
                                                children: [
                                                    step.from,
                                                    " → ",
                                                    step.to,
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-a831b47b65e97e38" + " " + "alt-dex",
                                                        children: [
                                                            "(",
                                                            step.dex,
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/RouteDisplay.tsx",
                                                        lineNumber: 137,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, stepIdx, true, {
                                                fileName: "[project]/components/RouteDisplay.tsx",
                                                lineNumber: 135,
                                                columnNumber: 41
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/RouteDisplay.tsx",
                                        lineNumber: 133,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-a831b47b65e97e38" + " " + "alt-details",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-a831b47b65e97e38" + " " + "alt-output",
                                                children: alt.totalOutput
                                            }, void 0, false, {
                                                fileName: "[project]/components/RouteDisplay.tsx",
                                                lineNumber: 142,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-a831b47b65e97e38" + " " + "alt-tradeoff",
                                                children: alt.tradeOff
                                            }, void 0, false, {
                                                fileName: "[project]/components/RouteDisplay.tsx",
                                                lineNumber: 143,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/RouteDisplay.tsx",
                                        lineNumber: 141,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, idx, true, {
                                fileName: "[project]/components/RouteDisplay.tsx",
                                lineNumber: 132,
                                columnNumber: 29
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/RouteDisplay.tsx",
                        lineNumber: 130,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/RouteDisplay.tsx",
                lineNumber: 126,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "a831b47b65e97e38",
                children: ".route-display.jsx-a831b47b65e97e38{margin-top:24px}.ai-badge.jsx-a831b47b65e97e38{color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:20px;align-items:center;gap:6px;margin-bottom:16px;padding:6px 12px;font-size:12px;font-weight:600;display:inline-flex}.route-card.jsx-a831b47b65e97e38{background:#ffffff08;border:1px solid #ffffff1a;border-radius:16px;padding:20px}.route-card.recommended.jsx-a831b47b65e97e38{background:linear-gradient(135deg,#6366f11a 0%,#8b5cf61a 100%);border-color:#6366f14d}.route-header.jsx-a831b47b65e97e38{justify-content:space-between;align-items:center;margin-bottom:16px;display:flex}.route-header.jsx-a831b47b65e97e38 h3.jsx-a831b47b65e97e38{color:#fff;font-size:16px;font-weight:600}.confidence.jsx-a831b47b65e97e38{color:#22c55e;background:#22c55e1a;border-radius:12px;padding:4px 10px;font-size:12px}.route-steps.jsx-a831b47b65e97e38{background:#0003;border-radius:12px;align-items:center;gap:8px;margin-bottom:16px;padding:16px;display:flex;overflow-x:auto}.step-container.jsx-a831b47b65e97e38{align-items:center;gap:8px;display:flex}.step-token.jsx-a831b47b65e97e38{flex-direction:column;align-items:center;gap:4px;display:flex}.token-icon.jsx-a831b47b65e97e38{color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%;justify-content:center;align-items:center;width:36px;height:36px;font-weight:600;display:flex}.token-symbol.jsx-a831b47b65e97e38{color:#ccc;font-size:12px}.step-arrow.jsx-a831b47b65e97e38{color:#666;flex-direction:column;align-items:center;gap:2px;display:flex}.dex-label.jsx-a831b47b65e97e38{color:#888;background:#ffffff1a;border-radius:4px;padding:2px 6px;font-size:10px}.route-details.jsx-a831b47b65e97e38{flex-direction:column;gap:10px;margin-bottom:16px;display:flex}.detail-row.jsx-a831b47b65e97e38{justify-content:space-between;align-items:center;font-size:14px;display:flex}.label.jsx-a831b47b65e97e38{color:#888}.value.jsx-a831b47b65e97e38{color:#fff;font-weight:500}.value.highlight.jsx-a831b47b65e97e38{color:#fff;font-size:16px;font-weight:600}.value.savings.jsx-a831b47b65e97e38{color:#22c55e}.risk-badge.jsx-a831b47b65e97e38{align-items:center;gap:4px;display:flex}.ai-explanation.jsx-a831b47b65e97e38{background:#6366f11a;border-radius:8px;align-items:flex-start;gap:8px;margin-bottom:16px;padding:12px;display:flex}.ai-explanation.jsx-a831b47b65e97e38 p.jsx-a831b47b65e97e38{color:#a5a5ff;margin:0;font-size:13px;line-height:1.4}.execute-button.jsx-a831b47b65e97e38{color:#fff;cursor:pointer;background:linear-gradient(135deg,#22c55e,#16a34a);border:none;border-radius:12px;width:100%;padding:14px;font-size:16px;font-weight:600;transition:all .2s}.execute-button.jsx-a831b47b65e97e38:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 20px #22c55e4d}.execute-button.jsx-a831b47b65e97e38:disabled{opacity:.6;cursor:not-allowed}.alternatives-section.jsx-a831b47b65e97e38{margin-top:16px}.alternatives-section.jsx-a831b47b65e97e38 summary.jsx-a831b47b65e97e38{cursor:pointer;color:#888;background:#ffffff08;border-radius:8px;padding:12px 16px;font-size:14px}.alternatives-section.jsx-a831b47b65e97e38 summary.jsx-a831b47b65e97e38:hover{background:#ffffff0d}.alternatives-list.jsx-a831b47b65e97e38{flex-direction:column;gap:8px;margin-top:12px;display:flex}.alt-route-card.jsx-a831b47b65e97e38{background:#ffffff05;border:1px solid #ffffff0d;border-radius:8px;padding:12px}.alt-steps.jsx-a831b47b65e97e38{flex-wrap:wrap;gap:4px;margin-bottom:8px;display:flex}.alt-step.jsx-a831b47b65e97e38{color:#ccc;font-size:13px}.alt-dex.jsx-a831b47b65e97e38{color:#666;margin-left:2px;font-size:11px}.alt-details.jsx-a831b47b65e97e38{justify-content:space-between;font-size:12px;display:flex}.alt-output.jsx-a831b47b65e97e38{color:#888;font-weight:500}.alt-tradeoff.jsx-a831b47b65e97e38{color:#666;font-style:italic}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/RouteDisplay.tsx",
        lineNumber: 34,
        columnNumber: 9
    }, this);
}
}),
"[project]/components/SwapWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SwapWidget",
    ()=>SwapWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mysten$2f$dapp$2d$kit$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mysten/dapp-kit/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$TokenSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/TokenSelect.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$RouteDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/RouteDisplay.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDownUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-down-up.js [app-ssr] (ecmascript) <export default as ArrowDownUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-ssr] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-ssr] (ecmascript) <export default as Zap>");
'use client';
;
;
;
;
;
;
;
function SwapWidget() {
    const account = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mysten$2f$dapp$2d$kit$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCurrentAccount"])();
    const [tokenA, setTokenA] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('USDC');
    const [tokenB, setTokenB] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('SUI');
    const [amount, setAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [route, setRoute] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [executing, setExecuting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleSwapTokens = ()=>{
        setTokenA(tokenB);
        setTokenB(tokenA);
        setRoute(null);
    };
    const handleFindRoutes = async ()=>{
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter an amount');
            return;
        }
        setLoading(true);
        setError(null);
        setRoute(null);
        try {
            // Step 1: Fetch pools from all DEXs
            const poolsResponse = await fetch(`/api/pools?tokenA=${tokenA}&tokenB=${tokenB}`);
            if (!poolsResponse.ok) {
                throw new Error('Failed to fetch pools');
            }
            const poolsData = await poolsResponse.json();
            const pools = poolsData.pools;
            if (pools.length === 0) {
                throw new Error('No liquidity pools found for this pair');
            }
            // Step 2: Get AI optimization
            const optimizeResponse = await fetch('/api/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tokenA,
                    tokenB,
                    amount: parseFloat(amount),
                    pools,
                    userPreferences: {
                        prioritize: 'balanced',
                        maxSlippage: 3
                    }
                })
            });
            if (!optimizeResponse.ok) {
                throw new Error('Route optimization failed');
            }
            const optimizeData = await optimizeResponse.json();
            setRoute(optimizeData.route);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally{
            setLoading(false);
        }
    };
    const handleExecuteSwap = async ()=>{
        if (!route || !account) return;
        setExecuting(true);
        setError(null);
        try {
            // In production, this would:
            // 1. Build the transaction using Sui SDK
            // 2. Sign with the connected wallet
            // 3. Submit to the Sui network
            // 4. Wait for confirmation
            // For demo, we'll simulate a delay
            await new Promise((resolve)=>setTimeout(resolve, 2000));
            alert('Swap executed successfully! (Demo mode)');
            setRoute(null);
            setAmount('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Swap execution failed');
        } finally{
            setExecuting(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-6b02dda770a73202" + " " + "swap-widget",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-6b02dda770a73202" + " " + "widget-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "jsx-6b02dda770a73202",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                size: 24
                            }, void 0, false, {
                                fileName: "[project]/components/SwapWidget.tsx",
                                lineNumber: 112,
                                columnNumber: 21
                            }, this),
                            "Swap"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/SwapWidget.tsx",
                        lineNumber: 111,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setRoute(null),
                        title: "Reset",
                        className: "jsx-6b02dda770a73202" + " " + "refresh-button",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                            size: 18
                        }, void 0, false, {
                            fileName: "[project]/components/SwapWidget.tsx",
                            lineNumber: 116,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/SwapWidget.tsx",
                        lineNumber: 115,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/SwapWidget.tsx",
                lineNumber: 110,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-6b02dda770a73202" + " " + "input-section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-6b02dda770a73202" + " " + "input-header",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-6b02dda770a73202" + " " + "input-label",
                                children: "From"
                            }, void 0, false, {
                                fileName: "[project]/components/SwapWidget.tsx",
                                lineNumber: 123,
                                columnNumber: 21
                            }, this),
                            account && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setAmount('1000'),
                                className: "jsx-6b02dda770a73202" + " " + "max-button",
                                children: "MAX"
                            }, void 0, false, {
                                fileName: "[project]/components/SwapWidget.tsx",
                                lineNumber: 125,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/SwapWidget.tsx",
                        lineNumber: 122,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-6b02dda770a73202" + " " + "input-row",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                value: amount,
                                onChange: (e)=>{
                                    setAmount(e.target.value);
                                    setRoute(null);
                                },
                                placeholder: "0.0",
                                min: "0",
                                step: "any",
                                className: "jsx-6b02dda770a73202" + " " + "amount-input"
                            }, void 0, false, {
                                fileName: "[project]/components/SwapWidget.tsx",
                                lineNumber: 134,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$TokenSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TokenSelect"], {
                                value: tokenA,
                                onChange: (v)=>{
                                    setTokenA(v);
                                    setRoute(null);
                                },
                                excludeToken: tokenB
                            }, void 0, false, {
                                fileName: "[project]/components/SwapWidget.tsx",
                                lineNumber: 146,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/SwapWidget.tsx",
                        lineNumber: 133,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/SwapWidget.tsx",
                lineNumber: 121,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-6b02dda770a73202" + " " + "swap-direction",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleSwapTokens,
                    className: "jsx-6b02dda770a73202" + " " + "swap-button",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDownUp$3e$__["ArrowDownUp"], {
                        size: 18
                    }, void 0, false, {
                        fileName: "[project]/components/SwapWidget.tsx",
                        lineNumber: 160,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/SwapWidget.tsx",
                    lineNumber: 159,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/SwapWidget.tsx",
                lineNumber: 158,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-6b02dda770a73202" + " " + "input-section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-6b02dda770a73202" + " " + "input-header",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "jsx-6b02dda770a73202" + " " + "input-label",
                            children: "To"
                        }, void 0, false, {
                            fileName: "[project]/components/SwapWidget.tsx",
                            lineNumber: 167,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/SwapWidget.tsx",
                        lineNumber: 166,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-6b02dda770a73202" + " " + "input-row output-row",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-6b02dda770a73202" + " " + "estimated-output",
                                children: route ? route.recommended.totalOutput : '0.0'
                            }, void 0, false, {
                                fileName: "[project]/components/SwapWidget.tsx",
                                lineNumber: 170,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$TokenSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TokenSelect"], {
                                value: tokenB,
                                onChange: (v)=>{
                                    setTokenB(v);
                                    setRoute(null);
                                },
                                excludeToken: tokenA
                            }, void 0, false, {
                                fileName: "[project]/components/SwapWidget.tsx",
                                lineNumber: 173,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/SwapWidget.tsx",
                        lineNumber: 169,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/SwapWidget.tsx",
                lineNumber: 165,
                columnNumber: 13
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-6b02dda770a73202" + " " + "error-message",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/SwapWidget.tsx",
                lineNumber: 186,
                columnNumber: 17
            }, this),
            !route && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleFindRoutes,
                disabled: !account || !amount || loading,
                className: "jsx-6b02dda770a73202" + " " + "action-button",
                children: [
                    !account ? 'Connect Wallet to Swap' : loading ? 'Finding Best Route...' : 'Find Best Route',
                    loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "jsx-6b02dda770a73202" + " " + "spinner"
                    }, void 0, false, {
                        fileName: "[project]/components/SwapWidget.tsx",
                        lineNumber: 204,
                        columnNumber: 33
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/SwapWidget.tsx",
                lineNumber: 193,
                columnNumber: 17
            }, this),
            route && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$RouteDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RouteDisplay"], {
                route: route,
                onExecute: handleExecuteSwap,
                loading: executing
            }, void 0, false, {
                fileName: "[project]/components/SwapWidget.tsx",
                lineNumber: 210,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "6b02dda770a73202",
                children: ".swap-widget.jsx-6b02dda770a73202{background:linear-gradient(#1a1a2ef2 0%,#161628fa 100%);border:1px solid #ffffff1a;border-radius:20px;width:100%;max-width:440px;padding:24px;box-shadow:0 20px 60px #00000080}.widget-header.jsx-6b02dda770a73202{justify-content:space-between;align-items:center;margin-bottom:20px;display:flex}.widget-header.jsx-6b02dda770a73202 h2.jsx-6b02dda770a73202{color:#fff;align-items:center;gap:10px;margin:0;font-size:20px;font-weight:600;display:flex}.refresh-button.jsx-6b02dda770a73202{color:#888;cursor:pointer;background:#ffffff0d;border:none;border-radius:8px;padding:8px;transition:all .2s}.refresh-button.jsx-6b02dda770a73202:hover{color:#fff;background:#ffffff1a}.input-section.jsx-6b02dda770a73202{background:#0003;border:1px solid #ffffff0d;border-radius:16px;margin-bottom:8px;padding:16px}.input-header.jsx-6b02dda770a73202{justify-content:space-between;align-items:center;margin-bottom:10px;display:flex}.input-label.jsx-6b02dda770a73202{color:#888;text-transform:uppercase;letter-spacing:.5px;font-size:13px}.max-button.jsx-6b02dda770a73202{color:#6366f1;cursor:pointer;background:#6366f133;border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:600;transition:background .2s}.max-button.jsx-6b02dda770a73202:hover{background:#6366f14d}.input-row.jsx-6b02dda770a73202{align-items:center;gap:12px;display:flex}.amount-input.jsx-6b02dda770a73202{color:#fff;background:0 0;border:none;outline:none;flex:1;min-width:0;font-size:28px;font-weight:500}.amount-input.jsx-6b02dda770a73202::placeholder{color:#444}.amount-input.jsx-6b02dda770a73202::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.amount-input.jsx-6b02dda770a73202::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}.output-row.jsx-6b02dda770a73202{background:#ffffff05;border-radius:12px;padding:8px 12px}.estimated-output.jsx-6b02dda770a73202{color:#22c55e;flex:1;font-size:28px;font-weight:500}.swap-direction.jsx-6b02dda770a73202{z-index:10;justify-content:center;margin:-4px 0;display:flex;position:relative}.swap-button.jsx-6b02dda770a73202{color:#888;cursor:pointer;background:#1a1a2e;border:4px solid #0f0f1a;border-radius:12px;padding:10px;transition:all .2s}.swap-button.jsx-6b02dda770a73202:hover{color:#6366f1;transform:rotate(180deg)}.error-message.jsx-6b02dda770a73202{color:#ef4444;background:#ef44441a;border:1px solid #ef44444d;border-radius:8px;margin:12px 0;padding:12px;font-size:13px}.action-button.jsx-6b02dda770a73202{color:#fff;cursor:pointer;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:14px;justify-content:center;align-items:center;gap:10px;width:100%;margin-top:16px;padding:16px;font-size:16px;font-weight:600;transition:all .2s;display:flex}.action-button.jsx-6b02dda770a73202:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 30px #6366f166}.action-button.jsx-6b02dda770a73202:disabled{opacity:.5;cursor:not-allowed}.spinner.jsx-6b02dda770a73202{border:2px solid #ffffff4d;border-top-color:#fff;border-radius:50%;width:16px;height:16px;animation:.8s linear infinite spin}@keyframes spin{to{transform:rotate(360deg)}}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/SwapWidget.tsx",
        lineNumber: 109,
        columnNumber: 9
    }, this);
}
}),
"[project]/lib/lifi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// LI.FI SDK Integration for Cross-Chain Swaps
// https://docs.li.fi
__turbopack_context__.s([
    "SUPPORTED_SOURCE_CHAINS",
    ()=>SUPPORTED_SOURCE_CHAINS,
    "checkBridgeStatus",
    ()=>checkBridgeStatus,
    "getCrossChainQuote",
    ()=>getCrossChainQuote,
    "getSupportedTokens",
    ()=>getSupportedTokens
]);
// LI.FI API Base URL
const LIFI_API_BASE = 'https://li.quest/v1';
const SUPPORTED_SOURCE_CHAINS = {
    ETHEREUM: {
        id: 1,
        name: 'Ethereum',
        symbol: 'ETH'
    },
    POLYGON: {
        id: 137,
        name: 'Polygon',
        symbol: 'MATIC'
    },
    ARBITRUM: {
        id: 42161,
        name: 'Arbitrum',
        symbol: 'ETH'
    },
    OPTIMISM: {
        id: 10,
        name: 'Optimism',
        symbol: 'ETH'
    },
    BSC: {
        id: 56,
        name: 'BNB Chain',
        symbol: 'BNB'
    }
};
// Native token addresses (zero address = native)
const NATIVE_TOKEN = '0x0000000000000000000000000000000000000000';
async function getCrossChainQuote(fromChain, toChain, fromToken, toToken, amount, userAddress) {
    const apiKey = process.env.NEXT_PUBLIC_LIFI_API_KEY;
    // If no API key, return mock data
    if (!apiKey) {
        console.warn('No NEXT_PUBLIC_LIFI_API_KEY set, using mock routes');
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
            slippage: '0.03',
            order: 'RECOMMENDED'
        });
        const response = await fetch(`${LIFI_API_BASE}/routes?${params}`, {
            headers: {
                'x-lifi-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            console.error('LI.FI API error:', response.status);
            return getMockCrossChainRoutes(fromChain, amount);
        }
        const data = await response.json();
        if (!data.routes || data.routes.length === 0) {
            return getMockCrossChainRoutes(fromChain, amount);
        }
        return data.routes.slice(0, 5).map((route)=>({
                id: route.id,
                fromChain: getChainName(fromChain),
                toChain: 'Sui',
                fromAmount: route.fromAmount,
                toAmount: route.toAmount,
                estimatedTime: route.steps.reduce((acc, step)=>acc + (step.estimate?.executionDuration || 0), 0),
                gasCost: route.gasCostUSD,
                steps: route.steps.map((step)=>({
                        tool: step.tool,
                        action: `${step.action.fromToken.symbol} → ${step.action.toToken.symbol}`
                    }))
            }));
    } catch (error) {
        console.error('Failed to fetch LI.FI routes:', error);
        return getMockCrossChainRoutes(fromChain, amount);
    }
}
async function getSupportedTokens(chainId) {
    try {
        const response = await fetch(`${LIFI_API_BASE}/tokens?chains=${chainId}`);
        if (!response.ok) {
            return getDefaultTokens(chainId);
        }
        const data = await response.json();
        return data.tokens[chainId] || getDefaultTokens(chainId);
    } catch  {
        return getDefaultTokens(chainId);
    }
}
async function checkBridgeStatus(txHash, fromChain) {
    try {
        const response = await fetch(`${LIFI_API_BASE}/status?txHash=${txHash}&fromChain=${fromChain}`);
        if (!response.ok) {
            return {
                status: 'pending'
            };
        }
        const data = await response.json();
        return {
            status: data.status === 'DONE' ? 'completed' : data.status === 'FAILED' ? 'failed' : 'pending',
            substatus: data.substatus,
            toTxHash: data.receiving?.txHash
        };
    } catch  {
        return {
            status: 'pending'
        };
    }
}
// Helper functions
function getChainName(chainId) {
    const chain = Object.values(SUPPORTED_SOURCE_CHAINS).find((c)=>c.id === chainId);
    return chain?.name || 'Unknown';
}
function getDefaultTokens(chainId) {
    // Common tokens across chains
    if (chainId === 1) {
        return [
            {
                address: NATIVE_TOKEN,
                symbol: 'ETH',
                name: 'Ethereum',
                decimals: 18
            },
            {
                address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                symbol: 'USDC',
                name: 'USD Coin',
                decimals: 6
            },
            {
                address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                symbol: 'USDT',
                name: 'Tether USD',
                decimals: 6
            }
        ];
    }
    if (chainId === 137) {
        return [
            {
                address: NATIVE_TOKEN,
                symbol: 'MATIC',
                name: 'Polygon',
                decimals: 18
            },
            {
                address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                symbol: 'USDC',
                name: 'USD Coin',
                decimals: 6
            }
        ];
    }
    if (chainId === 42161) {
        return [
            {
                address: NATIVE_TOKEN,
                symbol: 'ETH',
                name: 'Ethereum',
                decimals: 18
            },
            {
                address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
                symbol: 'USDC',
                name: 'USD Coin',
                decimals: 6
            }
        ];
    }
    return [];
}
function getMockCrossChainRoutes(fromChain, amount) {
    const amountNum = parseFloat(amount) / 1e18; // Assumes 18 decimals
    const chainName = getChainName(fromChain);
    return [
        {
            id: 'mock-route-1',
            fromChain: chainName,
            toChain: 'Sui',
            fromAmount: amount,
            toAmount: String(Math.floor(amountNum * 0.98 * 1e9)),
            estimatedTime: 300,
            gasCost: '5.50',
            steps: [
                {
                    tool: 'Wormhole',
                    action: 'ETH → wETH (Sui)'
                },
                {
                    tool: 'Cetus',
                    action: 'wETH → SUI'
                }
            ]
        },
        {
            id: 'mock-route-2',
            fromChain: chainName,
            toChain: 'Sui',
            fromAmount: amount,
            toAmount: String(Math.floor(amountNum * 0.97 * 1e9)),
            estimatedTime: 180,
            gasCost: '8.20',
            steps: [
                {
                    tool: 'Portal Bridge',
                    action: 'ETH → SUI'
                }
            ]
        }
    ];
}
}),
"[project]/components/CrossChainSwap.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CrossChainSwap",
    ()=>CrossChainSwap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lifi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lifi.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-ssr] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-ssr] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wallet.js [app-ssr] (ecmascript) <export default as Wallet>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-ssr] (ecmascript) <export default as Zap>");
'use client';
;
;
;
;
;
function CrossChainSwap({ userAddress }) {
    const [fromChain, setFromChain] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('ETHEREUM');
    const [amount, setAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [routes, setRoutes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedRoute, setSelectedRoute] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const chains = Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lifi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SUPPORTED_SOURCE_CHAINS"]);
    const handleFindRoutes = async ()=>{
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter an amount');
            return;
        }
        if (!userAddress) {
            setError('Please connect your wallet');
            return;
        }
        setLoading(true);
        setError(null);
        setRoutes([]);
        try {
            const response = await fetch('/api/cross-chain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fromChain,
                    toChain: 'SUI',
                    fromToken: '0x0000000000000000000000000000000000000000',
                    toToken: '0x2::sui::SUI',
                    amount: String(parseFloat(amount) * 1e18),
                    userAddress
                })
            });
            if (!response.ok) throw new Error('Failed to fetch routes');
            const data = await response.json();
            setRoutes(data.routes || []);
            if (data.routes?.length > 0) {
                setSelectedRoute(data.routes[0].id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally{
            setLoading(false);
        }
    };
    const handleExecuteBridge = async ()=>{
        if (!selectedRoute) return;
        // In production, this would execute the bridge transaction
        alert('Bridge execution would start here! (Demo mode)');
    };
    const formatTime = (seconds)=>{
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m`;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-4e5d9a4cb000702f" + " " + "cross-chain-swap",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-4e5d9a4cb000702f" + " " + "widget-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "jsx-4e5d9a4cb000702f",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                size: 24
                            }, void 0, false, {
                                fileName: "[project]/components/CrossChainSwap.tsx",
                                lineNumber: 83,
                                columnNumber: 11
                            }, this),
                            "Cross-Chain Bridge"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CrossChainSwap.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "jsx-4e5d9a4cb000702f" + " " + "badge",
                        children: "Powered by LI.FI"
                    }, void 0, false, {
                        fileName: "[project]/components/CrossChainSwap.tsx",
                        lineNumber: 86,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CrossChainSwap.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-4e5d9a4cb000702f" + " " + "input-section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "jsx-4e5d9a4cb000702f" + " " + "input-label",
                        children: "From Chain"
                    }, void 0, false, {
                        fileName: "[project]/components/CrossChainSwap.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-4e5d9a4cb000702f" + " " + "chain-grid",
                        children: chains.map(([key, chain])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setFromChain(key);
                                    setRoutes([]);
                                },
                                className: "jsx-4e5d9a4cb000702f" + " " + `chain-button ${fromChain === key ? 'selected' : ''}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-4e5d9a4cb000702f" + " " + "chain-icon",
                                        children: chain.symbol.charAt(0)
                                    }, void 0, false, {
                                        fileName: "[project]/components/CrossChainSwap.tsx",
                                        lineNumber: 102,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-4e5d9a4cb000702f" + " " + "chain-name",
                                        children: chain.name
                                    }, void 0, false, {
                                        fileName: "[project]/components/CrossChainSwap.tsx",
                                        lineNumber: 103,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, key, true, {
                                fileName: "[project]/components/CrossChainSwap.tsx",
                                lineNumber: 94,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/CrossChainSwap.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CrossChainSwap.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-4e5d9a4cb000702f" + " " + "input-section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "jsx-4e5d9a4cb000702f" + " " + "input-label",
                        children: "Amount"
                    }, void 0, false, {
                        fileName: "[project]/components/CrossChainSwap.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-4e5d9a4cb000702f" + " " + "amount-row",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                value: amount,
                                onChange: (e)=>{
                                    setAmount(e.target.value);
                                    setRoutes([]);
                                },
                                placeholder: "0.0",
                                className: "jsx-4e5d9a4cb000702f" + " " + "amount-input"
                            }, void 0, false, {
                                fileName: "[project]/components/CrossChainSwap.tsx",
                                lineNumber: 113,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-4e5d9a4cb000702f" + " " + "token-badge",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lifi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SUPPORTED_SOURCE_CHAINS"][fromChain]?.symbol
                            }, void 0, false, {
                                fileName: "[project]/components/CrossChainSwap.tsx",
                                lineNumber: 123,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CrossChainSwap.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CrossChainSwap.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-4e5d9a4cb000702f" + " " + "destination-row",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                        size: 20
                    }, void 0, false, {
                        fileName: "[project]/components/CrossChainSwap.tsx",
                        lineNumber: 131,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-4e5d9a4cb000702f" + " " + "destination-info",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-4e5d9a4cb000702f" + " " + "dest-label",
                                children: "To"
                            }, void 0, false, {
                                fileName: "[project]/components/CrossChainSwap.tsx",
                                lineNumber: 133,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-4e5d9a4cb000702f" + " " + "dest-chain",
                                children: "Sui Network"
                            }, void 0, false, {
                                fileName: "[project]/components/CrossChainSwap.tsx",
                                lineNumber: 134,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-4e5d9a4cb000702f" + " " + "dest-token",
                                children: "SUI"
                            }, void 0, false, {
                                fileName: "[project]/components/CrossChainSwap.tsx",
                                lineNumber: 135,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CrossChainSwap.tsx",
                        lineNumber: 132,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CrossChainSwap.tsx",
                lineNumber: 130,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-4e5d9a4cb000702f" + " " + "error-message",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/CrossChainSwap.tsx",
                lineNumber: 141,
                columnNumber: 9
            }, this),
            routes.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleFindRoutes,
                disabled: !userAddress || !amount || loading,
                className: "jsx-4e5d9a4cb000702f" + " " + "action-button",
                children: loading ? 'Finding Routes...' : 'Find Bridge Routes'
            }, void 0, false, {
                fileName: "[project]/components/CrossChainSwap.tsx",
                lineNumber: 146,
                columnNumber: 9
            }, this),
            routes.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-4e5d9a4cb000702f" + " " + "routes-section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "jsx-4e5d9a4cb000702f",
                        children: "Available Routes"
                    }, void 0, false, {
                        fileName: "[project]/components/CrossChainSwap.tsx",
                        lineNumber: 158,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-4e5d9a4cb000702f" + " " + "routes-list",
                        children: routes.map((route)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setSelectedRoute(route.id),
                                className: "jsx-4e5d9a4cb000702f" + " " + `route-card ${selectedRoute === route.id ? 'selected' : ''}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-4e5d9a4cb000702f" + " " + "route-header",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-4e5d9a4cb000702f" + " " + "route-output",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-4e5d9a4cb000702f" + " " + "output-amount",
                                                        children: (parseFloat(route.toAmount) / 1e9).toFixed(4)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CrossChainSwap.tsx",
                                                        lineNumber: 168,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-4e5d9a4cb000702f" + " " + "output-token",
                                                        children: "SUI"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CrossChainSwap.tsx",
                                                        lineNumber: 171,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CrossChainSwap.tsx",
                                                lineNumber: 167,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-4e5d9a4cb000702f" + " " + "route-meta",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-4e5d9a4cb000702f" + " " + "route-time",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                                size: 12
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CrossChainSwap.tsx",
                                                                lineNumber: 175,
                                                                columnNumber: 23
                                                            }, this),
                                                            formatTime(route.estimatedTime)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/CrossChainSwap.tsx",
                                                        lineNumber: 174,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-4e5d9a4cb000702f" + " " + "route-gas",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__["Wallet"], {
                                                                size: 12
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CrossChainSwap.tsx",
                                                                lineNumber: 179,
                                                                columnNumber: 23
                                                            }, this),
                                                            "$",
                                                            route.gasCost
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/CrossChainSwap.tsx",
                                                        lineNumber: 178,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CrossChainSwap.tsx",
                                                lineNumber: 173,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CrossChainSwap.tsx",
                                        lineNumber: 166,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-4e5d9a4cb000702f" + " " + "route-steps",
                                        children: route.steps.map((step, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-4e5d9a4cb000702f" + " " + "step-badge",
                                                children: [
                                                    step.tool,
                                                    ": ",
                                                    step.action
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/components/CrossChainSwap.tsx",
                                                lineNumber: 186,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/CrossChainSwap.tsx",
                                        lineNumber: 184,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, route.id, true, {
                                fileName: "[project]/components/CrossChainSwap.tsx",
                                lineNumber: 161,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/CrossChainSwap.tsx",
                        lineNumber: 159,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleExecuteBridge,
                        disabled: !selectedRoute,
                        className: "jsx-4e5d9a4cb000702f" + " " + "execute-button",
                        children: "Execute Bridge"
                    }, void 0, false, {
                        fileName: "[project]/components/CrossChainSwap.tsx",
                        lineNumber: 195,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CrossChainSwap.tsx",
                lineNumber: 157,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "4e5d9a4cb000702f",
                children: ".cross-chain-swap.jsx-4e5d9a4cb000702f{background:linear-gradient(#1a1a2ef2 0%,#161628fa 100%);border:1px solid #ffffff1a;border-radius:20px;width:100%;max-width:440px;padding:24px;box-shadow:0 20px 60px #00000080}.widget-header.jsx-4e5d9a4cb000702f{justify-content:space-between;align-items:center;margin-bottom:20px;display:flex}.widget-header.jsx-4e5d9a4cb000702f h2.jsx-4e5d9a4cb000702f{color:#fff;align-items:center;gap:10px;margin:0;font-size:20px;font-weight:600;display:flex}.badge.jsx-4e5d9a4cb000702f{color:#888;background:#ffffff0d;border-radius:12px;padding:4px 10px;font-size:11px}.input-section.jsx-4e5d9a4cb000702f{margin-bottom:16px}.input-label.jsx-4e5d9a4cb000702f{color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;font-size:12px;display:block}.chain-grid.jsx-4e5d9a4cb000702f{grid-template-columns:repeat(3,1fr);gap:8px;display:grid}.chain-button.jsx-4e5d9a4cb000702f{cursor:pointer;background:#ffffff08;border:1px solid #ffffff1a;border-radius:12px;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;transition:all .2s;display:flex}.chain-button.jsx-4e5d9a4cb000702f:hover{background:#ffffff0d}.chain-button.selected.jsx-4e5d9a4cb000702f{background:#6366f133;border-color:#6366f180}.chain-icon.jsx-4e5d9a4cb000702f{color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%;justify-content:center;align-items:center;width:32px;height:32px;font-weight:600;display:flex}.chain-name.jsx-4e5d9a4cb000702f{color:#ccc;font-size:11px}.amount-row.jsx-4e5d9a4cb000702f{background:#0003;border:1px solid #ffffff0d;border-radius:12px;align-items:center;gap:12px;padding:12px 16px;display:flex}.amount-input.jsx-4e5d9a4cb000702f{color:#fff;background:0 0;border:none;outline:none;flex:1;font-size:24px;font-weight:500}.amount-input.jsx-4e5d9a4cb000702f::placeholder{color:#444}.token-badge.jsx-4e5d9a4cb000702f{color:#fff;background:#ffffff1a;border-radius:8px;padding:6px 12px;font-size:14px;font-weight:600}.destination-row.jsx-4e5d9a4cb000702f{color:#22c55e;background:#22c55e1a;border:1px solid #22c55e33;border-radius:12px;align-items:center;gap:16px;margin-bottom:16px;padding:16px;display:flex}.destination-info.jsx-4e5d9a4cb000702f{flex-direction:column;gap:2px;display:flex}.dest-label.jsx-4e5d9a4cb000702f{color:#888;text-transform:uppercase;font-size:11px}.dest-chain.jsx-4e5d9a4cb000702f{color:#fff;font-size:16px;font-weight:600}.dest-token.jsx-4e5d9a4cb000702f{color:#22c55e;font-size:12px}.error-message.jsx-4e5d9a4cb000702f{color:#ef4444;background:#ef44441a;border:1px solid #ef44444d;border-radius:8px;margin-bottom:12px;padding:12px;font-size:13px}.action-button.jsx-4e5d9a4cb000702f{color:#fff;cursor:pointer;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:14px;width:100%;padding:16px;font-size:16px;font-weight:600;transition:all .2s}.action-button.jsx-4e5d9a4cb000702f:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 30px #6366f166}.action-button.jsx-4e5d9a4cb000702f:disabled{opacity:.5;cursor:not-allowed}.routes-section.jsx-4e5d9a4cb000702f h3.jsx-4e5d9a4cb000702f{color:#888;margin-bottom:12px;font-size:14px}.routes-list.jsx-4e5d9a4cb000702f{flex-direction:column;gap:10px;margin-bottom:16px;display:flex}.route-card.jsx-4e5d9a4cb000702f{cursor:pointer;text-align:left;background:#ffffff08;border:1px solid #ffffff1a;border-radius:12px;padding:14px;transition:all .2s}.route-card.jsx-4e5d9a4cb000702f:hover{background:#ffffff0d}.route-card.selected.jsx-4e5d9a4cb000702f{background:#6366f126;border-color:#6366f166}.route-header.jsx-4e5d9a4cb000702f{justify-content:space-between;align-items:center;margin-bottom:10px;display:flex}.route-output.jsx-4e5d9a4cb000702f{align-items:baseline;gap:6px;display:flex}.output-amount.jsx-4e5d9a4cb000702f{color:#22c55e;font-size:20px;font-weight:600}.output-token.jsx-4e5d9a4cb000702f{color:#888;font-size:14px}.route-meta.jsx-4e5d9a4cb000702f{gap:12px;display:flex}.route-time.jsx-4e5d9a4cb000702f,.route-gas.jsx-4e5d9a4cb000702f{color:#888;align-items:center;gap:4px;font-size:12px;display:flex}.route-steps.jsx-4e5d9a4cb000702f{flex-wrap:wrap;gap:6px;display:flex}.step-badge.jsx-4e5d9a4cb000702f{color:#888;background:#ffffff0d;border-radius:4px;padding:4px 8px;font-size:11px}.execute-button.jsx-4e5d9a4cb000702f{color:#fff;cursor:pointer;background:linear-gradient(135deg,#22c55e,#16a34a);border:none;border-radius:12px;width:100%;padding:14px;font-size:16px;font-weight:600;transition:all .2s}.execute-button.jsx-4e5d9a4cb000702f:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 20px #22c55e4d}.execute-button.jsx-4e5d9a4cb000702f:disabled{opacity:.6;cursor:not-allowed}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/CrossChainSwap.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mysten$2f$dapp$2d$kit$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mysten/dapp-kit/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WalletConnect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/WalletConnect.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SwapWidget$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SwapWidget.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CrossChainSwap$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CrossChainSwap.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-ssr] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRightLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right-left.js [app-ssr] (ecmascript) <export default as ArrowRightLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-ssr] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$github$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Github$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/github.js [app-ssr] (ecmascript) <export default as Github>");
'use client';
;
;
;
;
;
;
;
;
function Home() {
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('swap');
    const account = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mysten$2f$dapp$2d$kit$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCurrentAccount"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "jsx-6cdbe0f759323a3f" + " " + "main",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-6cdbe0f759323a3f" + " " + "bg-gradient"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-6cdbe0f759323a3f" + " " + "bg-grid"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "jsx-6cdbe0f759323a3f" + " " + "header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-6cdbe0f759323a3f" + " " + "logo",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                size: 28,
                                className: "logo-icon"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 25,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-6cdbe0f759323a3f" + " " + "logo-text",
                                children: "SuiFlow"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 26,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "jsx-6cdbe0f759323a3f" + " " + "nav",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "https://github.com",
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "jsx-6cdbe0f759323a3f" + " " + "nav-link",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$github$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Github$3e$__["Github"], {
                                    size: 20
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 30,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 29,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WalletConnect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WalletConnect"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 32,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "jsx-6cdbe0f759323a3f" + " " + "hero",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-6cdbe0f759323a3f" + " " + "hero-badge",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-6cdbe0f759323a3f",
                                children: "Powered by Google Gemini 2.5 Flash"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "jsx-6cdbe0f759323a3f" + " " + "hero-title",
                        children: [
                            "AI-Powered ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-6cdbe0f759323a3f" + " " + "gradient-text",
                                children: "Swap Aggregator"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 43,
                                columnNumber: 22
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 42,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "jsx-6cdbe0f759323a3f" + " " + "hero-subtitle",
                        children: "Get the best prices across all Sui DEXs with intelligent route optimization"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-6cdbe0f759323a3f" + " " + "tabs",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab('swap'),
                        className: "jsx-6cdbe0f759323a3f" + " " + `tab ${activeTab === 'swap' ? 'active' : ''}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRightLeft$3e$__["ArrowRightLeft"], {
                                size: 18
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 56,
                                columnNumber: 11
                            }, this),
                            "Swap"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab('bridge'),
                        className: "jsx-6cdbe0f759323a3f" + " " + `tab ${activeTab === 'bridge' ? 'active' : ''}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                size: 18
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 63,
                                columnNumber: 11
                            }, this),
                            "Bridge"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-6cdbe0f759323a3f" + " " + "content",
                children: activeTab === 'swap' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SwapWidget$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SwapWidget"], {}, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 71,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CrossChainSwap$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CrossChainSwap"], {
                    userAddress: account?.address
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 73,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "jsx-6cdbe0f759323a3f" + " " + "stats",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-6cdbe0f759323a3f" + " " + "stat-item",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-6cdbe0f759323a3f" + " " + "stat-value",
                                children: "3"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 80,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-6cdbe0f759323a3f" + " " + "stat-label",
                                children: "DEXs Integrated"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 81,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-6cdbe0f759323a3f" + " " + "stat-item",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-6cdbe0f759323a3f" + " " + "stat-value",
                                children: "5+"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-6cdbe0f759323a3f" + " " + "stat-label",
                                children: "Chains Supported"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 85,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-6cdbe0f759323a3f" + " " + "stat-item",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-6cdbe0f759323a3f" + " " + "stat-value",
                                children: "AI"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 88,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-6cdbe0f759323a3f" + " " + "stat-label",
                                children: "Route Optimization"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 89,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "jsx-6cdbe0f759323a3f" + " " + "features",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-6cdbe0f759323a3f" + " " + "feature-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-6cdbe0f759323a3f" + " " + "feature-icon",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                    size: 24
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 97,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 96,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "jsx-6cdbe0f759323a3f",
                                children: "AI-Powered Routing"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 99,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "jsx-6cdbe0f759323a3f",
                                children: "Google Gemini 2.5 Flash analyzes pools to find the optimal swap path"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 100,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 95,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-6cdbe0f759323a3f" + " " + "feature-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-6cdbe0f759323a3f" + " " + "feature-icon",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRightLeft$3e$__["ArrowRightLeft"], {
                                    size: 24
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 104,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 103,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "jsx-6cdbe0f759323a3f",
                                children: "Multi-DEX"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 106,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "jsx-6cdbe0f759323a3f",
                                children: "Aggregates liquidity from Cetus, Turbos, and Kriya DEXs"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-6cdbe0f759323a3f" + " " + "feature-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-6cdbe0f759323a3f" + " " + "feature-icon",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                    size: 24
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 111,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 110,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "jsx-6cdbe0f759323a3f",
                                children: "Cross-Chain"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 113,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "jsx-6cdbe0f759323a3f",
                                children: "Bridge assets from Ethereum, Polygon, Arbitrum via LI.FI"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 114,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 109,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "jsx-6cdbe0f759323a3f" + " " + "footer",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "jsx-6cdbe0f759323a3f",
                    children: "Built for Sui Hackathon | ENS Integration for Human-Readable Names"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 120,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 119,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "6cdbe0f759323a3f",
                children: ".main.jsx-6cdbe0f759323a3f{min-height:100vh;padding:20px;position:relative;overflow-x:hidden}.bg-gradient.jsx-6cdbe0f759323a3f{pointer-events:none;z-index:0;background:radial-gradient(80% 50% at 50% -20%,#6366f126,#0000);position:fixed;inset:0}.bg-grid.jsx-6cdbe0f759323a3f{pointer-events:none;z-index:0;background-image:linear-gradient(#ffffff05 1px,#0000 1px),linear-gradient(90deg,#ffffff05 1px,#0000 1px);background-size:50px 50px;position:fixed;inset:0}.header.jsx-6cdbe0f759323a3f{z-index:10;justify-content:space-between;align-items:center;max-width:1200px;margin:0 auto 40px;padding:0 20px;display:flex;position:relative}.logo.jsx-6cdbe0f759323a3f{align-items:center;gap:10px;display:flex}.logo-icon.jsx-6cdbe0f759323a3f{color:#6366f1}.logo-text.jsx-6cdbe0f759323a3f{-webkit-text-fill-color:transparent;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;font-size:24px;font-weight:700}.nav.jsx-6cdbe0f759323a3f{align-items:center;gap:16px;display:flex}.nav-link.jsx-6cdbe0f759323a3f{color:#888;padding:8px;transition:color .2s}.nav-link.jsx-6cdbe0f759323a3f:hover{color:#fff}.hero.jsx-6cdbe0f759323a3f{text-align:center;z-index:10;max-width:600px;margin:0 auto 40px;position:relative}.hero-badge.jsx-6cdbe0f759323a3f{color:#a5a5ff;background:#6366f11a;border:1px solid #6366f133;border-radius:20px;align-items:center;gap:8px;margin-bottom:20px;padding:8px 16px;font-size:13px;display:inline-flex}.hero-title.jsx-6cdbe0f759323a3f{color:#fff;margin-bottom:16px;font-size:42px;font-weight:700;line-height:1.2}.gradient-text.jsx-6cdbe0f759323a3f{-webkit-text-fill-color:transparent;background:linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7);-webkit-background-clip:text}.hero-subtitle.jsx-6cdbe0f759323a3f{color:#888;font-size:18px;line-height:1.6}.tabs.jsx-6cdbe0f759323a3f{z-index:10;justify-content:center;gap:8px;margin-bottom:24px;display:flex;position:relative}.tab.jsx-6cdbe0f759323a3f{color:#888;cursor:pointer;background:#ffffff08;border:1px solid #ffffff1a;border-radius:12px;align-items:center;gap:8px;padding:12px 24px;font-size:14px;font-weight:500;transition:all .2s;display:flex}.tab.jsx-6cdbe0f759323a3f:hover{color:#fff;background:#ffffff0d}.tab.active.jsx-6cdbe0f759323a3f{color:#6366f1;background:#6366f126;border-color:#6366f14d}.content.jsx-6cdbe0f759323a3f{z-index:10;justify-content:center;margin-bottom:60px;display:flex;position:relative}.stats.jsx-6cdbe0f759323a3f{z-index:10;justify-content:center;gap:60px;margin-bottom:60px;display:flex;position:relative}.stat-item.jsx-6cdbe0f759323a3f{text-align:center}.stat-value.jsx-6cdbe0f759323a3f{color:#6366f1;margin-bottom:4px;font-size:32px;font-weight:700;display:block}.stat-label.jsx-6cdbe0f759323a3f{color:#666;font-size:14px}.features.jsx-6cdbe0f759323a3f{z-index:10;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;max-width:1000px;margin:0 auto 60px;padding:0 20px;display:grid;position:relative}.feature-card.jsx-6cdbe0f759323a3f{text-align:center;background:#ffffff05;border:1px solid #ffffff0f;border-radius:16px;padding:24px}.feature-icon.jsx-6cdbe0f759323a3f{color:#6366f1;background:linear-gradient(135deg,#6366f133,#8b5cf633);border-radius:12px;justify-content:center;align-items:center;width:48px;height:48px;margin-bottom:16px;display:inline-flex}.feature-card.jsx-6cdbe0f759323a3f h3.jsx-6cdbe0f759323a3f{color:#fff;margin-bottom:8px;font-size:18px;font-weight:600}.feature-card.jsx-6cdbe0f759323a3f p.jsx-6cdbe0f759323a3f{color:#888;font-size:14px;line-height:1.5}.footer.jsx-6cdbe0f759323a3f{text-align:center;color:#666;z-index:10;border-top:1px solid #ffffff0d;padding:20px;font-size:13px;position:relative}@media (width<=768px){.hero-title.jsx-6cdbe0f759323a3f{font-size:32px}.stats.jsx-6cdbe0f759323a3f{flex-wrap:wrap;gap:30px}.features.jsx-6cdbe0f759323a3f{grid-template-columns:1fr}}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b349ba2a._.js.map