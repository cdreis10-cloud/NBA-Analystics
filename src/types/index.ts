// Core player data type
export interface PlayerData {
  id: string;
  nbaId?: number;  // NBA.com player ID for headshots
  name: string;
  team: string;
  teamCode: string;
  position: string;
  age: number;
  
  // Stats (2024-25 season)
  gamesPlayed: number;
  minutesPerGame: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  stealsPerGame: number;
  blocksPerGame: number;
  turnoversPerGame: number;
  fgPercentage: number;
  fg3Percentage: number;
  ftPercentage: number;
  
  // Advanced stats
  per: number;          // Player Efficiency Rating
  winShares: number;
  vorp: number;         // Value Over Replacement Player
  bpm: number;          // Box Plus/Minus
  usageRate: number;
  
  // Contract
  salary: number;       // In millions
  contractYears: number;
  contractType: 'rookie' | 'veteran' | 'max' | 'supermax' | 'minimum' | 'mid-level';
  
  // Availability
  gamesAvailable: number; // Out of 82
  injuryHistory: 'clean' | 'minor' | 'moderate' | 'significant';
}

// EPD (Effectiveness Per Dollar) calculated metrics
export interface EPDMetrics {
  playerId: string;
  
  // Core EPD
  rawProduction: number;      // Weighted composite of stats
  ageAdjustedProduction: number;
  availabilityMultiplier: number;
  replaceabilityFactor: number;
  
  epd: number;                // Final EPD score
  epdPerMillion: number;      // EPD / salary
  
  tier: 'Elite' | 'Great' | 'Good' | 'Average' | 'Below Average' | 'Poor';
  confidence: number;         // 0-1 based on games played
}

// Breakout Tracker metrics
export interface BreakoutMetrics {
  playerId: string;
  
  // Talent Score (0-100)
  talentScore: number;
  talentComponents: {
    ageAdjustedProduction: number;
    improvementVelocity: number;
    efficiencyMarkers: number;
    skillsAssessment: number;
  };
  
  // Opportunity Score (0-100)
  opportunityScore: number;
  opportunityComponents: {
    minutesAvailable: number;
    teamInvestment: number;
    teamSituation: number;
    roleClarity: number;
  };
  
  // Combined
  breakoutScore: number;      // Talent * Opportunity weighted
  breakoutTier: 'Imminent' | 'High Potential' | 'Developing' | 'Long-term' | 'Established';
  
  ceiling: string;            // e.g. "All-Star", "Starter", etc.
  floor: string;
}

// Combined player with all calculated metrics
export interface PlayerWithMetrics extends PlayerData {
  epd: EPDMetrics;
  breakout: BreakoutMetrics;
}

// Team data
export interface Team {
  code: string;
  name: string;
  city: string;
  conference: 'East' | 'West';
  division: string;
  wins: number;
  losses: number;
  playoffPosition: number | null;
}

// Filter/sort types
export type SortField = 'name' | 'epd' | 'epdPerMillion' | 'salary' | 'breakoutScore' | 
                        'pointsPerGame' | 'per' | 'age' | 'talentScore' | 'opportunityScore';
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  search: string;
  teams: string[];
  positions: string[];
  tiers: string[];
  minSalary: number;
  maxSalary: number;
  minAge: number;
  maxAge: number;
}
