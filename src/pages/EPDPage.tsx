import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePlayers } from '../hooks/usePlayers';
import { Card, TierBadge, PlayerAvatar, ConfidenceIndicator } from '../components/ui';
import { ChevronUp, ChevronDown } from 'lucide-react';

type LocalSortField = 'name' | 'salary' | 'epd' | 'epdPerMillion' | 'ppg';

export default function EPDPage() {
  const { allPlayers } = usePlayers();
  const [sortField, setSortField] = useState<LocalSortField>('epd');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('all');
  const [salaryFilter, setSalaryFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const handleSort = (field: LocalSortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const players = useMemo(() => {
    let filtered = [...allPlayers];

    // Search filter
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(s) ||
        p.team.toLowerCase().includes(s) ||
        p.teamCode.toLowerCase().includes(s)
      );
    }

    // Position filter
    if (posFilter !== 'all') {
      filtered = filtered.filter(p => p.position === posFilter);
    }

    // Salary filter
    if (salaryFilter !== 'all') {
      filtered = filtered.filter(p => {
        if (salaryFilter === 'under10') return p.salary < 10;
        if (salaryFilter === '10to25') return p.salary >= 10 && p.salary < 25;
        if (salaryFilter === '25to40') return p.salary >= 25 && p.salary < 40;
        if (salaryFilter === 'over40') return p.salary >= 40;
        return true;
      });
    }

    // Tier filter
    if (tierFilter !== 'all') {
      filtered = filtered.filter(p => p.epd.tier === tierFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: number, bVal: number;
      
      switch (sortField) {
        case 'name':
          return sortDir === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'salary':
          aVal = a.salary;
          bVal = b.salary;
          break;
        case 'epd':
          aVal = a.epd.epd;
          bVal = b.epd.epd;
          break;
        case 'epdPerMillion':
          aVal = a.epd.epdPerMillion;
          bVal = b.epd.epdPerMillion;
          break;
        case 'ppg':
          aVal = a.pointsPerGame;
          bVal = b.pointsPerGame;
          break;
        default:
          aVal = a.epd.epd;
          bVal = b.epd.epd;
      }
      
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [allPlayers, search, posFilter, salaryFilter, tierFilter, sortField, sortDir]);

  const SortHeader = ({ field, label }: { field: LocalSortField; label: string }) => (
    <th 
      onClick={() => handleSort(field)}
      className="cursor-pointer hover:text-white select-none"
    >
      <div className="flex items-center gap-1">
        {label}
        {sortField === field && (
          sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />
        )}
      </div>
    </th>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">EPD Rankings</h1>
          <p className="text-[13px] text-[#666] mt-1">Effectiveness Per Dollar — player value relative to salary</p>
        </div>

        {/* Filters */}
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
            
            {/* Salary Filter */}
            <div>
              <div className="text-[10px] text-[#666] uppercase tracking-wide mb-2">Salary</div>
              <div className="flex gap-1">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'under10', label: '<$10M' },
                  { value: '10to25', label: '$10-25M' },
                  { value: '25to40', label: '$25-40M' },
                  { value: 'over40', label: '$40M+' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSalaryFilter(opt.value)}
                    className={`px-3 py-1.5 text-[12px] border ${
                      salaryFilter === opt.value 
                        ? 'bg-white text-black border-white' 
                        : 'bg-transparent text-[#888] border-[#333] hover:border-[#666]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tier Filter */}
            <div>
              <div className="text-[10px] text-[#666] uppercase tracking-wide mb-2">Tier</div>
              <div className="flex gap-1">
                {['all', 'Elite', 'Great', 'Good', 'Average'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTierFilter(tier)}
                    className={`px-3 py-1.5 text-[12px] border ${
                      tierFilter === tier 
                        ? 'bg-white text-black border-white' 
                        : 'bg-transparent text-[#888] border-[#333] hover:border-[#666]'
                    }`}
                  >
                    {tier === 'all' ? 'All' : tier}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-[12px] text-[#666] ml-auto self-end pb-1.5">
              {players.length} players
            </span>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-10">#</th>
                  <SortHeader field="name" label="Player" />
                  <th>Team</th>
                  <SortHeader field="salary" label="Salary" />
                  <SortHeader field="ppg" label="PPG" />
                  <th>RPG</th>
                  <th>APG</th>
                  <SortHeader field="epd" label="EPD" />
                  <SortHeader field="epdPerMillion" label="EPD/$M" />
                  <th>Tier</th>
                  <th>Conf</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={player.id}>
                    <td className="text-[#444] font-mono text-[12px]">{index + 1}</td>
                    <td>
                      <Link 
                        to={`/player/${player.id}`}
                        className="flex items-center gap-3 hover:text-white transition-colors"
                      >
                        <PlayerAvatar name={player.name} teamCode={player.teamCode} size="sm" nbaId={player.nbaId} />
                        <div>
                          <div className="text-white text-[13px]">{player.name}</div>
                          <div className="text-[11px] text-[#444]">{player.position} · {player.age}y</div>
                        </div>
                      </Link>
                    </td>
                    <td className="text-[#666] text-[12px]">{player.teamCode}</td>
                    <td className="font-mono text-[13px]">${player.salary.toFixed(1)}M</td>
                    <td className="font-mono text-white text-[13px]">{player.pointsPerGame.toFixed(1)}</td>
                    <td className="font-mono text-[13px]">{player.reboundsPerGame.toFixed(1)}</td>
                    <td className="font-mono text-[13px]">{player.assistsPerGame.toFixed(1)}</td>
                    <td className="font-mono text-white font-medium text-[13px]">
                      {player.epd.epd.toFixed(1)}
                    </td>
                    <td className="font-mono text-[#00d26a] text-[13px]">
                      {player.epd.epdPerMillion.toFixed(2)}
                    </td>
                    <td><TierBadge tier={player.epd.tier} /></td>
                    <td><ConfidenceIndicator level={player.epd.confidence >= 0.8 ? 'high' : player.epd.confidence >= 0.5 ? 'medium' : 'low'} /></td>
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
