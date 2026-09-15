import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useEvaluationInfrastructure() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['evaluation-infrastructure'], queryFn: async () => {
    const [tests, releases, versions, workspaces] = await Promise.all([
      base44.entities.RegressionTest.list('-created_date', 200),
      base44.entities.ReleaseCandidate.list('-created_date', 50),
      base44.entities.ModelVersion.list('-updated_date', 500),
      base44.functions.invoke('rivetIntegrity', { action: 'workspaces' }).then(response => response.data),
    ]);
    return { tests, releases, versions, workspaces };
  }});
  const refresh = () => client.invalidateQueries({ queryKey: ['evaluation-infrastructure'] });
  const gate = useMutation({ mutationFn: async (payload) => (await base44.functions.invoke('evaluateReleaseCandidate', payload)).data, onSuccess: refresh });
  const toggle = useMutation({ mutationFn: ({ id, active }) => base44.entities.RegressionTest.update(id, { active }), onSuccess: refresh });
  return { ...query, gate, toggle };
}