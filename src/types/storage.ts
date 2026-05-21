/**
 * Storage-related type definitions
 */

export interface TaskInfo {
  taskId: string;
  path: string;
  mtime: number;
}

export interface StorageConfig {
  platform: NodeJS.Platform;
  paths: string[];
}

// Made with Bob
