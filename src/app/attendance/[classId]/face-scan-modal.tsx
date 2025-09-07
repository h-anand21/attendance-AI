
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScanFace, UserCheck, Users, StopCircle, CheckSquare } from 'lucide-react';
import type { Student } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { recognizeFaces } from '@/ai/flows/recognize-faces';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type FaceScanModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  students: Student[];
  onScanComplete: (recognizedStudentIds: string[]) => void;
};

export function FaceScanModal({
  isOpen,
  onOpenChange,
  students,
  onScanComplete,
}: FaceScanModalProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isScanningSession, setIsScanningSession] = useState(false);
  const [sessionRecognizedIds, setSessionRecognizedIds] = useState<Set<string>>(new Set());
  const [lastScanCount, setLastScanCount] = useState(0);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
  
  const resetState = useCallback(() => {
    if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
    }
    setIsScanningSession(false);
    setSessionRecognizedIds(new Set());
    setLastScanCount(0);
    setHasCameraPermission(undefined);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetState();

      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
            description: 'Please enable camera permissions in your browser settings to use this app.',
          });
        }
      };

      getCameraPermission();
    } else {
      // Turn off camera when modal is closed
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
       if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    }
  }, [isOpen, toast, resetState]);

  const captureFrame = (): string | null => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg');
      }
    }
    return null;
  };
  
  const performScan = async () => {
     const frame = captureFrame();
      if (!frame) {
        // Silently fail if frame can't be captured, loop will try again
        return;
      }

      try {
        const studentPhotos = students.map((s) => ({
          studentId: s.id,
          photoDataUri: s.avatar,
        }));

        const result = await recognizeFaces({
          scenePhotoDataUri: frame,
          studentPhotos,
        });

        const newIds = result.recognizedStudentIds;
        setLastScanCount(newIds.length);
        if(newIds.length > 0) {
            setSessionRecognizedIds(prevIds => {
                const updatedIds = new Set(prevIds);
                newIds.forEach(id => updatedIds.add(id));
                return updatedIds;
            });
        }
      } catch(error) {
          console.error("Single scan failed:", error);
          // Don't stop the session for a single failed scan
      }
  }

  const handleStartStopScan = () => {
    if(isScanningSession) {
        // Stop scanning
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        setIsScanningSession(false);
    } else {
        // Start scanning
        setSessionRecognizedIds(new Set());
        setLastScanCount(0);
        setIsScanningSession(true);
        
        // Perform initial scan immediately
        performScan();
        
        // Then set interval for subsequent scans
        scanIntervalRef.current = setInterval(performScan, 5000); // Scan every 5 seconds
    }
  };

  const handleDone = () => {
    onScanComplete(Array.from(sessionRecognizedIds));
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Face Scan Session</DialogTitle>
          <DialogDescription>
            Start a session to continuously scan for students. The system will keep recognizing faces until you stop.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="relative h-48 w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              className="w-full aspect-video rounded-md"
              autoPlay
              muted
              playsInline
            />
            {hasCameraPermission === undefined && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            {isScanningSession && <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 text-white p-2 rounded-md"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Scanning...</span></div>}
          </div>
          
          {hasCameraPermission === false && (
            <Alert variant="destructive">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access to use this feature.
              </AlertDescription>
            </Alert>
          )}

          <div className="w-full space-y-2 text-center">
             <div className="text-5xl font-bold">{sessionRecognizedIds.size}</div>
             <p className="text-muted-foreground">Total unique students recognized in this session.</p>
              {isScanningSession && (
                <Badge variant="secondary">Recognized {lastScanCount} in last scan</Badge>
              )}
          </div>
        </div>

        <DialogFooter className="grid grid-cols-2 gap-2">
           <Button
            className="w-full"
            onClick={handleStartStopScan}
            disabled={hasCameraPermission === false || hasCameraPermission === undefined}
            variant={isScanningSession ? 'destructive' : 'default'}
          >
            {isScanningSession ? (
                <><StopCircle className="mr-2 h-4 w-4" /> Stop Session</>
            ) : (
                <><ScanFace className="mr-2 h-4 w-4" /> Start Session</>
            )}
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={handleDone}
            disabled={isScanningSession}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Apply and Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
