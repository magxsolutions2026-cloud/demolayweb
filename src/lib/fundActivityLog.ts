import { query } from '@/lib/db';

export async function logFundActivity(actionType: string, message: string) {
  const msg = message.slice(0, 512);
  const type = actionType.slice(0, 32);
  await query('INSERT INTO fund_activity (action_type, message) VALUES (?, ?)', [type, msg]);
}
