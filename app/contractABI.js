export const NFT_FUND_ADDRESS = "0x61f9e12f4d853F582ABfCD17f4903cC3Cd640629";

export const NFT_FUND_ABI = [
  "function invest() external payable",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function getETHBalance() external view returns (uint256)",
  "function totalETHInvested() external view returns (uint256)",
  "function TOKENS_PER_ETH() external view returns (uint256)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function withdrawETH(uint256 amount) external",
  "function mintTokensManual(address to, uint256 tokenAmount, string calldata reason) external",
  "event Investment(address indexed investor, uint256 ethAmount, uint256 tokensReceived)"
];