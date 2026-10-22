import { RESOLUCIONES } from '../src/resoluciones/resoluciones.constants';

export interface ReclamoCandidate {
  id: number;
  numero: number;
  fechaHoraInicio: Date;
  idResolucion: number;
  usuario: { nombre: string | null } | null;
  partes: Array<{ parte: { nombre: string } }>;
}

export interface ReclamoSelectionOption {
  reclamo: ReclamoCandidate;
  label: string;
}

export interface ExportArguments {
  tipo: 'id' | 'numero';
  valor: number;
  outputPath?: string;
}

export function parseExportArguments(args: string[]): ExportArguments {
  let tipo: ExportArguments['tipo'] = 'id';
  let value: string | undefined;
  let outputPath: string | undefined;

  if (args[0] === '--id' || args[0] === '--numero') {
    tipo = args[0] === '--id' ? 'id' : 'numero';
    value = args[1];
    outputPath = args[2];
  } else {
    value = args[0];
    outputPath = args[1];
  }

  if (!value || !/^\d+$/.test(value)) {
    throw new Error('Indicá un ID o número de reclamo entero.');
  }
  if (args[0]?.startsWith('--') && args[0] !== '--id' && args[0] !== '--numero') {
    throw new Error(`Opción desconocida: ${args[0]}`);
  }

  return { tipo, valor: Number(value), outputPath };
}

export function formatReclamoOption(reclamo: ReclamoCandidate): string {
  const fecha = new Date(reclamo.fechaHoraInicio).toLocaleString('es-AR');
  const usuario = reclamo.usuario?.nombre ?? '(sin nombre)';
  const partes = reclamo.partes.map(({ parte }) => parte.nombre).join(', ') || '(sin partes)';
  const resolucion = RESOLUCIONES.find(({ value }) => value === reclamo.idResolucion)?.text ?? '(desconocida)';

  return `Reclamo #${reclamo.numero} (ID ${reclamo.id}) | Usuario: ${usuario} | Fecha: ${fecha} | Partes: ${partes} | Resolución: ${resolucion}`;
}

export async function selectReclamoCandidate(
  candidates: ReclamoCandidate[],
  promptSelection: (options: ReclamoSelectionOption[]) => Promise<number>
): Promise<ReclamoCandidate> {
  if (candidates.length === 0) {
    throw new Error('No se encontraron reclamos que coincidan con el número indicado.');
  }
  if (candidates.length === 1) {
    return candidates[0];
  }

  const options = candidates.map((reclamo) => ({ reclamo, label: formatReclamoOption(reclamo) }));
  const selectedIndex = await promptSelection(options);
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= options.length) {
    throw new Error('La selección del reclamo no es válida.');
  }

  return options[selectedIndex].reclamo;
}
