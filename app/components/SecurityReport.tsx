"use client";

import ThreatMeter from './ThreatMeter';

interface SecurityReportProps {
  result: {
    url: string;
    threatLevel: number;
    isPhishing: boolean;
    scanTime: string;
    details: {
      domainAge: number;
      sslCertificate: boolean;
      suspiciousPatterns: number;
      reputation: string;
    };
  };
}

export default function SecurityReport({ result }: SecurityReportProps) {
  const getThreatColor = (level: number) => {
    if (level < 30) return 'text-green-400';
    if (level < 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getThreatBgColor = (level: number) => {
    if (level < 30) return 'bg-green-900/30 border-green-600/30';
    if (level < 70) return 'bg-orange-900/30 border-orange-600/30';
    return 'bg-red-900/30 border-red-600/30';
  };

  const getThreatText = (level: number) => {
    if (level < 30) return 'Low threat';
    if (level < 70) return 'Medium threat';
    return 'High threat';
  };

  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-cyan-900/30 overflow-hidden">
      <div className="bg-linear-to-r from-cyan-900/50 to-zinc-900/50 p-8 text-white border-b border-cyan-800/30">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-3xl font-bold mb-3 text-white">Security Report</h3>
            <p className="text-cyan-300 break-all text-lg font-medium">{result.url}</p>
            <p className="text-zinc-400 mt-2">Scan completed: {new Date(result.scanTime).toLocaleString('en-US')}</p>
          </div>
          <div className={`px-6 py-3 rounded-2xl border-2 ${getThreatBgColor(result.threatLevel)} backdrop-blur-sm`}>
            <span className={`font-bold text-lg ${getThreatColor(result.threatLevel)}`}>
              {result.isPhishing ? '🚨 PHISHING' : getThreatText(result.threatLevel)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-10">
          <ThreatMeter threatLevel={result.threatLevel} />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-2xl font-bold text-white mb-6 flex items-center">
              <i className="ri-shield-check-line text-cyan-400 mr-3"></i>
              Security indicators
            </h4>

            <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${result.details.sslCertificate ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}></div>
                  <span className="text-zinc-300 font-medium text-lg">SSL Certificate</span>
                </div>
                <span className={`font-bold text-lg ${result.details.sslCertificate ? 'text-green-400' : 'text-red-400'}`}>
                  {result.details.sslCertificate ? 'Valid' : 'Missing/Invalid'}
                </span>
              </div>
            </div>

            <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${result.details.domainAge > 30 ? 'bg-green-500' : 'bg-orange-500'} shadow-lg`}></div>
                  <span className="text-zinc-300 font-medium text-lg">Domain age</span>
                </div>
                <span className="font-bold text-lg text-white">{result.details.domainAge} days</span>
              </div>
            </div>

            <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${result.details.suspiciousPatterns === 0 ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}></div>
                  <span className="text-zinc-300 font-medium text-lg">Suspicious patterns</span>
                </div>
                <span className={`font-bold text-lg ${result.details.suspiciousPatterns === 0 ? 'text-green-400' : 'text-red-400'}`}>{result.details.suspiciousPatterns} detected</span>
              </div>
            </div>

            <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${result.details.reputation === 'good' ? 'bg-green-500' : 'bg-orange-500'} shadow-lg`}></div>
                  <span className="text-zinc-300 font-medium text-lg">Domain reputation</span>
                </div>
                <span className={`font-bold text-lg ${result.details.reputation === 'good' ? 'text-green-400' : 'text-orange-400'}`}>{result.details.reputation === 'good' ? 'Good' : 'Suspicious'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-2xl font-bold text-white mb-6 flex items-center">
              <i className="ri-lightbulb-line text-cyan-400 mr-3"></i>
              Recommendations
            </h4>

            {result.isPhishing ? (
              <div className="p-6 bg-red-900/30 border-2 border-red-600/50 rounded-2xl backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shrink-0 border border-red-500/50">
                    <i className="ri-error-warning-line text-white text-xl"></i>
                  </div>
                  <div>
                    <h5 className="font-bold text-red-300 mb-3 text-lg">WARNING: Phishing detected!</h5>
                    <ul className="text-red-200 space-y-2">
                      <li className="flex items-start"><span className="text-red-400 mr-2">•</span>Do not enter any personal information</li>
                      <li className="flex items-start"><span className="text-red-400 mr-2">•</span>Do not click any links on this page</li>
                      <li className="flex items-start"><span className="text-red-400 mr-2">•</span>Close the browser tab immediately</li>
                      <li className="flex items-start"><span className="text-red-400 mr-2">•</span>Report this site to authorities</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : result.threatLevel > 50 ? (
              <div className="p-6 bg-orange-900/30 border-2 border-orange-600/50 rounded-2xl backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center shrink-0 border border-orange-500/50">
                    <i className="ri-alert-line text-white text-xl"></i>
                  </div>
                  <div>
                    <h5 className="font-bold text-orange-300 mb-3 text-lg">Exercise caution</h5>
                    <ul className="text-orange-200 space-y-2">
                      <li className="flex items-start"><span className="text-orange-400 mr-2">•</span>Check URL for spelling errors</li>
                      <li className="flex items-start"><span className="text-orange-400 mr-2">•</span>Avoid entering sensitive data</li>
                      <li className="flex items-start"><span className="text-orange-400 mr-2">•</span>Verify SSL certificate</li>
                      <li className="flex items-start"><span className="text-orange-400 mr-2">•</span>Consider using an alternative site</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-green-900/30 border-2 border-green-600/50 rounded-2xl backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shrink-0 border border-green-500/50">
                    <i className="ri-checkbox-circle-line text-white text-xl"></i>
                  </div>
                  <div>
                    <h5 className="font-bold text-green-300 mb-3 text-lg">Site appears safe</h5>
                    <ul className="text-green-200 space-y-2">
                      <li className="flex items-start"><span className="text-green-400 mr-2">•</span>SSL certificate is valid</li>
                      <li className="flex items-start"><span className="text-green-400 mr-2">•</span>No suspicious patterns detected</li>
                      <li className="flex items-start"><span className="text-green-400 mr-2">•</span>Domain has good reputation</li>
                      <li className="flex items-start"><span className="text-green-400 mr-2">•</span>You can continue browsing</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 bg-blue-900/30 border-2 border-blue-600/50 rounded-2xl backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shrink-0 border border-blue-500/50">
                  <i className="ri-information-line text-white text-xl"></i>
                </div>
                <div>
                  <h5 className="font-bold text-blue-300 mb-3 text-lg">Additional information</h5>
                  <p className="text-blue-200 leading-relaxed">This report was generated based on analysis of various security factors. Always exercise caution when entering personal information online.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-10 pt-8 border-t border-zinc-700/50">
          <button className="px-8 py-4 bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-2xl hover:from-cyan-700 hover:to-cyan-800 transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center font-bold shadow-lg hover:shadow-xl border border-cyan-500/30">
            <i className="ri-download-line mr-3 text-lg"></i>
            Download report
          </button>
          <button className="px-8 py-4 bg-zinc-800/50 text-zinc-300 rounded-2xl hover:bg-zinc-700/50 transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center font-bold border border-zinc-600/50 hover:border-zinc-500/50">
            <i className="ri-share-line mr-3 text-lg"></i>
            Share
          </button>
          <button className="px-8 py-4 bg-red-900/30 text-red-300 rounded-2xl hover:bg-red-800/30 transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center font-bold border border-red-600/50 hover:border-red-500/50">
            <i className="ri-flag-line mr-3 text-lg"></i>
            Report phishing
          </button>
        </div>
      </div>
    </div>
  );
}
