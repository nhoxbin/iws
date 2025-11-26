import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  role?: string;
  exp: number;
  iat: number;
}

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded) return true;

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const getUserFromToken = (token: string) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    id: parseInt(decoded.sub, 10),
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
  };
};

export const getTokenExpiry = (token: string): Date | null => {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return new Date(decoded.exp * 1000);
};

/**
 * Check if token will expire soon (within 5 minutes)
 * This is useful for proactive token refresh
 */
export const isTokenExpiringSoon = (token: string, minutesThreshold: number = 5): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded) return true;

    const expiryTime = decoded.exp * 1000;
    const now = Date.now();
    const threshold = minutesThreshold * 60 * 1000; // Convert minutes to milliseconds

    return expiryTime - now < threshold;
  } catch {
    return true;
  }
};
