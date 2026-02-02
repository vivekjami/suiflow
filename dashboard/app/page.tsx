'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Trade {
  timestamp: string;
  profit: number;
  gasSaved: number;
  type: string;
}

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState({
    totalProfit: 0,
    totalGasSaved: 0,
    tradesCount: 0,
  });

  useEffect(() => {
    // TODO: Fetch from backend API
    // For now, mock data
    const mockTrades = [
      { timestamp: '10:30', profit: 12.5, gasSaved: 15.2, type: 'ETH/USDC' },
      { timestamp: '10:35', profit: 8.3, gasSaved: 12.1, type: 'ETH/DAI' },
      { timestamp: '10:40', profit: 15.1, gasSaved: 18.5, type: 'WBTC/USDC' },
      { timestamp: '10:45', profit: 9.2, gasSaved: 11.0, type: 'ETH/USDT' },
      { timestamp: '10:50', profit: 11.8, gasSaved: 14.3, type: 'ETH/USDC' },
    ];
    setTrades(mockTrades);
    setStats({
      totalProfit: 56.9,
      totalGasSaved: 71.1,
      tradesCount: 5,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">⚡ Instant Arb Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm uppercase tracking-wider">Total Profit</p>
          <p className="text-3xl font-bold text-green-400 mt-2">${stats.totalProfit.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm uppercase tracking-wider">Gas Saved</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">${stats.totalGasSaved.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm uppercase tracking-wider">Trades Executed</p>
          <p className="text-3xl font-bold mt-2">{stats.tradesCount}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Recent Trades Performance</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trades}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timestamp" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                itemStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Profit ($)" />
              <Line type="monotone" dataKey="gasSaved" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Gas Saved ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Trades Table */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Trade History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left p-2">Time</th>
                <th className="text-left p-2">Pair</th>
                <th className="text-right p-2">Profit</th>
                <th className="text-right p-2">Gas Saved</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, i) => (
                <tr key={i} className="border-b border-gray-700 hover:bg-gray-750 font-mono text-sm">
                  <td className="p-2">{trade.timestamp}</td>
                  <td className="p-2 text-yellow-400">{trade.type}</td>
                  <td className="text-right p-2 text-green-400 font-bold">+${trade.profit.toFixed(2)}</td>
                  <td className="text-right p-2 text-blue-400">+${trade.gasSaved.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
