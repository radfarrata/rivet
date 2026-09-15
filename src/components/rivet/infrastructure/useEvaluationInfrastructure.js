import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useEvaluationInfrastructure() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['evaluation-infrastructure'], queryFn: async () => {
    const [tests, releases, versions, workspaces] = await Promise.all([
      base44.entities.RegressionTest.filter({ active: true }, '-created_date', 200),
      base44.entities.ReleaseCandidate.list('-created_date', 50),
      base44.entities.ModelVersion.list('-updated_date', 500),
      base44.entities.EvaluationWorkspace.list('-updated_date', 100),
    ]);
    return { tests, releases, versions, workspaces };
  }});
  const gate = useMutation({ mutationFn: async (payload) => (await base44.functions.invoke('evaluateReleaseCandidate', payload)).data, onSuccess: () => client.invalidateQueries({ queryKey: ['evaluation-infrastructure'] }) });
  return { ...query, gate };
}