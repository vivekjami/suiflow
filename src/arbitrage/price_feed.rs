use anyhow::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PriceData {
    pub pair: String,
    pub price: f64,
    pub exchange: String,
    pub timestamp: i64,
}

pub struct PriceFeed {
    client: reqwest::Client,
}

impl PriceFeed {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
        }
    }

    // Get prices from DEX Screener API
    pub async fn get_dex_prices(&self, token_pair: &str) -> Result<Vec<PriceData>> {
        let url = format!(
            "https://api.dexscreener.com/latest/dex/search?q={}",
            token_pair
        );

        let response = self.client
            .get(&url)
            .send()
            .await?
            .json::<serde_json::Value>()
            .await?;

        // Parse response
        let mut prices = Vec::new();
        
        if let Some(pairs) = response["pairs"].as_array() {
            for pair in pairs.iter().take(5) {
                if let Some(price_str) = pair["priceUsd"].as_str() {
                    prices.push(PriceData {
                        pair: token_pair.to_string(),
                        price: price_str.parse().unwrap_or(0.0),
                        exchange: pair["dexId"].as_str().unwrap_or("unknown").to_string(),
                        timestamp: chrono::Utc::now().timestamp(),
                    });
                }
            }
        }

        Ok(prices)
    }

    // Get Uniswap v4 prices (placeholder - implement with actual SDK)
    pub async fn get_uniswap_price(&self, _token_pair: &str) -> Result<f64> {
        // TODO: Implement Uniswap v4 SDK integration
        todo!("Implement Uniswap v4 price fetching")
    }
}

impl Default for PriceFeed {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_dex_screener() {
        let feed = PriceFeed::new();
        let prices = feed.get_dex_prices("ETH").await;
        assert!(prices.is_ok());
    }
}
