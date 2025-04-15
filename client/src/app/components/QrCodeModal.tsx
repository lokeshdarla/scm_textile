import { Button } from '@/components/ui/button'
import { DialogContent, DialogFooter } from '@/components/ui/dialog'

import { Dialog } from '@/components/ui/dialog'

import Image from 'next/image'

const QrCodeModal = ({ qrCode, qrCodeDialogOpen, setQrCodeDialogOpen }: { qrCode: string; qrCodeDialogOpen: boolean; setQrCodeDialogOpen: (open: boolean) => void }) => {
  return (
    <Dialog open={qrCodeDialogOpen} onOpenChange={setQrCodeDialogOpen}>
      <DialogContent className="flex flex-col items-center justify-center p-6" aria-labelledby="qr-code-title">
        <h3 id="qr-code-title" className="mb-4 text-lg font-medium">
          QR Code
        </h3>

        {qrCode && (
          <div className="p-4 bg-white rounded-lg">
            <Image src={qrCode} alt="QR Code" width={1000} height={1000} className="w-40 h-40" />
          </div>
        )}

        <p className="mt-4 text-sm text-gray-500">Scan this QR code to verify product authenticity</p>

        <DialogFooter className="flex items-center justify-center w-full gap-2 mt-6">
          <Button variant="outline" onClick={() => setQrCodeDialogOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default QrCodeModal
