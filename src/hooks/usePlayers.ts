import { useMemo, useState } from 'react';
import { allPlayers } from '../data/additionalPlayers';
import { computeAllPlayersMetrics } from '../lib/metrics';
import type { PlayerWithMetrics, SortField, SortDirection, FilterState } from '../types';

export function usePlayers(initialFilters?: Partial<FilterState>) {
  const [filters, setFilters] = useState<Partial<FilterState>>(initialFilters || {});
  const [sortField, setSortField] = useState<SortField>('epdPerMillion');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Compute metrics for all players
  const playersWithMetrics = useMemo(() => {
    return computeAllPlayersMetrics(allPlayers);
  }, []);

  // Apply filters
  const filteredPlayers = useMemo(() => {
    let result = playersWithMetrics;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.team.toLowerCase().includes(search) ||
        p.teamCode.toLowerCase().includes(search)
      );
    }

    if (filters.teams && filters.teams.length > 0) {
      result = result.filter(p => filters.teams!.includes(p.teamCode));
    }

    if (filters.positions && filters.positions.length > 0) {
      result = result.filter(p => filters.positions!.includes(p.position));
    }

    if (filters.tiers && filters.tiers.length > 0) {
      result = result.filter(p => filters.tiers!.includes(p.epd.tier));
    }

    if (filters.minSalary !== undefined) {
      result = result.filter(p => p.salary >= filters.minSalary!);
    }

    if (filters.maxSalary !== undefined) {
      result = result.filter(p => p.salary <= filters.maxSalary!);
    }

    if (filters.minAge !== undefined) {
      result = result.filter(p => p.age >= filters.minAge!);
    }

    if (filters.maxAge !== undefined) {
      result = result.filter(p => p.age <= filters.maxAge!);
    }

    return result;
  }, [playersWithMetrics, filters]);

  // Sort players
  const sortedPlayers = useMemo(() => {
    const sorted = [...filteredPlayers].sort((a, b) => {
      let aVal: number;
      let bVal: number;

      switch (sortField) {
        case 'name':
          return sortDirection === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'epd':
          aVal = a.epd.epd;
          bVal = b.epd.epd;
          break;
        case 'epdPerMillion':
          aVal = a.epd.epdPerMillion;
          bVal = b.epd.epdPerMillion;
          break;
        case 'salary':
          aVal = a.salary;
          bVal = b.salary;
          break;
        case 'breakoutScore':
          aVal = a.breakout.breakoutScore;
          bVal = b.breakout.breakoutScore;
          break;
        case 'pointsPerGame':
          aVal = a.pointsPerGame;
          bVal = b.pointsPerGame;
          break;
        case 'per':
          aVal = a.per;
          bVal = b.per;
          break;
        case 'age':
          aVal = a.age;
          bVal = b.age;
          break;
        case 'talentScore':
          aVal = a.breakout.talentScore;
          bVal = b.breakout.talentScore;
          break;
        case 'opportunityScore':
          aVal = a.breakout.opportunityScore;
          bVal = b.breakout.opportunityScore;
          break;
        default:
          aVal = a.epd.epdPerMillion;
          bVal = b.epd.epdPerMillion;
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [filteredPlayers, sortField, sortDirection]);

  // Top players by different metrics
  const topValuePlayers = useMemo(() => {
    return [...playersWithMetrics]
      .sort((a, b) => b.epd.epdPerMillion - a.epd.epdPerMillion)
      .slice(0, 20);
  }, [playersWithMetrics]);

  const topBreakoutPlayers = useMemo(() => {
    return [...playersWithMetrics]
      .filter(p => p.breakout.breakoutTier !== 'Established' && p.age <= 27)
      .sort((a, b) => b.breakout.breakoutScore - a.breakout.breakoutScore)
      .slice(0, 20);
  }, [playersWithMetrics]);

  // Get player by ID
  const getPlayer = (id: string): PlayerWithMetrics | undefined => {
    return playersWithMetrics.find(p => p.id === id);
  };

  // Toggle sort
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return {
    players: sortedPlayers,
    allPlayers: playersWithMetrics,
    topValuePlayers,
    topBreakoutPlayers,
    filters,
    setFilters,
    sortField,
    sortDirection,
    toggleSort,
    getPlayer,
    loading: false,
  };
}
