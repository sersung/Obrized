"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2, Sparkles, CheckCircle2, Download, Send } from "lucide-react";
import { toast } from "sonner";
import { useTranslations, Language } from "@/lib/translations";

// Minimal Web Speech API types for cross-browser support
interface ISpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface ISpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: ISpeechRecognitionAlternative;
}
interface ISpeechRecognitionResultList {
  length: number;
  [index: number]: ISpeechRecognitionResult;
}
interface ISpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: ISpeechRecognitionResultList;
}
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

type ReportState = "idle" | "recording" | "generating" | "done";

type SafetyReport = {
  date: string;
  project: string;
  workers_on_site: number;
  weather: string;
  temperature_c: number;
  work_performed: string;
  hazards_noted: string[];
  corrective_actions: string;
  incidents: string;
  compliance_flags: string[];
};

const PROJECTS = [
  "Maple Ridge Condominium",
  "Yaletown Office Tower",
  "King St Renovation",
  "Westmount Residence",
];

export default function NewSafetyReportPage() {
  const [lang, setLang] = useState<Language>("EN");
  const [state, setState] = useState<ReportState>("idle");
  const [project, setProject] = useState(PROJECTS[0]);
  const [reportType, setReportType] = useState("daily");
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [report, setReport] = useState<SafetyReport | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem("buildr_lang") as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const { t } = useTranslations(lang);

  const startVoice = () => {
    if (typeof window === "undefined") return;

    const SR: new () => ISpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SR) {
      toast.error(lang === "EN" ? "Speech recognition not supported in this browser. Please use Chrome or Edge." : "Reconnaissance vocale non supportée par votre navigateur. Utilisez Chrome ou Edge.");
      return;
    }

    const recognition = new SR();
    recognition.lang = lang === "EN" ? "en-CA" : "fr-CA";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + " ";
        }
      }
      if (final) setTranscript((prev) => prev + final);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error(lang === "EN" ? "Speech recognition error." : "Erreur de reconnaissance vocale.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setState("recording");
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setState("idle");
  };

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      toast.error(lang === "EN" ? "Please dictate or type a summary of today's work." : "Veuillez dicter ou écrire le résumé des travaux d'aujourd'hui.");
      return;
    }
    setState("generating");

    try {
      const response = await fetch("/api/safety/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: transcript,
          project,
          reportType,
          reportDate: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      setReport(data.report);
      setState("done");
      toast.success(lang === "EN" ? "Safety report generated successfully!" : "Rapport de sécurité généré avec succès !");
      
      // Save to Mock DB / Supabase
      await fetch("/api/safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: project,
          report_type: reportType,
          raw_transcript: transcript,
          report: data.report,
          report_date: new Date().toISOString().split("T")[0],
        }),
      });
    } catch {
      setState("idle");
      toast.error(lang === "EN" ? "Failed to generate report. Please check your Gemini API key." : "Erreur lors de la génération. Vérifiez votre clé API Gemini.");
    }
  };

  const handleSign = () => {
    toast.success(lang === "EN" ? "Report signed and saved successfully!" : "Rapport signé et enregistré avec succès !");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t("new_report")}</h2>
        <p className="text-xs text-gray-400 font-semibold mt-1">
          {t("new_report_desc")}
        </p>
      </div>

      {/* Config */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t("project_label")}</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              {PROJECTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {lang === "EN" ? "Report Type" : "Type de Rapport"}
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="daily">{lang === "EN" ? "Daily Log (RDO)" : "Journal de Chantier"}</option>
              <option value="weekly">{lang === "EN" ? "Weekly Safety Report" : "Rapport SST Hebdomadaire"}</option>
              <option value="incident">{lang === "EN" ? "Incident Report" : "Rapport d'Incident"}</option>
              <option value="toolbox">{lang === "EN" ? "Toolbox Talk Minutes" : "Procès-verbal Causerie Sécurité"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Voice input */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 text-sm mb-4">
          {lang === "EN" ? "Describe Today's Site Activities" : "Décrire les activités de chantier"}
        </h3>

        <div className="flex flex-col gap-4">
          {/* Voice button */}
          <div className="flex items-center gap-4">
            <button
              onClick={isListening ? stopVoice : startVoice}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm ${
                isListening
                  ? "bg-rose-500 text-white hover:bg-rose-600 animate-pulse"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  {lang === "EN" ? "Stop Recording" : "Arrêter l'enregistrement"}
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 animate-pulse text-orange-200" />
                  {t("record_voice")}
                </>
              )}
            </button>
            {isListening && (
              <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                {t("recording")}
              </div>
            )}
          </div>

          {/* Text input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {t("voice_notes")}
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={6}
              placeholder={t("voice_placeholder")}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none transition-all leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={!transcript.trim() || state === "generating"}
              className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {state === "generating" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-orange-200 animate-pulse" />
              )}
              {state === "generating" ? t("generating_report") : t("generate_report")}
            </button>
          </div>
        </div>
      </div>

      {/* Generated report */}
      {report && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-fade-in">
          <div className="bg-orange-50/50 border-b border-orange-100/50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5.5 h-5.5 text-orange-600" />
              <span className="font-extrabold text-orange-900 text-sm">{lang === "EN" ? "AI Generated Safety Record" : "Rapport SST généré par l'IA"}</span>
            </div>
            <div className="flex gap-2.5">
              <button className="flex items-center gap-1.5 px-3.5 py-1.75 border border-orange-200 text-orange-700 rounded-xl text-xs font-bold hover:bg-orange-100/40 transition-colors">
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={handleSign}
                className="flex items-center gap-1.5 px-3.5 py-1.75 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4 text-orange-150 animate-pulse" />
                {lang === "EN" ? "Sign & Submit" : "Signer et Soumettre"}
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Header info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-inner">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{lang === "EN" ? "Date" : "Date"}</p>
                <p className="font-bold text-gray-800 text-sm mt-1">{report.date}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("project_label")}</p>
                <p className="font-bold text-gray-800 text-sm mt-1 truncate">{report.project}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{lang === "EN" ? "Workers" : "Travailleurs"}</p>
                <p className="font-bold text-gray-800 text-sm mt-1">{report.workers_on_site}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{lang === "EN" ? "Weather / Temp" : "Météo / Temp"}</p>
                <p className="font-bold text-gray-800 text-sm mt-1">
                  {report.weather} · {report.temperature_c}°C
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                {t("work_performed")}
              </h4>
              <p className="text-sm font-medium text-gray-650 bg-gray-50 border border-gray-100 rounded-2xl p-4 leading-relaxed whitespace-pre-wrap select-all">
                {report.work_performed}
              </p>
            </div>

            {report.hazards_noted && report.hazards_noted.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  {lang === "EN" ? "Identified Hazards & Safety Controls" : "Risques Identifiés & Contrôles"}
                </h4>
                <ul className="space-y-2">
                  {report.hazards_noted.map((hazard, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm font-medium text-gray-650">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-2" />
                      <span>{hazard}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.corrective_actions && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  {t("corrective_actions")}
                </h4>
                <p className="text-sm font-medium text-gray-650 bg-gray-50/50 border border-gray-100 rounded-xl p-4 leading-relaxed">{report.corrective_actions}</p>
              </div>
            )}

            {report.compliance_flags && report.compliance_flags.length > 0 && (
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 shadow-sm">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2.5">
                  {t("compliance_flags")}
                </h4>
                <ul className="space-y-2">
                  {report.compliance_flags.map((flag, i) => (
                    <li key={i} className="text-xs font-semibold text-amber-700 flex items-start gap-2">
                      <span className="text-amber-500 animate-ping">⚠</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
