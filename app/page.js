'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useState } from 'react';
import { NFT_FUND_ADDRESS, NFT_FUND_ABI } from './contractABI';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [investAmount, setInvestAmount] = useState('');
  
  // Read contract data
  const { data: userBalance } = useReadContract({
    address: NFT_FUND_ADDRESS,
    abi: NFT_FUND_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: totalSupply } = useReadContract({
    address: NFT_FUND_ADDRESS,
    abi: NFT_FUND_ABI,
    functionName: 'totalSupply',
  });

  const { data: ethBalance } = useReadContract({
    address: NFT_FUND_ADDRESS,
    abi: NFT_FUND_ABI,
    functionName: 'getETHBalance',
  });

  const { data: totalInvested } = useReadContract({
    address: NFT_FUND_ADDRESS,
    abi: NFT_FUND_ABI,
    functionName: 'totalETHInvested',
  });

  // Write contract
  const { writeContract, data: hash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleInvest = async () => {
    if (!investAmount || parseFloat(investAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      writeContract({
        address: NFT_FUND_ADDRESS,
        abi: NFT_FUND_ABI,
        functionName: 'invest',
        value: parseEther(investAmount),
      });
    } catch (error) {
      console.error('Investment failed:', error);
      alert('Investment failed. Check console for details.');
    }
  };

  // Calculate ownership percentage
  const ownershipPercentage = userBalance && totalSupply 
    ? ((Number(userBalance) / Number(totalSupply)) * 100).toFixed(2)
    : '0';

  const expectedTokens = investAmount ? (parseFloat(investAmount) * 1000).toFixed(2) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-600">NFT Fund</h1>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Fund Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total ETH Invested</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {totalInvested ? formatEther(totalInvested) : '0'} ETH
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Treasury Balance</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {ethBalance ? formatEther(ethBalance) : '0'} ETH
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Fund Tokens</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {totalSupply ? Number(formatEther(totalSupply)).toLocaleString() : '0'}
            </p>
          </div>
        </div>

        {/* Investment Section */}
        {isConnected ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Invest Card */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Invest in Fund</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.0"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  You will receive: <span className="font-semibold text-indigo-600">{expectedTokens} NFTF tokens</span>
                </p>
              </div>

              <button
                onClick={handleInvest}
                disabled={isConfirming || !investAmount}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isConfirming ? 'Confirming...' : 'Invest Now'}
              </button>

              {isSuccess && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">✅ Investment successful!</p>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Exchange Rate:</strong> 1 ETH = 1,000 NFTF tokens
                </p>
              </div>
            </div>

            {/* Your Holdings Card */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Holdings</h2>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Your NFTF Tokens</p>
                  <p className="text-4xl font-bold text-indigo-600">
                    {userBalance ? Number(formatEther(userBalance)).toLocaleString() : '0'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Ownership Percentage</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {ownershipPercentage}%
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Your share of the fund's NFT portfolio and treasury
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Wallet to Get Started
            </h2>
            <p className="text-gray-600 mb-8">
              Invest in a curated portfolio of NFTs managed by experts
            </p>
            <ConnectButton />
          </div>
        )}

        {/* Contract Info */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Information</h3>
          <p className="text-sm text-gray-600">
            Contract Address: <a 
              href={`https://sepolia.etherscan.io/address/${NFT_FUND_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 font-mono"
            >
              {NFT_FUND_ADDRESS}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}