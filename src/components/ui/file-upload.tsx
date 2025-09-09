
"use client";

import { X } from "lucide-react";
import * as React from "react";
import {
  DropzoneState,
  FileRejection,
  useDropzone,
  Accept,
} from "react-dropzone";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FileUploaderContextProps {
  dropzoneState: DropzoneState;
  isLOF: boolean;
  isFocused: boolean;
  isFileDialogActive: boolean;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  maxFiles: number;
  maxSize: number;
  onRemove: (index: number) => void;
  onUpload: () => void;
  disabled: boolean;
}

const FileUploaderContext =
  React.createContext<FileUploaderContextProps | null>(null);

const useFileUploader = () => {
  const context = React.useContext(FileUploaderContext);
  if (!context) {
    throw new Error("useFileUploader must be used within a FileUploader");
  }
  return context;
};

type FileUploaderProps = React.HTMLAttributes<HTMLDivElement> & {
  value: File[] | null;
  onValueChange: React.Dispatch<React.SetStateAction<File[] | null>>;
  dropzoneOptions: {
    maxFiles: number;
    maxSize: number;
    multiple: boolean;
    accept?: Accept;
  };
  disabled?: boolean;
};

const FileUploader = React.forwardRef<HTMLDivElement, FileUploaderProps>(
  (
    {
      className,
      children,
      value,
      onValueChange,
      dropzoneOptions,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [files, setFiles] = React.useState<File[]>(value || []);

    const onDrop = React.useCallback(
      (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        if (!dropzoneOptions.multiple && acceptedFiles.length > 1) {
          toast({
            title: "Cannot upload more than one file",
            variant: "destructive",
          });
          return;
        }

        if (acceptedFiles.length > 0) {
          const newFiles = [...files, ...acceptedFiles];
          setFiles(newFiles);
          onValueChange(newFiles);
        }

        if (rejectedFiles.length > 0) {
          rejectedFiles.forEach(({ errors }) => {
            errors.forEach((error) => {
              toast({
                title: error.message,
                variant: "destructive",
              });
            });
          });
        }
      },
      [files, dropzoneOptions.multiple, onValueChange]
    );

    const onRemove = (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      onValueChange(newFiles);
    };

    const onUpload = () => {
      // console.log("uploading", files);
    };

    const dropzoneState = useDropzone({
      onDrop,
      maxSize: dropzoneOptions.maxSize,
      maxFiles: dropzoneOptions.maxFiles,
      multiple: dropzoneOptions.multiple,
      accept: dropzoneOptions.accept,
      disabled,
    });

    const { isFocused, isFileDialogActive } = dropzoneState;
    const isLOF = files.length >= dropzoneOptions.maxFiles;

    React.useEffect(() => {
        if(value === null) {
            setFiles([]);
        }
    }, [value]);
    
    return (
      <FileUploaderContext.Provider
        value={{
          dropzoneState,
          isLOF,
          isFocused,
          isFileDialogActive,
          files,
          setFiles,
          maxFiles: dropzoneOptions.maxFiles,
          maxSize: dropzoneOptions.maxSize,
          onRemove,
          onUpload,
          disabled,
        }}
      >
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </FileUploaderContext.Provider>
    );
  }
);

FileUploader.displayName = "FileUploader";

const FileUploaderContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { files } = useFileUploader();
  return (
    <div ref={ref} className={cn("", className)} {...props}>
      {files.length > 0 && children}
    </div>
  );
});

FileUploaderContent.displayName = "FileUploaderContent";

const FileUploaderItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { index: number }
>(({ className, children, index, ...props }, ref) => {
  const { onRemove } = useFileUploader();
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-center justify-between w-full p-1 border rounded-md",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 w-full">{children}</div>
      <button
        type="button"
        className="p-0.5 rounded-md hover:bg-destructive"
        onClick={() => onRemove(index)}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
});

FileUploaderItem.displayName = "FileUploaderItem";

const FileInput = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { dropzoneState, isLOF, disabled } = useFileUploader();
  const { getRootProps, getInputProps } = dropzoneState;
  return (
    <div
      ref={ref}
      {...getRootProps()}
      className={cn(
        "w-full h-full",
        isLOF || disabled ? "cursor-not-allowed" : "cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
      <input {...getInputProps()} />
    </div>
  );
});

FileInput.displayName = "FileInput";

export { FileUploader, FileUploaderContent, FileUploaderItem, FileInput };
