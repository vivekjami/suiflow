'use client';

import { useState } from 'react';
import { SUPPORTED_TOKENS, Token } from '@/lib/types';
import { ChevronDown, Search } from 'lucide-react';

interface TokenSelectProps {
    value: string;
    onChange: (symbol: string) => void;
    label?: string;
    excludeToken?: string;
}

export function TokenSelect({ value, onChange, label, excludeToken }: TokenSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const selectedToken = SUPPORTED_TOKENS.find(t => t.symbol === value);

    const filteredTokens = SUPPORTED_TOKENS.filter(token =>
        token.symbol !== excludeToken &&
        (token.symbol.toLowerCase().includes(search.toLowerCase()) ||
            token.name.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSelect = (token: Token) => {
        onChange(token.symbol);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div className="token-select-container">
            {label && <label className="token-label">{label}</label>}

            <button
                className="token-select-button"
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <div className="token-info">
                    <div className="token-icon">
                        {selectedToken?.symbol.charAt(0) || '?'}
                    </div>
                    <span className="token-symbol">{selectedToken?.symbol || 'Select'}</span>
                    {selectedToken?.ensName && (
                        <span className="token-ens">{selectedToken.ensName}</span>
                    )}
                </div>
                <ChevronDown className={`chevron ${isOpen ? 'open' : ''}`} size={20} />
            </button>

            {isOpen && (
                <div className="token-dropdown">
                    <div className="search-container">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search tokens..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                            autoFocus
                        />
                    </div>

                    <div className="token-list">
                        {filteredTokens.map(token => (
                            <button
                                key={token.symbol}
                                className={`token-option ${token.symbol === value ? 'selected' : ''}`}
                                onClick={() => handleSelect(token)}
                            >
                                <div className="token-icon">{token.symbol.charAt(0)}</div>
                                <div className="token-details">
                                    <span className="token-symbol">{token.symbol}</span>
                                    <span className="token-name">{token.name}</span>
                                </div>
                                {token.ensName && (
                                    <span className="token-ens-badge">{token.ensName}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
        .token-select-container {
          position: relative;
        }
        .token-label {
          display: block;
          font-size: 12px;
          color: #888;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .token-select-button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .token-select-button:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .token-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .token-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
          font-size: 14px;
        }
        .token-symbol {
          font-weight: 600;
          font-size: 16px;
          color: #fff;
        }
        .token-ens {
          font-size: 12px;
          color: #888;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }
        .chevron {
          color: #888;
          transition: transform 0.2s;
        }
        .chevron.open {
          transform: rotate(180deg);
        }
        .token-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 8px;
          background: #1a1a2e;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          z-index: 100;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }
        .search-container {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .search-icon {
          color: #666;
          margin-right: 10px;
        }
        .search-input {
          flex: 1;
          background: none;
          border: none;
          color: #fff;
          font-size: 14px;
          outline: none;
        }
        .search-input::placeholder {
          color: #666;
        }
        .token-list {
          max-height: 240px;
          overflow-y: auto;
        }
        .token-option {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
          text-align: left;
        }
        .token-option:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .token-option.selected {
          background: rgba(99, 102, 241, 0.2);
        }
        .token-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .token-name {
          font-size: 12px;
          color: #888;
        }
        .token-ens-badge {
          font-size: 11px;
          color: #6366f1;
          background: rgba(99, 102, 241, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
        }
      `}</style>
        </div>
    );
}
