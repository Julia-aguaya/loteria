import { create } from 'zustand';
import { buildSnapshots } from '@/lib/business';
import { createInitialAgencies, createInitialConfiguration, createInitialDailySales, createInitialTransfers } from '@/lib/mock-data';
import type { Agency, AppConfiguration, DailySale, DemoState, SessionState, Transfer } from '@/types/domain';

const SESSION_STORAGE_KEY = 'lotovibe-session';
const DEMO_USERNAME = 'demo@lotovibe.app';
const DEMO_PASSWORD = 'lotovibe-2026';

function getStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage.getItem(SESSION_STORAGE_KEY);
}

function persistSession(session: SessionState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

function randomFromString(input: string) {
  return input.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildInitialState(): DemoState {
  const agencies = createInitialAgencies();
  const configuration = createInitialConfiguration();
  const dailySales = createInitialDailySales(agencies);
  const transfers = createInitialTransfers(agencies);
  const snapshots = buildSnapshots(agencies, dailySales, transfers, configuration);
  const storedSession = getStoredSession();
  const session: SessionState = storedSession ? JSON.parse(storedSession) : { isAuthenticated: false, username: null };

  return {
    agencies,
    transfers,
    dailySales,
    snapshots,
    configuration,
    session,
  };
}

interface DemoActions {
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addTransfer: (transfer: Omit<Transfer, 'id' | 'createdAt'>) => void;
  addTransfers: (transfers: Array<Omit<Transfer, 'id' | 'createdAt'>>) => void;
  updateConfiguration: (payload: Partial<AppConfiguration>) => void;
  updateAgencySettings: (agencyId: string, payload: Partial<Pick<Agency, 'capLimit' | 'provincePercentageOverride' | 'status'>>) => void;
  simulateDay: () => void;
}

export const useDemoStore = create<DemoState & DemoActions>((set, get) => ({
  ...buildInitialState(),
  login: (username, password) => {
    if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      return false;
    }

    const session = { isAuthenticated: true, username };
    if (get().configuration.sessionPersistenceEnabled) {
      persistSession(session);
    }
    set({ session });
    return true;
  },
  logout: () => {
    clearStoredSession();
    set({ session: { isAuthenticated: false, username: null } });
  },
  addTransfer: (transfer) => {
    get().addTransfers([transfer]);
  },
  addTransfers: (incomingTransfers) => {
    set((state) => {
      const createdAt = new Date().toISOString();
      const batchId = incomingTransfers.length > 1 ? `batch-${Date.now()}` : undefined;
      const transfers = [
        ...incomingTransfers.map((transfer, index) => ({
          ...transfer,
          id: `manual-${Date.now()}-${index}`,
          batchId,
          createdAt,
        })),
        ...state.transfers,
      ];

      return {
        transfers,
        snapshots: buildSnapshots(state.agencies, state.dailySales, transfers, state.configuration),
      };
    });
  },
  updateConfiguration: (payload) => {
    set((state) => {
      const configuration = { ...state.configuration, ...payload };
      const agencies = state.agencies.map((agency) => ({
        ...agency,
        province: configuration.provinceName,
      }));

      if (!configuration.sessionPersistenceEnabled) {
        clearStoredSession();
      } else if (state.session.isAuthenticated) {
        persistSession(state.session);
      }

      return {
        agencies,
        configuration,
        snapshots: buildSnapshots(agencies, state.dailySales, state.transfers, configuration),
      };
    });
  },
  updateAgencySettings: (agencyId, payload) => {
    set((state) => {
      const agencies = state.agencies.map((agency) =>
        agency.id === agencyId
          ? {
              ...agency,
              ...payload,
            }
          : agency,
      );

      return {
        agencies,
        snapshots: buildSnapshots(agencies, state.dailySales, state.transfers, state.configuration),
      };
    });
  },
  simulateDay: () => {
    set((state) => {
      const latestDate = state.dailySales
        .map((sale) => sale.date)
        .sort((a, b) => b.localeCompare(a))[0] ?? isoDay(new Date());
      const nextDate = new Date(`${latestDate}T00:00:00.000Z`);
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);
      const dayStamp = isoDay(nextDate);

      const additions: DailySale[] = state.agencies.map((agency, index) => {
        const seed = randomFromString(`${agency.id}-${dayStamp}`) + index * 97;
        const normalized = 0.86 + (Math.sin(seed) + 1) * 0.23;
        const latestPeriod = state.snapshots.filter((snapshot) => snapshot.agencyId === agency.id).slice(-1)[0];
        const baseline = latestPeriod?.consolidatedSales ? latestPeriod.consolidatedSales / 3 : agency.capLimit * 0.31;
        return {
          id: `${agency.id}-sale-${dayStamp}`,
          agencyId: agency.id,
          date: dayStamp,
          amount: Math.round(baseline * normalized),
        };
      });

      const dailySales = [...state.dailySales, ...additions];
      const snapshots = buildSnapshots(state.agencies, dailySales, state.transfers, state.configuration);
      const latestSnapshotByAgency = new Map(snapshots.map((snapshot) => [snapshot.agencyId, snapshot]));

      const agencies = state.agencies.map((agency) => ({
        ...agency,
        lastConsolidationDate: latestSnapshotByAgency.get(agency.id)?.periodEnd ?? agency.lastConsolidationDate,
      }));

      return { agencies, dailySales, snapshots };
    });
  },
}));

export const demoCredentials = {
  username: DEMO_USERNAME,
  password: DEMO_PASSWORD,
};
