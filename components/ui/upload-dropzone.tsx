import { cn } from '@/lib/utils';
import { Loader2, Upload } from 'lucide-react';
import { useId, useState } from 'react';
import { useDropzone } from 'react-dropzone';

type UploadDropzoneProps = {
  id?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  description?:
    | {
        fileTypes?: string;
        maxFileSize?: string;
        maxFiles?: number;
      }
    | string;
  onFileSelected?: (files: File[]) => void;
};

export function UploadDropzone({
  id: _id,
  accept,
  multiple = false,
  maxFiles = 1,
  description,
  onFileSelected,
}: UploadDropzoneProps) {
  const id = useId();
  const [isPending, setIsPending] = useState(false);

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: (files) => {
      if (files.length > 0 && !isPending) {
        const filesToUpload = maxFiles ? files.slice(0, maxFiles) : files;
        if (onFileSelected) {
          onFileSelected(filesToUpload);
        }
      }
      inputRef.current.value = '';
    },
    multiple,
    maxFiles,
    noClick: true,
  });

  return (
    <div
      className={cn(
        'border-input text-foreground relative rounded-lg border border-dashed transition-colors',
        {
          'border-primary/80': isDragActive,
        }
      )}
    >
      <label
        {...getRootProps()}
        className={cn(
          'dark:bg-input/10 flex w-full min-w-72 cursor-pointer flex-col items-center justify-center rounded-lg bg-transparent px-2 py-6 transition-colors',
          {
            'text-muted-foreground cursor-not-allowed': isPending,
            'hover:bg-accent dark:hover:bg-accent/40': !isPending,
            'opacity-0': isDragActive,
          }
        )}
        htmlFor={_id || id}
      >
        <div className="my-2">
          {isPending ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <Upload className="size-6" />
          )}
        </div>

        <div className="mt-3 space-y-1 text-center">
          <p className="text-sm font-semibold">Arrastra y suelta archivos aquí</p>

          <p className="text-muted-foreground max-w-64 text-xs">
            {typeof description === 'string' ? (
              description
            ) : (
              <>
                {description?.maxFiles &&
                  `Puedes subir ${description.maxFiles} archivo${description.maxFiles !== 1 ? 's' : ''}.`}{' '}
                {description?.maxFileSize &&
                  `${description.maxFiles !== 1 ? 'Cada uno hasta' : 'Hasta'} ${description.maxFileSize}.`}{' '}
                {description?.fileTypes && `Acepta ${description.fileTypes}.`}
              </>
            )}
          </p>
        </div>

        <input
          {...getInputProps()}
          type="file"
          multiple={multiple}
          id={_id || id}
          accept={accept}
          disabled={isPending}
        />
      </label>

      {isDragActive && (
        <div className="pointer-events-none absolute inset-0 rounded-lg">
          <div className="dark:bg-accent/40 bg-accent flex size-full flex-col items-center justify-center rounded-lg">
            <div className="my-2">
              <Upload className="size-6" />
            </div>

            <p className="mt-3 text-sm font-semibold">Drop files here</p>
          </div>
        </div>
      )}
    </div>
  );
}
