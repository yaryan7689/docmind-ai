import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newDoc: any) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMsg('');
    const validExtensions = ['.pdf', '.docx', '.doc', '.csv', '.txt', '.md'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setErrorMsg('Unsupported file type. Please upload PDF, DOCX, CSV, TXT, or Markdown.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds 25MB limit.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMsg('');
    try {
      const res = await api.uploadDocument(selectedFile);
      onUploadSuccess(res);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed. Please check server logs.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isUploading}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            <span>Upload Document</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Ingest PDFs, Word files, spreadsheets, or text files for instant multimodal indexing.
          </p>
        </div>

        {/* Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-500 bg-indigo-950/30 scale-[0.99]'
              : 'border-slate-700/80 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-600'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.csv,.txt,.md"
            onChange={handleChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-200">
            Click to browse or drag and drop
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            PDF, DOCX, CSV, TXT, MD up to 25MB
          </p>
        </div>

        {/* Selected file preview */}
        {selectedFile && (
          <div className="mt-4 p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5 truncate">
              <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <div className="truncate text-xs">
                <p className="font-semibold text-slate-200 truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-slate-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-slate-400 hover:text-rose-400 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mt-3 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ingesting & Indexing...</span>
              </>
            ) : (
              <span>Start Ingestion</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
