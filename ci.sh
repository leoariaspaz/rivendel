pnpm install --frozen-lockfile
pnpm exec prisma generate
pnpm lint
pnpm exec tsc --noEmit
pnpm test:cov
pnpm test:e2e