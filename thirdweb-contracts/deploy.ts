import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  // Initialize the SDK
  const sdk = new ThirdwebSDK("mumbai", {
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });

  // Deploy the contract
  const contract = await sdk.deployer.deployContractFromUri(
    "ipfs://your-contract-uri", // Replace with your contract's IPFS URI
    [] // Constructor arguments
  );

  console.log("Contract deployed at:", contract);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
