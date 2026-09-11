import React, { useMemo, useState } from 'react';
import { useEvaluationTasks, useModelResults } from '../useEvaluations';
import { useHumanEvaluations } from '../useHumanEvaluations';
import { visibleTo } from '../evalStats';
import { buildVerdicts, markUpsets, buildMovements, interleave } from '../feed/verdictFeed';
import VerdictRow from '../feed/VerdictRow';
import MovementCard from '../feed/MovementCard';
import FeedTabs from '../home/FeedTabs';
import RivetEmptyState from '../RivetEmptyState';
import EvaluationTaskDetail from '../EvaluationTaskDetail';

const TABS = [
  { id: 'foryou', label: 'For you' },
  { id: 'disagreements', label: 'Disagreements' },
  { id: 'movements', label: 'Movements' },
];

export default function VerdictFeedView({ currentUser, onNavigate }) {
  const { data: tasks = [], isLoading } = useEvaluationTasks();
  const { data: results = [] } = useModelResults();
  const { data: humanEvals = [] } = useHumanEvaluations();
  const [tab, setTab] = useState('foryou');
  const [selected, setSelected] = useState(null);

  const { verdicts, movements } = useMemo(() => {
    const v = markUpsets(buildVerdicts(visibleTo(tasks, currentUser), results, humanEvals));
    return { verdicts: v, movements: buildMovements(v) };
  }, [tasks, results, humanEvals, currentUser]);

  const items = useMemo(() => {
    if (tab === 'movements') return movements.map((m, i) => ({ kind: 'movement', key: `m-${i}`, data: m }));
    const sorted = [...verdicts];
    if (tab === 'disagreements') {
      return sorted
        .filter(v => v.spread >= 10 || v.overruled || (v.margin !== null && v.margin <= 2))
        .sort((a, b) => (b.overruled - a.overruled) || (b.spread - a.spread))
        .map(v => ({ kind: 'verdict', key: `v-${v.task.id}`, data: v }));
    }
    sorted.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return interleave(sorted, movements);
  }, [tab, verdicts, movements]);

  return (
    <div className="max-w-[640px] mx-auto border-x border-[#2f3336] min-h-screen">
      <div className="px-4 pt-4 pb-3 border-b border-[#2f3336]">
        <h1 className="text-xl font-bold text-white">Feed</h1>
        <p className="text-[13px] text-[#71767b] mt-0.5">Every row is a claim about a model — with the evidence attached.</p>
      </div>

      <FeedTabs tabs={TABS} active={tab} onChange={setTab} />

      {isLoading ? (
        <RivetEmptyState loading title="Loading the feed…" />
      ) : items.length === 0 ? (
        <RivetEmptyState
          title={tab === 'movements' ? 'No score movements yet' : tab === 'disagreements' ? 'No disagreements yet' : 'No verdicts yet'}
          description={tab === 'movements'
            ? 'Once models are evaluated repeatedly, their shifts show up here.'
            : 'Run an evaluation and the verdict — plus the reasoning behind it — lands in this feed.'}
        />
      ) : items.map(item =>
        item.kind === 'verdict' ? (
          <VerdictRow key={item.key} verdict={item.data} onOpen={setSelected} onDisagree={setSelected} />
        ) : (
          <MovementCard key={item.key} movement={item.data} onOpen={() => onNavigate?.('capability-map')} />
        )
      )}

      {selected && <EvaluationTaskDetail task={selected} currentUser={currentUser} onClose={() => setSelected(null)} />}
    </div>
  );
}