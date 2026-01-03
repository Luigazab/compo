import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Image as ImageIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  onPhotosChange?: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  className?: string;
  compact?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotosChange,
  maxFiles = 5,
  maxSizeMB = 10,
  accept = 'image/*',
  className,
  compact = false
}) => {
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newPhotos: { file: File; preview: string }[] = [];
    const maxSize = maxSizeMB * 1024 * 1024;

    Array.from(files).forEach(file => {
      if (photos.length + newPhotos.length >= maxFiles) return;
      if (file.size > maxSize) return;
      if (!file.type.startsWith('image/') && !accept.includes(file.type.split('/')[1])) return;

      newPhotos.push({
        file,
        preview: URL.createObjectURL(file)
      });
    });

    const updated = [...photos, ...newPhotos].slice(0, maxFiles);
    setPhotos(updated);
    onPhotosChange?.(updated.map(p => p.file));
  }, [photos, maxFiles, maxSizeMB, accept, onPhotosChange]);

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    URL.revokeObjectURL(photos[index].preview);
    setPhotos(updated);
    onPhotosChange?.(updated.map(p => p.file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Upload Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-xl transition-all cursor-pointer',
          compact ? 'p-4' : 'p-8',
          dragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50',
          'text-center'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <Camera className={cn('mx-auto text-muted-foreground mb-2', compact ? 'h-6 w-6' : 'h-8 w-8')} />
        <p className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>
          {dragOver ? 'Drop photos here' : 'Drag & drop photos or click to upload'}
        </p>
        {!compact && (
          <p className="text-xs text-muted-foreground mt-1">
            Up to {maxFiles} photos, max {maxSizeMB}MB each
          </p>
        )}
        <Button variant="secondary" size="sm" className="mt-3" type="button">
          Choose Files
        </Button>
      </div>

      {/* Preview Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={photo.preview}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(index);
                }}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Document-specific upload with single file and preview
interface DocumentUploadProps {
  onFileChange?: (file: File | null) => void;
  file?: File | null;
  accept?: string;
  className?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onFileChange,
  file,
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  className
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(file || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const selectedFile = files[0];
    setCurrentFile(selectedFile);
    
    if (selectedFile.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
    
    onFileChange?.(selectedFile);
  };

  const removeFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setCurrentFile(null);
    onFileChange?.(null);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {!currentFile ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={(e) => handleFile(e.target.files)}
            className="hidden"
          />
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, JPG, PNG, DOC up to 10MB
          </p>
        </div>
      ) : (
        <div className="border rounded-xl p-4 space-y-3">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-48 object-contain rounded-lg bg-muted"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{currentFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="flex-1"
              type="button"
            >
              Change File
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={removeFile}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={(e) => handleFile(e.target.files)}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
