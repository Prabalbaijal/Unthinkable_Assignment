import React, { useState } from "react";
import Dropzone from "./components/Dropzone";
import ResultCard from "./components/ResultCard";
import { motion } from "framer-motion";

export default function App() {
  const [jobId, setJobId] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Social Media Content Analyzer
          </h1>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Upload a PDF or scanned image — OCR runs in background and AI gives
            engagement suggestions. Fast, pretty and production-ready.
          </p>
        </header>

        {/* Controls Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Dropzone Card */}
          <motion.div
            initial={{ scale: 0.99, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-6 lg:col-span-1"
          >
            <Dropzone onJobCreated={setJobId} />
            <p className="mt-4 text-sm text-gray-500">
              Tip: Use good contrast scanned images for best OCR results.
            </p>
          </motion.div>

          {/* Result / Extracted Text */}
          <motion.div
            initial={{ scale: 0.99, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col lg:col-span-2"
            style={{ minHeight: "500px" }}
          >
            {jobId && (
              <div className="flex-grow overflow-auto">
                <ResultCard jobId={jobId} />
              </div>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500">
          Built with ❤️ — drag a file, wait a bit, and see suggestions.
        </footer>
      </motion.div>
    </div>
  );
}
