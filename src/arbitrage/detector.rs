use log::info;

#[derive(Debug, Clone)]
pub struct ArbitrageOpportunity {
    pub buy_exchange: String,
    pub sell_exchange: String,
    pub buy_price: f64,
    pub sell_price: f64,
    pub profit_percentage: f64,
    pub estimated_profit_usd: f64,
    pub gas_cost_usd: f64,
    pub net_profit_usd: f64,
}

pub struct ArbitrageDetector {
    min_profit_percentage: f64,
    #[allow(dead_code)]
    gas_cost_estimate: f64,
}

impl ArbitrageDetector {
    pub fn new(min_profit_percentage: f64, gas_cost_estimate: f64) -> Self {
        Self {
            min_profit_percentage,
            gas_cost_estimate,
        }
    }

    pub fn detect_opportunity(
        &self,
        prices: &[super::price_feed::PriceData],
        trade_size_usd: f64,
    ) -> Option<ArbitrageOpportunity> {
        if prices.len() < 2 {
            return None;
        }

        // Find min and max prices
        let min_price = prices.iter()
            .min_by(|a, b| a.price.partial_cmp(&b.price).unwrap())?;
        let max_price = prices.iter()
            .max_by(|a, b| a.price.partial_cmp(&b.price).unwrap())?;

        // Calculate profit
        let profit_percentage = ((max_price.price - min_price.price) / min_price.price) * 100.0;
        let estimated_profit_usd = trade_size_usd * (profit_percentage / 100.0);
        
        // With Yellow Network, gas cost is ZERO for state channel trades
        let gas_cost_usd = 0.0; // This is the key value prop!
        let net_profit_usd = estimated_profit_usd - gas_cost_usd;

        if profit_percentage < self.min_profit_percentage {
            return None;
        }

        info!(
            "🎯 Arbitrage found! Buy {} @ ${:.2} | Sell {} @ ${:.2} | Profit: {:.2}%",
            min_price.exchange, min_price.price,
            max_price.exchange, max_price.price,
            profit_percentage
        );

        Some(ArbitrageOpportunity {
            buy_exchange: min_price.exchange.clone(),
            sell_exchange: max_price.exchange.clone(),
            buy_price: min_price.price,
            sell_price: max_price.price,
            profit_percentage,
            estimated_profit_usd,
            gas_cost_usd,
            net_profit_usd,
        })
    }
}
