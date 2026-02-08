'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useFormattedAddress } from '@/hooks/useENS';

export function WalletConnect() {
    const account = useCurrentAccount();
    const formattedAddress = useFormattedAddress(account?.address);

    return (
        <div className="wallet-connect">
            <ConnectButton
                connectText="Connect Wallet"
            />
            {account && (
                <div className="wallet-info">
                    <span className="wallet-address">{formattedAddress}</span>
                </div>
            )}
            <style jsx>{`
        .wallet-connect {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .wallet-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-size: 14px;
        }
        .wallet-address {
          color: #e0e0e0;
          font-family: monospace;
        }
      `}</style>
        </div>
    );
}
