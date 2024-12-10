export interface ICache {
  get(key: string): Promise<any>;
  setWithExpiry(key: string, timeout: number, value: string): Promise<any>;
  resetCacheForKey(key: string): Promise<any>;
  resetCacheForKeysByPattern(key: string): Promise<any>;
}
