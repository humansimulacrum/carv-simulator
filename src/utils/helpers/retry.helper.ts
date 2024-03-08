import { sleep } from "./sleep.helper";

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  retryDelay: number = 1000,
): Promise<T> {
  let error;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      console.error(`Attempt ${i + 1} of ${retries} failed:`, err);
      error = err;
      if (i < retries - 1) {
        await sleep(retryDelay);
      }
    }
  }
  throw error;
}
