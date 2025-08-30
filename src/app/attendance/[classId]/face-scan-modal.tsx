'use client';

import { useState, useEffect } from 'react';
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
  const [isScanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recognizedCount, setRecognizedCount] = useState(0);
  const [unrecognizedCount, setUnrecognizedCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setScanning(false);
      setProgress(0);
      setRecognizedCount(0);
      setUnrecognizedCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isScanning && progress < 100) {
      timer = setTimeout(() => {
        setProgress((prev) => prev + 2);
      }, 80);
    } else if (isScanning && progress >= 100) {
      setScanning(false);
      const recognized: string[] = [];
      students.forEach((student) => {
        if (Math.random() > 0.3) {
          recognized.push(student.id);
        }
      });
      setRecognizedCount(recognized.length);
      setUnrecognizedCount(students.length - recognized.length);

      setTimeout(() => {
        onScanComplete(recognized);
        onOpenChange(false);
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [isScanning, progress, onScanComplete, students, onOpenChange]);

  const handleStartScan = () => {
    setScanning(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Face Scan Attendance</DialogTitle>
          <DialogDescription>
            The camera will activate to scan students' faces. Please ensure good
            lighting.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          {isScanning || progress > 0 ? (
            <div className="w-full space-y-4">
              <div className="relative h-48 w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                <ScanFace className="h-24 w-24 text-muted-foreground/50" />
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 animate-scan-line"></div>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Scanning... {progress}%</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <UserCheck className="h-4 w-4 text-primary" />{' '}
                    {recognizedCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserX className="h-4 w-4 text-destructive" />{' '}
                    {unrecognizedCount}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <ScanFace className="mx-auto h-24 w-24 text-muted-foreground" />
              <p>Ready to start scanning.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {progress === 0 && !isScanning && (
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleStartScan}
            >
              Start Scanning
            </Button>
          )}
          {isScanning && (
            <Button className="w-full" disabled>
              Scanning in progress...
            </Button>
          )}
          {progress >= 100 && !isScanning && (
            <Button className="w-full" disabled>
              Finalizing...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
