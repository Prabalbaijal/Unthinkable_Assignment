import React, { useEffect, useState } from "react";
import API from "../lib/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2, FileText, Sparkles, Copy } from "lucide-react";

export default function ResultCard({ jobId }) {
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [textNotified, setTextNotified] = useState(false);
  const [suggestionNotified, setSuggestionNotified] = useState(false);

  useEffect(() => {
    setHasStarted(false);
    setTextNotified(false);
    setSuggestionNotified(false);
    setResult(null);
    setStatus(null);
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;

    if (!hasStarted) {
      toast.loading("Processing started…", { id: "job" });
      setHasStarted(true);
    }

    async function poll() {
      if (cancelled) return;
      try {
        const res = await API.get(`/api/job/${jobId}`);
        const data = res.data;
        setStatus(data.status);

        if (data.result) {
          setResult(data.result);

          if (data.result.text && !textNotified) {
            toast.success("Text extracted!", { id: "job" });
            setTextNotified(true);
          }

          if (data.result.suggestionsStatus === "done" && !suggestionNotified) {
            toast.success("Suggestions ready!", { id: "job" });
            setSuggestionNotified(true);
          }
        }

        const keepPolling =
          ["pending", "processing"].includes(data.status) ||
          data.result?.suggestionsStatus !== "done";

        if (keepPolling) setTimeout(poll, 1200);
      } catch (e) {
        toast.error("Something went wrong!", { id: "job" });
        setStatus("error");
      }
    }

    poll();
    return () => { cancelled = true; };
  }, [jobId]);

  if (!jobId) return null;

  const loadingText = (() => {
    if (!result) return "Extracting text...";
    if (result && result.suggestionsStatus !== "done") return "Generating suggestions...";
    return null;
  })();

  // Progress calculation
  const progress = (() => {
    if (!result) return 30;
    if (result && result.suggestionsStatus !== "done") return 70;
    return 100;
  })();

  // Copy function
  const copyText = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
      toast.success("Text copied to clipboard!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
    >
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-black transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {loadingText && (
        <div className="flex items-center gap-2 mb-5 text-lg font-semibold text-gray-700">
          <Loader2 className="animate-spin" size={20} /> {loadingText}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-gray-800 font-semibold text-lg">
              <FileText size={20} /> Extracted Text
            </div>
            <div className="bg-gray-100 p-4 rounded-xl max-h-64 overflow-y-auto font-mono text-sm whitespace-pre-wrap">
              {result.text || "No text found."}
            </div>
            <button
              onClick={copyText}
              className="mt-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg hover:bg-black transition"
            >
              <Copy size={14} className="inline mr-1" /> Copy Text
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-gray-800 font-semibold text-lg">
              <Sparkles size={20} /> Suggestions
            </div>

            {result.suggestionsStatus !== "done" ? (
              <p className="text-gray-600">Generating suggestions...</p>
            ) : result.suggestions?.length > 0 ? (
              <ul className="list-disc ml-5 space-y-2 text-gray-700">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No suggestions generated.</p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
