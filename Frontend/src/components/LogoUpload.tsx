import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LogoUploadProps {
  onLogoSelect: (file: File | null) => void;
  currentLogo?: string | null;
  disabled?: boolean;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ onLogoSelect, currentLogo, disabled = false }) => {
  const [preview, setPreview] = useState<string | null>(currentLogo || null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    onLogoSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const removeLogo = () => {
    setPreview(null);
    setError(null);
    onLogoSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Company Logo</h3>
        <p className="text-sm text-muted-foreground">Upload your company logo (optional)</p>
      </div>

      <Card className={`border-2 border-dashed transition-all duration-300 ${
        dragActive 
          ? 'border-primary bg-primary/5' 
          : preview 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-300 hover:border-primary/50'
      }`}>
        <CardContent className="p-6">
          <div
            className={`relative min-h-[200px] flex flex-col items-center justify-center space-y-4 ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              disabled={disabled}
            />

            {preview ? (
              <div className="relative group">
                <img
                  src={preview}
                  alt="Logo preview"
                  className="max-h-32 max-w-48 object-contain rounded-lg shadow-md"
                />
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLogo();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                  dragActive ? 'bg-primary/10' : 'bg-gray-100'
                }`}>
                  {dragActive ? (
                    <Upload className="w-8 h-8 text-primary" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {dragActive ? 'Drop your logo here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {preview && !error && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">Logo ready for upload</span>
        </div>
      )}
    </div>
  );
};

export default LogoUpload;
