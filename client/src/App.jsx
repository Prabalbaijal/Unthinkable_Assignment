import React, { useState } from "react";
import Dropzone from "./components/Dropzone";
import ResultCard from "./components/ResultCard";
import { motion } from "framer-motion";

export default function App() {
  const [jobId, setJobId] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0c0c12] to-[#111118] py-12 px-6 text-gray-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Social Media Content Analyzer
          </h1>
          <p className="mt-2 text-gray-400 max-w-2xl mx-auto">
            Upload PDF/Image — OCR runs in background and AI gives engagement suggestions. Fast, pretty and production-ready.
          </p>
        </header>

        {/* Controls Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Dropzone */}
          <motion.div
            initial={{ scale: 0.99, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="
              bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700 p-6 lg:col-span-1
              transition-all duration-300 
              hover:scale-[1.02] hover:shadow-2xl hover:border-gray-500 hover:bg-gray-800/80
            "
          >
            <Dropzone onJobCreated={setJobId} />
            <p className="mt-4 text-sm text-gray-400">
              Tip: Higher contrast images give best OCR.
            </p>
          </motion.div>

          {/* Result */}
          <motion.div
            initial={{ scale: 0.99, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="
              bg-gray-900/60 rounded-2xl shadow-xl border border-gray-700 p-6 flex flex-col lg:col-span-2
              transition-all duration-300
              hover:border-gray-500 hover:shadow-[0_0_20px_rgba(100,100,255,0.2)]
            "
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
        <footer className="text-center text-sm text-gray-500 transition-all duration-300 hover:text-gray-300 hover:-translate-y-0.5">
          Built with ❤️ — Dark Mode Powered ⚡
        </footer>
      </motion.div>
    </div>
  );
}
