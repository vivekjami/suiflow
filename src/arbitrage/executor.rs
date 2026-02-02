use anyhow::Result;
use log::info;

pub struct TradeExecutor {
    yellow_client: crate::yellow_client::YellowClient,
}

impl TradeExecutor {
    pub fn new(yellow_client: crate::yellow_client::YellowClient) -> Self {
        Self { yellow_client }
    }

    pub async fn execute_arbitrage(
        &self,
        opportunity: &super::ArbitrageOpportunity,
        amount_usd: f64,
    ) -> Result<String> {
        info!("🚀 Executing arbitrage trade...");
        info!(
            "📊 Buy on {} @ ${:.4} | Sell on {} @ ${:.4}",
            opportunity.buy_exchange,
            opportunity.buy_price,
            opportunity.sell_exchange,
            opportunity.sell_price
        );
        
        // Step 1: Buy on cheaper exchange (via Yellow state channel)
        let buy_tx = self.yellow_client
            .execute_trade(amount_usd, "USD", "ETH")
            .await?;
        
        info!("✅ Buy executed: {}", buy_tx);

        // Step 2: Sell on expensive exchange
        let sell_tx = self.yellow_client
            .execute_trade(amount_usd, "ETH", "USD")
            .await?;
        
        info!("✅ Sell executed: {}", sell_tx);

        Ok(format!("Buy: {} | Sell: {}", buy_tx, sell_tx))
    }
}
