import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Eye, FileText, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface UploadedFile {
  file: File;
  preview: string;
  id: string;
}

interface FileUploadWithPreviewProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
  label?: string;
}

const FileUploadWithPreview: React.FC<FileUploadWithPreviewProps> = ({
  files,
  onFilesChange,
  maxFiles = 5,
  acceptedTypes = "image/*,.pdf",
  label = "Upload Documents"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (file.type.startsWith('image/')) return true;
      if (file.type === 'application/pdf') return true;
      return false;
    });

    if (validFiles.length === 0) return;

    const remainingSlots = maxFiles - files.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    const newUploadedFiles: UploadedFile[] = filesToAdd.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      id: Math.random().toString(36).substr(2, 9)
    }));

    onFilesChange([...files, ...newUploadedFiles]);
  };

  const removeFile = (id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove && fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    onFilesChange(files.filter(f => f.id !== id));
  };

  const openPreview = (file: UploadedFile) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4 text-blue-600" />;
    }
    return <FileText className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      
      {/* Upload Area - Compact */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
          disabled={files.length >= maxFiles}
        />
        
        <div className="flex items-center justify-center space-x-2">
          <Upload className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600 font-medium">
              {files.length >= maxFiles ? 'Maximum files reached' : 'Click or drag files here'}
            </p>
            <p className="text-xs text-gray-500">
              Images, PDF • Max {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {/* File List - Compact */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-green-100 rounded">
              <FileText className="h-3 w-3 text-green-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">
              Uploaded Files ({files.length}/{maxFiles})
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {files.map((uploadedFile) => (
              <div key={uploadedFile.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getFileIcon(uploadedFile.file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {uploadedFile.file.type.startsWith('image/') && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openPreview(uploadedFile)}
                      className="h-6 w-6 p-0 hover:bg-blue-100"
                    >
                      <Eye className="h-3 w-3 text-blue-600" />
                    </Button>
                  )}
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.id)}
                    className="h-6 w-6 p-0 hover:bg-red-100"
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {previewFile?.file.name}
            </DialogTitle>
          </DialogHeader>
          
          {previewFile && (
            <div className="flex justify-center">
              <img
                src={previewFile.preview}
                alt={previewFile.file.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUploadWithPreview;
