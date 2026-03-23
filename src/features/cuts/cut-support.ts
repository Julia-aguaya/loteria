import type { Agency, CollectionStatus, DemoState, OperationalSnapshot } from '@/types/domain';

export interface CutSummary {
  periodStart: string;
  periodEnd: string;
  agencyCount: number;
  totalSales: number;
  totalDue: number;
  totalTransferred: number;
  totalPendingAfter: number;
  complied: number;
  partial: number;
  unpaid: number;
}

export interface CutAgencyRow {
  snapshot: OperationalSnapshot;
  agency: Agency;
}

export interface CutDetailModel {
  cutDates: string[];
  salesByAgencyDate: Map<string, Map<string, number>>;
  transfersByAgencyDate: Map<string, Map<string, number>>;
  agencyRows: CutAgencyRow[];
}

export function getCutSummaries(state: DemoState, fleetId: string) {
  const agencyIdsByFleet = new Set(
    state.agencies
      .filter((agency) => fleetId === 'all' || agency.fleetId === fleetId)
      .map((agency) => agency.id),
  );

  const byPeriodEnd = new Map<string, CutSummary>();

  state.snapshots
    .filter((snapshot) => agencyIdsByFleet.has(snapshot.agencyId))
    .forEach((snapshot) => {
      const existing = byPeriodEnd.get(snapshot.periodEnd);

      if (!existing) {
        byPeriodEnd.set(snapshot.periodEnd, {
          periodEnd: snapshot.periodEnd,
          periodStart: snapshot.periodStart,
          agencyCount: 1,
          totalSales: snapshot.consolidatedSales,
          totalDue: Math.max(snapshot.totalDue, 0),
          totalTransferred: snapshot.transfersApplied,
          totalPendingAfter: snapshot.pendingAfter,
          complied: snapshot.collectionStatus === 'Cumplio' ? 1 : 0,
          partial: snapshot.collectionStatus === 'Parcial' ? 1 : 0,
          unpaid: snapshot.collectionStatus === 'No pago' ? 1 : 0,
        });
        return;
      }

      byPeriodEnd.set(snapshot.periodEnd, {
        ...existing,
        periodStart: snapshot.periodStart < existing.periodStart ? snapshot.periodStart : existing.periodStart,
        agencyCount: existing.agencyCount + 1,
        totalSales: existing.totalSales + snapshot.consolidatedSales,
        totalDue: existing.totalDue + Math.max(snapshot.totalDue, 0),
        totalTransferred: existing.totalTransferred + snapshot.transfersApplied,
        totalPendingAfter: existing.totalPendingAfter + snapshot.pendingAfter,
        complied: existing.complied + (snapshot.collectionStatus === 'Cumplio' ? 1 : 0),
        partial: existing.partial + (snapshot.collectionStatus === 'Parcial' ? 1 : 0),
        unpaid: existing.unpaid + (snapshot.collectionStatus === 'No pago' ? 1 : 0),
      });
    });

  return [...byPeriodEnd.values()].sort((left, right) => right.periodEnd.localeCompare(left.periodEnd));
}

export function getCutDetailModel(state: DemoState, cut: CutSummary, fleetId: string): CutDetailModel {
  const cutDates = [...new Set(
    state.dailySales
      .filter((sale) => sale.date >= cut.periodStart && sale.date <= cut.periodEnd)
      .map((sale) => sale.date),
  )].sort();

  const salesByAgencyDate = new Map<string, Map<string, number>>();
  state.dailySales
    .filter((sale) => sale.date >= cut.periodStart && sale.date <= cut.periodEnd)
    .forEach((sale) => {
      if (!salesByAgencyDate.has(sale.agencyId)) {
        salesByAgencyDate.set(sale.agencyId, new Map());
      }

      const agencySales = salesByAgencyDate.get(sale.agencyId);
      if (!agencySales) return;
      agencySales.set(sale.date, (agencySales.get(sale.date) ?? 0) + sale.amount);
    });

  const transfersByAgencyDate = new Map<string, Map<string, number>>();
  state.transfers
    .filter((transfer) => transfer.date >= cut.periodStart && transfer.date <= cut.periodEnd)
    .forEach((transfer) => {
      if (!transfersByAgencyDate.has(transfer.agencyId)) {
        transfersByAgencyDate.set(transfer.agencyId, new Map());
      }

      const agencyTransfers = transfersByAgencyDate.get(transfer.agencyId);
      if (!agencyTransfers) return;
      agencyTransfers.set(transfer.date, (agencyTransfers.get(transfer.date) ?? 0) + transfer.amount);
    });

  const agencyById = new Map(state.agencies.map((agency) => [agency.id, agency]));
  const statusWeight = (status: CollectionStatus) => (status === 'No pago' ? 0 : status === 'Parcial' ? 1 : 2);

  const agencyRows = state.snapshots
    .filter((snapshot) => snapshot.periodEnd === cut.periodEnd)
    .filter((snapshot) => {
      if (fleetId === 'all') return true;
      return agencyById.get(snapshot.agencyId)?.fleetId === fleetId;
    })
    .map((snapshot) => {
      const agency = agencyById.get(snapshot.agencyId);
      return agency ? { snapshot, agency } : null;
    })
    .filter((row): row is CutAgencyRow => Boolean(row))
    .sort((left, right) => {
      const statusDiff = statusWeight(left.snapshot.collectionStatus) - statusWeight(right.snapshot.collectionStatus);
      if (statusDiff !== 0) return statusDiff;
      return right.snapshot.pendingAfter - left.snapshot.pendingAfter;
    });

  return {
    cutDates,
    salesByAgencyDate,
    transfersByAgencyDate,
    agencyRows,
  };
}

export function getCutStatusTone(status: CollectionStatus) {
  if (status === 'Cumplio') return 'success' as const;
  if (status === 'Parcial') return 'warning' as const;
  return 'danger' as const;
}
