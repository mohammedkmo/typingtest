'use client';

import { UploadButton } from "@/utils/uploadthing";
import { useState } from "react";

interface CustomUploadButtonProps {
  endpoint: "imageUploader" | "profilePicture"; // Add your endpoints here
  onClientUploadComplete?: (res: any) => void;
  onUploadError?: (error: Error) => void;
}

export function CustomUploadButton({
  endpoint,
  onClientUploadComplete,
  onUploadError
}: CustomUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <UploadButton
      endpoint={endpoint as any}
      onClientUploadComplete={(res) => {
        setIsUploading(false);
        if (onClientUploadComplete) onClientUploadComplete(res);
      }}
      onUploadBegin={() => {
        setIsUploading(true);
      }}
      onUploadError={(error) => {
        setIsUploading(false);
        if (onUploadError) onUploadError(error);
      }}
      appearance={{
        button: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 transition-colors",
        allowedContent: "text-muted-foreground text-xs mt-1",
        container: "w-full flex flex-col items-center gap-1",
      }}
      content={{
        button({ ready }) {
          if (ready) return "Upload File";
          return "Getting ready...";
        },
        allowedContent({ ready, isUploading }) {
          if (!ready) return "Initializing...";
          if (isUploading) return "Uploading...";
          return "Images up to 4MB";
        },
      }}
    />
  );
}