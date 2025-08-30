'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScanFace, UserCheck, UserX } from 'lucide-react';
import type { Student } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { recognizeFaces } from '@/ai/flows/recognize-faces';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

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
  const [isScanning, setScanning] = useState(false);
  const [recognizedCount, setRecognizedCount] = useState(0);
  const [unrecognizedCount, setUnrecognizedCount] = useState(0);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setScanning(false);
      setRecognizedCount(0);
      setUnrecognizedCount(0);
      setHasCameraPermission(undefined);

      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
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
              'Please enable camera permissions in your browser settings to use this app.',
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
    }
  }, [isOpen, toast]);

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

  const handleStartScan = async () => {
    setScanning(true);
    setIsLoading(true);
    const frame = captureFrame();

    if (!frame) {
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: 'Could not capture a frame from the camera.',
      });
      setScanning(false);
      setIsLoading(false);
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

      const recognizedIds = result.recognizedStudentIds;
      setRecognizedCount(recognizedIds.length);
      setUnrecognizedCount(students.length - recognizedIds.length);

      setTimeout(() => {
        onScanComplete(recognizedIds);
        onOpenChange(false);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Face recognition error:', error);
      toast({
        variant: 'destructive',
        title: 'Recognition Failed',
        description: 'An error occurred during face recognition.',
      });
      setScanning(false);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Face Scan Attendance</DialogTitle>
          <DialogDescription>
            Position students in front of the camera and press start.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-8">
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
          </div>
          {hasCameraPermission === false && (
            <Alert variant="destructive">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access to use this feature.
              </AlertDescription>
            </Alert>
          )}

          {isScanning && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <UserCheck className="h-4 w-4 text-primary" />{' '}
                    {recognizedCount} Recognized
                  </span>
                  <span className="flex items-center gap-1">
                    <UserX className="h-4 w-4 text-destructive" />{' '}
                    {unrecognizedCount} Unrecognized
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleStartScan}
            disabled={
              isLoading ||
              isScanning ||
              hasCameraPermission === false ||
              hasCameraPermission === undefined
            }
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ScanFace className="mr-2 h-4 w-4" />
            )}
            {isLoading
              ? 'Scanning...'
              : isScanning
              ? 'Scan Complete'
              : 'Start Scan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
