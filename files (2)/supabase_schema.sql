-- ============================================================
-- NBA Draft Scouting Tracker v2 — Supabase Database Schema
-- Run this in your Supabase SQL Editor to create all tables
-- ============================================================

-- =====================
-- CORE TABLES
-- =====================

CREATE TABLE players (
  player_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  school_team TEXT,
  primary_bucket TEXT CHECK (primary_bucket IN ('Guard', 'Wing', 'Big')),
  style_archetype TEXT,
  birth_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prospects (
  player_id TEXT PRIMARY KEY REFERENCES players(player_id) ON DELETE CASCADE,
  team TEXT,
  league_conf TEXT,
  height NUMERIC,
  weight NUMERIC,
  wingspan NUMERIC,
  age_year TEXT,
  class TEXT,
  accolades TEXT,
  strengths TEXT,
  weaknesses TEXT,
  comp_upper TEXT,
  comp_lower TEXT,
  tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- STATS
-- =====================

CREATE TABLE stats (
  id SERIAL PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(player_id) ON DELETE CASCADE,
  season TEXT,
  games INTEGER,
  mpg NUMERIC,
  ppg NUMERIC,
  rpg NUMERIC,
  apg NUMERIC,
  spg NUMERIC,
  bpg NUMERIC,
  tov NUMERIC,
  pf NUMERIC,
  fgm NUMERIC,
  fga NUMERIC,
  three_ptm NUMERIC,
  three_pta NUMERIC,
  ftm NUMERIC,
  fta NUMERIC,
  fg_pct NUMERIC,
  three_pt_pct NUMERIC,
  ft_pct NUMERIC,
  efg_pct NUMERIC,
  ts_pct NUMERIC,
  three_pta_rate NUMERIC,
  ft_rate NUMERIC,
  ast_tov NUMERIC,
  pts_per40 NUMERIC,
  reb_per40 NUMERIC,
  ast_per40 NUMERIC,
  stl_per40 NUMERIC,
  blk_per40 NUMERIC,
  tov_per40 NUMERIC,
  orb_total NUMERIC,
  drb_total NUMERIC,
  per NUMERIC,
  ws NUMERIC,
  dws NUMERIC,
  ortg NUMERIC,
  drtg NUMERIC,
  bpm NUMERIC,
  obpm NUMERIC,
  dbpm NUMERIC,
  rim_fg_pct NUMERIC,
  mid_fg_pct NUMERIC,
  cs_three_pct NUMERIC,
  pu_three_pct NUMERIC,
  pnr_bh_ppp NUMERIC,
  pnr_rm_ppp NUMERIC,
  su_ppp NUMERIC,
  iso_ppp NUMERIC,
  trans_freq_pct NUMERIC,
  trans_ppp NUMERIC,
  pts_total INTEGER,
  reb_total INTEGER,
  ast_total INTEGER,
  tov_total INTEGER,
  min_total INTEGER,
  stl_total INTEGER,
  blk_total INTEGER,
  pf_total INTEGER,
  fgm_total INTEGER,
  fga_total INTEGER,
  three_ptm_total INTEGER,
  three_pta_total INTEGER,
  ftm_total INTEGER,
  fta_total INTEGER,
  blk_pct NUMERIC,
  stl_pct NUMERIC,
  dunks INTEGER,
  dunks_att INTEGER,
  dunk_pct NUMERIC,
  two_pt_close NUMERIC,
  two_pt_close_att NUMERIC,
  two_pt_close_pct NUMERIC,
  two_pt_far NUMERIC,
  two_pt_far_att NUMERIC,
  two_pt_far_pct NUMERIC,
  porpagatu NUMERIC,
  dporpagatu NUMERIC,
  orb_pct NUMERIC,
  drb_pct NUMERIC,
  ast_pct NUMERIC,
  tov_pct NUMERIC,
  usg NUMERIC,
  astd_at_rim_pct NUMERIC,
  astd_inside_arc_pct NUMERIC,
  astd_three_pct NUMERIC,
  astd_tot_pct NUMERIC,
  at_rim_share_pct NUMERIC,
  inside_arc_share_pct NUMERIC,
  three_pt_share_pct NUMERIC,
  three_pta_per40 NUMERIC,
  fta_per40 NUMERIC,
  dunks_per_game NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stats_player ON stats(player_id);

-- =====================
-- MEASURABLES / COMBINE
-- =====================

CREATE TABLE measurables (
  player_id TEXT PRIMARY KEY REFERENCES players(player_id) ON DELETE CASCADE,
  height NUMERIC,
  weight NUMERIC,
  wingspan NUMERIC,
  standing_reach NUMERIC,
  vertical NUMERIC,
  max_vertical NUMERIC,
  three_quarter_sprint NUMERIC,
  lane_agility NUMERIC,
  shuttle NUMERIC,
  bench INTEGER,
  ws_minus_h NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- SCORING TABLES
-- =====================

-- SSA manual input grades (human-entered, 0-10 scale)
CREATE TABLE ssa_input (
  player_id TEXT PRIMARY KEY REFERENCES players(player_id) ON DELETE CASCADE,
  role_translation NUMERIC CHECK (role_translation >= 0 AND role_translation <= 10),
  shooting_profile NUMERIC CHECK (shooting_profile >= 0 AND shooting_profile <= 10),
  creation_scalability NUMERIC CHECK (creation_scalability >= 0 AND creation_scalability <= 10),
  playmaking_efficiency NUMERIC CHECK (playmaking_efficiency >= 0 AND playmaking_efficiency <= 10),
  defensive_impact NUMERIC CHECK (defensive_impact >= 0 AND defensive_impact <= 10),
  offball_value NUMERIC CHECK (offball_value >= 0 AND offball_value <= 10),
  decision_making NUMERIC CHECK (decision_making >= 0 AND decision_making <= 10),
  hustle_impact NUMERIC CHECK (hustle_impact >= 0 AND hustle_impact <= 10),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RAUS computed scores (recalculated by engine)
CREATE TABLE raus_scores (
  player_id TEXT PRIMARY KEY REFERENCES players(player_id) ON DELETE CASCADE,
  primary_bucket TEXT,
  scr_auto NUMERIC,
  rpi_auto NUMERIC,
  sci_auto NUMERIC,
  star_index NUMERIC,
  ptc_auto NUMERIC,
  ucs_auto NUMERIC,
  fcs_auto NUMERIC,
  adr_auto NUMERIC,
  sti_auto NUMERIC,
  rsm_auto NUMERIC,
  dri_auto NUMERIC,
  ppi_auto NUMERIC,
  raus_base NUMERIC,
  raus_weighted NUMERIC,
  raus_final_auto NUMERIC,
  raus_override NUMERIC,
  raus_final NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SSA computed scores (recalculated by engine)
CREATE TABLE ssa_scores (
  player_id TEXT PRIMARY KEY REFERENCES players(player_id) ON DELETE CASCADE,
  position TEXT,
  role NUMERIC,
  shooting NUMERIC,
  creation NUMERIC,
  playmaking NUMERIC,
  defense NUMERIC,
  offball NUMERIC,
  decision NUMERIC,
  hustle NUMERIC,
  age_mod NUMERIC DEFAULT 1.0,
  ws_h_mod NUMERIC DEFAULT 1.0,
  ssa_auto_final NUMERIC,
  ssa_rank_label TEXT,
  ssa_weighted NUMERIC,
  ssa_weighted_rank_label TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Athletic composite scores
CREATE TABLE athletic_scores (
  player_id TEXT PRIMARY KEY REFERENCES players(player_id) ON DELETE CASCADE,
  mas_sqrt NUMERIC,
  mav NUMERIC,
  mami NUMERIC,
  oai NUMERIC,
  oai_band TEXT,
  aaa NUMERIC,
  aaa_band TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- DNA ARCHETYPE SYSTEM
-- =====================

CREATE TABLE dna_scores (
  player_id TEXT PRIMARY KEY REFERENCES players(player_id) ON DELETE CASCADE,
  -- Archetype total scores (NULL = N/A / doesn't meet gates)
  klaw_score NUMERIC,
  king_score NUMERIC,
  reaper_score NUMERIC,
  wilt_score NUMERIC,
  pointgod_score NUMERIC,
  brow_score NUMERIC,
  air_score NUMERIC,
  beard_score NUMERIC,
  chef_score NUMERIC,
  joker_score NUMERIC,
  diesel_score NUMERIC,
  -- Component scores (C1-C5 per archetype, stored as JSONB for flexibility)
  klaw_components JSONB,
  king_components JSONB,
  reaper_components JSONB,
  wilt_components JSONB,
  pointgod_components JSONB,
  brow_components JSONB,
  air_components JSONB,
  beard_components JSONB,
  chef_components JSONB,
  joker_components JSONB,
  diesel_components JSONB,
  -- Output
  primary_archetype TEXT,
  secondary_archetype TEXT,
  dna_flag BOOLEAN DEFAULT FALSE,
  dna_max NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- MASTER BOARD (computed hub)
-- =====================

CREATE TABLE master_board (
  player_id TEXT PRIMARY KEY REFERENCES players(player_id) ON DELETE CASCADE,
  display_name TEXT,
  primary_bucket TEXT,
  style_archetype TEXT,
  raus_final NUMERIC,
  tier TEXT,
  overall_rank INTEGER,
  ssa NUMERIC,
  oai NUMERIC,
  oai_band TEXT,
  aaa NUMERIC,
  aaa_band TEXT,
  alert_status TEXT DEFAULT 'Clean',
  risk_notes TEXT,
  dna_flag BOOLEAN DEFAULT FALSE,
  dna_max NUMERIC,
  composite_score NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- PLAYER ALERTS
-- =====================

CREATE TABLE player_alerts (
  id SERIAL PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(player_id) ON DELETE CASCADE,
  report_date DATE,
  report_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_player ON player_alerts(player_id);

-- =====================
-- SETTINGS
-- =====================

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('raus_weights', '{
    "UCS": 0.18, "FCS": 0.12, "ADR": 0.10, "STI": 0.10,
    "RSM": 0.08, "DRI": 0.07, "SCR": 0.15, "RPI": 0.10,
    "SCI": 0.05, "Star_Index": 0.05
  }', 'RAUS Weighted formula weights'),

  ('raus_sub_weights', '{
    "w_UCS": 0.28, "w_FCS": 0.18, "w_ADR": 0.15,
    "w_STI": 0.07, "w_DRIpen": 0.12
  }', 'RAUS secondary metric weights'),

  ('big_board_weights', '{
    "RAUS": 0.45, "SSA": 0.25, "AAA": 0.15,
    "OAI": 0.05, "AGE": 0.10
  }', 'Big Board composite formula weights'),

  ('ssa_weights_guard', '{
    "role": 1.1, "shooting": 1.2, "creation": 1.3,
    "playmaking": 1.3, "defense": 0.8, "offball": 0.8,
    "decision": 1.2, "hustle": 0.3
  }', 'SSA weights for Guards'),

  ('ssa_weights_wing', '{
    "role": 1.2, "shooting": 1.1, "creation": 1.1,
    "playmaking": 0.7, "defense": 1.2, "offball": 1.1,
    "decision": 1.0, "hustle": 0.6
  }', 'SSA weights for Wings'),

  ('ssa_weights_big', '{
    "role": 1.1, "shooting": 0.8, "creation": 0.8,
    "playmaking": 0.6, "defense": 1.4, "offball": 1.2,
    "decision": 0.9, "hustle": 1.2
  }', 'SSA weights for Bigs'),

  ('star_index_bucket_mods', '{
    "Guard": 1.0, "Wing": 1.05, "Big": 1.15
  }', 'Star Index position multipliers'),

  ('raus_tiers', '[
    {"tier": "Generational", "anchor": 9.7, "sigma": 0.4},
    {"tier": "Franchise", "anchor": 8.8, "sigma": 0.55},
    {"tier": "All-Star", "anchor": 7.9, "sigma": 0.65},
    {"tier": "Starter", "anchor": 7.0, "sigma": 0.7},
    {"tier": "Rotation", "anchor": 6.0, "sigma": 0.75},
    {"tier": "Development", "anchor": 5.0, "sigma": 0.85},
    {"tier": "Longshot", "anchor": 4.0, "sigma": 1.0}
  ]', 'RAUS tier definitions with anchors and sigma'),

  ('ptc_map', '{
    "EuroLeague": 1.15,
    "SEC": 1.10, "ACC": 1.10, "Big 12": 1.10, "Big Ten": 1.10,
    "Big East": 1.06, "Pac-12": 1.06,
    "Mid-major": 1.00,
    "Low-major": 0.97
  }', 'PTC competition multiplier by conference/league'),

  ('risk_statuses', '["Clean", "Minor Injury", "Major Injury", "Season Ending Injury", "Arrested", "Suspended", "Off-Court", "Transfer/Leaving", "Unknown"]',
  'Valid alert/risk status values'),

  ('style_archetypes', '{
    "Guard": ["Primary Playmaker", "Scoring Lead Guard", "Shot Creator Combo Guard", "Off Ball Shooter", "Movement Shooter", "Secondary Playmaker", "Rim Pressure Guard", "Transition Guard", "POA Defender", "Energy Guard"],
    "Wing": ["Offensive Engine", "Shot Creating Wing", "Three Level Scorer", "Mid Post Wing", "3 and D Wing", "Off Ball Scoring Wing", "Connector Wing", "Perimeter Stopper", "Switchable Defensive Wing", "Point Forward", "Slasher Wing", "Transition Wing", "Two Way Star Wing"],
    "Big": ["Rim Protector", "Paint Anchor", "Drop Coverage Big", "Rim Runner", "Vertical Lob Threat", "Offensive Rebounder", "Stretch Big", "Pick and Pop Big", "High Post Facilitator", "Switch Big", "Mobile Defensive Big", "Weakside Shot Blocker", "Unicorn"]
  }', 'Style archetypes organized by position bucket');

-- =====================
-- HELPER VIEWS
-- =====================

-- Big Board view: auto-ranked by composite
CREATE OR REPLACE VIEW big_board AS
SELECT
  mb.player_id,
  mb.display_name,
  mb.primary_bucket,
  mb.style_archetype,
  mb.raus_final,
  mb.ssa,
  mb.aaa,
  mb.oai,
  mb.tier,
  mb.alert_status,
  mb.dna_flag,
  mb.dna_max,
  mb.composite_score,
  RANK() OVER (ORDER BY mb.composite_score DESC NULLS LAST) AS board_rank
FROM master_board mb
WHERE mb.raus_final IS NOT NULL
ORDER BY mb.composite_score DESC NULLS LAST;

-- =====================
-- v2 NEW FEATURE TABLES
-- =====================

-- Derived metrics: LCI, SFR, WS-H Factor, Age-Adjusted scores
CREATE TABLE derived_metrics (
  player_id TEXT PRIMARY KEY REFERENCES players(player_id) ON DELETE CASCADE,
  -- Load Capacity Index
  lci NUMERIC,
  -- Stocks-to-Foul Ratio
  sfr NUMERIC,
  sfr_label TEXT, -- 'Disciplined', 'Solid', 'Gambler'
  -- Wingspan-Height Factor
  wsh_factor NUMERIC,
  -- Age-Relative Production Curve
  class_multiplier NUMERIC,
  improvement_delta NUMERIC,
  age_adjusted_ssa NUMERIC,
  -- FT% Projection Signal
  ft_pct_label TEXT, -- 'Projectable Stroke', 'Developing Stroke', 'Mechanical Concern'
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_derived_metrics_updated BEFORE UPDATE ON derived_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE derived_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON derived_metrics FOR ALL USING (auth.role() = 'authenticated');

-- Historical Comp Engine reference database
CREATE TABLE historical_players (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  draft_year INTEGER,
  draft_pick INTEGER,
  tier TEXT CHECK (tier IN ('modern', 'legend')),
  position TEXT,
  college_team TEXT,
  class_year TEXT,
  age_at_draft NUMERIC,
  college_ts_pct NUMERIC,
  college_ft_pct NUMERIC,
  college_usg NUMERIC,
  college_ast_pct NUMERIC,
  college_stl_pct NUMERIC,
  college_blk_pct NUMERIC,
  oai_estimate NUMERIC,
  ssa_estimate NUMERIC,
  scr_estimate NUMERIC,
  sci_estimate NUMERIC,
  nba_ppg_first4 NUMERIC,
  nba_ws48_first4 NUMERIC,
  nba_outcome_label TEXT, -- 'All-Star', 'Starter', 'Rotation', 'Bust'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_historical_tier ON historical_players(tier);
CREATE INDEX idx_historical_position ON historical_players(position);

ALTER TABLE historical_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON historical_players FOR ALL USING (auth.role() = 'authenticated');

-- Player comp results (computed by engine)
CREATE TABLE player_comps (
  id SERIAL PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(player_id) ON DELETE CASCADE,
  historical_player_id INTEGER NOT NULL REFERENCES historical_players(id) ON DELETE CASCADE,
  comp_tier TEXT CHECK (comp_tier IN ('modern', 'legend')),
  similarity_distance NUMERIC,
  comp_rank INTEGER, -- 1 = closest match, 2 = second closest, etc.
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comps_player ON player_comps(player_id);

ALTER TABLE player_comps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON player_comps FOR ALL USING (auth.role() = 'authenticated');

-- Add comp engine weights to settings
INSERT INTO settings (key, value, description) VALUES
  ('comp_engine_weights', '{
    "ssa": 0.20, "scr": 0.15, "sci": 0.15,
    "ts_pct": 0.15, "usg": 0.10, "oai": 0.15, "age": 0.10
  }', 'Weights for historical comp similarity distance calculation'),

  ('age_curve_class_multipliers', '{
    "Freshman": 1.15, "Sophomore": 1.05, "Junior": 1.00,
    "Senior": 0.92, "Fifth-Year": 0.85, "International": 1.00
  }', 'Class year multipliers for age-relative production curve'),

  ('ft_pct_thresholds', '{
    "projectable": 0.80, "developing": 0.72
  }', 'FT% thresholds for projection signal labels'),

  ('sfr_thresholds', '{
    "disciplined": 1.0, "solid": 0.7
  }', 'Stocks-to-Foul Ratio threshold labels'),

  ('wsh_baseline', '{
    "baseline": 2.5, "denominator": 25
  }', 'Wingspan-Height factor parameters: factor = 1 + ((wsh - baseline) / denominator)');

-- =====================
-- ROW-LEVEL SECURITY (basic single-user setup)
-- =====================

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurables ENABLE ROW LEVEL SECURITY;
ALTER TABLE ssa_input ENABLE ROW LEVEL SECURITY;
ALTER TABLE raus_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ssa_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletic_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE dna_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (single-user app)
CREATE POLICY "Allow all for authenticated" ON players FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON prospects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON stats FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON measurables FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON ssa_input FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON raus_scores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON ssa_scores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON athletic_scores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON dna_scores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON master_board FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON player_alerts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- =====================
-- AUTO-UPDATE TIMESTAMPS
-- =====================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_players_updated BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_prospects_updated BEFORE UPDATE ON prospects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_measurables_updated BEFORE UPDATE ON measurables FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_ssa_input_updated BEFORE UPDATE ON ssa_input FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_raus_scores_updated BEFORE UPDATE ON raus_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_ssa_scores_updated BEFORE UPDATE ON ssa_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_athletic_scores_updated BEFORE UPDATE ON athletic_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_dna_scores_updated BEFORE UPDATE ON dna_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_master_board_updated BEFORE UPDATE ON master_board FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- PHASE 11: DRAFT ARCHIVE
-- =====================

-- Add archive/draft tracking columns to players
ALTER TABLE players ADD COLUMN IF NOT EXISTS draft_class TEXT DEFAULT '2026';
ALTER TABLE players ADD COLUMN IF NOT EXISTS draft_status TEXT DEFAULT 'prospect' CHECK (draft_status IN ('prospect', 'drafted', 'undrafted', 'archived'));
ALTER TABLE players ADD COLUMN IF NOT EXISTS draft_pick INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS draft_team TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS draft_date DATE;

-- Add NBA outcome tracking to historical_players for accuracy tracker
ALTER TABLE historical_players ADD COLUMN IF NOT EXISTS actual_ppg NUMERIC;
ALTER TABLE historical_players ADD COLUMN IF NOT EXISTS actual_rpg NUMERIC;
ALTER TABLE historical_players ADD COLUMN IF NOT EXISTS actual_apg NUMERIC;
ALTER TABLE historical_players ADD COLUMN IF NOT EXISTS actual_ws48 NUMERIC;
ALTER TABLE historical_players ADD COLUMN IF NOT EXISTS all_star_selections INTEGER DEFAULT 0;
ALTER TABLE historical_players ADD COLUMN IF NOT EXISTS outcome_updated_at TIMESTAMPTZ;

-- =====================
-- PHASE 12: INTERACTIVE MOCK DRAFT
-- =====================

CREATE TABLE nba_teams (
  team_id TEXT PRIMARY KEY,
  team_name TEXT NOT NULL,
  conference TEXT CHECK (conference IN ('East', 'West')),
  division TEXT,
  logo_url TEXT,
  need_1 TEXT,
  need_2 TEXT,
  need_3 TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mock_drafts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  draft_class TEXT DEFAULT '2026',
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mock_draft_picks (
  id SERIAL PRIMARY KEY,
  mock_draft_id INTEGER NOT NULL REFERENCES mock_drafts(id) ON DELETE CASCADE,
  pick_number INTEGER NOT NULL,
  round INTEGER NOT NULL CHECK (round IN (1, 2)),
  original_team_id TEXT NOT NULL REFERENCES nba_teams(team_id),
  current_team_id TEXT NOT NULL REFERENCES nba_teams(team_id),
  player_id TEXT REFERENCES players(player_id),
  is_traded BOOLEAN DEFAULT FALSE,
  trade_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mock_picks_draft ON mock_draft_picks(mock_draft_id);
CREATE INDEX idx_mock_picks_player ON mock_draft_picks(player_id);

-- RLS for new tables
ALTER TABLE nba_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_draft_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON nba_teams FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON mock_drafts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON mock_draft_picks FOR ALL USING (auth.role() = 'authenticated');

-- Triggers
CREATE TRIGGER trg_nba_teams_updated BEFORE UPDATE ON nba_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_mock_drafts_updated BEFORE UPDATE ON mock_drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Preload all 30 NBA teams
INSERT INTO nba_teams (team_id, team_name, conference, division) VALUES
  ('ATL', 'Atlanta Hawks', 'East', 'Southeast'),
  ('BOS', 'Boston Celtics', 'East', 'Atlantic'),
  ('BKN', 'Brooklyn Nets', 'East', 'Atlantic'),
  ('CHA', 'Charlotte Hornets', 'East', 'Southeast'),
  ('CHI', 'Chicago Bulls', 'East', 'Central'),
  ('CLE', 'Cleveland Cavaliers', 'East', 'Central'),
  ('DAL', 'Dallas Mavericks', 'West', 'Southwest'),
  ('DEN', 'Denver Nuggets', 'West', 'Northwest'),
  ('DET', 'Detroit Pistons', 'East', 'Central'),
  ('GSW', 'Golden State Warriors', 'West', 'Pacific'),
  ('HOU', 'Houston Rockets', 'West', 'Southwest'),
  ('IND', 'Indiana Pacers', 'East', 'Central'),
  ('LAC', 'Los Angeles Clippers', 'West', 'Pacific'),
  ('LAL', 'Los Angeles Lakers', 'West', 'Pacific'),
  ('MEM', 'Memphis Grizzlies', 'West', 'Southwest'),
  ('MIA', 'Miami Heat', 'East', 'Southeast'),
  ('MIL', 'Milwaukee Bucks', 'East', 'Central'),
  ('MIN', 'Minnesota Timberwolves', 'West', 'Northwest'),
  ('NOP', 'New Orleans Pelicans', 'West', 'Southwest'),
  ('NYK', 'New York Knicks', 'East', 'Atlantic'),
  ('OKC', 'Oklahoma City Thunder', 'West', 'Northwest'),
  ('ORL', 'Orlando Magic', 'East', 'Southeast'),
  ('PHI', 'Philadelphia 76ers', 'East', 'Atlantic'),
  ('PHX', 'Phoenix Suns', 'West', 'Pacific'),
  ('POR', 'Portland Trail Blazers', 'West', 'Northwest'),
  ('SAC', 'Sacramento Kings', 'West', 'Pacific'),
  ('SAS', 'San Antonio Spurs', 'West', 'Southwest'),
  ('TOR', 'Toronto Raptors', 'East', 'Atlantic'),
  ('UTA', 'Utah Jazz', 'West', 'Northwest'),
  ('WAS', 'Washington Wizards', 'East', 'Southeast');

-- Add need-archetype mapping to settings
INSERT INTO settings (key, value, description) VALUES
  ('need_archetype_map', '{
    "Rim Protector": {"buckets": ["Big"], "archetypes": ["Rim Protector", "Paint Anchor", "Weakside Shot Blocker"]},
    "3-and-D Wing": {"buckets": ["Wing"], "archetypes": ["3 and D Wing", "Perimeter Stopper", "Switchable Defensive Wing"]},
    "Primary Playmaker": {"buckets": ["Guard"], "archetypes": ["Primary Playmaker", "Scoring Lead Guard"]},
    "Stretch Big": {"buckets": ["Big"], "archetypes": ["Stretch Big", "Pick and Pop Big"]},
    "Shot Creator": {"buckets": ["Guard", "Wing"], "archetypes": ["Shot Creator Combo Guard", "Shot Creating Wing", "Offensive Engine"]},
    "Rim Runner": {"buckets": ["Big"], "archetypes": ["Rim Runner", "Vertical Lob Threat"]},
    "Point Forward": {"buckets": ["Wing"], "archetypes": ["Point Forward", "Connector Wing"]},
    "Secondary Playmaker": {"buckets": ["Guard", "Wing"], "archetypes": ["Secondary Playmaker", "Connector Wing"]},
    "Scoring Wing": {"buckets": ["Wing"], "archetypes": ["Three Level Scorer", "Off Ball Scoring Wing", "Slasher Wing"]},
    "Defensive Anchor": {"buckets": ["Big"], "archetypes": ["Rim Protector", "Paint Anchor", "Mobile Defensive Big"]}
  }', 'Maps team need labels to style archetypes for mock draft recommendations');
