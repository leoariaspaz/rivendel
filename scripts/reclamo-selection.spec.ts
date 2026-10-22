import {
  formatReclamoOption,
  parseExportArguments,
  ReclamoCandidate,
  selectReclamoCandidate,
} from './reclamo-selection';

const candidate = (overrides: Partial<ReclamoCandidate> = {}): ReclamoCandidate => ({
  id: 8,
  numero: 120,
  fechaHoraInicio: new Date('2026-10-20T12:00:00.000Z'),
  idResolucion: 2,
  usuario: { nombre: 'Dra. Ada' },
  partes: [{ parte: { nombre: 'Juan Pérez' } }, { parte: { nombre: 'Acme SA' } }],
  ...overrides,
});

describe('reclamo export selection', () => {
  it('accepts the legacy positional argument as an ID', () => {
    expect(parseExportArguments(['8', './output.json'])).toEqual({
      tipo: 'id',
      valor: 8,
      outputPath: './output.json',
    });
  });

  it('accepts an explicit claim number', () => {
    expect(parseExportArguments(['--numero', '120'])).toEqual({ tipo: 'numero', valor: 120, outputPath: undefined });
  });

  it('selects the only matching claim without prompting', async () => {
    const promptSelection = jest.fn();

    await expect(selectReclamoCandidate([candidate()], promptSelection)).resolves.toMatchObject({ id: 8 });
    expect(promptSelection).not.toHaveBeenCalled();
  });

  it('prompts when several claims share a number and returns the selected claim', async () => {
    const promptSelection = jest.fn().mockResolvedValue(1);
    const first = candidate();
    const second = candidate({ id: 9, usuario: { nombre: 'Dr. Turing' } });

    await expect(selectReclamoCandidate([first, second], promptSelection)).resolves.toBe(second);
    expect(promptSelection).toHaveBeenCalledWith([
      { reclamo: first, label: formatReclamoOption(first) },
      { reclamo: second, label: formatReclamoOption(second) },
    ]);
  });

  it('shows the creator, date, party names, and resolution in the option label', () => {
    const label = formatReclamoOption(candidate());

    expect(label).toContain('Usuario: Dra. Ada');
    expect(label).toContain('Fecha:');
    expect(label).toContain('Juan Pérez, Acme SA');
    expect(label).toContain('Resolución: Fracaso');
  });
});
