import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePlayers } from '../hooks/usePlayers';
import { Card, BreakoutBadge, PlayerAvatar, ProgressBar } from '../components/ui';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function BreakoutPage() {
  const { allPlayers } = usePlayers();
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'breakout' | 'talent' | 'opportunity'>('breakout');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  const players = useMemo(() => {
    let filtered = allPlayers.filter(p => p.age <= 27); // Focus on younger players

    // Age filter
    if (ageFilter !== 'all') {
      const maxAge = parseInt(ageFilter);
      filtered = filtered.filter(p => p.age <= maxAge);
    }

    // Tier filter
    if (tierFilter !== 'all') {
      filtered = filtered.filter(p => p.breakout.breakoutTier === tierFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortField) {
        case 'talent':
          aVal = a.breakout.talentScore;
          bVal = b.breakout.talentScore;
          break;
        case 'opportunity':
          aVal = a.breakout.opportunityScore;
          bVal = b.breakout.opportunityScore;
          break;
        default:
          aVal = a.breakout.breakoutScore;
          bVal = b.breakout.breakoutScore;
      }
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return filtered;
  }, [allPlayers, ageFilter, tierFilter, sortField, sortDir]);

  const handleSort = (field: 'breakout' | 'talent' | 'opportunity') => {
    if (sortField === field) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortButton = ({ field, label }: { field: 'breakout' | 'talent' | 'opportunity'; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`px-3 py-1.5 text-[12px] border flex items-center gap-1 ${
        sortField === field 
          ? 'bg-white text-black border-white' 
          : 'bg-transparent text-[#888] border-[#333] hover:border-[#666]'
      }`}
    >
      {label}
      {sortField === field && (
        sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">Breakout Tracker</h1>
          <p className="text-[13px] text-[#666] mt-1">
            Undervalued players poised for breakout seasons — talent × opportunity
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-4">
          <div className="flex flex-wrap gap-6 items-start">
            {/* Age Filter */}
            <div>
              <div className="text-[10px] text-[#666] uppercase tracking-wide mb-2">Max Age</div>
              <div className="flex gap-1">
                {[
                  { value: 'all', label: 'All' },
                  { value: '23', label: '≤23' },
                  { value: '25', label: '≤25' },
                  { value: '27', label: '≤27' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAgeFilter(opt.value)}
                    className={`px-3 py-1.5 text-[12px] border ${
                      ageFilter === opt.value 
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
                {[
                  { value: 'all', label: 'All' },
                  { value: 'Imminent', label: 'Imminent' },
                  { value: 'High Potential', label: 'High Pot.' },
                  { value: 'Developing', label: 'Developing' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTierFilter(opt.value)}
                    className={`px-3 py-1.5 text-[12px] border ${
                      tierFilter === opt.value 
                        ? 'bg-white text-black border-white' 
                        : 'bg-transparent text-[#888] border-[#333] hover:border-[#666]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <div className="text-[10px] text-[#666] uppercase tracking-wide mb-2">Sort By</div>
              <div className="flex gap-1">
                <SortButton field="breakout" label="Score" />
                <SortButton field="talent" label="Talent" />
                <SortButton field="opportunity" label="Opportunity" />
              </div>
            </div>

            <span className="text-[12px] text-[#666] ml-auto self-end pb-1.5">
              {players.length} candidates
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
                  <th>Player</th>
                  <th>Team</th>
                  <th>Age</th>
                  <th>Salary</th>
                  <th className="w-32">Talent</th>
                  <th className="w-32">Opportunity</th>
                  <th>Score</th>
                  <th>Tier</th>
                  <th>Ceiling</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => {
                  const talent = player.breakout.talentScore;
                  const opportunity = player.breakout.opportunityScore;
                  const score = player.breakout.breakoutScore;
                  
                  return (
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
                            <div className="text-[11px] text-[#444]">{player.position}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="text-[#666] text-[12px]">{player.teamCode}</td>
                      <td className="font-mono text-[13px]">{player.age}</td>
                      <td className="font-mono text-[13px]">${player.salary.toFixed(1)}M</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[13px] text-white w-8">{talent}</span>
                          <div className="flex-1">
                            <ProgressBar value={talent} color={talent >= 80 ? 'green' : talent >= 60 ? 'yellow' : 'default'} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[13px] text-white w-8">{opportunity}</span>
                          <div className="flex-1">
                            <ProgressBar value={opportunity} color={opportunity >= 70 ? 'green' : opportunity >= 50 ? 'yellow' : 'default'} />
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-[#00d26a] font-medium text-[14px]">
                        {score.toFixed(1)}
                      </td>
                      <td><BreakoutBadge tier={player.breakout.breakoutTier} /></td>
                      <td className="text-[12px] text-[#888]">{player.breakout.ceiling}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
