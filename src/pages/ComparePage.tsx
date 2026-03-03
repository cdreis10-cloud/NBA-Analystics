import { useState, useRef, useEffect } from 'react';
import { usePlayers } from '../hooks/usePlayers';
import { Card, PlayerAvatar, TierBadge } from '../components/ui';
import type { PlayerWithMetrics } from '../types';
import { ChevronDown, X, Search } from 'lucide-react';

export default function ComparePage() {
  const { allPlayers } = usePlayers();
  const [player1, setPlayer1] = useState<PlayerWithMetrics | null>(null);
  const [player2, setPlayer2] = useState<PlayerWithMetrics | null>(null);
  const [dropdown1Open, setDropdown1Open] = useState(false);
  const [dropdown2Open, setDropdown2Open] = useState(false);
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const dropdown1Ref = useRef<HTMLDivElement>(null);
  const dropdown2Ref = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdown1Ref.current && !dropdown1Ref.current.contains(e.target as Node)) {
        setDropdown1Open(false);
      }
      if (dropdown2Ref.current && !dropdown2Ref.current.contains(e.target as Node)) {
        setDropdown2Open(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter and sort players for dropdowns
  const getFilteredPlayers = (search: string, excludePlayer: PlayerWithMetrics | null) => {
    return allPlayers
      .filter(p => {
        if (excludePlayer && p.id === excludePlayer.id) return false;
        if (!search) return true;
        const s = search.toLowerCase();
        return p.name.toLowerCase().includes(s) || p.teamCode.toLowerCase().includes(s);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const filteredPlayers1 = getFilteredPlayers(search1, player2);
  const filteredPlayers2 = getFilteredPlayers(search2, player1);

  const selectPlayer = (player: PlayerWithMetrics, slot: 1 | 2) => {
    if (slot === 1) {
      setPlayer1(player);
      setDropdown1Open(false);
      setSearch1('');
    } else {
      setPlayer2(player);
      setDropdown2Open(false);
      setSearch2('');
    }
  };

  const PlayerDropdown = ({ 
    slot, 
    player, 
    isOpen, 
    setIsOpen, 
    search, 
    setSearch, 
    filteredPlayers,
    dropdownRef
  }: { 
    slot: 1 | 2;
    player: PlayerWithMetrics | null;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    search: string;
    setSearch: (s: string) => void;
    filteredPlayers: PlayerWithMetrics[];
    dropdownRef: React.RefObject<HTMLDivElement>;
  }) => (
    <Card className="p-4">
      <div className="text-[10px] text-[#666] uppercase tracking-wide mb-2">
        Player {slot}
      </div>
      <div className="relative" ref={dropdownRef}>
        {player ? (
          <div className="flex items-center gap-3 p-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded">
            <PlayerAvatar name={player.name} teamCode={player.teamCode} size="sm" nbaId={player.nbaId} />
            <div className="flex-1 min-w-0">
              <div className="text-white text-[13px] truncate">{player.name}</div>
              <div className="text-[11px] text-[#666]">{player.teamCode} · {player.position} · ${player.salary.toFixed(1)}M</div>
            </div>
            <button 
              onClick={() => slot === 1 ? setPlayer1(null) : setPlayer2(null)} 
              className="text-[#666] hover:text-white p-1"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-3 bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333] transition-colors rounded"
          >
            <span className="text-[#666] text-[13px]">Select a player...</span>
            <ChevronDown size={16} className={`text-[#666] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}

        {isOpen && !player && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded z-20 shadow-xl">
            {/* Search input */}
            <div className="p-2 border-b border-[#1a1a1a]">
              <div className="relative">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#666]" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 py-1.5 text-[13px]"
                  autoFocus
                />
              </div>
            </div>
            
            {/* Player list */}
            <div className="max-h-[300px] overflow-y-auto">
              {filteredPlayers.length === 0 ? (
                <div className="p-4 text-center text-[#666] text-[13px]">No players found</div>
              ) : (
                filteredPlayers.map(p => (
                  <button
                    key={p.id}
                    onClick={() => selectPlayer(p, slot)}
                    className="w-full px-3 py-2 text-left hover:bg-[#111] flex items-center gap-3 border-b border-[#111] last:border-0"
                  >
                    <PlayerAvatar name={p.name} teamCode={p.teamCode} size="sm" nbaId={p.nbaId} />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-[13px] truncate">{p.name}</div>
                      <div className="text-[11px] text-[#666]">{p.teamCode} · {p.position}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[12px] text-white font-mono">{p.pointsPerGame.toFixed(1)}</div>
                      <div className="text-[10px] text-[#666]">PPG</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );

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
        <td className={`font-mono text-[13px] py-2 ${getColor(val1, val2, true)}`}>{formatVal(val1)}</td>
        <td className="text-[#666] text-[12px] text-center py-2">{label}</td>
        <td className={`font-mono text-[13px] text-right py-2 ${getColor(val2, val1, false)}`}>{formatVal(val2)}</td>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <PlayerDropdown 
            slot={1}
            player={player1}
            isOpen={dropdown1Open}
            setIsOpen={setDropdown1Open}
            search={search1}
            setSearch={setSearch1}
            filteredPlayers={filteredPlayers1}
            dropdownRef={dropdown1Ref as React.RefObject<HTMLDivElement>}
          />
          <PlayerDropdown 
            slot={2}
            player={player2}
            isOpen={dropdown2Open}
            setIsOpen={setDropdown2Open}
            search={search2}
            setSearch={setSearch2}
            filteredPlayers={filteredPlayers2}
            dropdownRef={dropdown2Ref as React.RefObject<HTMLDivElement>}
          />
        </div>

        {/* Comparison Table */}
        {player1 && player2 ? (
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
                <ComparisonRow label="Age" val1={player1.age} val2={player2.age} higherIsBetter={false} />
                <ComparisonRow label="Salary" val1={player1.salary} val2={player2.salary} format="money" higherIsBetter={false} />
                <ComparisonRow label="Games" val1={player1.gamesPlayed} val2={player2.gamesPlayed} />
                <ComparisonRow label="PPG" val1={player1.pointsPerGame} val2={player2.pointsPerGame} />
                <ComparisonRow label="RPG" val1={player1.reboundsPerGame} val2={player2.reboundsPerGame} />
                <ComparisonRow label="APG" val1={player1.assistsPerGame} val2={player2.assistsPerGame} />
                <ComparisonRow label="SPG" val1={player1.stealsPerGame} val2={player2.stealsPerGame} />
                <ComparisonRow label="BPG" val1={player1.blocksPerGame} val2={player2.blocksPerGame} />
                <ComparisonRow label="FG%" val1={player1.fgPercentage} val2={player2.fgPercentage} format="percent" />
                <ComparisonRow label="3P%" val1={player1.fg3Percentage} val2={player2.fg3Percentage} format="percent" />
                <ComparisonRow label="FT%" val1={player1.ftPercentage} val2={player2.ftPercentage} format="percent" />
                <ComparisonRow label="PER" val1={player1.per} val2={player2.per} />
                <ComparisonRow label="Win Shares" val1={player1.winShares} val2={player2.winShares} />
                <ComparisonRow label="VORP" val1={player1.vorp} val2={player2.vorp} />
                <ComparisonRow label="BPM" val1={player1.bpm} val2={player2.bpm} />
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
        ) : (
          <Card className="p-8 text-center">
            <div className="text-[#666] text-[14px]">
              Select two players above to compare their stats
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
