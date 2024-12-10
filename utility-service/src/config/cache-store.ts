import NodeCache from "node-cache";
import { Service } from "typedi";

const store = new NodeCache();

@Service()
export class Cache {
  setWithExpiry(key: string, ttl: number, data: any): boolean {
    const success = store.set(key, data, ttl);
    return success;
  }

  get(key: string): any {
    return store.get(key);
  }

  del(keys: string[]): number {
    return store.del(keys);
  }
}
