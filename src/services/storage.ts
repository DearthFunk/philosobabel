import { IntegrationData } from '../types/integrations';

class StorageService {
  private readonly STORAGE_PREFIX = 'philosobabel-integration-';
  private readonly STORAGE_AVAILABLE = typeof(Storage) !== 'undefined';

  private getStorageKey(integrationId: string, word: string): string {
    return `${this.STORAGE_PREFIX}${integrationId}-${word.toLowerCase()}`;
  }

  getCachedData(integrationId: string, word: string): IntegrationData | null {
    if (!this.STORAGE_AVAILABLE) return null;
    
    try {
      const key = this.getStorageKey(integrationId, word);
      const cached = sessionStorage.getItem(key);
      if (cached) {
        const data = JSON.parse(cached) as IntegrationData;
        console.log(`Session cache hit for ${integrationId}:${word}`);
        return data;
      }
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
    }
    return null;
  }

  setCachedData(integrationId: string, word: string, data: IntegrationData): void {
    if (!this.STORAGE_AVAILABLE) return;
    
    try {
      const key = this.getStorageKey(integrationId, word);
      sessionStorage.setItem(key, JSON.stringify(data));
      console.log(`Set Cached data for ${integrationId}:${word}`);
    } catch (error) {
      console.error('Error writing to sessionStorage:', error);
      // If storage is full, clear some integration data
      this.clearOldestCacheEntries();
    }
  }

  private clearOldestCacheEntries(): void {
    if (!this.STORAGE_AVAILABLE) return;
    
    // Get all integration keys from sessionStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove first 10 entries to free up space
    keysToRemove.slice(0, 10).forEach(key => {
      sessionStorage.removeItem(key);
    });
  }

  clearCachedData(integrationId: string, word: string): boolean {
    if (!this.STORAGE_AVAILABLE) return false;
    
    try {
      const key = this.getStorageKey(integrationId, word);
      const existed = sessionStorage.getItem(key) !== null;
      if (existed) {
        sessionStorage.removeItem(key);
        console.log(`Cleared cached data for ${integrationId}:${word}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing cached data:', error);
      return false;
    }
  }

  clearSessionCache(): void {
    if (!this.STORAGE_AVAILABLE) return;
    
    // Clear all integration data from session storage
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
    });
    
    console.log('Session cache cleared');
  }

  getSessionCacheStats(): {
    totalItems: number;
    integrationItems: number;
    storageUsed: string;
  } {
    if (!this.STORAGE_AVAILABLE) {
      return { totalItems: 0, integrationItems: 0, storageUsed: '0 KB' };
    }
    
    let integrationItems = 0;
    let storageUsed = 0;
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        if (value) {
          storageUsed += key.length + value.length;
          if (key.startsWith(this.STORAGE_PREFIX)) {
            integrationItems++;
          }
        }
      }
    }
    
    return {
      totalItems: sessionStorage.length,
      integrationItems,
      storageUsed: `${Math.round(storageUsed / 1024)} KB`
    };
  }

  // Custom terms file storage
  private readonly CUSTOM_TERMS_PREFIX = 'philosobabel-custom-terms-';

  storeCustomTermsFile(fileName: string, data: { [key: string]: string }): void {
    if (!this.STORAGE_AVAILABLE) return;
    
    try {
      const key = `${this.CUSTOM_TERMS_PREFIX}${fileName}`;
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Stored custom terms file: ${fileName}`);
    } catch (error) {
      console.error('Error storing custom terms file:', error);
      throw new Error('Failed to store custom terms file');
    }
  }

  getCustomTermsFile(fileName: string): { [key: string]: string } | null {
    if (!this.STORAGE_AVAILABLE) return null;
    
    try {
      const key = `${this.CUSTOM_TERMS_PREFIX}${fileName}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading custom terms file:', error);
    }
    return null;
  }

  removeCustomTermsFile(fileName: string): void {
    if (!this.STORAGE_AVAILABLE) return;
    
    try {
      const key = `${this.CUSTOM_TERMS_PREFIX}${fileName}`;
      localStorage.removeItem(key);
      console.log(`Removed custom terms file: ${fileName}`);
    } catch (error) {
      console.error('Error removing custom terms file:', error);
    }
  }

  clearAllCustomTermsFiles(): void {
    if (!this.STORAGE_AVAILABLE) return;
    
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.CUSTOM_TERMS_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('All custom terms files cleared');
  }
}

export const storageService = new StorageService();
