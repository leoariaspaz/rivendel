import { ConfigType, registerAs } from '@nestjs/config';

type OriginValue = string[] | RegExp;

function parseCorsAllowedOrigins(envValue: string): OriginValue {
  const trimmed = envValue.trim();

  // Si empieza y termina con "/", lo tratamos como regex: /pattern/flags
  const regexMatch = trimmed.match(/^\/(.+)\/([a-z]*)$/i);
  if (regexMatch) {
    const [, pattern, flags] = regexMatch;
    return new RegExp(pattern, flags);
  }

  // Si no, lo tratamos como lista separada por comas
  return trimmed.split(',').map((s) => s.trim());
}

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'local',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  allowedOrigins: parseCorsAllowedOrigins(process.env.ALLOWED_ORIGINS || 'http://localhost:5173'),
}));

export type AppConfig = ConfigType<typeof appConfig>;
