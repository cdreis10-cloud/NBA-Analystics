import { useParams, Link } from 'react-router-dom';
import { usePlayers } from '../hooks/usePlayers';
import { Card, PlayerAvatar, TierBadge, BreakoutBadge, ProgressBar } from '../components/ui';
import { ArrowLeft } from 'lucide-react';

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getPlayer } = usePlayers();
  const player = getPlayer(id || '');

  if (!player) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#666]">Player not found</p>
          <Link to="/players" className="text-[#0088ff] text-[13px] mt-2 inline-block">← Back to players</Link>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'PPG', value: player.pointsPerGame },
    { label: 'RPG', value: player.reboundsPerGame },
    { label: 'APG', value: player.assistsPerGame },
    { label: 'SPG', value: player.stealsPerGame },
    { label: 'BPG', value: player.blocksPerGame },
    { label: 'FG%', value: player.fgPercentage },
    { label: '3P%', value: player.fg3Percentage },
    { label: 'FT%', value: player.ftPercentage },
  ];

  const advanced = [
    { label: 'PER', value: player.per },
    { label: 'Win Shares', value: player.winShares },
    { label: 'VORP', value: player.vorp },
    { label: 'BPM', value: player.bpm },
    { label: 'Usage', value: player.usageRate },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <Link to="/players" className="flex items-center gap-2 text-[#666] hover:text-white text-[13px] mb-6">
          <ArrowLeft size={14} /> Back to players
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <PlayerAvatar name={player.name} teamCode={player.teamCode} size="lg" nbaId={player.nbaId} />
          <div>
            <h1 className="text-2xl font-semibold text-white">{player.name}</h1>
            <p className="text-[#666] text-[14px]">{player.team} · {player.position} · Age {player.age}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="font-mono text-white">${player.salary.toFixed(1)}M</span>
              <TierBadge tier={player.epd.tier} />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Stats */}
          <Card className="p-4">
            <h2 className="text-[11px] text-[#666] uppercase tracking-wide mb-4">Per Game Stats</h2>
            <div className="space-y-3">
              {stats.map(stat => (
                <div key={stat.label} className="flex justify-between">
                  <span className="text-[#888] text-[13px]">{stat.label}</span>
                  <span className="font-mono text-white text-[13px]">{stat.value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Advanced */}
          <Card className="p-4">
            <h2 className="text-[11px] text-[#666] uppercase tracking-wide mb-4">Advanced Metrics</h2>
            <div className="space-y-3">
              {advanced.map(stat => (
                <div key={stat.label} className="flex justify-between">
                  <span className="text-[#888] text-[13px]">{stat.label}</span>
                  <span className="font-mono text-white text-[13px]">{stat.value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* EPD Analysis */}
          <Card className="p-4">
            <h2 className="text-[11px] text-[#666] uppercase tracking-wide mb-4">EPD Analysis</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#888] text-[13px]">EPD Score</span>
                <span className="font-mono text-[#00d26a] text-[14px] font-medium">{player.epd.epd.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888] text-[13px]">EPD per $M</span>
                <span className="font-mono text-white text-[13px]">{player.epd.epdPerMillion.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888] text-[13px]">Raw Production</span>
                <span className="font-mono text-white text-[13px]">{player.epd.rawProduction.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888] text-[13px]">Age Adjusted</span>
                <span className="font-mono text-white text-[13px]">{player.epd.ageAdjustedProduction.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888] text-[13px]">Availability</span>
                <span className="font-mono text-white text-[13px]">{(player.epd.availabilityMultiplier * 100).toFixed(0)}%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Breakout Analysis */}
        {player.age <= 27 && (
          <Card className="p-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] text-[#666] uppercase tracking-wide">Breakout Analysis</h2>
              <BreakoutBadge tier={player.breakout.breakoutTier} />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[#888] text-[13px]">Talent Score</span>
                  <span className="font-mono text-white">{player.breakout.talentScore}</span>
                </div>
                <ProgressBar value={player.breakout.talentScore} color="green" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[#888] text-[13px]">Opportunity Score</span>
                  <span className="font-mono text-white">{player.breakout.opportunityScore}</span>
                </div>
                <ProgressBar value={player.breakout.opportunityScore} color="yellow" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[#888] text-[13px]">Breakout Score</span>
                  <span className="font-mono text-[#00d26a] font-medium">{player.breakout.breakoutScore.toFixed(1)}</span>
                </div>
                <div className="text-[12px] text-[#666] mt-1">
                  Ceiling: <span className="text-white">{player.breakout.ceiling}</span> · 
                  Floor: <span className="text-white">{player.breakout.floor}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Contract Info */}
        <Card className="p-4 mt-6">
          <h2 className="text-[11px] text-[#666] uppercase tracking-wide mb-4">Contract Details</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <span className="text-[#888] text-[13px] block">Annual Salary</span>
              <span className="font-mono text-white text-[16px]">${player.salary.toFixed(1)}M</span>
            </div>
            <div>
              <span className="text-[#888] text-[13px] block">Years Remaining</span>
              <span className="font-mono text-white text-[16px]">{player.contractYears}</span>
            </div>
            <div>
              <span className="text-[#888] text-[13px] block">Contract Type</span>
              <span className="text-white text-[14px] capitalize">{player.contractType}</span>
            </div>
            <div>
              <span className="text-[#888] text-[13px] block">Games Played</span>
              <span className="font-mono text-white text-[16px]">{player.gamesPlayed}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
