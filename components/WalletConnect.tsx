'use client';

import {
  useCurrentAccount,
  useWallets,
  useConnectWallet,
  useDisconnectWallet
} from '@mysten/dapp-kit';
import { useFormattedAddress } from '@/hooks/useENS';
import { useState, useRef, useEffect } from 'react';
import { Wallet, LogOut, Download, ExternalLink, X } from 'lucide-react';

const POPULAR_WALLETS = [
  {
    name: 'Sui Wallet',
    icon: 'https://lh3.googleusercontent.com/info-card/APP_FULL_COLOR_ICON/20230221191054/1046903253/com.mystenlabs.sui_wallet?s=256',
    downloadUrl: 'https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbnyfyjmg',
  },
  {
    name: 'Suiet',
    icon: 'https://suiet.app/logo.png',
    downloadUrl: 'https://suiet.app/',
  },
  {
    name: 'Ethos Wallet',
    icon: 'https://ethoswallet.xyz/assets/images/ethos-icon-square.png',
    downloadUrl: 'https://ethoswallet.xyz/',
  },
  {
    name: 'Nightly',
    icon: 'https://nightly.app/img/nightly-logo.png', // Placeholder, using text/generic if fails
    downloadUrl: 'https://nightly.app/',
  }
];

export function WalletConnect() {
  const account = useCurrentAccount();
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const formattedAddress = useFormattedAddress(account?.address);

  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleConnect = (wallet: any) => {
    connect(
      { wallet },
      {
        onSuccess: () => setIsOpen(false),
      }
    );
  };

  if (account) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <span className="wallet-icon">🟣</span>
          <span className="wallet-address">{formattedAddress}</span>
        </div>
        <button
          className="disconnect-btn"
          onClick={() => disconnect()}
          title="Disconnect Wallet"
        >
          <LogOut size={16} />
        </button>
        <style jsx>{`
                    .wallet-connected {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        background: rgba(255, 255, 255, 0.08);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        padding: 6px 6px 6px 12px;
                        border-radius: 12px;
                        backdrop-filter: blur(10px);
                    }
                    .wallet-info {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 14px;
                        font-weight: 500;
                        color: #fff;
                    }
                    .wallet-icon {
                        font-size: 16px;
                    }
                    .wallet-address {
                        font-family: 'Inter', sans-serif;
                        letter-spacing: 0.5px;
                    }
                    .disconnect-btn {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 32px;
                        height: 32px;
                        border: none;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        color: #ef4444;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .disconnect-btn:hover {
                        background: rgba(239, 68, 68, 0.2);
                        transform: scale(1.05);
                    }
                `}</style>
      </div>
    );
  }

  return (
    <>
      <button
        className="connect-btn"
        onClick={() => setIsOpen(true)}
      >
        <Wallet size={18} />
        Connect Wallet
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h3>Connect Wallet</h3>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="wallets-section">
              <h4>Detected Wallets</h4>
              {wallets.length > 0 ? (
                <div className="wallets-list">
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.name}
                      className="wallet-item"
                      onClick={() => handleConnect(wallet)}
                    >
                      <img src={wallet.icon} alt={wallet.name} className="wallet-logo" />
                      <span className="wallet-name">{wallet.name}</span>
                      <span className="wallet-status">Detected</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="no-wallets">
                  <p>No Sui wallet detected.</p>
                </div>
              )}
            </div>

            <div className="wallets-section">
              <h4>Popular Wallets</h4>
              <div className="wallets-list">
                {POPULAR_WALLETS.filter(pw => !wallets.some(w => w.name === pw.name)).map((wallet) => (
                  <a
                    key={wallet.name}
                    href={wallet.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wallet-item download"
                  >
                    <div className="wallet-left">
                      {/* Fallback for icon if external image fails to load? Browser handles broken img tags usually. */}
                      {/* Using a generic placeholder div if no icon, or just text */}
                      <div className="wallet-logo-placeholder">{wallet.name[0]}</div>
                      <span className="wallet-name">{wallet.name}</span>
                    </div>
                    <div className="download-badge">
                      <Download size={14} />
                      <span>Install</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
                .connect-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                }
                .connect-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.2s ease-out;
                }

                .modal-content {
                    width: 100%;
                    max-width: 420px;
                    background: #1a1b2e;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 24px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .modal-header h3 {
                    margin: 0;
                    color: #fff;
                    font-size: 20px;
                    font-weight: 700;
                }
                .close-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    color: #888;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .wallets-section {
                    margin-bottom: 24px;
                }
                .wallets-section h4 {
                    color: #888;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 0 0 12px 0;
                }

                .wallets-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .wallet-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    color: #fff;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .wallet-item:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.1);
                    transform: translateX(4px);
                }

                .wallet-logo {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    margin-right: 12px;
                }
                .wallet-logo-placeholder {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    margin-right: 12px;
                }

                .wallet-name {
                    font-size: 16px;
                    font-weight: 500;
                    flex: 1;
                    text-align: left;
                }
                .wallet-status {
                    font-size: 12px;
                    color: #22c55e;
                    background: rgba(34, 197, 94, 0.1);
                    padding: 4px 8px;
                    border-radius: 20px;
                }

                .wallet-left {
                    display: flex;
                    align-items: center;
                    flex: 1;
                }

                .download-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: #6366f1;
                    background: rgba(99, 102, 241, 0.1);
                    padding: 6px 10px;
                    border-radius: 20px;
                    transition: background 0.2s;
                }
                .wallet-item:hover .download-badge {
                    background: rgba(99, 102, 241, 0.2);
                }

                .no-wallets {
                    text-align: center;
                    padding: 20px;
                    color: #666;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 12px;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
    </>
  );
}
