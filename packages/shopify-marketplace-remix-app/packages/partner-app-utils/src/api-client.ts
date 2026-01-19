/**
 * Generic API client for making requests to sub-applications
 */

export interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Make a request to a sub-application with retry logic
 */
export async function makeAppRequest<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T | null> {
  const {
    timeout = 5000,
    retries = 2,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error as Error;
      console.error(`Failed to fetch from ${url} (attempt ${attempt + 1}/${retries + 1}):`, error);

      // If this isn't the last attempt, wait before retrying
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // All retries failed
  console.error(`All retries failed for ${url}:`, lastError);
  return null;
}

/**
 * Make a POST request to a sub-application
 */
export async function postAppRequest<T = any>(
  url: string,
  data: any,
  options: RequestOptions = {}
): Promise<T | null> {
  return makeAppRequest<T>(url, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Make a PUT request to a sub-application
 */
export async function putAppRequest<T = any>(
  url: string,
  data: any,
  options: RequestOptions = {}
): Promise<T | null> {
  return makeAppRequest<T>(url, {
    ...options,
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Make a DELETE request to a sub-application
 */
export async function deleteAppRequest<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T | null> {
  return makeAppRequest<T>(url, {
    ...options,
    method: "DELETE",
  });
}

/**
 * Check if a service is healthy
 */
export async function checkHealth(baseUrl: string): Promise<boolean> {
  try {
    const response = await makeAppRequest(`${baseUrl}/health`, {
      timeout: 3000,
      retries: 0,
    });
    return response !== null;
  } catch {
    return false;
  }
}
