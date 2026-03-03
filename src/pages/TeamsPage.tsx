import { useMemo, useState } from 'react';
import { usePlayers } from '../hooks/usePlayers';
import { teams } from '../data/players';
import { Card } from '../components/ui';
import { ChevronUp, ChevronDown } from 'lucide-react';

type SortField = 'wins' | 'salary' | 'avgEPD' | 'players';

export default function TeamsPage() {
  const { allPlayers } = usePlayers();
  const [sortField, setSortField] = useState<SortField>('wins');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  const teamStats = useMemo(() => {
    return teams.map(team => {
      const roster = allPlayers.filter(p => p.teamCode === team.code);
      const totalSalary = roster.reduce((sum, p) => sum + p.salary, 0);
      const avgEPD = roster.length > 0 
        ? roster.reduce((sum, p) => sum + p.epd.epd, 0) / roster.length 
        : 0;
      const topPlayer = roster.sort((a, b) => b.epd.epd - a.epd.epd)[0];

      return {
        ...team,
        roster,
        totalSalary,
        avgEPD,
        topPlayer,
      };
    });
  }, [allPlayers]);

  const sortTeams = (teamList: typeof teamStats) => {
    return [...teamList].sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortField) {
        case 'salary':
          aVal = a.totalSalary;
          bVal = b.totalSalary;
          break;
        case 'avgEPD':
          aVal = a.avgEPD;
          bVal = b.avgEPD;
          break;
        case 'players':
          aVal = a.roster.length;
          bVal = b.roster.length;
          break;
        default:
          aVal = a.wins;
          bVal = b.wins;
      }
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
  };

  const eastTeams = sortTeams(teamStats.filter(t => t.conference === 'East'));
  const westTeams = sortTeams(teamStats.filter(t => t.conference === 'West'));

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-[#333] ml-1">↕</span>;
    return sortDir === 'desc' 
      ? <ChevronDown size={12} className="ml-1 text-[#00d26a]" />
      : <ChevronUp size={12} className="ml-1 text-[#00d26a]" />;
  };

  const TeamTable = ({ teams: teamList, title }: { teams: typeof teamStats; title: string }) => (
    <div>
      <h2 className="text-sm font-medium text-white mb-3">{title}</h2>
      <Card className="overflow-x-auto">
        <table className="data-table w-full" style={{ minWidth: '580px' }}>
          <thead>
            <tr>
              <th className="w-8">#</th>
              <th className="text-left" style={{ minWidth: '160px' }}>Team</th>
              <th 
                className="cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('wins')}
                style={{ minWidth: '70px' }}
              >
                <div className="flex items-center justify-center">
                  W-L
                  <SortIcon field="wins" />
                </div>
              </th>
              <th 
                className="cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('players')}
                style={{ minWidth: '50px' }}
              >
                <div className="flex items-center justify-center">
                  Players
                  <SortIcon field="players" />
                </div>
              </th>
              <th 
                className="cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('salary')}
                style={{ minWidth: '80px' }}
              >
                <div className="flex items-center justify-center">
                  Salary
                  <SortIcon field="salary" />
                </div>
              </th>
              <th 
                className="cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('avgEPD')}
                style={{ minWidth: '70px' }}
              >
                <div className="flex items-center justify-center">
                  Avg EPD
                  <SortIcon field="avgEPD" />
                </div>
              </th>
              <th className="text-left" style={{ minWidth: '140px' }}>Top Player</th>
            </tr>
          </thead>
          <tbody>
            {teamList.map((team, index) => (
              <tr key={team.code}>
                <td className="text-[#444] font-mono text-[12px]">{index + 1}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-[13px] whitespace-nowrap">{team.city} {team.name}</span>
                    <span className="text-[#444] text-[11px]">{team.code}</span>
                  </div>
                </td>
                <td className="font-mono text-[13px] text-center">{team.wins}-{team.losses}</td>
                <td className="font-mono text-[13px] text-center">{team.roster.length}</td>
                <td className="font-mono text-[13px] text-center">${team.totalSalary.toFixed(1)}M</td>
                <td className="font-mono text-white text-[13px] text-center">{team.avgEPD.toFixed(1)}</td>
                <td className="text-[13px] text-[#888]">
                  {team.topPlayer ? team.topPlayer.name.split(' ').slice(-1)[0] : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">Team Analytics</h1>
          <p className="text-[13px] text-[#666] mt-1">Standings, roster value, and EPD breakdown by team</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <TeamTable teams={eastTeams} title="Eastern Conference" />
          <TeamTable teams={westTeams} title="Western Conference" />
        </div>
      </div>
    </div>
  );
}
