import { UploadCloud, FileText, Image, Video, X } from 'lucide-react';

const ACCEPTED_TYPES = {
  'image/jpeg': { icon: Image, label: 'JPG' },
  'image/png': { icon: Image, label: 'PNG' },
  'video/mp4': { icon: Video, label: 'MP4' },
  'application/pdf': { icon: FileText, label: 'PDF' },
};

export function FileUpload({
  files = [],
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 10,
  accept = 'image/jpeg,image/png,video/mp4,application/pdf',
  label = 'Upload evidence',
  hint = 'JPG, PNG, MP4, or PDF. Max 10MB per file.',
}) {
  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    const valid = selected.filter((f) => {
      const typeOk = Object.keys(ACCEPTED_TYPES).includes(f.type);
      const sizeOk = f.size <= maxSizeMB * 1024 * 1024;
      return typeOk && sizeOk;
    });
    const combined = [...files, ...valid].slice(0, maxFiles);
    onFilesChange(combined);
    e.target.value = '';
  };

  const removeFile = (idx) => {
    onFilesChange(files.filter((_, i) => i !== idx));
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
          {label}
        </label>
      )}
      <label
        className="flex flex-col items-center justify-center gap-2 py-6 px-4 border-2 border-dashed border-civic-border rounded-lg cursor-pointer hover:border-civic-blue hover:bg-civic-hover/50 transition-all duration-200"
      >
        <UploadCloud size={28} className="text-civic-muted" />
        <p className="text-sm text-civic-text-secondary">
          <span className="text-civic-blue font-medium">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-civic-muted">{hint}</p>
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </label>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, idx) => {
            const config = ACCEPTED_TYPES[file.type] || { icon: FileText, label: 'FILE' };
            const Icon = config.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-2.5 bg-civic-bg border border-civic-border rounded-lg"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white border border-civic-border flex items-center justify-center">
                  <Icon size={16} className="text-civic-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-civic-text-primary truncate">{file.name}</p>
                  <p className="text-xs text-civic-muted">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="p-1 rounded text-civic-text-secondary hover:text-status-rejected hover:bg-red-50 transition-colors"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
