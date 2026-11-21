import { useQuery } from '@tanstack/react-query';
import { matchService } from '../services/matchService';

export function useUnreadMessages(): number {
  const { data } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchService.getMatches(),
    refetchInterval: 30_000,
    select: (d) => d.matches.filter((m) => !m.isSwapped).length,
  });
  return data ?? 0;
}
