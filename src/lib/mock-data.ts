import type { Agency, AppConfiguration, DailySale, Transfer } from '@/types/domain';

const agenciesSeed = [
  { name: 'Santa Fe Centro', fleetId: 'litoral-norte', fleetName: 'Flota Litoral Norte', city: 'Santa Fe' },
  { name: 'Boulevard Galvez', fleetId: 'litoral-norte', fleetName: 'Flota Litoral Norte', city: 'Santa Fe' },
  { name: 'Guadalupe Norte', fleetId: 'litoral-norte', fleetName: 'Flota Litoral Norte', city: 'Santa Fe' },
  { name: 'Laguna Setubal', fleetId: 'litoral-norte', fleetName: 'Flota Litoral Norte', city: 'Santa Fe' },
  { name: 'Recreo Operativa', fleetId: 'litoral-norte', fleetName: 'Flota Litoral Norte', city: 'Recreo' },
  { name: 'Esperanza Comercial', fleetId: 'litoral-norte', fleetName: 'Flota Litoral Norte', city: 'Esperanza' },
  { name: 'Rafaela Norte', fleetId: 'litoral-norte', fleetName: 'Flota Litoral Norte', city: 'Rafaela' },
  { name: 'Sunchales Uno', fleetId: 'litoral-norte', fleetName: 'Flota Litoral Norte', city: 'Sunchales' },
  { name: 'San Justo Plaza', fleetId: 'litoral-norte', fleetName: 'Flota Litoral Norte', city: 'San Justo' },
  { name: 'Avellaneda Litoral', fleetId: 'litoral-norte', fleetName: 'Flota Litoral Norte', city: 'Avellaneda' },
  { name: 'Reconquista Centro', fleetId: 'litoral-norte', fleetName: 'Flota Litoral Norte', city: 'Reconquista' },
  { name: 'Venado Tuerto Sur', fleetId: 'corredor-sur', fleetName: 'Flota Corredor Sur', city: 'Venado Tuerto' },
  { name: 'Rosario Microcentro', fleetId: 'corredor-sur', fleetName: 'Flota Corredor Sur', city: 'Rosario' },
  { name: 'Rosario Costanera', fleetId: 'corredor-sur', fleetName: 'Flota Corredor Sur', city: 'Rosario' },
  { name: 'Pichincha Gestion', fleetId: 'corredor-sur', fleetName: 'Flota Corredor Sur', city: 'Rosario' },
  { name: 'San Lorenzo Puerto', fleetId: 'corredor-sur', fleetName: 'Flota Corredor Sur', city: 'San Lorenzo' },
  { name: 'Villa Gobernador', fleetId: 'corredor-sur', fleetName: 'Flota Corredor Sur', city: 'Villa Gobernador Galvez' },
  { name: 'Casilda Mercado', fleetId: 'corredor-sur', fleetName: 'Flota Corredor Sur', city: 'Casilda' },
  { name: 'Firmat Centro', fleetId: 'corredor-sur', fleetName: 'Flota Corredor Sur', city: 'Firmat' },
  { name: 'Canada de Gomez', fleetId: 'corredor-sur', fleetName: 'Flota Corredor Sur', city: 'Canada de Gomez' },
  { name: 'Arroyo Seco Sur', fleetId: 'corredor-sur', fleetName: 'Flota Corredor Sur', city: 'Arroyo Seco' },
  { name: 'Villa Constitucion', fleetId: 'corredor-sur', fleetName: 'Flota Corredor Sur', city: 'Villa Constitucion' },
  { name: 'Perez Operativa', fleetId: 'corredor-sur', fleetName: 'Flota Corredor Sur', city: 'Perez' },
  { name: 'Funes Comercial', fleetId: 'corredor-sur', fleetName: 'Flota Corredor Sur', city: 'Funes' },
];

const managerNames = ['Ana Belen Rios', 'Matias Sosa', 'Carla Fernandez', 'Luciano Romero', 'Mariela Gomez', 'Nicolas Peralta', 'Rocio Martinez', 'Pablo Acosta'];

const seedReference = new Date('2026-03-19T09:00:00.000Z');

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function createInitialConfiguration(): AppConfiguration {
  return {
    provinceName: 'Santa Fe',
    defaultProvincePercentage: 28,
    consolidationFrequencyDays: 3,
    sessionPersistenceEnabled: true,
    currency: 'ARS',
  };
}

export function createInitialAgencies(): Agency[] {
  return agenciesSeed.map((agencySeed, index) => ({
    id: `agency-${index + 1}`,
    code: `AG-${String(index + 1).padStart(3, '0')}`,
    name: agencySeed.name,
    province: 'Santa Fe',
    fleetId: agencySeed.fleetId,
    fleetName: agencySeed.fleetName,
    status: index % 8 === 0 ? 'critical' : index % 3 === 0 ? 'watch' : 'active',
    capLimit: 320000 + index * 18000,
    provincePercentageOverride: index % 7 === 0 ? 26 + (index % 4) * 1.5 : undefined,
    lastConsolidationDate: isoDay(seedReference),
    address: `${1200 + index * 17} ${agencySeed.city}`,
    phone: `+54 342 ${String(4100000 + index * 137).slice(0, 7)}`,
    managerName: managerNames[index % managerNames.length],
    managerDocument: `${30 + index}.${120 + index * 3}.${400 + index * 7}`,
    managerEmail: `agencia${index + 1}@santafe.demo`,
  }));
}

export function createInitialDailySales(agencies: Agency[]): DailySale[] {
  const random = mulberry32(42);
  const sales: DailySale[] = [];

  agencies.forEach((agency, agencyIndex) => {
    for (let dayOffset = 11; dayOffset >= 0; dayOffset -= 1) {
      const day = new Date(seedReference);
      day.setUTCDate(seedReference.getUTCDate() - dayOffset);
      const baseline = 69000 + agencyIndex * 4900 + (agency.fleetId === 'corredor-sur' ? 21000 : 9000);
      const variance = 0.88 + random() * 0.38;
      sales.push({
        id: `${agency.id}-sale-${isoDay(day)}`,
        agencyId: agency.id,
        date: isoDay(day),
        amount: Math.round(baseline * variance),
      });
    }
  });

  return sales;
}

export function createInitialTransfers(agencies: Agency[]): Transfer[] {
  return agencies.flatMap((agency, agencyIndex) => {
    const cycleEnds = [9, 6, 3, 0].map((dayOffset) => {
      const date = new Date(seedReference);
      date.setUTCDate(seedReference.getUTCDate() - dayOffset);
      return date;
    });

    return cycleEnds.map((date, cycleIndex) => {
      const amountBase = 198000 + agencyIndex * 11500;
      const ratioPattern = [0.92, 0.58, 0, 1.06];
      const ratio = ratioPattern[(agencyIndex + cycleIndex) % ratioPattern.length];
      const amount = Math.round(amountBase * ratio);

      return {
        id: `${agency.id}-transfer-${cycleIndex + 1}`,
        agencyId: agency.id,
        date: isoDay(date),
        amount,
        notes:
          ratio === 0
            ? 'Corte sin pago registrado'
            : ratio > 1
              ? 'Regularizacion con saldo a favor'
              : ratio < 0.7
                ? 'Transferencia parcial del cierre'
                : 'Cierre operativo del corte',
        createdAt: new Date(date.getTime() + (agencyIndex + cycleIndex) * 60_000).toISOString(),
      };
    });
  });
}
