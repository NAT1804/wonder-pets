// Self-hosted NestJS API Auth (production)
export * from './lib/api-auth/auth.models';
export * from './lib/api-auth/api-auth.service';
export * from './lib/api-auth/api-auth.interceptor';
export * from './lib/api-auth/api-auth.guard';

// Keycloak OIDC Auth (kept for self-study / research)
export * from './lib/config.service';
export * from './lib/auth.service';
export * from './lib/auth.guard';
