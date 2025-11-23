import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import API from "../lib/api";
import { motion } from "framer-motion";
import { CloudUpload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Dropzone({ onJobCreated }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

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
          timeout: 5 * 60 * 1000 // long uploads
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
          isDragActive ? "border-indigo-500 bg-indigo-50/40" : "border-dashed border-gray-300 bg-white/70"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-600 to-pink-500 text-white">
            <CloudUpload size={22} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Upload file</h3>
            <p className="text-sm text-gray-500">
              Drag & drop PDF or image, or click to select. Max 20MB.
            </p>
          </div>
        </div>

        {/* uploading UI */}
        {uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="mt-4"
          >
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-fuchsia-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-600">Uploading… {progress}%</p>
          </motion.div>
        )}

        {/* subtle floating helper */}
        <div className="pointer-events-none absolute -bottom-4 right-4 opacity-40 text-xs text-gray-400">
          Drop to start
        </div>
      </div>

      {/* small helpers */}
      <div className="mt-3 flex gap-3 text-sm">
        <div className="text-xs text-gray-500">
          Supported: PDF, PNG, JPG, TIFF
        </div>
        <div className="text-xs text-gray-500">•</div>
        <div className="text-xs text-gray-500">OCR & AI suggestions</div>
      </div>
    </div>
  );
}
