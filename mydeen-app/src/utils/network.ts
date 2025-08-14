/**
 * Simple network connectivity utility
 * Tests connectivity by making a lightweight request
 */
export async function isNetworkAvailable(): Promise<boolean> {
  try {
    // Use a lightweight ping to test connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('Network check failed:', error);
    return false;
  }
}