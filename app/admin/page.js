'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useState } from 'react';
import { NFT_FUND_ADDRESS, NFT_FUND_ABI } from '../contractABI';

// Your deployer wallet address (the one that deployed the contract)
const ADMIN_ADDRESS = "0x7d0262f9dc4f014cbbffe8c6efdb2de509856aa4"; // Replace with your actual address

export default function AdminDashboard() {
  const { address, isConnected } = useAccount();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [mintAddress, setMintAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [mintReason, setMintReason] = useState('');
  const [founderTokenAmount, setFounderTokenAmount] = useState('');

  // Check if connected wallet is admin
  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  // Read contract data
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

  const { data: adminBalance } = useReadContract({
    address: NFT_FUND_ADDRESS,
    abi: NFT_FUND_ABI,
    functionName: 'balanceOf',
    args: isAdmin ? [address] : undefined,
  });

  // Write functions
  const { writeContract: withdraw, data: withdrawHash } = useWriteContract();
  const { writeContract: mintTokens, data: mintHash } = useWriteContract();
  const { writeContract: mintFounder, data: founderHash } = useWriteContract();

  const { isLoading: isWithdrawing } = useWaitForTransactionReceipt({ hash: withdrawHash });
  const { isLoading: isMinting } = useWaitForTransactionReceipt({ hash: mintHash });
  const { isLoading: isMintingFounder } = useWaitForTransactionReceipt({ hash: founderHash });

  // Calculate stats
  const tokensFromETH = totalInvested ? (Number(formatEther(totalInvested)) * 1000) : 0;
  const manuallyMinted = totalSupply ? (Number(formatEther(totalSupply)) - tokensFromETH) : 0;
  const ownershipPercentage = adminBalance && totalSupply 
    ? ((Number(adminBalance) / Number(totalSupply)) * 100).toFixed(2)
    : '0';

  // Handler functions
  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      withdraw({
        address: NFT_FUND_ADDRESS,
        abi: NFT_FUND_ABI,
        functionName: 'withdrawETH',
        args: [parseEther(withdrawAmount)],
      });
    } catch (error) {
      console.error('Withdrawal failed:', error);
      alert('Withdrawal failed. Check console for details.');
    }
  };

  const handleMintTokens = () => {
    if (!mintAddress || !mintAmount || !mintReason) {
      alert('Please fill in all fields');
      return;
    }

    try {
      mintTokens({
        address: NFT_FUND_ADDRESS,
        abi: NFT_FUND_ABI,
        functionName: 'mintTokensManual',
        args: [mintAddress, mintAmount, mintReason],
      });
    } catch (error) {
      console.error('Minting failed:', error);
      alert('Minting failed. Check console for details.');
    }
  };

  const handleMintFounder = () => {
    if (!founderTokenAmount || parseFloat(founderTokenAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const reason = `Remaining founder allocation to reach target`;
    
    try {
      mintTokens({
        address: NFT_FUND_ADDRESS,
        abi: NFT_FUND_ABI,
        functionName: 'mintTokensManual',
        args: [address, founderTokenAmount, reason],
      });
    } catch (error) {
      console.error('Founder minting failed:', error);
      alert('Founder minting failed. Check console for details.');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
          <p className="text-gray-600">This dashboard is only accessible to the fund admin.</p>
          <p className="text-sm text-gray-500 mt-4">Connected: {address}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">S100 Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Fund Management & Controls</p>
          </div>
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Fund Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total ETH Invested</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {totalInvested ? formatEther(totalInvested) : '0'} ETH
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Target: 5 ETH
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Treasury Balance</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {ethBalance ? formatEther(ethBalance) : '0'} ETH
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Available to withdraw
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Tokens Issued</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {totalSupply ? Number(formatEther(totalSupply)).toLocaleString() : '0'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              From ETH: {tokensFromETH.toLocaleString()} | Manual: {manuallyMinted.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Your Ownership</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {ownershipPercentage}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {adminBalance ? Number(formatEther(adminBalance)).toLocaleString() : '0'} tokens
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Withdraw ETH Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">💰 Withdraw ETH</h2>
            <p className="text-sm text-gray-600 mb-4">
              Withdraw ETH from treasury to buy NFTs
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (ETH)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.0"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {ethBalance ? formatEther(ethBalance) : '0'} ETH
              </p>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing || !withdrawAmount}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              {isWithdrawing ? 'Processing...' : 'Withdraw ETH'}
            </button>
          </div>

          {/* Manual Token Minting Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🎫 Mint Tokens (Fiat Investors)</h2>
            <p className="text-sm text-gray-600 mb-4">
              Manually mint tokens for investors who paid via fiat
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investor Address
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={mintAddress}
                  onChange={(e) => setMintAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Amount
                </label>
                <input
                  type="number"
                  placeholder="1000"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <input
                  type="text"
                  placeholder="Fiat payment - $2000 from John"
                  value={mintReason}
                  onChange={(e) => setMintReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleMintTokens}
              disabled={isMinting || !mintAddress || !mintAmount || !mintReason}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition"
            >
              {isMinting ? 'Minting...' : 'Mint Tokens'}
            </button>
          </div>
        </div>

        {/* Mint Remaining Founder Tokens Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">👑 Mint Remaining Founder Tokens</h2>
          <p className="text-sm text-gray-600 mb-4">
            If friends don't reach 5 ETH target, mint yourself the remaining tokens
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-900">
              <strong>Current Status:</strong><br/>
              Friends invested: {totalInvested ? formatEther(totalInvested) : '0'} ETH<br/>
              Target: 5 ETH<br/>
              Remaining: {totalInvested ? (5 - Number(formatEther(totalInvested))).toFixed(2) : '5'} ETH<br/>
              Tokens to mint: {totalInvested ? ((5 - Number(formatEther(totalInvested))) * 1000).toFixed(0) : '5000'}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Amount to Mint
            </label>
            <input
              type="number"
              placeholder="2000"
              value={founderTokenAmount}
              onChange={(e) => setFounderTokenAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-lg"
            />
          </div>

          <button
            onClick={handleMintFounder}
            disabled={isMintingFounder || !founderTokenAmount}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition"
          >
            {isMintingFounder ? 'Minting...' : 'Mint Founder Tokens'}
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
          <div className="space-y-2">
            <a 
              href={`https://sepolia.etherscan.io/address/${NFT_FUND_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-indigo-600 hover:text-indigo-800"
            >
              → View Contract on Etherscan
            </a>
            <a 
              href="/"
              className="block text-indigo-600 hover:text-indigo-800"
            >
              → Go to Public Investment Page
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}