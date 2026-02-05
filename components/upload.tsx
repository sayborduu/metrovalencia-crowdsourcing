'use client';

import { useRef } from 'react';
import { UploadDropzone } from '@/components/ui/upload-dropzone';

export function Uploader({
  onFile,
}: {
  onFile?: (files: File[]) => void;
}) {
  const handleUploadOverride = (files: File[]) => {
    if (files.length > 0 && onFile) {
      onFile(files);
    }
  };

  return (
    <UploadDropzone
      onFileSelected={handleUploadOverride}
      accept="image/*"
      multiple
      maxFiles={5}
      description={{
        maxFiles: 5,
        maxFileSize: '5MB',
      }}
    />
  );
}