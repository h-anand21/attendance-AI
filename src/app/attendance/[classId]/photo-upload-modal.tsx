
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
import { ScanFace, UserCheck, UserX, Loader2, UploadCloud, AlertCircle } from 'lucide-react';
import type { Student } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { recognizeFaces } from '@/ai/flows/recognize-faces';
import ExifReader from 'exifreader';
import { format } from 'date-fns';

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
  const [photoCreationDate, setPhotoCreationDate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setScanning(false);
    setRecognizedCount(0);
    setUnrecognizedCount(0);
    setIsLoading(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setPhotoCreationDate(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      resetState(); // Reset previous state
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Extract EXIF data
      try {
        const tags = await ExifReader.load(file);
        const dateTimeOriginal = tags['DateTimeOriginal']?.description;
        if (dateTimeOriginal) {
          // EXIF format is 'YYYY:MM:DD HH:MM:SS', convert to ISO 'YYYY-MM-DDTHH:MM:SS'
          const [datePart, timePart] = dateTimeOriginal.split(' ');
          const isoDateTime = `${datePart.replace(/:/g, '-')}T${timePart}`;
          setPhotoCreationDate(isoDateTime);
        } else {
           setPhotoCreationDate(null); // No EXIF date found
           toast({
             variant: 'default',
             title: 'No Date Metadata Found',
             description: "Couldn't verify photo date. Proceeding without validation.",
           });
        }
      } catch (error) {
        console.error("Could not read EXIF data:", error);
        setPhotoCreationDate(null);
      }
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

    setIsLoading(true);

    try {
      const studentPhotos = students.map((s) => ({
        studentId: s.id,
        photoDataUri: s.avatar,
      }));

      const result = await recognizeFaces({
        scenePhotoDataUri: previewUrl,
        studentPhotos,
        photoCreationDate: photoCreationDate || undefined,
      });
      
      setScanning(true);
      const recognizedIds = result.recognizedStudentIds;
      setRecognizedCount(recognizedIds.length);
      setUnrecognizedCount(students.length - recognizedIds.length);
      
      onScanComplete(recognizedIds);
      toast({
        title: 'Scan Successful',
        description: `${recognizedIds.length} student(s) marked as present.`,
      });

      // Close modal after a short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);

    } catch (error: any) {
      console.error('Face recognition error:', error);
      toast({
        variant: 'destructive',
        title: 'Recognition Failed',
        description: error.message || 'An error occurred during face recognition.',
      });
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
            Select a group photo to automatically take attendance. The photo must have been taken today.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-4">
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
              <Label htmlFor="picture">Class Photo</Label>
              <Input id="picture" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} ref={fileInputRef} />
            </div>
          
          {photoCreationDate && (
             <div className="text-xs text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-3 w-3" />
                Photo taken on: {format(new Date(photoCreationDate), 'MMM dd, yyyy, hh:mm a')}
             </div>
          )}

          {isScanning && (
            <div className="w-full space-y-2 pt-4">
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
              ? 'Validating & Scanning...'
              : isScanning
              ? 'Scan Complete'
              : 'Scan Photo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
