import { SetMetadata } from '@nestjs/common';

export const SKIP_JWT_KEY = 'skipJwt';
export const SkipJwt = () => SetMetadata(SKIP_JWT_KEY, true);
