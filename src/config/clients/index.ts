import { austinSleep } from './austin-sleep';
import type { ClientConfig } from './types';

export type { ClientConfig };

// Multi-tenant scaffold: the active client is resolved here.
// For MVP, hardcoded to Austin Sleep. Later this will read from an env var,
// route param, or auth context.
export const activeClient: ClientConfig = austinSleep;
