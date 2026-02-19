export const AUTH_SYSTEM = (import.meta.env.VITE_AUTH_SYSTEM || 'passcode') as 'passcode' | 'magic-link';

export const isNewAuthSystem = AUTH_SYSTEM === 'magic-link';
export const isPasscodeSystem = AUTH_SYSTEM === 'passcode';
