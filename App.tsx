import React, { useState, useCallback } from 'react';
import { analyzeRepository } from './services/geminiService';
import { AnalysisResult, OverallStatus, AffectedPackage } from './types';
import { GitHubIcon, ShieldCheckIcon, ExclamationTriangleIcon, SkullIcon, CheckCircleIcon, XCircleIcon } from './components/IconComponents';
import { LoadingIndicator } from './components/LoadingIndicator';

const StatusDisplay: React.FC<{ status: OverallStatus }> = ({ status }) => {
  const statusConfig = {
    [OverallStatus.SECURE]: {
      text: "Seguro",
      icon: <ShieldCheckIcon className="w-10 h-10" />,
      textColor: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
    [OverallStatus.WARNING]: {
      text: "Atenção",
      icon: <ExclamationTriangleIcon className="w-10 h-10" />,
      textColor: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
    },
    [OverallStatus.VULNERABLE]: {
      text: "Vulnerável",
      icon: <SkullIcon className="w-10 h-10" />,
      textColor: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`p-6 rounded-lg border ${config.bgColor} ${config.borderColor} flex flex-col items-center justify-center text-center`}>
      <div className={`${config.textColor}`}>{config.icon}</div>
      <h2 className={`mt-4 text-3xl font-bold ${config.textColor}`}>{config.text}</h2>
    </div>
  );
};

const ResultCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-indigo-300 mb-4">{title}</h3>
        {children}
    </div>
);


export default function App() {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const isValidGitHubUrl = (url: string) => {
    const pattern = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9_.-]+(\/)?$/;
    return pattern.test(url);
  }

  const handleAnalysis = useCallback(async () => {
    if (!repoUrl || !isValidGitHubUrl(repoUrl)) {
      setError("Por favor, insira uma URL de repositório do GitHub válida.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeRepository(repoUrl);
      setAnalysisResult(result);
    } catch (e: any) {
      setError(e.message || "Ocorreu um erro desconhecido durante a análise.");
    } finally {
      setIsLoading(false);
    }
  }, [repoUrl]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-indigo-500/20 rounded-full ring-8 ring-indigo-500/10">
                 <ShieldCheckIcon className="w-8 h-8 text-indigo-300" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Guardião do GitHub
            </h1>
            <p className="mt-4 text-lg text-gray-400">
                Scanner de segurança com IA para detectar código malicioso e vulnerabilidades na cadeia de suprimentos em seus repositórios.
            </p>
        </div>

        <div className="max-w-2xl mx-auto mt-12">
          <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                  <GitHubIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => {
                        setRepoUrl(e.target.value);
                        if (error) setError(null);
                    }}
                    placeholder="https://github.com/usuario/repositorio"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />
              </div>
            <button
              onClick={handleAnalysis}
              disabled={isLoading}
              className="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analisando...
                </>
              ) : 'Analisar Repositório'}
            </button>
          </div>
           {error && <p className="mt-2 text-red-400 text-sm text-center sm:text-left">{error}</p>}
        </div>

        <div className="max-w-3xl mx-auto mt-12">
            {isLoading && <LoadingIndicator />}

            {analysisResult && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                    <div className="md:col-span-1">
                        <StatusDisplay status={analysisResult.overallStatus} />
                    </div>
                    <div className="md:col-span-2">
                        <ResultCard title="Resumo da Análise">
                           <p className="text-gray-300">{analysisResult.summary}</p>
                        </ResultCard>
                    </div>

                    <div className="md:col-span-3">
                        <ResultCard title="Análise do Ataque à Cadeia de Suprimentos de Setembro de 2025">
                            <div className="space-y-4">
                               <div className={`flex items-start p-4 rounded-md ${analysisResult.supplyChainAttackAnalysis.vulnerable ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                                    {analysisResult.supplyChainAttackAnalysis.vulnerable ? 
                                      <XCircleIcon className="w-6 h-6 text-red-400 mr-3 flex-shrink-0" /> :
                                      <CheckCircleIcon className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                                    }
                                    <p className="text-gray-300">{analysisResult.supplyChainAttackAnalysis.details}</p>
                                </div>
                                {analysisResult.supplyChainAttackAnalysis.affectedPackages.length > 0 && (
                                  <div>
                                      <h4 className="font-semibold text-gray-300 mb-2">Pacotes Potencialmente Afetados:</h4>
                                      <ul className="space-y-2">
                                          {analysisResult.supplyChainAttackAnalysis.affectedPackages.map((pkg: AffectedPackage) => (
                                              <li key={pkg.name} className="p-3 bg-gray-900/50 border border-gray-700 rounded-md">
                                                <div className="flex justify-between items-center">
                                                  <code className="text-sm font-mono text-purple-300">{pkg.name}@{pkg.version}</code>
                                                  <span className="text-xs font-medium text-red-400 bg-red-500/20 px-2 py-1 rounded-full">Vulnerável</span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1 pl-1 border-l-2 border-gray-600 ml-1">{pkg.reason}</p>
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
                                )}
                            </div>
                        </ResultCard>
                    </div>

                    <div className="md:col-span-3">
                        <ResultCard title="Verificação Geral de Vulnerabilidades">
                           <div className="flex items-center justify-between mb-4">
                               <span className="text-gray-400">Pontuação de Segurança</span>
                               <span className="text-2xl font-bold text-indigo-400">{analysisResult.generalAnalysis.score}/100</span>
                           </div>
                           <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div className="bg-indigo-500 h-2.5 rounded-full" style={{width: `${analysisResult.generalAnalysis.score}%`}}></div>
                           </div>
                           <ul className="mt-6 space-y-3">
                                {analysisResult.generalAnalysis.findings.map((finding, index) => (
                                    <li key={index} className="flex items-start">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                                        <span className="text-gray-300">{finding}</span>
                                    </li>
                                ))}
                           </ul>
                        </ResultCard>
                    </div>

                </div>
            )}
        </div>
      </main>
    </div>
  );
}