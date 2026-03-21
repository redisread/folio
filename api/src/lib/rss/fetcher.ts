import { parseFeed, type ParsedFeed } from "./parser";

const MAX_RETRIES = 3;
const TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 1000;

/** 带超时和重试的 RSS 抓取器 */
export async function fetchFeed(feedUrl: string): Promise<ParsedFeed> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await Promise.race([
        parseFeed(feedUrl),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`抓取超时（${TIMEOUT_MS}ms）`)), TIMEOUT_MS)
        ),
      ]);
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw new Error(`抓取失败（已重试 ${MAX_RETRIES} 次）: ${lastError?.message}`);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
