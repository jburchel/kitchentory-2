'use client'

import { useState, useRef, useEffect } from 'react'
import Quagga, { QuaggaJSConfigObject, QuaggaJSResultObject } from '@ericblade/quagga2'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, Square, X, Keyboard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void
  onClose: () => void
  className?: string
}

export default function BarcodeScanner({ onBarcodeDetected, onClose, className }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [manualEntry, setManualEntry] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')
  const [error, setError] = useState('')
  const [permissionGranted, setPermissionGranted] = useState(false)
  const scannerRef = useRef<HTMLDivElement>(null)

  const config: QuaggaJSConfigObject = {
    inputStream: {
      name: 'Live',
      type: 'LiveStream',
      target: scannerRef.current || undefined,
      constraints: {
        width: 640,
        height: 480,
        facingMode: 'environment' // Use back camera on mobile
      }
    },
    decoder: {
      readers: [
        'ean_reader',
        'ean_8_reader',
        'code_128_reader',
        'code_39_reader',
        'code_39_vin_reader',
        'codabar_reader',
        'upc_reader',
        'upc_e_reader',
        'i2of5_reader'
      ]
    },
    locator: {
      patchSize: 'medium',
      halfSample: true
    },
    numOfWorkers: 2,
    frequency: 10
  }

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop()) // Stop immediately after permission check
      setPermissionGranted(true)
      setError('')
      return true
    } catch (err) {
      setError('Camera access needed for scanning. Please enable camera or try manual entry.')
      setPermissionGranted(false)
      return false
    }
  }

  const startScanning = async () => {
    if (!scannerRef.current) return

    try {
      setError('')
      setIsScanning(true)

      await Quagga.init({
        ...config,
        inputStream: {
          ...config.inputStream,
          target: scannerRef.current
        }
      })

      Quagga.start()
      
      Quagga.onDetected((result: QuaggaJSResultObject) => {
        const code = result.codeResult.code
        if (code && code.length >= 8) { // Basic validation for barcode length
          onBarcodeDetected(code)
          stopScanning()
        }
      })

    } catch (err) {
      setError('Camera not available right now. Manual entry is ready to use.')
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    Quagga.stop()
    setIsScanning(false)
  }

  const handleManualSubmit = () => {
    if (manualBarcode.trim().length >= 8) {
      onBarcodeDetected(manualBarcode.trim())
    } else {
      setError('Barcode needs at least 8 digits. Please check and try again.')
    }
  }

  useEffect(() => {
    return () => {
      if (isScanning) {
        Quagga.stop()
      }
    }
  }, [isScanning])

  return (
    <Card className={cn('w-full max-w-2xl mx-auto border-primary-200 shadow-elevated', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-primary-600">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Camera className="h-5 w-5 text-primary-600" />
            </div>
            Scan Barcode
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-error-light hover:text-error">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!permissionGranted && !manualEntry && (
          <div className="text-center space-y-6 py-6">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-primary-50 rounded-xl mb-4">
                <Camera className="h-12 w-12 text-primary-500 mx-auto mb-3" />
              </div>
              <p className="text-muted-foreground text-base leading-relaxed">
                Scan barcodes instantly with your camera, or add items by typing their codes
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
              <Button onClick={requestCameraPermission} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Allow Camera
              </Button>
              <Button variant="secondary" onClick={() => setManualEntry(true)} className="flex-1">
                <Keyboard className="h-4 w-4 mr-2" />
                Manual Entry
              </Button>
            </div>
          </div>
        )}

        {permissionGranted && !manualEntry && !isScanning && (
          <div className="text-center space-y-4 py-4">
            <Button onClick={startScanning} size="lg" className="min-w-[200px]">
              <Camera className="h-5 w-5 mr-3" />
              Start Scanning
            </Button>
            <Button variant="ghost" onClick={() => setManualEntry(true)} className="text-primary-600 hover:text-primary-700">
              <Keyboard className="h-4 w-4 mr-2" />
              Enter Manually Instead
            </Button>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="relative bg-black rounded-xl overflow-hidden border-2 border-primary-200">
              <div ref={scannerRef} className="w-full h-64" />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-2 border-primary-400/30 rounded-xl" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Square className="h-32 w-32 text-primary-400 animate-pulse" strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="text-center space-y-4">
              <p className="text-base text-muted-foreground font-medium">
                Center the barcode in the frame for quick scanning
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                <Button onClick={stopScanning} variant="secondary" className="flex-1">
                  Stop Scanning
                </Button>
                <Button variant="ghost" onClick={() => {
                  stopScanning()
                  setManualEntry(true)
                }} className="flex-1 text-primary-600 hover:text-primary-700">
                  Manual Entry
                </Button>
              </div>
            </div>
          </div>
        )}

        {manualEntry && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manual-barcode">Enter Barcode</Label>
              <Input
                id="manual-barcode"
                type="text"
                placeholder="Type or paste barcode number here..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleManualSubmit()
                  }
                }}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleManualSubmit} className="flex-1">
                Add Product
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setManualEntry(false)
                  setManualBarcode('')
                  if (permissionGranted) {
                    startScanning()
                  }
                }}
                className="flex-1"
              >
                Back to Camera
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-error-light border border-error-border text-error p-4 rounded-xl text-sm font-medium flex items-start gap-3">
            <span className="text-lg flex-shrink-0">❌</span>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}