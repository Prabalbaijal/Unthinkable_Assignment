import React, { useState } from "react";
import Dropzone from "./components/Dropzone";
import ResultCard from "./components/ResultCard";
import { motion } from "framer-motion";

export default function App() {
  const [jobId, setJobId] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Social Media Content Analyzer
          </h1>
          <p className="text-gray-600">
            Upload a PDF or scanned image; OCR runs in the background and you'll
            get suggestions.
          </p>
        </div>

        {/* Dropzone Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
        >
          <Dropzone onJobCreated={setJobId} />
        </motion.div>

        {/* Result Card */}
        {jobId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <ResultCard jobId={jobId} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
