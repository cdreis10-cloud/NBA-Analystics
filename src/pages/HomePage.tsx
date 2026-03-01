import { Link } from 'react-router-dom';
import { usePlayers } from '../hooks/usePlayers';
import { Card, StatCard, PlayerAvatar, TierBadge, BreakoutBadge } from '../components/ui';

export default function HomePage() {
  const { allPlayers, topValuePlayers, topBreakoutPlayers } = usePlayers();

  // Calculate summary stats
  const totalPlayers = allPlayers.length;
  const totalSalary = allPlayers.reduce((sum: number, p) => sum + p.salary, 0);
  const avgEPD = allPlayers.reduce((sum: number, p) => sum + p.epd.epd, 0) / totalPlayers;
  const elitePlayers = allPlayers.filter(p => p.epd.tier === 'Elite').length;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">NBA Analytics Overview</h1>
          <p className="text-[13px] text-[#666] mt-1">2024-25 Season · Player value and breakout tracking</p>
        </div>

        {/* Summary Stats */}
        <Card className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            <StatCard label="Players Tracked" value={totalPlayers} />
            <StatCard label="Total Salary" value={`$${(totalSalary / 1000).toFixed(1)}B`} />
            <StatCard label="Avg EPD" value={avgEPD.toFixed(1)} />
            <StatCard label="Elite Tier" value={elitePlayers} subValue={`${((elitePlayers/totalPlayers)*100).toFixed(0)}%`} />
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Top EPD */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-white">Top EPD Rankings</h2>
              <Link to="/epd" className="text-[12px] text-[#666] hover:text-white">View all →</Link>
            </div>
            <Card>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>EPD</th>
                    <th>Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {topValuePlayers.slice(0, 10).map((player, index) => (
                    <tr key={player.id}>
                      <td className="text-[#444] font-mono text-[12px]">{index + 1}</td>
                      <td>
                        <Link 
                          to={`/player/${player.id}`}
                          className="flex items-center gap-2 hover:text-white"
                        >
                          <PlayerAvatar name={player.name} teamCode={player.teamCode} size="sm" nbaId={player.nbaId} />
                          <div>
                            <div className="text-white text-[13px]">{player.name}</div>
                            <div className="text-[11px] text-[#444]">{player.teamCode} · ${player.salary}M</div>
                          </div>
                        </Link>
                      </td>
                      <td className="font-mono text-white text-[13px]">{player.epd.epd.toFixed(1)}</td>
                      <td><TierBadge tier={player.epd.tier} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Top Breakout */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-white">Top Breakout Candidates</h2>
              <Link to="/breakout" className="text-[12px] text-[#666] hover:text-white">View all →</Link>
            </div>
            <Card>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Score</th>
                    <th>Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {topBreakoutPlayers.slice(0, 10).map((player, index) => (
                    <tr key={player.id}>
                      <td className="text-[#444] font-mono text-[12px]">{index + 1}</td>
                      <td>
                        <Link 
                          to={`/player/${player.id}`}
                          className="flex items-center gap-2 hover:text-white"
                        >
                          <PlayerAvatar name={player.name} teamCode={player.teamCode} size="sm" nbaId={player.nbaId} />
                          <div>
                            <div className="text-white text-[13px]">{player.name}</div>
                            <div className="text-[11px] text-[#444]">{player.teamCode} · Age {player.age}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="font-mono text-[#00d26a] text-[13px]">{player.breakout.breakoutScore.toFixed(1)}</td>
                      <td><BreakoutBadge tier={player.breakout.breakoutTier} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
