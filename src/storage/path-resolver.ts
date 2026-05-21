/**
 * Platform-specific path resolution for Bob storage
 */

import * as path from 'path';
import * as os from 'os';

/**
 * Get potential storage paths based on the current platform
 */
export function getStoragePaths(): string[] {
  const paths: string[] = [];
  
  if (process.platform === 'win32') {
    const appdata = process.env.APPDATA;
    if (appdata) {
      paths.push(
        path.join(appdata, 'Bob-IDE', 'User', 'globalStorage', 'ibm.bob-code'),
        path.join(appdata, 'IBM Bob', 'User', 'globalStorage', 'ibm.bob-code')
      );
    }
  } else if (process.platform === 'darwin') {
    const home = os.homedir();
    const appSupport = path.join(home, 'Library', 'Application Support');
    paths.push(
      path.join(appSupport, 'Bob-IDE', 'User', 'globalStorage', 'ibm.bob-code'),
      path.join(appSupport, 'IBM Bob', 'User', 'globalStorage', 'ibm.bob-code')
    );
  }
  
  return paths;
}

/**
 * Detect the current platform
 */
export function detectPlatform(): NodeJS.Platform {
  return process.platform;
}

/**
 * Resolve the tasks directory from a base storage path
 */
export function resolveTasksDirectory(basePath: string): string {
  return path.join(basePath, 'tasks');
}

// Made with Bob
