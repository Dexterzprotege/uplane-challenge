'use client'

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoaderThree } from '@/components/ui/loader';
import ResultsPage from './Results';

const allowedTypes = ['image/png', 'image/jpeg'];
const MAX_FILE_SIZE_MB = 8;

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image_file", file);

  const res = await fetch("/api/remove-bg", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to remove background");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  return url;
}

export default function ImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result);
    }
  }, [result]);

  const validateAndSetFile = (selected: File | undefined | null) => {
    if (!selected) return;

    if (!allowedTypes.includes(selected.type)) {
      setFile(null);
      setPreviewUrl(null);
      setError('Only PNG or JPG images are allowed.');
      setSuccess(false);
      setResult("");
      return;
    }

    const sizeMb = selected.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_SIZE_MB) {
      setFile(null);
      setPreviewUrl(null);
      setError(`Image must be <= ${MAX_FILE_SIZE_MB}MB.`);
      setSuccess(false);
      setResult("");
      return;
    }

    const url = URL.createObjectURL(selected);
    setFile(selected);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setError(null);
    setSuccess(false);
    setResult("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    validateAndSetFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const processedUrl = await uploadImage(file);
      setResult(processedUrl);
      setSuccess(true);
      setError(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Something went wrong. Please try again.');
      setSuccess(false);
      setResult("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSetFile(droppedFile);
  };

  return isLoading ? (
    <div className="fixed inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <LoaderThree />
    </div>
  ) : result ? (
    <ResultsPage
      originalUrl={previewUrl ?? ''}
      resultUrl={result}
      onBack={() => {
        setResult('');
        setSuccess(false);
      }}
    />
  ) : (
    <Card className="max-w-lg mx-auto mt-20 shadow-2xl border border-muted rounded-3xl bg-white dark:bg-zinc-900">
      <CardContent className="p-8 space-y-6">
        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Upload an Image</h2>
          <p className="text-sm text-muted-foreground">PNG or JPG formats only</p>
        </div>

        <div
          className={cn(
            'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/30 px-6 py-10 transition-all hover:bg-muted/50 cursor-pointer',
            error ? 'border-red-500' : 'border-muted-foreground'
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {previewUrl ? (
            <div className="w-full flex flex-col items-center gap-3">
              <img
                src={previewUrl}
                alt={file?.name || 'Selected image'}
                className="max-h-64 rounded-lg object-contain border border-muted"
              />
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <ImageIcon className="w-4 h-4" />
                <span className="truncate max-w-[80%]">{file?.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">Click or drop another image to replace</p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground animate-pulse" />
              <p className="text-sm text-muted-foreground">
                Click or drag to upload your image
              </p>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {success && (
          <p className="text-sm text-green-600 text-center">
            Image uploaded successfully!
          </p>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || isLoading}
          className="w-full font-semibold text-base"
        >
          {isLoading ? 'Processing...' : 'Process Image'}
        </Button>
      </CardContent>
    </Card>
  );
}