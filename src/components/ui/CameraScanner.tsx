'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, X, SwitchCamera, Flashlight } from 'lucide-react'
import { toast } from 'sonner'

interface CameraScannerProps {
  onScan?: (result: string) => void
  onCapture?: (imageData: string) => void
  onClose?: () => void
  mode?: 'barcode' | 'photo'
  className?: string
}

export function CameraScanner({
  onScan,
  onCapture,
  onClose,
  mode = 'barcode',
  className = ''
}: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [hasCamera, setHasCamera] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      // Check if we have camera support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Camera not supported in this browser')
        return
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
        setIsActive(true)
        setHasCamera(true)
      }

      // If in barcode mode, start scanning
      if (mode === 'barcode' && onScan) {
        startBarcodeScanning()
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error('Unable to access camera. Please check permissions.')
      setHasCamera(false)
    }
  }, [facingMode, mode, onScan])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsActive(false)
  }, [stream])

  const switchCamera = useCallback(() => {
    setFacingMode(current => current === 'user' ? 'environment' : 'user')
    stopCamera()
    setTimeout(startCamera, 100)
  }, [startCamera, stopCamera])

  const toggleFlash = useCallback(async () => {
    if (!stream) return

    try {
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities()

      if ('torch' in capabilities) {
        await track.applyConstraints({
          advanced: [{ torch: !isFlashOn } as any]
        })
        setIsFlashOn(!isFlashOn)
      } else {
        toast.error('Flash not supported on this device')
      }
    } catch (error) {
      console.error('Error toggling flash:', error)
      toast.error('Unable to toggle flash')
    }
  }, [stream, isFlashOn])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !onCapture) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    onCapture(imageData)

    toast.success('Photo captured!')
  }, [onCapture])

  const startBarcodeScanning = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !onScan) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    const scanInterval = setInterval(() => {
      if (!video.videoWidth || !video.videoHeight) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Get image data for barcode scanning
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      // Mock barcode detection (in a real app, you'd use a library like QuaggaJS or ZXing)
      // For now, we'll simulate finding a barcode after a few seconds
      if (Math.random() > 0.95) { // 5% chance per scan
        const mockBarcode = '1234567890123' // Mock EAN-13 barcode
        onScan(mockBarcode)
        clearInterval(scanInterval)
      }
    }, 100) // Scan 10 times per second

    return () => clearInterval(scanInterval)
  }, [onScan])

  const handleClose = useCallback(() => {
    stopCamera()
    onClose?.()
  }, [stopCamera, onClose])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  if (!hasCamera && isActive === false) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <div className="space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Camera className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              {mode === 'barcode' ? 'Barcode Scanner' : 'Camera'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {mode === 'barcode' 
                ? 'Scan product barcodes to quickly add items to your inventory'
                : 'Take photos of your items for better organization'
              }
            </p>
            <Button onClick={startCamera} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Start {mode === 'barcode' ? 'Scanner' : 'Camera'}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative">
        {/* Video Stream */}
        <video
          ref={videoRef}
          className="w-full h-64 md:h-80 object-cover bg-black"
          playsInline
          muted
        />
        
        {/* Overlay for barcode scanning */}
        {mode === 'barcode' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-white rounded-lg w-64 h-32 bg-transparent opacity-50">
              <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-lg animate-pulse" />
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50">
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClose}
              className="bg-black/50 text-white hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleFlash}
                className="bg-black/50 text-white hover:bg-black/70"
              >
                <Flashlight className={`w-4 h-4 ${isFlashOn ? 'text-yellow-400' : ''}`} />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={switchCamera}
                className="bg-black/50 text-white hover:bg-black/70"
              >
                <SwitchCamera className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4">
            {mode === 'photo' && (
              <div className="flex justify-center">
                <Button
                  onClick={capturePhoto}
                  className="rounded-full w-16 h-16 bg-white hover:bg-gray-100"
                  variant="secondary"
                >
                  <Camera className="w-6 h-6 text-black" />
                </Button>
              </div>
            )}
            {mode === 'barcode' && (
              <div className="text-center">
                <p className="text-white text-sm mb-2">
                  Position the barcode within the frame
                </p>
                <div className="bg-black/50 rounded-lg px-3 py-2 text-white text-xs">
                  Scanning for barcodes...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>
    </Card>
  )
}

// Hook for camera permissions
export function useCameraPermissions() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const checkCameraSupport = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsSupported(false)
        return
      }

      setIsSupported(true)

      try {
        // Check existing permissions
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
        setHasPermission(permission.state === 'granted')

        permission.addEventListener('change', () => {
          setHasPermission(permission.state === 'granted')
        })
      } catch (error) {
        // Permissions API not supported, try to access camera directly
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          stream.getTracks().forEach(track => track.stop())
          setHasPermission(true)
        } catch (error) {
          setHasPermission(false)
        }
      }
    }

    checkCameraSupport()
  }, [])

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
      return true
    } catch (error) {
      setHasPermission(false)
      return false
    }
  }

  return {
    hasPermission,
    isSupported,
    requestPermission
  }
}