'use client';
import React from 'react';

type ResultsPageProps = {
  originalUrl: string;
  resultUrl: string;
  onBack?: () => void;
};

function ResultsPage({ originalUrl, resultUrl, onBack }: ResultsPageProps) {
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

      // Flip the canvas context horizontally
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);

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

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Results</h2>
        {onBack && (
          <button
            onClick={onBack}
            className="text-sm px-3 py-2 rounded-md border border-muted-foreground/30 hover:bg-muted"
          >
            Back
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-xl p-4 bg-muted/30">
          <p className="text-sm font-medium mb-2">Original</p>
          <img
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
          <img
            src={resultUrl}
            alt="Processed image"
            className="w-full h-auto rounded-lg object-contain transform scale-x-[-1]"
          />
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
