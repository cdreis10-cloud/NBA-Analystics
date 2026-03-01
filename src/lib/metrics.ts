import type { PlayerData, EPDMetrics, BreakoutMetrics, PlayerWithMetrics } from '../types';

/**
 * EPD (Effectiveness Per Dollar) Calculation
 * 
 * Core insight: Traditional metrics miss the relationship between production, 
 * availability, replaceability, and cost efficiency.
 * 
 * Formula:
 * EPD = (Age-Adjusted Production × Availability × Replaceability Factor) / Salary
 */

// Weights for production composite
const PRODUCTION_WEIGHTS = {
  points: 1.5,        // Increased - scoring is king
  rebounds: 0.6,
  assists: 1.0,       // Increased - playmaking valuable
  steals: 0.8,        // Reduced - was overweighting defensive stats
  blocks: 0.8,        // Reduced
  turnovers: -0.8,
  per: 2.0,           // Still important
  winShares: 3.0,     // Increased - actual winning contribution
  vorp: 2.5,          // Increased
  bpm: 2.0,           // Increased
  efficiency: 0.5,    // Reduced - efficiency alone isn't value
};

// Age curve for production adjustment
function getAgeMultiplier(age: number): number {
  // Peak years: 25-29
  if (age >= 25 && age <= 29) return 1.0;
  if (age < 25) {
    // Young players: bonus for upside
    return 0.9 + (25 - age) * 0.03; // 21yo = 1.02, 22yo = 0.99, etc
  }
  // Older players: decline factor
  if (age >= 30 && age < 33) return 0.95 - (age - 30) * 0.03;
  if (age >= 33 && age < 36) return 0.86 - (age - 33) * 0.04;
  return Math.max(0.6, 0.74 - (age - 36) * 0.05); // 36+ steep decline
}

// Availability factor based on games played
function getAvailabilityMultiplier(gamesPlayed: number, totalPossible: number = 82): number {
  const availability = gamesPlayed / totalPossible;
  
  // Heavily penalize low availability
  if (availability >= 0.9) return 1.0;        // 74+ games
  if (availability >= 0.8) return 0.95;       // 66-73 games
  if (availability >= 0.7) return 0.85;       // 57-65 games
  if (availability >= 0.6) return 0.72;       // 49-56 games
  if (availability >= 0.5) return 0.58;       // 41-48 games
  return 0.4;                                  // <41 games - major red flag
}

// Replaceability based on position scarcity and skill rarity
function getReplaceabilityFactor(player: PlayerData): number {
  let factor = 1.0;
  
  // Position scarcity (centers are more replaceable, versatile wings less so)
  switch (player.position) {
    case 'G': factor *= 0.95; break;    // Point guards slightly more valuable
    case 'F': factor *= 1.05; break;    // Wings very valuable  
    case 'C': factor *= 0.9; break;     // Traditional centers more replaceable
    default: factor *= 1.0;
  }
  
  // Skill rarity bonuses
  if (player.fg3Percentage > 40 && player.pointsPerGame > 15) factor *= 1.1; // Elite shooter
  if (player.assistsPerGame > 7) factor *= 1.08; // Elite playmaker
  if (player.blocksPerGame > 2) factor *= 1.12; // Rim protection rare
  if (player.stealsPerGame > 1.5) factor *= 1.05; // Elite perimeter D
  
  // Two-way premium
  if (player.per > 20 && player.bpm > 3) factor *= 1.1;
  
  return factor;
}

// Calculate raw production score
function calculateRawProduction(player: PlayerData): number {
  // Estimate True Shooting
  const tsPercentage = (player.fgPercentage + 1.5 * player.fg3Percentage * 0.33 + player.ftPercentage * 0.44) / 2;
  
  return (
    player.pointsPerGame * PRODUCTION_WEIGHTS.points +
    player.reboundsPerGame * PRODUCTION_WEIGHTS.rebounds +
    player.assistsPerGame * PRODUCTION_WEIGHTS.assists +
    player.stealsPerGame * PRODUCTION_WEIGHTS.steals +
    player.blocksPerGame * PRODUCTION_WEIGHTS.blocks +
    player.turnoversPerGame * PRODUCTION_WEIGHTS.turnovers +
    player.per * PRODUCTION_WEIGHTS.per +
    (player.winShares / (player.gamesPlayed / 82)) * PRODUCTION_WEIGHTS.winShares + // Annualize WS
    player.vorp * PRODUCTION_WEIGHTS.vorp +
    player.bpm * PRODUCTION_WEIGHTS.bpm +
    tsPercentage * PRODUCTION_WEIGHTS.efficiency
  );
}

// Determine tier based on EPD per million
function getEPDTier(epdPerMillion: number): EPDMetrics['tier'] {
  // Recalibrated thresholds - elite should be rare
  if (epdPerMillion >= 12) return 'Elite';      // Only truly exceptional value
  if (epdPerMillion >= 7) return 'Great';       // Strong value contracts
  if (epdPerMillion >= 4) return 'Good';        // Solid value
  if (epdPerMillion >= 2) return 'Average';     // Fair market value
  if (epdPerMillion >= 1) return 'Below Average';
  return 'Poor';
}

// Confidence based on sample size
function getConfidence(gamesPlayed: number): number {
  if (gamesPlayed >= 70) return 0.95;
  if (gamesPlayed >= 55) return 0.85;
  if (gamesPlayed >= 40) return 0.7;
  if (gamesPlayed >= 25) return 0.5;
  return 0.3;
}

export function calculateEPD(player: PlayerData): EPDMetrics {
  const rawProduction = calculateRawProduction(player);
  const ageMultiplier = getAgeMultiplier(player.age);
  const ageAdjustedProduction = rawProduction * ageMultiplier;
  const availabilityMultiplier = getAvailabilityMultiplier(player.gamesPlayed);
  const replaceabilityFactor = getReplaceabilityFactor(player);
  
  // Production floor: Low-usage role players get penalized
  // This prevents 10 PPG players from ranking above 25 PPG stars
  let productionFloorMultiplier = 1.0;
  if (player.pointsPerGame < 12) {
    productionFloorMultiplier = 0.7;  // Significant penalty for limited scorers
  } else if (player.pointsPerGame < 15) {
    productionFloorMultiplier = 0.85; // Moderate penalty
  }
  
  // Core EPD formula
  const epd = ageAdjustedProduction * availabilityMultiplier * replaceabilityFactor * productionFloorMultiplier;
  const epdPerMillion = epd / Math.max(player.salary, 0.5); // Avoid division by near-zero
  
  return {
    playerId: player.id,
    rawProduction,
    ageAdjustedProduction,
    availabilityMultiplier,
    replaceabilityFactor,
    epd,
    epdPerMillion,
    tier: getEPDTier(epdPerMillion),
    confidence: getConfidence(player.gamesPlayed),
  };
}

/**
 * Breakout Tracker Calculation
 * 
 * Core insight: Talent alone doesn't predict success - opportunity matters equally.
 * A player can have all the skills but be blocked by depth chart, team situation, etc.
 * 
 * Breakout Score = Talent Score × Opportunity Score (weighted)
 */

// Calculate talent score components
function calculateTalentScore(player: PlayerData): BreakoutMetrics['talentComponents'] {
  // Age-adjusted production (young players get more credit for same production)
  let ageAdjustedProduction = 50;
  const productionPerMinute = (player.pointsPerGame + player.assistsPerGame * 0.8 + player.reboundsPerGame * 0.5) / player.minutesPerGame;
  if (productionPerMinute > 0.8) ageAdjustedProduction = 90;
  else if (productionPerMinute > 0.6) ageAdjustedProduction = 75;
  else if (productionPerMinute > 0.45) ageAdjustedProduction = 60;
  
  // Young player bonus
  if (player.age <= 23) ageAdjustedProduction = Math.min(100, ageAdjustedProduction * 1.15);
  else if (player.age <= 25) ageAdjustedProduction = Math.min(100, ageAdjustedProduction * 1.05);
  else if (player.age >= 30) ageAdjustedProduction *= 0.8;
  
  // Improvement velocity (for young players, assume positive trajectory)
  let improvementVelocity = 50;
  if (player.age <= 24) {
    improvementVelocity = 70 + (24 - player.age) * 5; // Younger = more room to grow
    if (player.per > 18) improvementVelocity += 10; // Already producing
  } else if (player.age >= 28) {
    improvementVelocity = 30; // Unlikely to improve significantly
  }
  
  // Efficiency markers
  let efficiencyMarkers = 50;
  if (player.fgPercentage > 50) efficiencyMarkers += 15;
  if (player.fg3Percentage > 37) efficiencyMarkers += 15;
  if (player.ftPercentage > 80) efficiencyMarkers += 10;
  if (player.turnoversPerGame < 2) efficiencyMarkers += 10;
  
  // Skills assessment (versatility indicator)
  let skillsAssessment = 50;
  const isMultiDimensional = 
    player.pointsPerGame > 10 && 
    (player.assistsPerGame > 3 || player.reboundsPerGame > 5);
  if (isMultiDimensional) skillsAssessment += 20;
  if (player.stealsPerGame > 1 || player.blocksPerGame > 1) skillsAssessment += 15;
  
  return {
    ageAdjustedProduction: Math.min(100, ageAdjustedProduction),
    improvementVelocity: Math.min(100, improvementVelocity),
    efficiencyMarkers: Math.min(100, efficiencyMarkers),
    skillsAssessment: Math.min(100, skillsAssessment),
  };
}

// Calculate opportunity score components
function calculateOpportunityScore(player: PlayerData): BreakoutMetrics['opportunityComponents'] {
  // Minutes available (inverse - if playing big minutes, less room to break out MORE)
  let minutesAvailable = 50;
  if (player.minutesPerGame < 20) minutesAvailable = 90; // Huge upside
  else if (player.minutesPerGame < 25) minutesAvailable = 75;
  else if (player.minutesPerGame < 30) minutesAvailable = 60;
  else if (player.minutesPerGame >= 35) minutesAvailable = 30; // Already starring
  
  // Team investment (contract type signals commitment)
  let teamInvestment = 50;
  if (player.contractType === 'rookie') teamInvestment = 70;
  else if (player.contractType === 'max' || player.contractType === 'supermax') teamInvestment = 40; // Already invested
  else if (player.contractType === 'minimum') teamInvestment = 30; // Low commitment
  
  // Team situation (bad teams = more opportunity for young players)
  // We don't have team record directly, but can infer from player context
  let teamSituation = 50;
  if (player.usageRate > 25) teamSituation = 30; // Team already leans on them
  else if (player.usageRate < 18 && player.per > 15) teamSituation = 80; // Underutilized talent
  
  // Role clarity
  let roleClarity = 60;
  if (player.minutesPerGame > 30 && player.usageRate > 24) roleClarity = 85; // Clear star role
  else if (player.minutesPerGame < 25) roleClarity = 40; // Role uncertain
  
  return {
    minutesAvailable: Math.min(100, minutesAvailable),
    teamInvestment: Math.min(100, teamInvestment),
    teamSituation: Math.min(100, teamSituation),
    roleClarity: Math.min(100, roleClarity),
  };
}

function getBreakoutTier(
  breakoutScore: number, 
  age: number, 
  player: PlayerData
): BreakoutMetrics['breakoutTier'] {
  // Players who have ALREADY broken out should not appear as "breakout candidates"
  
  // Clear stars: 20+ PPG = you've made it
  if (player.pointsPerGame >= 20) return 'Established';
  
  // High-usage starters: 18+ PPG with significant role
  if (player.pointsPerGame >= 18 && player.usageRate >= 22) return 'Established';
  
  // Established starters: 15+ PPG playing starter minutes
  if (player.pointsPerGame >= 15 && player.minutesPerGame >= 28) return 'Established';
  
  // Past the development window
  if (age > 27) return 'Established';
  
  // Actual breakout candidates
  if (breakoutScore >= 70) return 'Imminent';
  if (breakoutScore >= 55) return 'High Potential';
  if (breakoutScore >= 40) return 'Developing';
  return 'Long-term';
}

function projectCeiling(player: PlayerData, talentScore: number): string {
  if (talentScore >= 80 && player.age <= 25) return 'All-NBA';
  if (talentScore >= 70 && player.age <= 27) return 'All-Star';
  if (talentScore >= 55) return 'Quality Starter';
  if (talentScore >= 40) return 'Rotation Player';
  return 'End of Bench';
}

function projectFloor(player: PlayerData, opportunityScore: number): string {
  if (opportunityScore >= 70 && player.per > 15) return 'Quality Starter';
  if (opportunityScore >= 50) return 'Rotation Player';
  return 'Out of Rotation';
}

export function calculateBreakout(player: PlayerData): BreakoutMetrics {
  const talentComponents = calculateTalentScore(player);
  const opportunityComponents = calculateOpportunityScore(player);
  
  // Weighted averages
  const talentScore = (
    talentComponents.ageAdjustedProduction * 0.35 +
    talentComponents.improvementVelocity * 0.25 +
    talentComponents.efficiencyMarkers * 0.20 +
    talentComponents.skillsAssessment * 0.20
  );
  
  const opportunityScore = (
    opportunityComponents.minutesAvailable * 0.30 +
    opportunityComponents.teamInvestment * 0.25 +
    opportunityComponents.teamSituation * 0.25 +
    opportunityComponents.roleClarity * 0.20
  );
  
  // Breakout score: geometric mean gives balanced weight to both factors
  const breakoutScore = Math.sqrt(talentScore * opportunityScore);
  
  return {
    playerId: player.id,
    talentScore,
    talentComponents,
    opportunityScore,
    opportunityComponents,
    breakoutScore,
    breakoutTier: getBreakoutTier(breakoutScore, player.age, player),
    ceiling: projectCeiling(player, talentScore),
    floor: projectFloor(player, opportunityScore),
  };
}

/**
 * Main function to compute all metrics for a player
 */
export function computeAllMetrics(player: PlayerData): PlayerWithMetrics {
  return {
    ...player,
    epd: calculateEPD(player),
    breakout: calculateBreakout(player),
  };
}

export function computeAllPlayersMetrics(players: PlayerData[]): PlayerWithMetrics[] {
  return players.map(computeAllMetrics);
}
