'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type ResultsPageProps = {
  originalUrl: string;
  resultUrl: string;
  onBack?: () => void;
};

function ResultsPage({ originalUrl, resultUrl, onBack }: ResultsPageProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDownload = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = resultUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Trigger download
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'result-flipped.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.onerror = () => {
      // Fallback to direct download if canvas method fails
      const link = document.createElement('a');
      link.href = resultUrl;
      link.download = 'result.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(
        `/api/delete?url=${encodeURIComponent(resultUrl)}`,
        {
          method: 'DELETE'
        }
      );
      if (!res.ok) {
        throw new Error(await res.text());
      }
      if (onBack) onBack(); // return to upload page
    } catch (err) {
      console.error('Delete error:', err);
      setDeleteError('Failed to delete image. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Results</h2>
        <div className="flex gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="text-sm px-3 py-2 rounded-md border border-muted-foreground/30 hover:bg-muted"
            >
              Back
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-sm px-3 py-2 rounded-md border border-red-500/40 text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {deleteError && (
        <p className="text-sm text-red-500 mb-4">{deleteError}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-xl p-4 bg-muted/30">
          <p className="text-sm font-medium mb-2">Original</p>
          <Image
            src={originalUrl}
            alt="Original upload"
            className="w-full h-auto rounded-lg object-contain"
          />
        </div>

        <div className="border rounded-xl p-4 bg-muted/30">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Result</p>
            <button
              onClick={handleDownload}
              className="text-sm px-3 py-1 rounded-md border border-muted-foreground/30 hover:bg-muted"
            >
              Download
            </button>
          </div>
          <Image
            src={resultUrl}
            alt="Processed image"
            className="w-full h-auto rounded-lg object-contain transform"
          />
          <p className="mt-2 text-xs text-gray-500 break-all">
            Hosted at:{' '}
            
            <Link
              href={resultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {resultUrl}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
