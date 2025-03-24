// scripts/transfer-from-hardhat.js
const { ethers } = require("hardhat");

async function main() {
  // Get the first signer from Hardhat's local accounts
  const [sender] = await ethers.getSigners();
  
  // Your personal wallet address on Sepolia
  const receiverAddress = "0xCE103E9f566fb0F25b176aC0E2699Ede3C7A222C"; // Replace with your actual address
  
  // Amount to send (in ETH)
  const amountInEth = "500.0";
  const amountInWei = ethers.parseEther(amountInEth);
  
  // Get initial balances
  const senderBalanceBefore = await ethers.provider.getBalance(sender.address);
  console.log(`Sender balance before: ${ethers.formatEther(senderBalanceBefore)} ETH`);
  
  console.log(`Transferring ${amountInEth} ETH from ${sender.address} to ${receiverAddress}`);
  
  // Send the transaction
  const tx = await sender.sendTransaction({
    to: receiverAddress,
    value: amountInWei
  });
  
  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();
  console.log("Transfer complete!");
  
  // Get final balance
  const senderBalanceAfter = await ethers.provider.getBalance(sender.address);
  console.log(`Sender balance after: ${ethers.formatEther(senderBalanceAfter)} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
