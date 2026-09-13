import React, { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import Icon from '@/components/Icon';
import { useCreateEvaluationTask } from '../useEvaluations';
import { DOMAINS } from '../evalModels';
import TemplatePicker from './TemplatePicker';
import DocumentUpload from './DocumentUpload';

const EVAL_TYPES = [
  { id: 'hybrid', label: 'Human + Automated' },
  { id: 'automated', label: 'Automated only' },
  { id: 'human', label: 'Human only' },
];

const TABS = [
  { id: 'new', label: 'New Task', icon: 'edit' },
  { id: 'upload', label: 'Upload Document', icon: 'paperclip' },
  { id: 'template', label: 'From Template', icon: 'template' },
];

type LabeledSelectProps = {
  icon: string;
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
};

function LabeledSelect({ icon, label, value, options, onChange }: LabeledSelectProps) {
  const selected = options.find((o) => o.id === value)?.label ?? '';

  return (
    <label className="group relative flex items-center gap-2.5 rounded-xl border border-[#2f3336] bg-black px-3 py-2.5 cursor-pointer flex-1 min-w-0 transition-colors hover:border-[#71767b]">
      <Icon name={icon} size={15} className="text-[#71767b] flex-shrink-0 transition-colors group-hover:text-[#b0b4b9]" />
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] uppercase tracking-wide text-[#71767b] leading-none">{label}</span>
        <span className="block text-[13px] text-white font-semibold truncate mt-0.5">{selected}</span>
      </span>
      <ChevronDown size={14} className="text-[#71767b] transition-colors group-hover:text-[#b0b4b9]" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type HomeHeroProps = {
  currentUser?: { full_name?: string | null };
  onNavigate?: (route: string) => void;
};

export default function HomeHero({ currentUser, onNavigate }: HomeHeroProps) {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('biology');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [evaluationType, setEvaluationType] = useState('hybrid');
  const [tab, setTab] = useState<'new' | 'upload' | 'template'>('new');
  const [fromUpload, setFromUpload] = useState(false);

  const create = useCreateEvaluationTask();

  const handleRun = () => {
    if (!prompt.trim()) return;

    create.mutate(
      {
        title: (title || prompt).trim().slice(0, 80),
        prompt: prompt.trim(),
        domain,
        difficulty,
        evaluationType,
        visibility: fromUpload ? 'private' : 'public',
        models: ['gpt_5_mini', 'claude-sonnet-5', 'gemini_3_flash'],
        status: 'pending',
        creatorName: currentUser?.full_name || 'You',
      },
      {
        onSuccess: () => {
          setPrompt('');
          setTitle('');
          onNavigate?.('evaluation-lab');
        },
      }
    );
  };

  const applyTemplate = (t: { label: string; prompt: string; domain: string; difficulty: string }) => {
    setTitle(t.label);
    setPrompt(t.prompt);
    setDomain(t.domain);
    setDifficulty(t.difficulty);
    setTab('new');
  };

  const displayName = currentUser?.full_name || 'You';
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="border-b border-[#2f3336] px-4 py-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#2f3336] pb-px mb-4">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id as typeof tab)}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold transition-colors ${
              tab === id ? 'text-white' : 'text-[#71767b] hover:text-white'
            }`}
          >
            <Icon name={icon} size={13} />
            {label}
            {tab === id && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#b06d97]" />}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'upload' && (
        <div className="mb-4">
          <DocumentUpload
            onExtracted={(d) => {
              setTitle(d.title);
              setPrompt(d.prompt);
              setFromUpload(true);
              setTab('new');
            }}
          />
        </div>
      )}

      {tab === 'template' && (
        <div className="mb-4">
          <TemplatePicker onPick={applyTemplate} />
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#2f3336] bg-[#1f232e] text-sm font-bold text-white">
          {initial}
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder='Describe your task… (e.g. “Given this paper and these constraints, which experimental design is most defensible?”)'
          className="flex-1 resize-none bg-transparent pt-2 text-[15px] leading-relaxed text-white placeholder-[#71767b] focus:outline-none"
        />
      </div>

      {/* Helper + error */}
      {fromUpload && (
        <p className="mt-2 text-xs text-[#71767b]">Document-derived tasks are private to you.</p>
      )}
      {create.isError && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {create.error.message}
        </p>
      )}

      {/* Controls + action */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:pl-[52px]">
        <LabeledSelect
          icon="layers"
          label="Domain"
          value={domain}
          options={DOMAINS}
          onChange={setDomain}
        />
        <LabeledSelect
          icon="shield"
          label="Evaluation Type"
          value={evaluationType}
          options={EVAL_TYPES}
          onChange={setEvaluationType}
        />

        <button
          onClick={handleRun}
          disabled={create.isPending || !prompt.trim()}
          className="ml-auto flex flex-shrink-0 items-center justify-center gap-2 rounded-full bg-[#653653] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#7c4165] disabled:opacity-40"
        >
          {create.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Icon name="play" size={12} />
          )}
          Run Evaluation
        </button>
      </div>
    </div>
  );
}
