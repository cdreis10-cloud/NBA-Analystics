import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePlayers } from '../hooks/usePlayers';
import { Card, PlayerAvatar, TierBadge } from '../components/ui';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function PlayersPage() {
  const { allPlayers } = usePlayers();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [posFilter, setPosFilter] = useState('all');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'name' ? 'asc' : 'desc');
    }
  };

  const players = useMemo(() => {
    let filtered = [...allPlayers];

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(s) || 
        p.teamCode.toLowerCase().includes(s)
      );
    }

    if (posFilter !== 'all') {
      filtered = filtered.filter(p => p.position === posFilter);
    }

    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case 'name': aVal = a.name; bVal = b.name; break;
        case 'team': aVal = a.teamCode; bVal = b.teamCode; break;
        case 'salary': aVal = a.salary; bVal = b.salary; break;
        case 'ppg': aVal = a.pointsPerGame; bVal = b.pointsPerGame; break;
        case 'epd': aVal = a.epd.epd; bVal = b.epd.epd; break;
        default: aVal = a.name; bVal = b.name;
      }
      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [allPlayers, search, posFilter, sortField, sortDir]);

  const SortHeader = ({ field, label }: { field: string; label: string }) => (
    <th onClick={() => handleSort(field)} className="cursor-pointer hover:text-white select-none">
      <div className="flex items-center gap-1">
        {label}
        {sortField === field && (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
      </div>
    </th>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">Players Database</h1>
          <p className="text-[13px] text-[#666] mt-1">Complete roster with stats and contract details</p>
        </div>

        <Card className="p-4 mb-4">
          <div className="flex flex-wrap gap-6 items-start">
            {/* Search */}
            <div>
              <div className="text-[10px] text-[#666] uppercase tracking-wide mb-2">Search</div>
              <input
                type="text"
                placeholder="Player name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-40"
              />
            </div>

            {/* Position Filter */}
            <div>
              <div className="text-[10px] text-[#666] uppercase tracking-wide mb-2">Position</div>
              <div className="flex gap-1">
                {['all', 'G', 'F', 'C'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPosFilter(pos)}
                    className={`px-3 py-1.5 text-[12px] border ${
                      posFilter === pos 
                        ? 'bg-white text-black border-white' 
                        : 'bg-transparent text-[#888] border-[#333] hover:border-[#666]'
                    }`}
                  >
                    {pos === 'all' ? 'All' : pos}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-[12px] text-[#666] ml-auto self-end pb-1.5">{players.length} players</span>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <SortHeader field="name" label="Player" />
                  <SortHeader field="team" label="Team" />
                  <th>Pos</th>
                  <th>Age</th>
                  <SortHeader field="salary" label="Salary" />
                  <SortHeader field="ppg" label="PPG" />
                  <th>RPG</th>
                  <th>APG</th>
                  <th>GP</th>
                  <SortHeader field="epd" label="EPD" />
                  <th>Tier</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id}>
                    <td>
                      <Link to={`/player/${player.id}`} className="flex items-center gap-3 hover:text-white">
                        <PlayerAvatar name={player.name} teamCode={player.teamCode} size="sm" nbaId={player.nbaId} />
                        <span className="text-white text-[13px]">{player.name}</span>
                      </Link>
                    </td>
                    <td className="text-[#666] text-[12px]">{player.teamCode}</td>
                    <td className="text-[12px]">{player.position}</td>
                    <td className="font-mono text-[13px]">{player.age}</td>
                    <td className="font-mono text-[13px]">${player.salary.toFixed(1)}M</td>
                    <td className="font-mono text-white text-[13px]">{player.pointsPerGame.toFixed(1)}</td>
                    <td className="font-mono text-[13px]">{player.reboundsPerGame.toFixed(1)}</td>
                    <td className="font-mono text-[13px]">{player.assistsPerGame.toFixed(1)}</td>
                    <td className="font-mono text-[13px]">{player.gamesPlayed}</td>
                    <td className="font-mono text-white text-[13px]">{player.epd.epd.toFixed(1)}</td>
                    <td><TierBadge tier={player.epd.tier} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
