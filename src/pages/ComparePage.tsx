import { useState } from 'react';
import { usePlayers } from '../hooks/usePlayers';
import { Card, PlayerAvatar, TierBadge } from '../components/ui';
import type { PlayerWithMetrics } from '../types';

export default function ComparePage() {
  const { allPlayers } = usePlayers();
  const [player1, setPlayer1] = useState<PlayerWithMetrics | null>(null);
  const [player2, setPlayer2] = useState<PlayerWithMetrics | null>(null);
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');

  const filteredPlayers1 = search1 
    ? allPlayers.filter(p => p.name.toLowerCase().includes(search1.toLowerCase())).slice(0, 5)
    : [];
  
  const filteredPlayers2 = search2 
    ? allPlayers.filter(p => p.name.toLowerCase().includes(search2.toLowerCase())).slice(0, 5)
    : [];

  const selectPlayer = (player: PlayerWithMetrics, slot: 1 | 2) => {
    if (slot === 1) {
      setPlayer1(player);
      setSearch1('');
    } else {
      setPlayer2(player);
      setSearch2('');
    }
  };

  const ComparisonRow = ({ label, val1, val2, format = 'number', higherIsBetter = true }: { 
    label: string; 
    val1?: number; 
    val2?: number;
    format?: 'number' | 'money' | 'percent';
    higherIsBetter?: boolean;
  }) => {
    const formatVal = (val?: number) => {
      if (val === undefined) return '-';
      if (format === 'money') return `$${val.toFixed(1)}M`;
      if (format === 'percent') return `${val.toFixed(1)}%`;
      return val.toFixed(1);
    };

    const getColor = (v1?: number, v2?: number, isFirst?: boolean) => {
      if (v1 === undefined || v2 === undefined) return 'text-white';
      const better = higherIsBetter ? v1 > v2 : v1 < v2;
      const worse = higherIsBetter ? v1 < v2 : v1 > v2;
      if (isFirst && better) return 'text-[#00d26a]';
      if (isFirst && worse) return 'text-[#ff3b3b]';
      if (!isFirst && better) return 'text-[#ff3b3b]';
      if (!isFirst && worse) return 'text-[#00d26a]';
      return 'text-white';
    };

    return (
      <tr>
        <td className={`font-mono text-[13px] ${getColor(val1, val2, true)}`}>{formatVal(val1)}</td>
        <td className="text-[#666] text-[12px] text-center">{label}</td>
        <td className={`font-mono text-[13px] text-right ${getColor(val2, val1, false)}`}>{formatVal(val2)}</td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1000px] mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">Compare Players</h1>
          <p className="text-[13px] text-[#666] mt-1">Side-by-side statistical comparison</p>
        </div>

        {/* Player Selection */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Player 1 */}
          <Card className="p-4">
            {player1 ? (
              <div className="flex items-center gap-3">
                <PlayerAvatar name={player1.name} teamCode={player1.teamCode} size="md" nbaId={player1.nbaId} />
                <div className="flex-1">
                  <div className="text-white text-[14px]">{player1.name}</div>
                  <div className="text-[11px] text-[#666]">{player1.teamCode} · {player1.position}</div>
                </div>
                <button onClick={() => setPlayer1(null)} className="text-[#666] hover:text-white text-[12px]">×</button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search player..."
                  value={search1}
                  onChange={(e) => setSearch1(e.target.value)}
                  className="w-full"
                />
                {filteredPlayers1.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#0a0a0a] border border-[#1a1a1a] z-10">
                    {filteredPlayers1.map(p => (
                      <button
                        key={p.id}
                        onClick={() => selectPlayer(p, 1)}
                        className="w-full px-3 py-2 text-left hover:bg-[#111] flex items-center gap-2"
                      >
                        <PlayerAvatar name={p.name} teamCode={p.teamCode} size="sm" nbaId={p.nbaId} />
                        <span className="text-white text-[13px]">{p.name}</span>
                        <span className="text-[#666] text-[11px]">{p.teamCode}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Player 2 */}
          <Card className="p-4">
            {player2 ? (
              <div className="flex items-center gap-3">
                <PlayerAvatar name={player2.name} teamCode={player2.teamCode} size="md" nbaId={player2.nbaId} />
                <div className="flex-1">
                  <div className="text-white text-[14px]">{player2.name}</div>
                  <div className="text-[11px] text-[#666]">{player2.teamCode} · {player2.position}</div>
                </div>
                <button onClick={() => setPlayer2(null)} className="text-[#666] hover:text-white text-[12px]">×</button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search player..."
                  value={search2}
                  onChange={(e) => setSearch2(e.target.value)}
                  className="w-full"
                />
                {filteredPlayers2.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#0a0a0a] border border-[#1a1a1a] z-10">
                    {filteredPlayers2.map(p => (
                      <button
                        key={p.id}
                        onClick={() => selectPlayer(p, 2)}
                        className="w-full px-3 py-2 text-left hover:bg-[#111] flex items-center gap-2"
                      >
                        <PlayerAvatar name={p.name} teamCode={p.teamCode} size="sm" nbaId={p.nbaId} />
                        <span className="text-white text-[13px]">{p.name}</span>
                        <span className="text-[#666] text-[11px]">{p.teamCode}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Comparison Table */}
        {player1 && player2 && (
          <Card className="p-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-white text-[13px] pb-4 w-1/3">{player1.name}</th>
                  <th className="text-center text-[11px] text-[#666] uppercase tracking-wide pb-4">Stat</th>
                  <th className="text-right text-white text-[13px] pb-4 w-1/3">{player2.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111]">
                <ComparisonRow label="Salary" val1={player1.salary} val2={player2.salary} format="money" higherIsBetter={false} />
                <ComparisonRow label="PPG" val1={player1.pointsPerGame} val2={player2.pointsPerGame} />
                <ComparisonRow label="RPG" val1={player1.reboundsPerGame} val2={player2.reboundsPerGame} />
                <ComparisonRow label="APG" val1={player1.assistsPerGame} val2={player2.assistsPerGame} />
                <ComparisonRow label="FG%" val1={player1.fgPercentage} val2={player2.fgPercentage} format="percent" />
                <ComparisonRow label="3P%" val1={player1.fg3Percentage} val2={player2.fg3Percentage} format="percent" />
                <ComparisonRow label="PER" val1={player1.per} val2={player2.per} />
                <ComparisonRow label="Win Shares" val1={player1.winShares} val2={player2.winShares} />
                <ComparisonRow label="EPD" val1={player1.epd.epd} val2={player2.epd.epd} />
                <ComparisonRow label="EPD/$M" val1={player1.epd.epdPerMillion} val2={player2.epd.epdPerMillion} />
              </tbody>
            </table>
            
            <div className="flex justify-between mt-4 pt-4 border-t border-[#1a1a1a]">
              <div>
                <span className="text-[11px] text-[#666] uppercase">Tier</span>
                <div className="mt-1"><TierBadge tier={player1.epd.tier} /></div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#666] uppercase">Tier</span>
                <div className="mt-1"><TierBadge tier={player2.epd.tier} /></div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
