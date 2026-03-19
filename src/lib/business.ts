import type {
  Agency,
  AgencyMetrics,
  AppConfiguration,
  CollectionStatus,
  DailySale,
  DemoState,
  OperationalSnapshot,
  Transfer,
} from '@/types/domain';

function sortByDate<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => a.date.localeCompare(b.date));
}

function sumAmounts<T>(items: T[], getAmount: (item: T) => number) {
  return items.reduce((sum, item) => sum + getAmount(item), 0);
}

function maxDate(values: string[]) {
  return values.slice().sort((a, b) => b.localeCompare(a))[0] ?? null;
}

function minDate(values: string[]) {
  return values.slice().sort((a, b) => a.localeCompare(b))[0] ?? null;
}

function uniqueSortedDates(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function groupAmountsByDate(items: Array<{ date: string; amount: number }>) {
  return items.reduce<Map<string, number>>((accumulator, item) => {
    accumulator.set(item.date, (accumulator.get(item.date) ?? 0) + item.amount);
    return accumulator;
  }, new Map<string, number>());
}

function getCollectionStatus(totalDue: number, transferred: number): CollectionStatus {
  const positiveDue = Math.max(totalDue, 0);

  if (positiveDue <= 0 || transferred >= positiveDue) {
    return 'Cumplio';
  }

  if (transferred > 0) {
    return 'Parcial';
  }

  return 'No pago';
}

function getRiskLevel(capUsage: number, pendingBalance: number) {
  if (capUsage >= 100 || pendingBalance >= 350000) {
    return 'critical' as const;
  }

  if (capUsage >= 85 || pendingBalance >= 180000) {
    return 'attention' as const;
  }

  return 'healthy' as const;
}

function getAgencySales(state: DemoState, agencyId: string, upToDate?: string) {
  return sortByDate(state.dailySales.filter((sale) => sale.agencyId === agencyId && (!upToDate || sale.date <= upToDate)));
}

function getAgencyTransfersInternal(state: DemoState, agencyId: string, upToDate?: string) {
  return sortByDate(state.transfers.filter((transfer) => transfer.agencyId === agencyId && (!upToDate || transfer.date <= upToDate)));
}

function buildCycleDefinitions(dates: string[], frequency: number) {
  const sortedDates = uniqueSortedDates(dates);
  const definitions: Array<{ periodStart: string; periodEnd: string; dates: string[] }> = [];

  for (let index = 0; index < sortedDates.length; index += frequency) {
    const windowDates = sortedDates.slice(index, index + frequency);
    if (windowDates.length === 0) {
      continue;
    }

    definitions.push({
      periodStart: windowDates[0],
      periodEnd: windowDates[windowDates.length - 1],
      dates: windowDates,
    });
  }

  return definitions;
}

export function getApplicableProvincePercentage(agency: Agency, configuration: AppConfiguration) {
  return agency.provincePercentageOverride ?? configuration.defaultProvincePercentage;
}

export function buildSnapshots(
  agencies: Agency[],
  dailySales: DailySale[],
  transfers: Transfer[],
  configuration: AppConfiguration,
): OperationalSnapshot[] {
  const frequency = configuration.consolidationFrequencyDays;

  return agencies.flatMap((agency) => {
    const agencySales = sortByDate(dailySales.filter((sale) => sale.agencyId === agency.id));
    const agencyTransfers = sortByDate(transfers.filter((transfer) => transfer.agencyId === agency.id));
    const salesByDate = groupAmountsByDate(agencySales);
    const transferByDate = groupAmountsByDate(agencyTransfers);
    const percentage = getApplicableProvincePercentage(agency, configuration) / 100;
    let runningBalance = 0;

    return buildCycleDefinitions(
      agencySales.map((sale) => sale.date),
      frequency,
    ).map((definition) => {
      const consolidatedSales = sumAmounts(definition.dates, (date) => salesByDate.get(date) ?? 0);
      const transfersApplied = sumAmounts(definition.dates, (date) => transferByDate.get(date) ?? 0);
      const totalDue = runningBalance + consolidatedSales;
      const balanceAfterConsolidation = totalDue - transfersApplied;
      const pendingAfter = Math.max(balanceAfterConsolidation, 0);
      const creditAfter = Math.max(-balanceAfterConsolidation, 0);

      const snapshot: OperationalSnapshot = {
        id: `${agency.id}-${definition.periodEnd}`,
        agencyId: agency.id,
        periodStart: definition.periodStart,
        periodEnd: definition.periodEnd,
        consolidatedSales,
        pendingBefore: Math.max(runningBalance, 0),
        totalDue,
        transfersApplied,
        balanceAfterConsolidation,
        pendingAfter,
        creditAfter,
        collectionStatus: getCollectionStatus(totalDue, transfersApplied),
        provinceAmount: Math.round(consolidatedSales * percentage),
        capUsage: (consolidatedSales / agency.capLimit) * 100,
        capRemaining: agency.capLimit - consolidatedSales,
      };

      runningBalance = balanceAfterConsolidation;
      return snapshot;
    });
  });
}

export function getFleetOptions(state: DemoState) {
  const fleets = new Map<string, string>();

  state.agencies.forEach((agency) => {
    fleets.set(agency.fleetId, agency.fleetName);
  });

  return [...fleets.entries()].map(([id, name]) => ({ id, name }));
}

export function getLatestBusinessDate(state: DemoState) {
  return maxDate([...state.dailySales.map((sale) => sale.date), ...state.transfers.map((transfer) => transfer.date)]);
}

export function getAgencyDailyRows(state: DemoState, agencyId: string, upToDate?: string) {
  const grouped = new Map<string, { sales: number; transfers: number }>();

  getAgencySales(state, agencyId, upToDate).forEach((sale) => {
    const current = grouped.get(sale.date) ?? { sales: 0, transfers: 0 };
    grouped.set(sale.date, { ...current, sales: current.sales + sale.amount });
  });

  getAgencyTransfersInternal(state, agencyId, upToDate).forEach((transfer) => {
    const current = grouped.get(transfer.date) ?? { sales: 0, transfers: 0 };
    grouped.set(transfer.date, { ...current, transfers: current.transfers + transfer.amount });
  });

  let runningBalance = 0;

  return [...grouped.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, values]) => {
      runningBalance += values.sales - values.transfers;

      return {
        date,
        sales: values.sales,
        transfers: values.transfers,
        balance: runningBalance,
        pending: Math.max(runningBalance, 0),
        credit: Math.max(-runningBalance, 0),
      };
    })
    .reverse();
}

export function getAgencySnapshots(state: DemoState, agencyId: string, upToDate?: string) {
  return state.snapshots
    .filter((snapshot) => snapshot.agencyId === agencyId && (!upToDate || snapshot.periodEnd <= upToDate))
    .sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
}

export function getAgencyTransfers(state: DemoState, agencyId: string, upToDate?: string) {
  return state.transfers
    .filter((transfer) => transfer.agencyId === agencyId && (!upToDate || transfer.date <= upToDate))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function getCycleProgressForDate(state: DemoState, agency: Agency, selectedDate: string) {
  const sales = getAgencySales(state, agency.id, selectedDate);
  if (sales.length === 0) {
    return {
      salesToDate: 0,
      pendingBefore: 0,
      totalDue: 0,
      periodStart: null,
      periodEnd: null,
      capUsage: 0,
      capRemaining: agency.capLimit,
    };
  }

  const definitions = buildCycleDefinitions(
    sales.map((sale) => sale.date),
    state.configuration.consolidationFrequencyDays,
  );
  const snapshotsAsc = getAgencySnapshots(state, agency.id, selectedDate).slice().reverse();
  const activeDefinition =
    definitions.find((definition) => definition.periodStart <= selectedDate && selectedDate <= definition.periodEnd) ?? definitions[definitions.length - 1];
  const previousSnapshot = snapshotsAsc.find((snapshot) => snapshot.periodEnd < (activeDefinition?.periodStart ?? ''));
  const salesToDate = sumAmounts(
    sales.filter((sale) => activeDefinition?.dates.includes(sale.date)),
    (sale) => sale.amount,
  );
  const carryBalance = previousSnapshot?.balanceAfterConsolidation ?? 0;

  return {
    salesToDate,
    pendingBefore: Math.max(carryBalance, 0),
    totalDue: carryBalance + salesToDate,
    periodStart: activeDefinition?.periodStart ?? null,
    periodEnd: activeDefinition?.periodEnd ?? null,
    capUsage: (salesToDate / agency.capLimit) * 100,
    capRemaining: agency.capLimit - salesToDate,
  };
}

export function deriveAgencyMetrics(state: DemoState, selectedDate = getLatestBusinessDate(state) ?? new Date().toISOString().slice(0, 10)): AgencyMetrics[] {
  return state.agencies.map((agency) => {
    const percentage = getApplicableProvincePercentage(agency, state.configuration);
    const agencySales = getAgencySales(state, agency.id, selectedDate);
    const agencyTransfers = getAgencyTransfersInternal(state, agency.id, selectedDate);
    const salesOnDate = sumAmounts(agencySales.filter((sale) => sale.date === selectedDate), (sale) => sale.amount);
    const transfersOnDate = sumAmounts(agencyTransfers.filter((transfer) => transfer.date === selectedDate), (transfer) => transfer.amount);
    const totalSales = sumAmounts(agencySales, (sale) => sale.amount);
    const totalTransfers = sumAmounts(agencyTransfers, (transfer) => transfer.amount);
    const currentBalance = totalSales - totalTransfers;
    const latestSnapshot = getAgencySnapshots(state, agency.id, selectedDate)[0] ?? null;
    const cycleProgress = getCycleProgressForDate(state, agency, selectedDate);
    const lastTransfer = getAgencyTransfers(state, agency.id, selectedDate)[0] ?? null;
    const pendingBalance = Math.max(currentBalance, 0);
    const creditBalance = Math.max(-currentBalance, 0);

    return {
      agency,
      applicableProvincePercentage: percentage,
      currentBalance,
      pendingBalance,
      creditBalance,
      totalSales,
      totalTransfers,
      totalProvinceDebt: Math.round(totalSales * (percentage / 100)),
      capUsage: cycleProgress.capUsage,
      capRemaining: cycleProgress.capRemaining,
      riskLevel: getRiskLevel(cycleProgress.capUsage, pendingBalance),
      latestCycleSales: latestSnapshot?.consolidatedSales ?? 0,
      latestCyclePendingBefore: latestSnapshot?.pendingBefore ?? 0,
      latestCycleTotalDue: latestSnapshot?.totalDue ?? 0,
      latestCycleTransferred: latestSnapshot?.transfersApplied ?? 0,
      latestCycleStatus: latestSnapshot?.collectionStatus ?? 'No pago',
      latestCycleEnd: latestSnapshot?.periodEnd ?? null,
      salesOnDate,
      transfersOnDate,
      lastTransfer,
    };
  });
}

export function getAgencyDetailSummary(state: DemoState, agencyId: string, selectedDate = getLatestBusinessDate(state) ?? new Date().toISOString().slice(0, 10)) {
  const metric = deriveAgencyMetrics(state, selectedDate).find((item) => item.agency.id === agencyId) ?? null;
  if (!metric) {
    return null;
  }

  const cycleProgress = getCycleProgressForDate(state, metric.agency, selectedDate);

  return {
    metric,
    cycleProgress,
    dailyRows: getAgencyDailyRows(state, agencyId, selectedDate),
    cycles: getAgencySnapshots(state, agencyId, selectedDate),
    transfers: getAgencyTransfers(state, agencyId, selectedDate).slice(0, 8),
  };
}

export function getDashboardOverview(state: DemoState, fleetId = 'all', referenceDate?: string, periodStart?: string) {
  const latestDate = referenceDate ?? getLatestBusinessDate(state) ?? new Date().toISOString().slice(0, 10);
  const metrics = deriveAgencyMetrics(state, latestDate);
  const filteredMetrics = metrics.filter((metric) => (fleetId === 'all' ? true : metric.agency.fleetId === fleetId));
  const filteredAgencyIds = new Set(filteredMetrics.map((metric) => metric.agency.id));
  const latestCycleEnd = maxDate(
    state.snapshots.filter((snapshot) => filteredAgencyIds.has(snapshot.agencyId) && snapshot.periodEnd <= latestDate).map((snapshot) => snapshot.periodEnd),
  );
  const latestCut = state.snapshots.filter(
    (snapshot) => filteredAgencyIds.has(snapshot.agencyId) && snapshot.periodEnd === latestCycleEnd,
  );
  const latestCycleStart = minDate(latestCut.map((snapshot) => snapshot.periodStart));
  const latestTransfers = state.transfers
    .filter(
      (transfer) =>
        filteredAgencyIds.has(transfer.agencyId) &&
        transfer.date <= latestDate &&
        (!periodStart || transfer.date >= periodStart),
    )
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  return {
    latestDate,
    latestCycleEnd,
    latestCycleStart,
    selectedMetrics: filteredMetrics,
    latestCutAgencies: latestCut.length,
    latestCutAtRisk: latestCut.filter((item) => item.collectionStatus !== 'Cumplio').length,
    lastCutSummary: {
      sales: sumAmounts(latestCut, (item) => item.consolidatedSales),
      totalDue: sumAmounts(latestCut, (item) => Math.max(item.totalDue, 0)),
      transferred: sumAmounts(latestCut, (item) => item.transfersApplied),
      pending: sumAmounts(latestCut, (item) => item.pendingAfter),
      paid: latestCut.filter((item) => item.collectionStatus === 'Cumplio').length,
      partial: latestCut.filter((item) => item.collectionStatus === 'Parcial').length,
      unpaid: latestCut.filter((item) => item.collectionStatus === 'No pago').length,
    },
    provinceSummary: {
      salesBase: filteredMetrics.reduce((sum, item) => sum + item.totalSales, 0),
      estimatedProvinceAmount: filteredMetrics.reduce((sum, item) => sum + item.totalProvinceDebt, 0),
      percentage: state.configuration.defaultProvincePercentage,
    },
    topCapAgencies: filteredMetrics.slice().sort((a, b) => b.capUsage - a.capUsage).slice(0, 10),
    latestTransfers,
  };
}

export function getTransferBatchContext(state: DemoState, agencyId: string, selectedDate: string) {
  const agency = state.agencies.find((item) => item.id === agencyId);
  if (!agency) {
    return null;
  }

  const metric = deriveAgencyMetrics(state, selectedDate).find((item) => item.agency.id === agencyId) ?? null;
  const cycleProgress = getCycleProgressForDate(state, agency, selectedDate);

  return {
    agency,
    metric,
    pendingBefore: cycleProgress.pendingBefore,
    newCut: cycleProgress.salesToDate,
    totalDue: cycleProgress.totalDue,
  };
}

export function buildTransferTrend(transfers: Transfer[]) {
  const grouped = new Map<string, number>();
  transfers.forEach((transfer) => {
    grouped.set(transfer.date, (grouped.get(transfer.date) ?? 0) + transfer.amount);
  });

  return [...grouped.entries()].map(([date, amount]) => ({ date, amount }));
}

export function buildDailyTrend(metrics: AgencyMetrics[], sales: DailySale[]) {
  const grouped = new Map<string, { sales: number; agencies: number }>();

  sales.forEach((entry) => {
    const current = grouped.get(entry.date) ?? { sales: 0, agencies: 0 };
    grouped.set(entry.date, {
      sales: current.sales + entry.amount,
      agencies: current.agencies + 1,
    });
  });

  const balancePulse = metrics.reduce((sum, item) => sum + item.currentBalance, 0) / Math.max(metrics.length, 1);

  return [...grouped.entries()].map(([date, value]) => ({
    date,
    sales: value.sales,
    averageSales: value.sales / Math.max(value.agencies, 1),
    balancePulse,
  }));
}
