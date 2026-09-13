export const RIVET_MODELS = [
  { id: 'gpt_5_mini', label: 'GPT-5 Mini' },
  { id: 'gpt_5_4', label: 'GPT-5' },
  { id: 'claude-sonnet-5', label: 'Claude' },
  { id: 'gemini_3_flash', label: 'Gemini' },
];

export const DOMAINS = [
  { id: 'reasoning', label: 'Reasoning' },
  { id: 'coding', label: 'Coding' },
  { id: 'mathematics', label: 'Mathematics' },
  { id: 'biology', label: 'Biology' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'physics', label: 'Physics' },
  { id: 'medicine', label: 'Medicine' },
  { id: 'multimodal', label: 'Multimodal' },
  { id: 'long_context', label: 'Long-Context' },
  { id: 'safety', label: 'Safety' },
  { id: 'scientific_reasoning', label: 'Scientific Reasoning' },
  { id: 'agentic', label: 'Agentic' },
  { id: 'open_weight_core', label: 'Open-Weight Core' },
  { id: 'other', label: 'Other' },
];

export const DIFFICULTIES = ['basic', 'intermediate', 'advanced'];

export const domainLabel = (id) => DOMAINS.find(d => d.id === id)?.label || id;
export const modelLabel = (id) => RIVET_MODELS.find(m => m.id === id)?.label || id;