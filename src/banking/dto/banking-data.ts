export interface BankingData {
  cbu: string;
  codigoBancoDestino: string;
  cuenta: string;
  cuentaPBF: string;
  estadoCuenta: string;
  moneda: string;
  nombreBancoDestino: string;
  nombreTitular: string;
  redDestino: string;
  tipoPersona: string;
  tipoProducto: string;
  esTransaccional: boolean;
  titulares: Titulares[];
  uuid: string;
}

export interface Titulares {
  denominacion: string;
  idTributario: string;
}
