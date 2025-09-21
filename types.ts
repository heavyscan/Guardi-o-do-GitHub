
export enum OverallStatus {
  SECURE = 'SECURE',
  WARNING = 'WARNING',
  VULNERABLE = 'VULNERABLE',
}

export interface AffectedPackage {
  name: string;
  version: string;
  reason: string;
}

export interface AnalysisResult {
  overallStatus: OverallStatus;
  summary: string;
  generalAnalysis: {
    score: number;
    findings: string[];
  };
  supplyChainAttackAnalysis: {
    vulnerable: boolean;
    details: string;
    affectedPackages: AffectedPackage[];
  };
}
