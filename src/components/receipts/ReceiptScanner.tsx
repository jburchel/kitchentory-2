'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Camera, 
  Upload, 
  Scan, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  FileImage,
  Trash2,
  Save,
  ShoppingCart,
  Receipt as ReceiptIcon,
  Zap,
  Eye,
  X
} from 'lucide-react'
import { ReceiptOCRService, ReceiptOCRResult, ParsedReceipt, OCRProvider } from '@/services/ReceiptOCRService'
import { toast } from 'sonner'

export interface ReceiptScannerProps {
  householdId: string
  onItemsAdded?: (items: any[]) => void
  onReceiptProcessed?: (receipt: ParsedReceipt) => void
}

export function ReceiptScanner({ 
  householdId, 
  onItemsAdded, 
  onReceiptProcessed 
}: ReceiptScannerProps) {
  const [ocrService] = useState(() => new ReceiptOCRService())
  const [supportedProviders, setSupportedProviders] = useState<OCRProvider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingResult, setProcessingResult] = useState<ReceiptOCRResult | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showResults, setShowResults] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  React.useEffect(() => {
    const providers = ocrService.getSupportedProviders()
    setSupportedProviders(providers)
    if (providers.length > 0) {
      setSelectedProvider(providers[0].id)
    }
  }, [ocrService])

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setShowCamera(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error('Unable to access camera. Please check permissions.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(imageDataUrl)
        setShowPreview(true)
        stopCamera()
      }
    }
  }, [stopCamera])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!ocrService.validateImage(file)) {
      toast.error('Invalid image file. Please select a JPEG, PNG, or GIF image under 10MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string
      setCapturedImage(imageDataUrl)
      setShowPreview(true)
    }
    reader.readAsDataURL(file)
  }, [ocrService])

  const processReceipt = useCallback(async () => {
    if (!capturedImage) {
      toast.error('No image to process')
      return
    }

    setIsProcessing(true)
    setShowPreview(false)
    
    try {
      const result = await ocrService.processReceipt({
        image: capturedImage,
        imageFormat: 'base64',
        provider: selectedProvider,
        enhanceAccuracy: true
      })

      setProcessingResult(result)
      setShowResults(true)

      if (result.success && result.receipt) {
        toast.success(`Receipt processed successfully! Found ${result.receipt.items.length} items.`)
        onReceiptProcessed?.(result.receipt)
      } else {
        toast.error(`Processing failed: ${result.error?.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Receipt processing error:', error)
      toast.error('Failed to process receipt')
    } finally {
      setIsProcessing(false)
    }
  }, [capturedImage, selectedProvider, ocrService, onReceiptProcessed])

  const addToInventory = useCallback(async () => {
    if (!processingResult?.receipt) return

    try {
      const inventoryItems = await ocrService.convertToInventoryItems(processingResult.receipt)
      onItemsAdded?.(inventoryItems)
      toast.success(`Added ${inventoryItems.length} items to inventory`)
      
      // Reset state
      setCapturedImage(null)
      setProcessingResult(null)
      setShowResults(false)
    } catch (error) {
      console.error('Error adding items to inventory:', error)
      toast.error('Failed to add items to inventory')
    }
  }, [processingResult, ocrService, onItemsAdded])

  const resetScanner = useCallback(() => {
    setCapturedImage(null)
    setProcessingResult(null)
    setShowPreview(false)
    setShowResults(false)
    setIsProcessing(false)
    stopCamera()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [stopCamera])

  const getStatusColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusIcon = (confidence: number) => {
    if (confidence >= 90) return <CheckCircle2 className="w-4 h-4" />
    if (confidence >= 70) return <AlertCircle className="w-4 h-4" />
    return <AlertCircle className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ReceiptIcon className="w-6 h-6 text-blue-600" />
            Receipt Scanner
          </h2>
          <p className="text-muted-foreground">
            Scan receipts to automatically add items to your inventory
          </p>
        </div>
      </div>

      {/* OCR Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            OCR Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supportedProviders.map((provider) => (
              <div 
                key={provider.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedProvider === provider.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedProvider(provider.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{provider.displayName}</p>
                  <Badge variant="outline">{provider.accuracy}% accuracy</Badge>
                </div>
                {provider.hasFreeLimit && (
                  <p className="text-xs text-muted-foreground">
                    Free limit: {provider.freeLimit} per month
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scan Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={startCamera}
              disabled={isProcessing}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={isProcessing}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
            
            {capturedImage && (
              <Button 
                onClick={() => setShowPreview(true)}
                variant="outline"
                disabled={isProcessing}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Processing Status */}
      {isProcessing && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <div>
                <p className="font-medium">Processing Receipt...</p>
                <p className="text-sm text-muted-foreground">
                  Using {supportedProviders.find(p => p.id === selectedProvider)?.displayName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {processingResult && !isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Processing Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${getStatusColor(processingResult.confidence)}`}>
                {getStatusIcon(processingResult.confidence)}
                <span className="font-medium">
                  {processingResult.confidence}% confidence
                </span>
              </div>
              <Badge variant="outline">
                {processingResult.processingTime}ms
              </Badge>
            </div>

            {processingResult.success && processingResult.receipt ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Store</p>
                    <p className="text-muted-foreground">{processingResult.receipt.merchant.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total</p>
                    <p className="text-muted-foreground">
                      ${processingResult.receipt.totals.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">
                    Items Found ({processingResult.receipt.items.length})
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {processingResult.receipt.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} • Category: {item.category}
                          </p>
                        </div>
                        <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addToInventory} className="flex-1">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Inventory
                  </Button>
                  <Button onClick={() => setShowResults(true)} variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="font-medium text-red-600">Processing Failed</p>
                <p className="text-sm text-muted-foreground">
                  {processingResult.error?.message || 'Unknown error'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reset Actions */}
      {(capturedImage || processingResult) && !isProcessing && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button onClick={resetScanner} variant="outline" className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear & Scan New
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Camera Dialog */}
      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Camera</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={capturePhoto} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
              <Button onClick={stopCamera} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {capturedImage && (
              <div className="relative">
                <img 
                  src={capturedImage} 
                  alt="Receipt preview" 
                  className="w-full rounded-lg max-h-96 object-contain"
                />
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={processReceipt} disabled={isProcessing} className="flex-1">
                <Scan className="w-4 h-4 mr-2" />
                Process Receipt
              </Button>
              <Button onClick={() => setShowPreview(false)} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}