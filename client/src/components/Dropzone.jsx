import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import API from "../lib/api";
import { motion } from "framer-motion";
import { CloudUpload } from "lucide-react";
import toast from "react-hot-toast";

export default function Dropzone({ onJobCreated }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null); // <-- preview URL
  const [fileType, setFileType] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileType(file.type);

      // Frontend preview
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else if (file.type === "application/pdf") {
        setPreview("pdf-icon"); // simple placeholder
      }

      // Upload logic
      const fd = new FormData();
      fd.append("file", file);

      try {
        setUploading(true);
        setProgress(0);

        const res = await API.post("/api/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / e.total);
            setProgress(percent);
          },
          timeout: 5 * 60 * 1000
        });

        toast.success("File uploaded — job created");
        onJobCreated(res.data.jobId);
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Upload failed. Try again.");
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [onJobCreated]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    multiple: false
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-xl p-6 border-2 transition-all ${
          isDragActive
            ? "border-purple-500 bg-purple-500/10"
            : "border-dashed border-gray-600 bg-gray-800/40 backdrop-blur-xl"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 text-white">
            <CloudUpload size={22} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-200">Upload file</h3>
            <p className="text-sm text-gray-400">Drag & drop PDF/Image or click</p>
          </div>
        </div>

        {/* uploading UI */}
        {uploading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">Uploading… {progress}%</p>
          </motion.div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mt-4 border border-gray-700 rounded-lg p-2 bg-gray-900/50">
            {fileType.startsWith("image/") ? (
              <img
                src={preview}
                alt="preview"
                className="w-full max-h-48 object-contain rounded"
              />
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400">
                📄 PDF selected
              </div>
            )}
          </div>
        )}

        <div className="pointer-events-none absolute -bottom-4 right-4 opacity-40 text-xs text-gray-500">
          Drop to start
        </div>
      </div>

      <div className="mt-3 flex gap-3 text-sm text-gray-500">
        <div className="text-xs">PDF, PNG, JPG, TIFF</div>
        <div className="text-xs">•</div>
        <div className="text-xs">OCR + AI suggestions</div>
      </div>
    </div>
  );
}
