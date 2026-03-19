export type AgencyStatus = 'active' | 'watch' | 'critical';

export type CollectionStatus = 'Cumplio' | 'Parcial' | 'No pago';

export interface Agency {
  id: string;
  code: string;
  name: string;
  province: string;
  fleetId: string;
  fleetName: string;
  status: AgencyStatus;
  capLimit: number;
  provincePercentageOverride?: number;
  lastConsolidationDate: string;
  address: string;
  phone: string;
  managerName: string;
  managerDocument: string;
  managerEmail: string;
}

export interface Transfer {
  id: string;
  agencyId: string;
  date: string;
  amount: number;
  batchId?: string;
  notes?: string;
  createdAt: string;
}

export interface DailySale {
  id: string;
  agencyId: string;
  date: string;
  amount: number;
}

export interface OperationalSnapshot {
  id: string;
  agencyId: string;
  periodStart: string;
  periodEnd: string;
  consolidatedSales: number;
  pendingBefore: number;
  totalDue: number;
  transfersApplied: number;
  balanceAfterConsolidation: number;
  pendingAfter: number;
  creditAfter: number;
  collectionStatus: CollectionStatus;
  provinceAmount: number;
  capUsage: number;
  capRemaining: number;
}

export interface AppConfiguration {
  provinceName: string;
  defaultProvincePercentage: number;
  consolidationFrequencyDays: number;
  sessionPersistenceEnabled: boolean;
  currency: string;
}

export interface SessionState {
  isAuthenticated: boolean;
  username: string | null;
}

export interface AgencyMetrics {
  agency: Agency;
  applicableProvincePercentage: number;
  currentBalance: number;
  pendingBalance: number;
  creditBalance: number;
  totalSales: number;
  totalTransfers: number;
  totalProvinceDebt: number;
  capUsage: number;
  capRemaining: number;
  riskLevel: 'healthy' | 'attention' | 'critical';
  latestCycleSales: number;
  latestCyclePendingBefore: number;
  latestCycleTotalDue: number;
  latestCycleTransferred: number;
  latestCycleStatus: CollectionStatus;
  latestCycleEnd: string | null;
  salesOnDate: number;
  transfersOnDate: number;
  lastTransfer: Transfer | null;
}

export interface DemoState {
  agencies: Agency[];
  transfers: Transfer[];
  dailySales: DailySale[];
  snapshots: OperationalSnapshot[];
  configuration: AppConfiguration;
  session: SessionState;
}
