use anyhow::Result;
use log::info;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PriceData {
    pub pair: String,
    pub price: f64,
    pub exchange: String,
    pub timestamp: i64,
    pub volume_24h: Option<f64>,
    pub liquidity: Option<f64>,
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

    /// Get prices from DEX Screener API
    /// This aggregates prices from multiple DEXes across multiple chains
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
            for pair in pairs.iter().take(10) {
                if let Some(price_str) = pair["priceUsd"].as_str() {
                    let price = price_str.parse().unwrap_or(0.0);
                    if price > 0.0 {
                        prices.push(PriceData {
                            pair: token_pair.to_string(),
                            price,
                            exchange: pair["dexId"].as_str().unwrap_or("unknown").to_string(),
                            timestamp: chrono::Utc::now().timestamp(),
                            volume_24h: pair["volume"]["h24"].as_f64(),
                            liquidity: pair["liquidity"]["usd"].as_f64(),
                        });
                    }
                }
            }
        }

        Ok(prices)
    }

    /// Get Uniswap prices using DEX Screener filtered for Uniswap
    pub async fn get_uniswap_price(&self, token_pair: &str) -> Result<f64> {
        let prices = self.get_dex_prices(token_pair).await?;
        
        // Filter for Uniswap DEXes
        let uniswap_prices: Vec<_> = prices
            .iter()
            .filter(|p| p.exchange.contains("uniswap"))
            .collect();

        if let Some(best_price) = uniswap_prices.first() {
            info!("💱 Uniswap price for {}: ${:.4}", token_pair, best_price.price);
            Ok(best_price.price)
        } else if let Some(fallback) = prices.first() {
            // Fallback to any DEX price
            info!("💱 Fallback price for {}: ${:.4} ({})", token_pair, fallback.price, fallback.exchange);
            Ok(fallback.price)
        } else {
            anyhow::bail!("No price found for {}", token_pair)
        }
    }

    /// Get prices from multiple sources for better arbitrage detection
    pub async fn get_multi_source_prices(&self, token: &str) -> Result<Vec<PriceData>> {
        let mut all_prices = Vec::new();

        // Get DEX Screener prices
        let dex_prices = self.get_dex_prices(token).await?;
        all_prices.extend(dex_prices);

        // Try to get CoinGecko price as reference
        if let Ok(cg_price) = self.get_coingecko_price(token).await {
            all_prices.push(PriceData {
                pair: token.to_string(),
                price: cg_price,
                exchange: "coingecko".to_string(),
                timestamp: chrono::Utc::now().timestamp(),
                volume_24h: None,
                liquidity: None,
            });
        }

        Ok(all_prices)
    }

    /// Get price from CoinGecko API (free tier)
    async fn get_coingecko_price(&self, token: &str) -> Result<f64> {
        let token_id = match token.to_uppercase().as_str() {
            "ETH" => "ethereum",
            "BTC" => "bitcoin",
            "USDC" => "usd-coin",
            "USDT" => "tether",
            "DAI" => "dai",
            "WETH" => "weth",
            _ => return Err(anyhow::anyhow!("Unknown token for CoinGecko: {}", token)),
        };

        let url = format!(
            "https://api.coingecko.com/api/v3/simple/price?ids={}&vs_currencies=usd",
            token_id
        );

        let response: serde_json::Value = self.client
            .get(&url)
            .send()
            .await?
            .json()
            .await?;

        response[token_id]["usd"]
            .as_f64()
            .ok_or_else(|| anyhow::anyhow!("Price not found in CoinGecko response"))
    }

    /// Get the best buy and sell prices from a list
    pub fn get_best_prices(prices: &[PriceData]) -> Option<(PriceData, PriceData)> {
        if prices.len() < 2 {
            return None;
        }

        let min = prices.iter().min_by(|a, b| a.price.partial_cmp(&b.price).unwrap())?;
        let max = prices.iter().max_by(|a, b| a.price.partial_cmp(&b.price).unwrap())?;

        Some((min.clone(), max.clone()))
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
        let prices = prices.unwrap();
        assert!(!prices.is_empty());
        println!("Found {} price sources", prices.len());
        for p in &prices {
            println!("  {} @ ${:.4} on {}", p.pair, p.price, p.exchange);
        }
    }

    #[tokio::test]
    async fn test_uniswap_price() {
        let feed = PriceFeed::new();
        let price = feed.get_uniswap_price("ETH").await;
        assert!(price.is_ok());
        println!("Uniswap ETH price: ${}", price.unwrap());
    }

    #[tokio::test]
    async fn test_multi_source() {
        let feed = PriceFeed::new();
        let prices = feed.get_multi_source_prices("ETH").await;
        assert!(prices.is_ok());
        let prices = prices.unwrap();
        println!("Multi-source prices:");
        for p in &prices {
            println!("  ${:.4} on {}", p.price, p.exchange);
        }
    }
}
