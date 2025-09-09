
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
import { ScanFace, UserCheck, UserX, Loader2, UploadCloud, AlertCircle } from 'lucide-react';
import type { Student } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { recognizeFaces } from '@/ai/flows/recognize-faces';
import ExifReader from 'exifreader';
import { format } from 'date-fns';
import { FileUploader, FileUploaderContent, FileUploaderItem, FileInput } from '@/components/ui/file-upload';
import { Paperclip } from 'lucide-react';

const FileSvgDraw = () => {
  return (
    <>
      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mb-1 text-sm text-center text-muted-foreground">
        <span className="font-semibold">Click to upload</span>
        &nbsp; or drag and drop
      </p>
      <p className="text-xs text-center text-muted-foreground">A single JPG, PNG or WEBP file</p>
    </>
  );
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
  const [files, setFiles] = useState<File[] | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoCreationDate, setPhotoCreationDate] = useState<string | null>(null);
  
  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 4, // 4MB
    multiple: false,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    }
  };

  const resetState = () => {
    setScanning(false);
    setRecognizedCount(0);
    setUnrecognizedCount(0);
    setIsLoading(false);
    setFiles(null);
    setPreviewUrl(null);
    setPhotoCreationDate(null);
  }
  
  const handleFileChange = async (newFiles: File[] | null) => {
    if (newFiles && newFiles.length > 0) {
      const file = newFiles[0];
      resetState();
      setFiles(newFiles);

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
    } else {
      // Handle file removal
      resetState();
    }
  };

  const handleScanPhoto = async () => {
    if (!files || files.length === 0 || !previewUrl) {
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
            <FileUploader
              value={files}
              onValueChange={handleFileChange}
              dropzoneOptions={dropZoneConfig}
              className="relative bg-background rounded-lg p-2 border border-dashed border-muted-foreground/40 w-full"
            >
              <FileInput>
                <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full">
                  {previewUrl && files && files.length > 0 ? (
                     <img src={previewUrl} alt="Photo preview" className="h-32 w-auto object-contain rounded-md" />
                  ) : (
                    <FileSvgDraw />
                  )}
                </div>
              </FileInput>

              <FileUploaderContent>
                {files && files.length > 0 && (
                  <FileUploaderItem index={0} className="h-10 px-2">
                    <Paperclip className="h-4 w-4 stroke-current" />
                    <span className="text-sm font-medium text-ellipsis overflow-hidden">{files[0].name}</span>
                  </FileUploaderItem>
                )}
              </FileUploaderContent>
            </FileUploader>
          
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
              !files || files.length === 0
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
