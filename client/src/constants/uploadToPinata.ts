import axios from 'axios';

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY!;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_SECRET!;
import QRCode from 'qrcode';


export async function uploadJsonDirect(json: any) {
  console.log(PINATA_API_KEY, PINATA_SECRET_API_KEY)
  const res = await axios.post(
    'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    {
      pinataMetadata: { name: 'DataDoc' },
      pinataContent: json,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    }
  );

  const cid = res.data.IpfsHash;
  const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
  return { cid, url };
}


export async function generateQrFromUrl(cid: string): Promise<string> {
  try {
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
    const qrDataUrl = await QRCode.toDataURL(url);
    return qrDataUrl;
  } catch (err) {
    throw new Error('QR generation failed: ' + err);
  }
}
