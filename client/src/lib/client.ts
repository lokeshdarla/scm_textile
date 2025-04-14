// lib/client.ts
import { createThirdwebClient, defineChain, getContract } from "thirdweb";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!; // this will be used on the client
const secretKey = process.env.THIRDWEB_SECRET_KEY!; // this will be used on the server-side

export const client = createThirdwebClient(
  secretKey ? { secretKey } : { clientId },
);

export const contract = getContract({
  client,
  chain: defineChain(11155111),
  address: "0xc340d4b778f896c5fd82497cd149799389dc124b",
});

