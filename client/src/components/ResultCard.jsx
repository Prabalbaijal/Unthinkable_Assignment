import React, { useEffect, useState } from "react";
import API from "../lib/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2, FileText, Sparkles, Copy, Image } from "lucide-react";

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
          if (data.result.text) {
            toast.success("Text extracted!", { id: "job" });
          }
          if (data.result.suggestionsStatus === "done") {
            toast.success("Suggestions ready!", { id: "job" });
          }
        }

        const keep = ["pending", "processing"].includes(data.status) || data.result?.suggestionsStatus !== "done";
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

  const loadingText = (() => {
    if (!result) return "Extracting text...";
    if (result && result.suggestionsStatus !== "done") return "Generating suggestions...";
    return null;
  })();

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
      className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100"
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-gradient-to-r from-indigo-600 to-pink-500 text-white">
            <FileText size={18} />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-800">Analysis</div>
            <div className="text-xs text-gray-500">Job: <span className="font-mono">{jobId}</span></div>
          </div>
        </div>

        <div className="w-40">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div style={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 transition-all" />
          </div>
          <div className="text-xs text-right text-gray-500 mt-1">
            {progress}% 
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} /> <h4 className="font-medium text-gray-800">Extracted Text</h4>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl min-h-[120px] max-h-56 overflow-y-auto font-mono text-sm whitespace-pre-wrap text-gray-700">
            {result?.text ? result.text : "No text yet — wait a moment."}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={copyText}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gray-900 text-white text-sm hover:scale-[1.02] transition-transform"
            >
              <Copy size={14} /> Copy
            </button>
            <div className="text-xs text-gray-500">Status: <span className="font-medium text-gray-700">{status}</span></div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} /> <h4 className="font-medium text-gray-800">Suggestions</h4>
          </div>

          <div className="bg-white p-4 rounded-xl min-h-[120px] max-h-56 overflow-y-auto text-gray-700">
            {result?.suggestionsStatus !== "done" ? (
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin" /> <div>Generating suggestions…</div>
              </div>
            ) : result?.suggestions?.length ? (
              <ul className="list-disc ml-5 space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">No suggestions generated.</div>
            )}
          </div>

          {/* optional image preview (if backend returns an image url) */}
          {result?.imageUrl && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              < img src={result.imageUrl} alt="preview" className="w-full h-40 object-contain bg-gray-50" />
              <div className="p-2 text-xs text-gray-500">Preview</div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
