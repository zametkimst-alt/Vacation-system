// src/core/storage.js
// Система зберігання даних для платформи

export class StorageManager {
  constructor(namespace = 'vacation-platform') {
    this.namespace = namespace;
  }

  getKey(module, key) {
    return `${this.namespace}:${module}:${key}`;
  }

  get(module, key) {
    try {
      const data = localStorage.getItem(this.getKey(module, key));
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage read error:', e);
      return null;
    }
  }

  set(module, key, value) {
    try {
      localStorage.setItem(this.getKey(module, key), JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage write error:', e);
      return false;
    }
  }

  delete(module, key) {
    try {
      localStorage.removeItem(this.getKey(module, key));
      return true;
    } catch (e) {
      console.error('Storage delete error:', e);
      return false;
    }
  }

  clear(module) {
    try {
      const keys = Object.keys(localStorage).filter(k =>
        k.startsWith(`${this.namespace}:${module}:`)
      );
      keys.forEach(k => localStorage.removeItem(k));
      return true;
    } catch (e) {
      console.error('Storage clear error:', e);
      return false;
    }
  }
}

export const storage = new StorageManager();
