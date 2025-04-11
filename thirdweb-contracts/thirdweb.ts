import { createThirdwebClient } from "thirdweb";

if (!process.env.THIRDWEB_SECRET_KEY) {
  throw new Error("THIRDWEB_SECRET_KEY is required");
}

const client = createThirdwebClient({
  clientId: process.env.THIRDWEB_CLIENT_ID,
  secretKey: process.env.THIRDWEB_SECRET_KEY,
});



