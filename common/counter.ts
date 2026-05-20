import fs from 'fs/promises';
import path from 'path';

const COUNTER_PATH = path.join(process.cwd(), 'updates-counter.json');

/** Ensure the counter file exists, create with defaults if missing */
async function ensureCounterFile() {
  try {
    await fs.access(COUNTER_PATH);
  } catch {
    await fs.writeFile(
      COUNTER_PATH,
      JSON.stringify({ totalUpdates: 0, lastUpdated: null }, null, 2),
      'utf8',
    );
  }
}

export async function incrementUpdateCounter() {
  await ensureCounterFile();
  const raw = await fs.readFile(COUNTER_PATH, 'utf8');
  const data = JSON.parse(raw) as { totalUpdates: number; lastUpdated: string | null };
  data.totalUpdates += 1;
  data.lastUpdated = new Date().toISOString();
  await fs.writeFile(COUNTER_PATH, JSON.stringify(data, null, 2), 'utf8');
  return data;
}

export async function getUpdateCounter() {
  await ensureCounterFile();
  const raw = await fs.readFile(COUNTER_PATH, 'utf8');
  return JSON.parse(raw) as { totalUpdates: number; lastUpdated: string | null };
}
