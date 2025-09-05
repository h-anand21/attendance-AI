
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type QrScanModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onScan: (studentId: string) => void;
};

export function QrScanModal({
  isOpen,
  onOpenChange,
  onScan,
}: QrScanModalProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | undefined
  >(undefined);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
        canvasRef.current
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data !== scannedCode) {
            setScannedCode(code.data);
            onScan(code.data);
            // Vibrate for feedback if supported
            if (navigator.vibrate) {
              navigator.vibrate(200);
            }
          }
        }
      }
      if (isScanning) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    if (isOpen) {
      setHasCameraPermission(undefined);
      setScannedCode(null);
      setIsScanning(true);

      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description:
              'Please enable camera permissions in your browser settings.',
          });
        }
      };

      getCameraPermission();
    } else {
      setIsScanning(false);
      stopCamera();
    }

    if (isScanning) {
       animationFrameId = requestAnimationFrame(tick);
    }
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (isScanning) {
         setIsScanning(false);
      }
      stopCamera();
    };
  }, [isOpen, isScanning, onScan, stopCamera, toast, scannedCode]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scan Student QR Code</DialogTitle>
          <DialogDescription>
            Point the camera at a student's QR code to mark them as present.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-64 w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            muted
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {hasCameraPermission === undefined && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {hasCameraPermission === true && (
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-64 h-64 border-4 border-dashed border-primary/50 rounded-lg" />
            </div>
          )}
        </div>

        {hasCameraPermission === false && (
          <Alert variant="destructive">
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
              Please allow camera access to use this feature.
            </AlertDescription>
          </Alert>
        )}
        
        <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                Done
            </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
