'use client';

import { useSuiClientContext } from '@mysten/dapp-kit';
import { useState, useRef, useEffect } from 'react';
import { Network, ChevronDown } from 'lucide-react';

export function NetworkSwitcher() {
    const ctx = useSuiClientContext();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const networks = ['mainnet', 'testnet']; // We only care about these two for now

    const handleSelect = (network: string) => {
        ctx.selectNetwork(network);
        setIsOpen(false);
    };

    return (
        <div className="network-switcher" ref={dropdownRef}>
            <button
                className={`network-button ${ctx.network === 'testnet' ? 'testnet' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Network size={16} />
                <span className="network-name">
                    {ctx.network ? ctx.network.charAt(0).toUpperCase() + ctx.network.slice(1) : 'Unknown'}
                </span>
                <ChevronDown size={14} className={`chevron ${isOpen ? 'open' : ''}`} />
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    {networks.map((net) => (
                        <button
                            key={net}
                            className={`dropdown-item ${ctx.network === net ? 'active' : ''}`}
                            onClick={() => handleSelect(net)}
                        >
                            <span className={`status-dot ${net}`} />
                            {net.charAt(0).toUpperCase() + net.slice(1)}
                        </button>
                    ))}
                </div>
            )}

            <style jsx>{`
                .network-switcher {
                    position: relative;
                }
                .network-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: #fff;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .network-button:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                .network-button.testnet {
                    border-color: rgba(245, 158, 11, 0.5);
                    color: #fca5a5;
                }
                .network-name {
                    margin: 0 4px;
                }
                .chevron {
                    opacity: 0.5;
                    transition: transform 0.2s;
                }
                .chevron.open {
                    transform: rotate(180deg);
                }
                .dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    background: #1a1a2e;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 6px;
                    width: 140px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    z-index: 100;
                    backdrop-filter: blur(10px);
                }
                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    padding: 10px;
                    background: none;
                    border: none;
                    border-radius: 8px;
                    color: #888;
                    font-size: 14px;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .dropdown-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                }
                .dropdown-item.active {
                    background: rgba(99, 102, 241, 0.1);
                    color: #6366f1;
                }
                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }
                .status-dot.mainnet {
                    background: #22c55e;
                    box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
                }
                .status-dot.testnet {
                    background: #f59e0b;
                    box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
                }
            `}</style>
        </div>
    );
}
