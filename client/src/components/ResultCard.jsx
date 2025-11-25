import React, { useEffect, useState } from "react";
import API from "../lib/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2, FileText, Sparkles, Copy } from "lucide-react";

export default function ResultCard({ jobId }) {
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setStarted(false);
    setResult(null);
    setStatus(null);
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;

    if (!started) {
      toast.loading("Processing started…", { id: "job" });
      setStarted(true);
    }

    async function poll() {
      if (cancelled) return;
      try {
        const res = await API.get(`/api/job/${jobId}`);
        const data = res.data;
        setStatus(data.status || "pending");

        if (data.result) {
          setResult(data.result);
          if (data.result.text) toast.success("Text extracted!", { id: "job" });
          if (data.result.suggestionsStatus === "done") toast.success("Suggestions ready!", { id: "job" });
        }

        const keep =
          ["pending", "processing"].includes(data.status) ||
          data.result?.suggestionsStatus !== "done";
        if (keep) setTimeout(poll, 1200);
      } catch (err) {
        console.error("poll error:", err);
        toast.error("Something went wrong while polling");
        setStatus("error");
      }
    }

    poll();
    return () => { cancelled = true; };
  }, [jobId, started]);

  if (!jobId) return null;

  const progress = (() => {
    if (!result) return 20;
    if (result && result.suggestionsStatus !== "done") return 65;
    return 100;
  })();

  const copyText = async () => {
    if (result?.text) {
      await navigator.clipboard.writeText(result.text);
      toast.success("Copied text");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="
        bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700 text-gray-200
        transition-all duration-300
        hover:shadow-[0_0_25px_rgba(120,120,255,0.25)]
        hover:border-indigo-500/40
        hover:-translate-y-1
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 text-white">
            <FileText size={18} />
          </div>
          <div>
            <div className="text-lg font-semibold text-white">Analysis</div>
            <div className="text-xs text-gray-400 font-mono">Job: {jobId}</div>
          </div>
        </div>

        <div className="w-40">
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 transition-all"
            />
          </div>
          <div className="text-xs text-right text-gray-400 mt-1">{progress}%</div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Extracted Text */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} />
            <h4 className="font-medium text-white">Extracted Text</h4>
          </div>

          <div
            className="
              bg-gray-900/60 p-4 rounded-xl min-h-[120px] max-h-56 overflow-y-auto 
              font-mono text-sm text-gray-300 whitespace-pre-wrap 
              scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-800
              transition-all duration-300
              hover:bg-gray-900/80 hover:border-gray-600 hover:shadow-inner hover:shadow-indigo-500/20
            "
          >
            {result?.text || "Processing…"}
          </div>

          <button
            onClick={copyText}
            className="
              mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gray-700 text-white text-sm 
              transition-all duration-300
              hover:bg-indigo-600 hover:text-white hover:scale-[1.04] hover:shadow-lg
            "
          >
            <Copy size={14} /> Copy
          </button>
        </div>

        {/* Suggestions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} />
            <h4 className="font-medium text-white">Suggestions</h4>
          </div>

          <div
            className="
              bg-gray-900/60 p-4 rounded-xl min-h-[120px] max-h-56 overflow-y-auto 
              text-gray-300 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-800
              transition-all duration-300
              hover:bg-gray-900/80 hover:shadow-[0_0_18px_rgba(150,150,255,0.15)]
            "
          >
            {result?.suggestionsStatus !== "done" ? (
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin" /> Generating…
              </div>
            ) : result?.suggestions?.length ? (
              <div className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="
                      bg-gray-800/50 p-3 rounded-lg border border-gray-700
                      transition-all duration-300
                      hover:bg-gray-800 hover:border-indigo-500/60 
                      hover:translate-x-1 hover:shadow-[0_0_15px_rgba(120,120,255,0.2)]
                    "
                  >
                    <h5 className="text-indigo-300 font-semibold">
                      {i + 1}. {s.title || `Suggestion ${i + 1}`}
                    </h5>
                    <p className="text-gray-400"><strong>Problem:</strong> {s.problem}</p>
                    <p className="text-gray-200"><strong>Suggestion:</strong> {s.suggestion}</p>
                    {s.example && <p className="text-gray-300 italic">Example: {s.example}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400">No suggestions generated.</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
