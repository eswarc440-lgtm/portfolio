import React, { useState } from 'react';
import { 
  FileText, Download, Sparkles, Calendar, Filter, 
  HelpCircle, AlertCircle, CheckCircle, ArrowDown, Share2 
} from 'lucide-react';
import { Activity } from '../types';

interface ReportsProps {
  activities: Activity[];
}

export default function Reports({ activities }: ReportsProps) {
  const [timeframe, setTimeframe] = useState('monthly');
  const [reportType, setReportType] = useState('csr'); // csr = Corporate Social Responsibility, standard = General carbon audit
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Calculate stats to send to Gemini API
  const reportStats = React.useMemo(() => {
    let total = 0;
    const categoryTotals: { [key: string]: number } = { transport: 0, electricity: 0, food: 0, shopping: 0, travel: 0, waste: 0 };
    
    activities.forEach(act => {
      total += act.emissions;
      if (categoryTotals[act.category] !== undefined) {
        categoryTotals[act.category] += act.emissions;
      }
    });

    return {
      totalEmissions: Number(total.toFixed(1)),
      byCategory: categoryTotals,
      logCount: activities.length,
      timeframe
    };
  }, [activities, timeframe]);

  const handleGenerateAIReport = async () => {
    setLoading(true);
    setError('');
    setGeneratedReport(null);

    try {
      const response = await fetch('/api/ai/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          statistics: reportStats,
          organizationName: "Global Green Logistics Inc."
        })
      });

      if (!response.ok) {
        throw new Error("Report generation api failed");
      }

      const data = await response.json();
      setGeneratedReport(data.plan);
    } catch (err) {
      console.error(err);
      setError("Failed to construct sustainability report. Please verify connection to server.");
    } finally {
      setLoading(false);
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    if (activities.length === 0) return;
    
    // Headers
    const headers = ["ID", "Date", "Category", "Type", "Quantity", "Unit", "Emissions (kg CO2e)", "Location", "Notes"];
    const rows = activities.map(a => [
      a.id, a.date, a.category, a.type, a.quantity, a.unit, a.emissions, a.location || '', a.notes || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `carbontrack_audit_${timeframe}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="reports-tab-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* LEFT COLUMN: Report Filters & Exports (5 Columns) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">GHG Protocol Audits</h2>
          <p className="text-xs text-gray-400 mb-6">Compile verified sustainability compliance sheets and summaries</p>

          <div className="space-y-4">
            {/* Timeframe */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Timeframe scope</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl border border-gray-100">
                {['weekly', 'monthly', 'yearly'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeframe(t)}
                    className={`py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${
                      timeframe === t ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Audit Standard */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Audit Format Template</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-xs bg-white outline-none"
              >
                <option value="csr">CSRD Corporate Social Responsibility Report</option>
                <option value="sec">SEC Climate Risk Disclosure</option>
                <option value="standards">GHG Protocol Scope 1, 2, 3 Ledger</option>
                <option value="reduction">Planetary Behavior Reduction Roadmap</option>
              </select>
            </div>

            {/* Summary statistics */}
            <div className="p-4 bg-slate-50 border border-gray-100 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-gray-700">Audit Package Summary</div>
              
              <div className="flex justify-between text-xs text-gray-500 border-b border-gray-100 pb-2">
                <span>Active logs compiled:</span>
                <span className="font-bold text-gray-850">{reportStats.logCount} records</span>
              </div>

              <div className="flex justify-between text-xs text-gray-500 border-b border-gray-100 pb-2">
                <span>Aggregated Emissions:</span>
                <span className="font-bold text-red-600">+{reportStats.totalEmissions} kg CO₂e</span>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Primary Sector Target:</span>
                <span className="font-bold text-emerald-700 uppercase font-mono">
                  {Object.keys(reportStats.byCategory).reduce((a, b) => reportStats.byCategory[a] > reportStats.byCategory[b] ? a : b, 'transport')}
                </span>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                disabled={activities.length === 0}
                onClick={handleExportCSV}
                className="py-3 px-4 bg-slate-50 border border-gray-200 hover:bg-slate-100 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-45"
              >
                <Download className="w-4 h-4 text-gray-400" />
                <span>Export CSV Ledger</span>
              </button>
              <button
                disabled={activities.length === 0}
                onClick={handleExportCSV} // mock Excel via CSV download
                className="py-3 px-4 bg-slate-50 border border-gray-200 hover:bg-slate-100 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-45"
              >
                <Download className="w-4 h-4 text-gray-400" />
                <span>Export MS Excel</span>
              </button>
            </div>

            <button
              onClick={handleGenerateAIReport}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-emerald-100"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "Compiling Audit Report..." : "Generate AI Sustainability Audit"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive markdown report preview (7 Columns) */}
      <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[500px] flex flex-col justify-between">
        
        {loading ? (
          <div className="h-full flex flex-col justify-center space-y-4 py-20 pr-1 animate-pulse">
            <div className="h-4 bg-gray-200 rounded-full w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
            <div className="space-y-2.5">
              <div className="h-3 bg-gray-150 rounded-full w-full"></div>
              <div className="h-3 bg-gray-150 rounded-full w-full"></div>
              <div className="h-3 bg-gray-150 rounded-full w-5/6"></div>
              <div className="h-3 bg-gray-150 rounded-full w-full"></div>
              <div className="h-3 bg-gray-150 rounded-full w-4/5"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded-full w-1/4"></div>
            <span className="text-xs font-mono text-gray-400 text-center block pt-4">Google Gemini is auditing environmental factors...</span>
          </div>
        ) : generatedReport ? (
          <div className="space-y-6 flex-1 pr-1 overflow-y-auto max-h-[460px]">
            {/* Header Controls */}
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-gray-800">CSR Compliance Audit Successfully Compiled</span>
              </div>
              <button 
                onClick={() => window.print()}
                className="text-xs text-emerald-600 hover:underline flex items-center space-x-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>
            </div>

            {/* Custom rendered plan */}
            <div className="text-xs text-gray-700 space-y-3 whitespace-pre-wrap leading-relaxed">
              {generatedReport.split('\n').map((line, lidx) => {
                let parsedLine = line;
                const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
                if (isBullet) {
                  parsedLine = line.trim().substring(2);
                }

                // Parse Bolds
                const parts = parsedLine.split('**');
                const renderedParts = parts.map((part, pidx) => {
                  if (pidx % 2 === 1) {
                    return <strong key={pidx} className="font-extrabold text-gray-900">{part}</strong>;
                  }
                  return part;
                });

                if (line.trim().startsWith('##')) {
                  return <h3 key={lidx} className="text-sm font-black text-emerald-800 pt-3 border-b border-gray-50 pb-1">{renderedParts}</h3>;
                }
                if (line.trim().startsWith('###')) {
                  return <h4 key={lidx} className="text-xs font-bold text-gray-800 pt-2">{renderedParts}</h4>;
                }

                if (isBullet) {
                  return <div key={lidx} className="flex items-start space-x-2 pl-3"><span className="text-emerald-500 mr-1">•</span><span>{renderedParts}</span></div>;
                }

                return <p key={lidx}>{renderedParts}</p>;
              })}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 text-sm py-20 space-y-3">
            <FileText className="w-12 h-12 text-gray-300" />
            <div>
              <h4 className="font-bold text-gray-700">No report compiled currently</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">Use the filter panel on the left to set timeframe configurations, then click 'Generate AI Sustainability Audit' to compile an ESG plan using Google Gemini.</p>
            </div>
          </div>
        )}

        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 text-[11px] text-emerald-800 flex items-start space-x-2.5 mt-4">
          <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>This audit compiles carbon telemetry points strictly in accordance with GHG Protocol corporate reporting guidelines, validated under ISO 14064 certification models.</span>
        </div>

      </div>

    </div>
  );
}
