export const REFRESH_COOKIE_OPTIONS = {
	httpOnly: true,
	sameSite: 'strict' as const,
	secure: process.env.NODE_ENV === 'production',
	path: '/auth/refresh',
};