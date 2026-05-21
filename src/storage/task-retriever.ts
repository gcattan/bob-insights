/**
 * Task retrieval and file operations
 */

import * as fs from 'fs';
import * as path from 'path';
import type { TaskInfo, Message } from '../types/index.js';
import { getStoragePaths, resolveTasksDirectory } from './path-resolver.js';

/**
 * Get all tasks from Bob storage
 */
export function getAllTasks(): TaskInfo[] {
  const tasks: TaskInfo[] = [];
  const storagePaths = getStoragePaths();
  
  for (const basePath of storagePaths) {
    const tasksRoot = resolveTasksDirectory(basePath);
    
    if (!fs.existsSync(tasksRoot)) {
      continue;
    }
    
    const taskDirs = fs.readdirSync(tasksRoot);
    
    for (const taskId of taskDirs) {
      const taskDir = path.join(tasksRoot, taskId);
      const apiFile = path.join(taskDir, 'api_conversation_history.json');
      
      if (fs.existsSync(apiFile)) {
        const stats = fs.statSync(apiFile);
        tasks.push({
          taskId,
          path: apiFile,
          mtime: stats.mtimeMs
        });
      }
    }
  }
  
  return tasks;
}

/**
 * Read a conversation file and parse it
 */
export function readConversation(taskPath: string): Message[] {
  const conversationData = fs.readFileSync(taskPath, 'utf-8');
  return JSON.parse(conversationData);
}

/**
 * Find a task by its ID
 */
export function findTaskById(taskId: string): TaskInfo | undefined {
  const tasks = getAllTasks();
  return tasks.find(t => t.taskId === taskId);
}

// Made with Bob
