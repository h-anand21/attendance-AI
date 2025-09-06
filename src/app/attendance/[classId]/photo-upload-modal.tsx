
'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScanFace, UserCheck, UserX, Loader2, UploadCloud } from 'lucide-react';
import type { Student } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { recognizeFaces } from '@/ai/flows/recognize-faces';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type PhotoUploadModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  students: Student[];
  onScanComplete: (recognizedStudentIds: string[]) => void;
};

export function PhotoUploadModal({
  isOpen,
  onOpenChange,
  students,
  onScanComplete,
}: PhotoUploadModalProps) {
  const { toast } = useToast();
  const [isScanning, setScanning] = useState(false);
  const [recognizedCount, setRecognizedCount] = useState(0);
  const [unrecognizedCount, setUnrecognizedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setScanning(false);
    setRecognizedCount(0);
    setUnrecognizedCount(0);
    setIsLoading(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanPhoto = async () => {
    if (!selectedFile || !previewUrl) {
      toast({
        variant: 'destructive',
        title: 'No Photo Selected',
        description: 'Please select a photo to scan.',
      });
      return;
    }

    setScanning(true);
    setIsLoading(true);

    try {
      const studentPhotos = students.map((s) => ({
        studentId: s.id,
        photoDataUri: s.avatar,
      }));

      const result = await recognizeFaces({
        scenePhotoDataUri: previewUrl,
        studentPhotos,
      });

      const recognizedIds = result.recognizedStudentIds;
      setRecognizedCount(recognizedIds.length);
      setUnrecognizedCount(students.length - recognizedIds.length);

      setTimeout(() => {
        onScanComplete(recognizedIds);
        onOpenChange(false);
        resetState();
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
  
  const handleModalOpenChange = (open: boolean) => {
    if(!open) {
      resetState();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Photo for Attendance</DialogTitle>
          <DialogDescription>
            Select a group photo to automatically take attendance.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="relative h-48 w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img src={previewUrl} alt="Photo preview" className="h-full w-full object-contain" />
            ) : (
              <div className="text-center text-muted-foreground p-4">
                <UploadCloud className="mx-auto h-12 w-12" />
                <p className="mt-2 text-sm">Upload a photo to get started.</p>
              </div>
            )}
          </div>
          
           <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">Picture</Label>
              <Input id="picture" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} ref={fileInputRef} />
            </div>

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
            className="w-full"
            onClick={handleScanPhoto}
            disabled={
              isLoading ||
              isScanning ||
              !selectedFile
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
              : 'Scan Photo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
