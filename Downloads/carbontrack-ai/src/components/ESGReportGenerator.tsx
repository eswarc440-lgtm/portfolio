import React, { useState, useMemo } from 'react';
import {
  FileText, Download, Share2, CheckCircle, AlertCircle, Zap,
  Calendar, TrendingDown, Award, Plus, Copy, Eye
} from 'lucide-react';
import { Activity, UserProfile } from '../types';
import { motion } from 'motion/react';

interface ESGReportGeneratorProps {
  activities: Activity[];
  userProfile: UserProfile | null;
  onGenerateReport?: () => void;
  onExportPDF?: (reportData: any) => void;
}

interface ReportData {
  period: string;
  totalEmissions: number;
  reductionPercentage: number;
  categorySummary: Record<string, number>;
  highlights: string[];
  recommendations: string[];
  certificationLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  generatedAt: string;
}

export default function ESGReportGenerator({
  activities,
  userProfile,
  onGenerateReport,
  onExportPDF
}: ESGReportGeneratorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [reportGenerated, setReportGenerated] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Generate report data
  const generateReport = (): ReportData => {
    const now = new Date();
    let startDate = new Date();

    if (selectedPeriod === 'monthly') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (selectedPeriod === 'quarterly') {
      startDate.setMonth(now.getMonth() - 3);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const filteredActivities = activities.filter(
      a => new Date(a.date) >= startDate
    );

    const totalEmissions = filteredActivities.reduce((sum, a) => sum + a.emissions, 0);
    const previousPeriodEmissions = activities
      .filter(a => {
        const date = new Date(a.date);
        return date >= new Date(startDate.getTime() - (startDate.getTime() - new Date(startDate).getTime())) &&
               date < startDate;
      })
      .reduce((sum, a) => sum + a.emissions, 0);

    const reductionPercentage = previousPeriodEmissions > 0
      ? ((previousPeriodEmissions - totalEmissions) / previousPeriodEmissions) * 100
      : 0;

    const categorySummary: Record<string, number> = {};
    filteredActivities.forEach(a => {
      categorySummary[a.category] = (categorySummary[a.category] || 0) + a.emissions;
    });

    // Determine certification level
    const carbonScore = userProfile?.carbonScore || 0;
    let certificationLevel: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';
    if (carbonScore >= 90) certificationLevel = 'platinum';
    else if (carbonScore >= 80) certificationLevel = 'gold';
    else if (carbonScore >= 70) certificationLevel = 'silver';

    const highlights = [];
    if (reductionPercentage > 0) {
      highlights.push(`Achieved ${reductionPercentage.toFixed(1)}% emissions reduction`);
    }
    if (userProfile?.currentStreak && userProfile.currentStreak > 7) {
      highlights.push(`${userProfile.currentStreak}-day tracking consistency`);
    }
    if (totalEmissions < 200) {
      highlights.push('Below average carbon footprint');
    }

    const recommendations = [];
    const highestCategory = Object.entries(categorySummary).sort((a, b) => b[1] - a[1])[0];
    if (highestCategory) {
      recommendations.push(`Focus on reducing ${highestCategory[0]} emissions`);
    }
    recommendations.push('Implement one recommendation from AI insights weekly');
    recommendations.push('Maintain current logging streak for data integrity');

    return {
      period: selectedPeriod,
      totalEmissions,
      reductionPercentage,
      categorySummary,
      highlights,
      recommendations,
      certificationLevel,
      generatedAt: new Date().toISOString()
    };
  };

  const report = useMemo(() => {
    if (reportGenerated && generatedReport) {
      return generatedReport;
    }
    return null;
  }, [reportGenerated, generatedReport]);

  const handleGenerateReport = () => {
    const newReport = generateReport();
    setGeneratedReport(newReport);
    setReportGenerated(true);
    if (onGenerateReport) {
      onGenerateReport();
    }
  };

  const handleExport = () => {
    if (report && onExportPDF) {
      onExportPDF(report);
    }
  };

  const getCertificationColor = (level: string) => {
    switch (level) {
      case 'platinum': return 'from-purple-400 via-purple-500 to-purple-600';
      case 'gold': return 'from-yellow-400 via-yellow-500 to-yellow-600';
      case 'silver': return 'from-gray-300 via-gray-400 to-gray-500';
      case 'bronze': return 'from-orange-400 via-orange-500 to-orange-600';
      default: return 'from-slate-400 to-slate-600';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 font-display">ESG Report Generator</h1>
          <p className="text-sm text-slate-500">Generate sustainability reports and certifications</p>
        </div>
        {report && (
          <div className="flex space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm flex items-center space-x-2 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>{previewMode ? 'Edit' : 'Preview'}</span>
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        )}
      </div>

      {!report ? (
        <>
          {/* Configuration Panel */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-emerald-100 rounded-2xl p-8 shadow-sm"
          >
            <h3 className="text-sm font-bold text-slate-800 mb-6">Report Configuration</h3>

            <div className="space-y-6">
              {/* Period Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Reporting Period</label>
                <div className="grid grid-cols-3 gap-3">
                  {['monthly', 'quarterly', 'annual'].map(period => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period as any)}
                      className={`p-3 rounded-lg text-sm font-bold transition-all ${
                        selectedPeriod === period
                          ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                          : 'bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {period === 'monthly' ? 'Monthly' : period === 'quarterly' ? 'Quarterly' : 'Annual'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metrics Preview */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="text-xs font-bold text-slate-600 uppercase">Report Will Include:</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Total emissions for {selectedPeriod} period</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Year-over-year reduction analysis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Emissions breakdown by category</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Sustainability certification level</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Personalized reduction recommendations</span>
                  </li>
                </ul>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateReport}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-colors"
              >
                Generate Report
              </button>
            </div>
          </motion.div>
        </>
      ) : (
        <>
          {previewMode ? (
            // Preview Mode
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Certification Badge */}
              <div className="text-center">
                <div className={`inline-flex flex-col items-center p-8 rounded-2xl bg-gradient-to-b ${getCertificationColor(report.certificationLevel)} text-white shadow-lg`}>
                  <Award className="w-16 h-16 mb-3" />
                  <div className="text-2xl font-extrabold">{report.certificationLevel.toUpperCase()}</div>
                  <div className="text-sm mt-1">Sustainability Certification</div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                  <div className="text-3xl font-extrabold text-slate-800">{report.totalEmissions.toFixed(1)}</div>
                  <div className="text-sm text-slate-600 mt-1">Total Emissions (kg CO₂e)</div>
                </div>
                <div className="bg-white border border-emerald-200 rounded-lg p-6 text-center">
                  <div className={`text-3xl font-extrabold ${report.reductionPercentage > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {Math.abs(report.reductionPercentage).toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    {report.reductionPercentage > 0 ? 'Reduction' : 'Change'}
                  </div>
                </div>
                <div className="bg-white border border-blue-200 rounded-lg p-6 text-center">
                  <div className="text-3xl font-extrabold text-blue-600">{userProfile?.carbonScore || 0}</div>
                  <div className="text-sm text-slate-600 mt-1">Carbon Score</div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h4 className="text-sm font-bold text-slate-800 mb-4">Emissions by Category</h4>
                <div className="space-y-3">
                  {Object.entries(report.categorySummary).map(([category, emissions]) => (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700 capitalize">{category}</span>
                        <span className="font-bold text-slate-800">{(emissions as number).toFixed(1)} kg</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${((emissions as number) / report.totalEmissions) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                <h4 className="text-sm font-bold text-emerald-900 mb-3">Highlights</h4>
                <ul className="space-y-2">
                  {report.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm text-emerald-800">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-sm font-bold text-blue-900 mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm text-blue-800">
                      <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Report Footer */}
              <div className="text-xs text-slate-500 text-center space-y-1">
                <p>Generated on {new Date(report.generatedAt).toLocaleDateString()}</p>
                <p>CarbonTrack ESG Reporting System v1.0</p>
              </div>
            </motion.div>
          ) : (
            // Edit Mode
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm"
            >
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                  <CheckCircle className="w-5 h-5" />
                  <span>Report Generated Successfully</span>
                </div>

                {/* Change Period */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Reporting Period</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['monthly', 'quarterly', 'annual'].map(period => (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period as any)}
                        className={`p-3 rounded-lg text-sm font-bold transition-all ${
                          selectedPeriod === period
                            ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                            : 'bg-slate-50 text-slate-700 border-2 border-slate-200'
                        }`}
                      >
                        {period === 'monthly' ? 'Monthly' : period === 'quarterly' ? 'Quarterly' : 'Annual'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateReport}
                  className="w-full py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg text-sm transition-colors"
                >
                  Regenerate Report
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
