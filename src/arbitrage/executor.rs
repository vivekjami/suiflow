use anyhow::Result;
use log::info;

use crate::yellow_client::{YellowClient, TradeResult};

/// Trade execution result
#[derive(Debug, Clone)]
pub struct ExecutionResult {
    pub buy_tx: TradeResult,
    pub sell_tx: TradeResult,
    pub net_profit_usd: f64,
    pub total_gas_saved: f64,
}

/// Trade Executor using Yellow Network for gasless execution
pub struct TradeExecutor {
    yellow_client: YellowClient,
    /// Estimated gas cost if executed on Ethereum mainnet (for comparison)
    estimated_mainnet_gas: f64,
}

impl TradeExecutor {
    pub fn new(yellow_client: YellowClient) -> Self {
        Self { 
            yellow_client,
            estimated_mainnet_gas: 0.0,
        }
    }

    /// Execute an arbitrage opportunity
    /// 
    /// This demonstrates the key value proposition of Yellow Network:
    /// - Buy on cheaper exchange via state channel (gas: $0)
    /// - Sell on expensive exchange via state channel (gas: $0)
    /// - Traditional execution would cost $15-30 per trade in gas!
    pub async fn execute_arbitrage(
        &mut self,
        opportunity: &super::ArbitrageOpportunity,
        amount_usd: f64,
    ) -> Result<ExecutionResult> {
        info!("🚀 Executing arbitrage trade via Yellow Network...");
        info!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        info!(
            "📊 Strategy: Buy on {} @ ${:.4} | Sell on {} @ ${:.4}",
            opportunity.buy_exchange,
            opportunity.buy_price,
            opportunity.sell_exchange,
            opportunity.sell_price
        );
        info!("💵 Trade size: ${:.2}", amount_usd);
        info!("📈 Expected profit: {:.2}% (${:.2})", 
            opportunity.profit_percentage, 
            opportunity.net_profit_usd
        );
        info!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // Ensure state channel is open
        if !self.yellow_client.is_connected() {
            info!("📡 Opening Yellow Network state channel...");
            self.yellow_client.create_state_channel().await?;
        }
        
        // Step 1: Buy on cheaper exchange (via Yellow state channel)
        info!("");
        info!("📥 Step 1: BUY {} worth of ETH @ ${:.4}", amount_usd, opportunity.buy_price);
        let buy_tx = self.yellow_client
            .execute_trade(amount_usd, "USDC", "ETH")
            .await?;
        
        // Calculate how much ETH we bought
        let eth_amount = amount_usd / opportunity.buy_price;
        
        // Step 2: Sell on expensive exchange (via Yellow state channel)
        info!("");
        info!("📤 Step 2: SELL {:.6} ETH @ ${:.4}", eth_amount, opportunity.sell_price);
        let sell_tx = self.yellow_client
            .execute_trade(eth_amount, "ETH", "USDC")
            .await?;

        // Calculate actual profit
        let revenue = sell_tx.amount_out;
        let net_profit = revenue - amount_usd;
        
        // Calculate gas savings compared to Ethereum mainnet
        // Typical DEX swap: ~150,000 gas * 30 gwei * $2300/ETH = ~$10
        // We need 2 swaps, so ~$20 saved
        let mainnet_gas_estimate = 20.0;
        self.estimated_mainnet_gas += mainnet_gas_estimate;

        info!("");
        info!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        info!("✅ ARBITRAGE COMPLETE!");
        info!("   💰 Net Profit: ${:.2}", net_profit);
        info!("   ⛽ Gas Cost: $0.00 (via Yellow state channel)");
        info!("   💸 Gas Saved: ${:.2} (vs Ethereum mainnet)", mainnet_gas_estimate);
        info!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        Ok(ExecutionResult {
            buy_tx,
            sell_tx,
            net_profit_usd: net_profit,
            total_gas_saved: mainnet_gas_estimate,
        })
    }

    /// Get total gas saved across all trades
    pub fn get_total_gas_saved(&self) -> f64 {
        self.estimated_mainnet_gas
    }

    /// Get the underlying Yellow client
    pub fn yellow_client(&self) -> &YellowClient {
        &self.yellow_client
    }

    /// Get mutable reference to Yellow client
    pub fn yellow_client_mut(&mut self) -> &mut YellowClient {
        &mut self.yellow_client
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::yellow_client::YellowConfig;

    #[tokio::test]
    async fn test_executor_creation() {
        let config = YellowConfig::default();
        let client = YellowClient::new(config);
        let _executor = TradeExecutor::new(client);
    }

    #[tokio::test]
    async fn test_execute_arbitrage() {
        let config = YellowConfig::default();
        let client = YellowClient::new(config);
        let mut executor = TradeExecutor::new(client);

        let opportunity = super::super::ArbitrageOpportunity {
            buy_exchange: "uniswap".to_string(),
            sell_exchange: "sushiswap".to_string(),
            buy_price: 2300.0,
            sell_price: 2320.0,
            profit_percentage: 0.87,
            estimated_profit_usd: 8.7,
            gas_cost_usd: 0.0,
            net_profit_usd: 8.7,
        };

        let result = executor.execute_arbitrage(&opportunity, 1000.0).await;
        assert!(result.is_ok());
        
        let result = result.unwrap();
        assert_eq!(result.buy_tx.gas_cost, 0.0);
        assert_eq!(result.sell_tx.gas_cost, 0.0);
        assert!(result.total_gas_saved > 0.0);
    }
}
