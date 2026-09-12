import { base44 } from '@/api/base44Client';
export async function integrity(action, args = {}) {
  try {
    const response = await base44.functions.invoke('rivetIntegrity', { action, ...args });
    if (response.data?.error) throw new Error(response.data.error);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message || 'Evaluation operation failed.');
  }
}