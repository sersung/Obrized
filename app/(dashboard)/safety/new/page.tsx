"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Loader2, Sparkles, CheckCircle2, Download, Send } from "lucide-react";
import { toast } from "sonner";

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
  "Condomínio Maple Ridge",
  "Escritórios Yaletown",
  "King St Reforma",
  "Residência Westmount",
];

export default function NewSafetyReportPage() {
  const [state, setState] = useState<ReportState>("idle");
  const [project, setProject] = useState(PROJECTS[0]);
  const [reportType, setReportType] = useState("daily");
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [report, setReport] = useState<SafetyReport | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const startVoice = () => {
    if (typeof window === "undefined") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: new () => ISpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SR) {
      toast.error("Reconhecimento de voz não suportado neste navegador. Use Chrome ou Edge.");
      return;
    }

    const recognition = new SR();
    recognition.lang = "pt-BR";
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
      toast.error("Erro no reconhecimento de voz.");
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
      toast.error("Fale algo ou escreva uma descrição das atividades do dia.");
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

      if (!response.ok) throw new Error("Falha na geração");

      const data = await response.json();
      setReport(data.report);
      setState("done");
      toast.success("Relatório gerado com sucesso!");
      // Save to Supabase
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
      toast.error("Erro ao gerar relatório. Verifique sua chave de API.");
    }
  };

  const handleSign = () => {
    toast.success("Relatório assinado e salvo com sucesso!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Novo Relatório de Segurança</h2>
        <p className="text-sm text-gray-500 mt-1">
          Descreva as atividades do dia por voz ou texto. A IA estrutura o relatório conforme
          exigências do OHSA (Ontario) ou WorkSafeBC.
        </p>
      </div>

      {/* Config */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Projeto</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {PROJECTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tipo de Relatório
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="daily">Diário de Obra</option>
              <option value="weekly">Semanal</option>
              <option value="incident">Relatório de Incidente</option>
              <option value="toolbox">Toolbox Talk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Voice input */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-medium text-gray-900 mb-4">
          Descreva as Atividades do Dia
        </h3>

        <div className="flex flex-col gap-4">
          {/* Voice button */}
          <div className="flex items-center gap-4">
            <button
              onClick={isListening ? stopVoice : startVoice}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                isListening
                  ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  Parar Gravação
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Iniciar Gravação por Voz
                </>
              )}
            </button>
            {isListening && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Gravando...
              </div>
            )}
          </div>

          {/* Text input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Transcrição / Notas de Campo
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={6}
              placeholder="Ex: Hoje trabalhamos 18 operários na área norte. Concretagem das lajes do 3º e 4º andares. Chuva leve pela manhã causou pausa de 2 horas. Identificamos que o andaime no lado leste precisa de reforço — já corrigimos. Nenhum incidente a reportar."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={!transcript.trim() || state === "generating"}
              className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {state === "generating" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {state === "generating" ? "Gerando..." : "Gerar Relatório com IA"}
            </button>
          </div>
        </div>
      </div>

      {/* Generated report */}
      {report && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="bg-orange-50 border-b border-orange-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-orange-900">Relatório Gerado pela IA</span>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-orange-200 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors">
                <Download className="w-3.5 h-3.5" />
                PDF
              </button>
              <button
                onClick={handleSign}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Assinar e Enviar
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Header info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Data</p>
                <p className="font-medium text-gray-900 text-sm">{report.date}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Projeto</p>
                <p className="font-medium text-gray-900 text-sm">{report.project}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Trabalhadores</p>
                <p className="font-medium text-gray-900 text-sm">{report.workers_on_site}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Clima / Temp.</p>
                <p className="font-medium text-gray-900 text-sm">
                  {report.weather} · {report.temperature_c}°C
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Trabalho Realizado
              </h4>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 leading-relaxed">
                {report.work_performed}
              </p>
            </div>

            {report.hazards_noted.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Riscos Identificados
                </h4>
                <ul className="space-y-1.5">
                  {report.hazards_noted.map((hazard, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-2" />
                      <span className="text-gray-700">{hazard}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.corrective_actions && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Ações Corretivas
                </h4>
                <p className="text-sm text-gray-700">{report.corrective_actions}</p>
              </div>
            )}

            {report.compliance_flags.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">
                  Alertas de Conformidade
                </h4>
                <ul className="space-y-1">
                  {report.compliance_flags.map((flag, i) => (
                    <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                      <span>⚠</span> {flag}
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
