import LRUCache from 'lru-cache';
import shortId from 'shortid';
import options from '../config/options';

const userCache = new LRUCache({
  maxAge: options.snapshot().storage.specs.stdTTL,
});

function save<T>(
  id: string,
  session: T,
  ttl: number = options.snapshot().storage.specs.stdTTL
): string {
  userCache.set(id, session, ttl);
  return id;
}
function push<T>(session: T, ttl: number): string {
  return save(shortId(), session, ttl);
}
function find<T>(id: string): T | undefined {
  const value = id ? userCache.get(id) : undefined;
  return value as T | undefined;
}

export default { save, push, find };
