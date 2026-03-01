import { useMemo } from 'react';
import { usePlayers } from '../hooks/usePlayers';
import { teams } from '../data/players';
import { Card } from '../components/ui';

export default function TeamsPage() {
  const { allPlayers } = usePlayers();

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

  const eastTeams = teamStats.filter(t => t.conference === 'East').sort((a, b) => b.wins - a.wins);
  const westTeams = teamStats.filter(t => t.conference === 'West').sort((a, b) => b.wins - a.wins);

  const TeamTable = ({ teams: teamList, title }: { teams: typeof teamStats; title: string }) => (
    <div>
      <h2 className="text-sm font-medium text-white mb-3">{title}</h2>
      <Card className="overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>W-L</th>
              <th>Players</th>
              <th>Salary</th>
              <th>Avg EPD</th>
              <th>Top Player</th>
            </tr>
          </thead>
          <tbody>
            {teamList.map((team, index) => (
              <tr key={team.code}>
                <td className="text-[#444] font-mono text-[12px]">{index + 1}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-[13px]">{team.city} {team.name}</span>
                    <span className="text-[#444] text-[11px]">{team.code}</span>
                  </div>
                </td>
                <td className="font-mono text-[13px]">{team.wins}-{team.losses}</td>
                <td className="font-mono text-[13px]">{team.roster.length}</td>
                <td className="font-mono text-[13px]">${team.totalSalary.toFixed(1)}M</td>
                <td className="font-mono text-white text-[13px]">{team.avgEPD.toFixed(1)}</td>
                <td className="text-[13px] text-[#888]">
                  {team.topPlayer ? team.topPlayer.name : '-'}
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
          <p className="text-[13px] text-[#666] mt-1">Standings and roster value breakdown</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <TeamTable teams={eastTeams} title="Eastern Conference" />
          <TeamTable teams={westTeams} title="Western Conference" />
        </div>
      </div>
    </div>
  );
}
