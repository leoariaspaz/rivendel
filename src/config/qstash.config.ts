import { ConfigType, registerAs } from '@nestjs/config';

export const qstashConfig = registerAs('qstash', () => ({
  currentKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
}));

export type QStashConfig = ConfigType<typeof qstashConfig>;
