import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import API from "../lib/api";
import { motion } from "framer-motion";
import { Loader2, FileText, Sparkles, Copy } from "lucide-react";
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
        });

        toast.success("File uploaded successfully!");
        onJobCreated(res.data.jobId);
      } catch (e) {
        toast.error("Upload failed!");
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
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg mx-auto"
    >
      <div
        {...getRootProps()}
        className={`border-2 rounded-xl p-6 text-center cursor-pointer transition ${
          isDragActive ? "border-black bg-gray-50" : "border-gray-300 bg-white"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-gray-700" size={24} />
            <p className="text-gray-700 font-medium">Uploading... {progress}%</p>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : isDragActive ? (
          <p className="text-gray-700 font-medium">Drop file here</p>
        ) : (
          <p className="text-gray-700 font-medium">
            Drag & drop PDF/image or click to select
          </p>
        )}
      </div>
    </motion.div>
  );
}
