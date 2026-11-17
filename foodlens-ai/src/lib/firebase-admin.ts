import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

function loadFirebaseProjectId(): string {
  if (process.env.FIREBASE_PROJECT_ID) {
    return process.env.FIREBASE_PROJECT_ID;
  }
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (parsed && parsed.projectId) {
        return parsed.projectId;
      }
    }
  } catch (err) {
    console.warn('Could not read firebase-applet-config.json, using local fallback projectId:', err);
  }
  return 'foodlens-ai-local';
}

if (!getApps().length) {
  initializeApp({
    projectId: loadFirebaseProjectId(),
  });
}

export const adminAuth = getAuth();
