import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Security constants
const API_TIMEOUT_MS = 30000; // 30 seconds timeout
const MAX_REQUEST_SIZE = 1024 * 1024; // 1MB max request size

/**
 * Enhanced error handling with better error messages
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage: string;
    
    try {
      // Try to parse as JSON first
      const errorData = await res.json();
      errorMessage = errorData.message || res.statusText;
    } catch {
      // Fall back to plain text if not JSON
      errorMessage = (await res.text()) || res.statusText;
    }
    
    // Create a more descriptive error
    throw new Error(`API Error (${res.status}): ${errorMessage}`);
  }
}

/**
 * Helper to sanitize URL to prevent potential injection
 */
function sanitizeUrl(url: string): string {
  // Basic URL sanitization
  return url.replace(/[^\w\s:/.?=&%-]/gi, '');
}

/**
 * Check data size before sending to prevent DoS
 */
function validateDataSize(data: unknown): void {
  if (data) {
    const size = new TextEncoder().encode(JSON.stringify(data)).length;
    if (size > MAX_REQUEST_SIZE) {
      throw new Error(`Request data too large (${size} bytes). Maximum allowed is ${MAX_REQUEST_SIZE} bytes.`);
    }
  }
}

/**
 * Enhanced API request function with security features
 * - Timeout to prevent hanging requests
 * - URL sanitization 
 * - Size validation
 * - CSRF protection via custom headers
 */
export async function apiRequest(
  requestOptions: {
    url: string;
    method: string;
    body?: unknown;
  } | string,
  skipErrorHandling: boolean = false,
): Promise<Response> {
  let method: string;
  let sanitizedUrl: string;
  let data: unknown;
  
  // Handle the function being called with either object or string parameters
  if (typeof requestOptions === 'string') {
    method = 'GET';
    sanitizedUrl = sanitizeUrl(requestOptions);
    data = undefined;
  } else {
    method = requestOptions.method;
    sanitizedUrl = sanitizeUrl(requestOptions.url);
    data = requestOptions.body;
  }
  
  // Validate data size
  validateDataSize(data);
  
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  
  try {
    const res = await fetch(sanitizedUrl, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        // Basic CSRF protection
        "X-Requested-With": "XMLHttpRequest",
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: controller.signal,
    });

    if (!skipErrorHandling) {
      await throwIfResNotOk(res);
    }
    return res;
  } catch (error) {
    // Check if this was a timeout
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Request timeout after ${API_TIMEOUT_MS/1000} seconds`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Extract URL from query key and sanitize
    const url = sanitizeUrl(queryKey[0] as string);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    
    try {
      const res = await fetch(url, {
        credentials: "include",
        headers: {
          // Basic CSRF protection
          "X-Requested-With": "XMLHttpRequest",
        },
        signal: controller.signal,
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // Check if this was a timeout
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error(`Request timeout after ${API_TIMEOUT_MS/1000} seconds`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
