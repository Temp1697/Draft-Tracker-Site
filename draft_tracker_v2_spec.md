# NBA Draft Scouting Tracker v2 — Project Specification

## Overview

This document is the complete technical spec for rebuilding an NBA draft scouting tracker as a web application. The system was originally built over ~6 months in Google Sheets (v1) and is being ported to a React + Supabase web app (v2).

The system evaluates NBA draft prospects using a hybrid model of statistical production, skill indicators, athletic profiling, contextual adjustments, and projection scoring — then ranks them on a composite Big Board. It mirrors how NBA front offices think:

> **Can he play? → SSA**
> **Can he translate? → RAUS**
> **Does he have upside? → AAA**
> **How early should we draft him? → Big Board**

---

## Tech Stack

- **Frontend:** React (Vite or Next.js)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (single user for now, expandable)
- **Hosting:** Vercel or Supabase hosting
- **Charts:** Recharts or D3 for scouting cards / DNA radar charts

---

## Architecture Philosophy

v1 used a layered pipeline to prevent double-counting and circular logic:

```
Players → Stats → Skill Metrics (RAUS_Auto / SSA_Auto) → Projection (RAUS_Final)
                                                        → Production (SSA_Final)
         Measurables → Athletic Profile (OAI / AAA)
         Prospects_DB → Context (PTC, Age)
                                                        → Master_Board (hub)
                                                        → Big_Board (composite ranking)
                                                        → DNA_Archetype (historical comps)
                                                        → Scouting Cards (visual output)
```

**Key design rules:**
1. Stats → Skills → Projection → Ranking (strict separation of layers)
2. RAUS stays "pure" — age is applied at the Big Board level, not inside RAUS
3. Big Board is a composite (not just RAUS), combining projection + production + athleticism + age
4. Override system exists at RAUS level — model does heavy lifting, human corrects via eye test
5. All boards are dynamic (auto-sort, auto-rank)

---

## Data Model

### Current Scale
- **130 players** in the 2025-26 draft class
- **94 statistical columns** per player
- **109 total columns** in Stats (including identifiers)
- **11 DNA archetypes** (Klaw, King, Reaper, Wilt, PointGod, Brow, Air, Beard, Chef, Joker, Diesel)
- **36 style archetypes** across 3 position buckets

---

## Database Tables

### `players`
Primary player registry. All other tables reference `player_id`.

| Column | Type | Notes |
|--------|------|-------|
| player_id | text PK | Format: `firstlast_birthyear` e.g. `darrynpeterson_2007` |
| display_name | text | |
| school_team | text | |
| primary_bucket | text | `Guard`, `Wing`, `Big` |
| style_archetype | text | One of 36 archetypes (see Settings) |
| birth_year | integer | |

### `prospects`
Scouting metadata layer.

| Column | Type | Notes |
|--------|------|-------|
| player_id | text FK → players | |
| team | text | School/club |
| league_conf | text | e.g. `Big 12`, `ACC`, `EuroLeague` |
| height | numeric | Inches |
| weight | numeric | Pounds |
| wingspan | numeric | Inches |
| age_year | text | |
| class | text | Fr/So/Jr/Sr/Intl |
| accolades | text | |
| strengths | text | |
| weaknesses | text | |
| comp_upper | text | Ceiling comp |
| comp_lower | text | Floor comp |
| tier | text | e.g. `Tier 2 — All-Star / Primary Starter` |

### `stats`
Raw statistical inputs — one row per player per season.

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| player_id | text FK → players | |
| season | text | |
| games | integer | |
| mpg | numeric | |
| ppg | numeric | |
| rpg | numeric | |
| apg | numeric | |
| spg | numeric | |
| bpg | numeric | |
| tov | numeric | |
| pf | numeric | |
| fgm | numeric | |
| fga | numeric | |
| three_ptm | numeric | |
| three_pta | numeric | |
| ftm | numeric | |
| fta | numeric | |
| fg_pct | numeric | |
| three_pt_pct | numeric | |
| ft_pct | numeric | |
| efg_pct | numeric | |
| ts_pct | numeric | |
| three_pta_rate | numeric | 3ptaR |
| ft_rate | numeric | ftR |
| ast_tov | numeric | |
| pts_per40 | numeric | |
| reb_per40 | numeric | |
| ast_per40 | numeric | |
| stl_per40 | numeric | |
| blk_per40 | numeric | |
| tov_per40 | numeric | |
| orb_total | numeric | |
| drb_total | numeric | |
| per | numeric | PER |
| ws | numeric | Win Shares |
| dws | numeric | Defensive WS |
| ortg | numeric | |
| drtg | numeric | |
| bpm | numeric | |
| obpm | numeric | |
| dbpm | numeric | |
| rim_fg_pct | numeric | |
| mid_fg_pct | numeric | |
| cs_three_pct | numeric | Catch & Shoot 3pt% |
| pu_three_pct | numeric | Pull-Up 3pt% |
| pnr_bh_ppp | numeric | PnR Ball Handler PPP |
| pnr_rm_ppp | numeric | PnR Roll Man PPP |
| su_ppp | numeric | Spot Up PPP |
| iso_ppp | numeric | |
| trans_freq_pct | numeric | |
| trans_ppp | numeric | |
| pts_total | integer | |
| reb_total | integer | |
| ast_total | integer | |
| tov_total | integer | |
| min_total | integer | |
| stl_total | integer | |
| blk_total | integer | |
| pf_total | integer | |
| fgm_total | integer | |
| fga_total | integer | |
| three_ptm_total | integer | |
| three_pta_total | integer | |
| ftm_total | integer | |
| fta_total | integer | |
| blk_pct | numeric | |
| stl_pct | numeric | |
| dunks | integer | |
| dunks_att | integer | |
| dunk_pct | numeric | |
| two_pt_close | numeric | |
| two_pt_close_att | numeric | |
| two_pt_close_pct | numeric | |
| two_pt_far | numeric | |
| two_pt_far_att | numeric | |
| two_pt_far_pct | numeric | |
| porpagatu | numeric | |
| dporpagatu | numeric | |
| orb_pct | numeric | |
| drb_pct | numeric | |
| ast_pct | numeric | |
| tov_pct | numeric | |
| usg | numeric | Usage% |
| astd_at_rim_pct | numeric | AST'D at Rim% |
| astd_inside_arc_pct | numeric | |
| astd_three_pct | numeric | |
| astd_tot_pct | numeric | |
| at_rim_share_pct | numeric | |
| inside_arc_share_pct | numeric | |
| three_pt_share_pct | numeric | |
| three_pta_per40 | numeric | |
| fta_per40 | numeric | |
| dunks_per_game | numeric | |

### `measurables`
Combine / athletic testing data.

| Column | Type | Notes |
|--------|------|-------|
| player_id | text FK → players | |
| height | numeric | Inches |
| weight | numeric | Pounds |
| wingspan | numeric | Inches |
| standing_reach | numeric | |
| vertical | numeric | Standing vert |
| max_vertical | numeric | |
| three_quarter_sprint | numeric | |
| lane_agility | numeric | |
| shuttle | numeric | |
| bench | integer | |
| ws_minus_h | numeric | Wingspan minus Height |

### `raus_scores`
Core projection engine — computed scores per player.

| Column | Type | Notes |
|--------|------|-------|
| player_id | text FK → players | |
| primary_bucket | text | |
| scr_auto | numeric | Self-Creation Rating |
| rpi_auto | numeric | Rim Pressure Index |
| sci_auto | numeric | Shot Creation Index |
| star_index | numeric | Composite star potential |
| ptc_auto | numeric | Playing Time/Competition multiplier |
| ucs_auto | numeric | Perimeter scoring |
| fcs_auto | numeric | Finishing |
| adr_auto | numeric | Decision-making |
| sti_auto | numeric | Defensive events (steals/blocks) |
| rsm_auto | numeric | Size/Rebounding |
| dri_auto | numeric | Defensive versatility |
| ppi_auto | numeric | Player Production Index |
| raus_base | numeric | Simple average of all skill metrics |
| raus_weighted | numeric | Weighted average |
| raus_final_auto | numeric | Weighted × PTC |
| raus_override | numeric NULL | Manual override (human eye test) |
| raus_final | numeric | = override if set, else auto |

### `ssa_input`
Manual skill assessment grades (0-10 scale, 0.5 increments).

| Column | Type | Notes |
|--------|------|-------|
| player_id | text FK → players | |
| role_translation | numeric | |
| shooting_profile | numeric | |
| creation_scalability | numeric | |
| playmaking_efficiency | numeric | |
| defensive_impact | numeric | |
| offball_value | numeric | |
| decision_making | numeric | |
| hustle_impact | numeric | |

### `ssa_scores`
Computed SSA (Skill Set Assessment) outputs.

| Column | Type | Notes |
|--------|------|-------|
| player_id | text FK → players | |
| position | text | |
| role | text | |
| shooting | numeric | |
| creation | numeric | |
| playmaking | numeric | |
| defense | numeric | |
| offball | numeric | |
| decision | numeric | |
| hustle | numeric | |
| age_mod | numeric | Age modifier |
| ws_h_mod | numeric | Wingspan-height modifier |
| ssa_auto_final | numeric | Weighted SSA score |
| ssa_rank_label | text | e.g. `Top 3 Pick`, `Lottery (4-14)` |
| ssa_weighted | numeric | |
| ssa_weighted_rank_label | text | e.g. `Elite Statistical Résumé` |

### `player_alerts`
Injury / risk tracking.

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| player_id | text FK → players | |
| report_date | date | |
| report_type | text | e.g. `Fractured L Hand`, `Recurring Injuries` |
| notes | text | |

### `settings`
All configurable weights and thresholds.

| Column | Type | Notes |
|--------|------|-------|
| key | text PK | |
| value | jsonb | Flexible storage |

---

## Scoring Engines

### RAUS Pipeline

**Skill Metrics** (columns in RAUS_Auto, computed from Stats):
- `SCR_Auto` — Self-Creation (array formula from stats)
- `RPI_Auto` — Rim Pressure Index
- `SCI_Auto` — Shot Creation Index
- `UCS_Auto` — Perimeter Scoring
- `FCS_Auto` — Finishing
- `ADR_Auto` — Decision-Making
- `STI_Auto` — Defensive Events
- `RSM_Auto` — Size/Rebounding
- `DRI_Auto` — Defensive Versatility
- `PPI_Auto` — Player Production Index

**Star Index:**
```
star_index = ROUND((0.35 × SCR + 0.25 × RPI + 0.4 × SCI) × bucket_modifier, 2)

bucket_modifier:
  Guard = 1.0
  Wing  = 1.05
  Big   = 1.15
```

**PPI (Player Production Index):**
```
ppi = ROUND((
  RAUS_Weighted × 0.35 +
  RAUS_Base × 0.20 +
  Star_Index × 0.15 +
  SCI × 0.10 +
  RPI × 0.10 +
  SCR × 0.05
) × PTC, 2)
```

**RAUS Base:**
```
raus_base = ROUND(AVERAGE(SCR, RPI, SCI, Star_Index, UCS, FCS, ADR, STI, RSM, DRI), 2)
```

**RAUS Weighted:**
```
raus_weighted = ROUND(
  UCS × 0.18 +
  FCS × 0.12 +
  ADR × 0.10 +
  STI × 0.10 +
  RSM × 0.08 +
  DRI × 0.07 +
  SCR × 0.15 +
  RPI × 0.10 +
  SCI × 0.05 +
  Star_Index × 0.05
, 2)
```

**RAUS Final Auto:**
```
raus_final_auto = ROUND(RAUS_Weighted × PTC, 2)
```

**RAUS Final (with override):**
```
raus_final = raus_override ?? raus_final_auto
```

### PTC (Competition Multiplier)

| League/Conference | Multiplier |
|---|---|
| EuroLeague | 1.15 |
| SEC / ACC / Big 12 / Big Ten | 1.10 |
| Big East / Pac-12 | 1.06 |
| Mid-major | 1.00 |
| Low-major | 0.97–0.94 |

(Stored in settings, applied as a lookup from `prospects.league_conf`)

### SSA (Skill Set Assessment)

**Position-specific weights:**

| Category | Guard | Wing | Big |
|---|---|---|---|
| Role Translation | 1.1 | 1.2 | 1.1 |
| Shooting | 1.2 | 1.1 | 0.8 |
| Creation | 1.3 | 1.1 | 0.8 |
| Playmaking | 1.3 | 0.7 | 0.6 |
| Defense | 0.8 | 1.2 | 1.4 |
| Off-Ball | 0.8 | 1.1 | 1.2 |
| Decision | 1.2 | 1.0 | 0.9 |
| Hustle | 0.3 | 0.6 | 1.2 |

**SSA Formula:**
```
weighted_sum = (role × w_role + shoot × w_shoot + create × w_create + playmake × w_playmake + defense × w_defense + offball × w_offball + decision × w_decision + hustle × w_hustle)
denom = sum of all weights for that bucket
ssa = ROUND((weighted_sum / denom) × age_mod × ws_h_mod, 2)
```

**SSA Rank Labels:**
| Score | Label |
|---|---|
| ≥ 9.0 | Top 3 Pick |
| ≥ 8.25 | Lottery (4-14) |
| ≥ 7.25 | Mid-Late 1st |
| ≥ 6.75 | 2nd Round |
| ≥ 6.25 | Bench/Specialist |
| < 6.25 | Fringe/Two-Way |

**SSA Weighted Rank Labels:**
| Score | Label |
|---|---|
| ≥ 8.75 | Elite Statistical Résumé |
| ≥ 8.0 | High-End Profile |
| ≥ 7.25 | Starter-Level Indicators |
| ≥ 6.75 | Rotation Statistical Profile |
| ≥ 6.25 | Partial Skill Profile |
| < 6.25 | Insufficient Résumé |

### Athletic Metrics

**OAI** (Overall Athletic Index): Computed from combine measurables — MAS_Sqrt, MAV, MAMI composite. Requires standing reach, verticals, sprint, agility data.

**AAA** (Athletic + Size composite): Extends OAI with height/weight/wingspan.

**Band Labels** (percentile within bucket):
| Percentile | OAI Band | AAA Band |
|---|---|---|
| ≥ 99th | Outlier Burst | Outlier Physical |
| ≥ 90th | Elite Burst | Elite Physical |
| ≥ 70th | Plus Burst | Plus Physical |
| ≥ 50th | Average Burst | Average Physical |
| < 50th | Limited Burst | Limited Physical |

### Big Board Composite

**Weights (stored in Settings):**
| Metric | Weight |
|---|---|
| RAUS | 0.45 |
| SSA | 0.25 |
| AAA | 0.15 |
| OAI | 0.05 |
| AGE | 0.10 |

**Formula:**
```
composite = ROUND(
  raus_final × 0.45 +
  ssa × 0.25 +
  aaa × 0.15 +
  oai × 0.05 +
  age_score × 0.10
, 4)
```

Age score = `2026 - birth_year` (applied at ranking level, not inside RAUS).

Board auto-sorts descending by composite.

### RAUS Tier System

| Tier | Anchor | Sigma |
|---|---|---|
| Generational | 9.7 | 0.4 |
| Franchise | 8.8 | 0.55 |
| All-Star | 7.9 | 0.65 |
| Starter | 7.0 | 0.7 |
| Rotation | 6.0 | 0.75 |
| Development | 5.0 | 0.85 |
| Longshot | 4.0 | 1.0 |

---

## DNA Archetype System

11 archetypes modeled after NBA legends. Each archetype has 5 component scores (C1-C5), each worth 0-20 points. Total possible = 100.

**Archetypes:**
1. **King** (LeBron) — C1: Freak (athletic + size), C2: Passing, C3: Rim Pressure, C4: IQ/Efficiency, C5: Versatility
2. **Klaw** (Kawhi) — C1: Defense, C2: Length (WS-H), C3: Inside Arc, C4: Efficiency/Decision, C5: Off-Ball — *Requires: H 77-80, WS-H ≥ 4*
3. **Air** (Jordan) — C1: Explosive 2-Way Athlete, C2: Inside Arc, C3: Alpha Volume, C4: Rim Pressure, C5: Perimeter D
4. **Reaper** (KD) — C1: Length + Shooting + Finishing, C2: Scoring Volume + Efficiency, C3: Mid-Range + FT, C4: IQ/Low TOV, C5: Defensive Events — *Requires: H ≥ 80*
5. **Wilt** — C1-C5: Size-based dominance metrics (rebounding, rim protection, rim finishing)
6. **PointGod** (CP3) — *Requires: H 68-77, W 170-205* — Passing, efficiency, low TOV, defensive plays
7. **Brow** (AD) — *Requires: H 81-85* — Rim protection + versatile scoring
8. **Beard** (Harden) — *Requires: H 75-78, W ≥ 215* — Volume scoring + playmaking
9. **Chef** (Curry) — *Requires: 3ptaR ≥ 30%, 3pta/40 ≥ 4, 3pt% ≥ 32%, TS% ≥ 54%* — Shooting volume + gravity
10. **Joker** (Jokic) — *Requires: H ≥ 81, W ≥ 240* — Passing big + scoring efficiency
11. **Diesel** (Shaq) — Size + rim dominance

**Scoring logic:** Each component uses threshold-based scoring (hits system). Example:
```
hits = (stat_a >= threshold_a) + (stat_b >= threshold_b) + ...
score = IFS(hits >= 4 → 20, hits = 3 → 16, hits = 2 → 12, hits = 1 → 8, else → 0)
```

**Output columns per archetype:** `[Archetype]_Score` (total of C1-C5, shown as N/A if eligibility gates fail, capped at < 60 = N/A)

**DNA_Flag:** Set on Master_Board when a player hits ≥ 80 on any archetype (🃏 emoji in v1)
**DNA_Max:** Highest archetype score across all 11

---

## Settings & Configuration

All weights, thresholds, and dropdowns are stored centrally.

### Position Buckets
`Guard`, `Wing`, `Big`

### Style Archetypes (36 total)

**Guards (10):** Primary Playmaker, Scoring Lead Guard, Shot Creator Combo Guard, Off Ball Shooter, Movement Shooter, Secondary Playmaker, Rim Pressure Guard, Transition Guard, POA Defender, Energy Guard

**Wings (13):** Offensive Engine, Shot Creating Wing, Three Level Scorer, Mid Post Wing, 3 and D Wing, Off Ball Scoring Wing, Connector Wing, Perimeter Stopper, Switchable Defensive Wing, Point Forward, Slasher Wing, Transition Wing, Two Way Star Wing

**Bigs (13):** Rim Protector, Paint Anchor, Drop Coverage Big, Rim Runner, Vertical Lob Threat, Offensive Rebounder, Stretch Big, Pick and Pop Big, High Post Facilitator, Switch Big, Mobile Defensive Big, Weakside Shot Blocker, Unicorn

### Risk/Alert Statuses
Clean, Minor Injury, Major Injury, Season Ending Injury, Arrested, Suspended, Off-Court, Transfer/Leaving, Unknown

### SSA Scale
0.0 to 10.0 in 0.5 increments

### RAUS Sub-Weights (for secondary metrics)
- w_UCS: 0.28
- w_FCS: 0.18
- w_ADR: 0.15
- w_STI: 0.07
- w_DRIpen: 0.12

---

## UI Views (Priority Order)

### 1. Scouting Cards (PRIMARY)
Individual player profile cards with:
- Photo placeholder
- Bio info (school, height/weight/wingspan, age, class)
- RAUS_Final score + tier badge
- SSA score + rank label
- OAI/AAA scores + band badges
- **LCI score** (Load Capacity Index — usage-efficiency tension)
- **SFR badge** (Stocks-to-Foul Ratio — defensive discipline indicator)
- **FT% projection label** (Projectable Stroke / Developing / Mechanical Concern)
- **WS-H Factor** displayed with wingspan differential
- Radar chart of skill metrics (SCR, RPI, SCI, UCS, FCS, ADR, STI, RSM, DRI)
- SSA breakdown (8 categories with position weights shown)
- DNA archetype matches (show top 2-3 with scores, radar overlay)
- **Historical comps** (top 3 modern comps with career outcomes + legend echo if applicable)
- **Age-adjusted SSA** with class multiplier and improvement velocity shown
- Strengths / Weaknesses text
- Upper/Lower comps
- Alert status + risk notes
- RAUS override input field

### 2. Big Board
- Auto-sorted by composite score
- Columns: Rank, Name, Bucket, Archetype, RAUS, SSA, AAA, OAI, Composite
- Color-coded by tier
- Filterable by bucket, tier, archetype
- Click row → opens scouting card

### 3. Comparison View
- Side-by-side 2-4 players
- Overlaid radar charts
- Stat tables with highlights for leader in each category
- DNA archetype comparison

### 4. Data Entry / Grading Interface
- Form-based entry for SSA grades (8 sliders, 0-10 in 0.5 steps)
- Stats entry (or CSV import)
- Measurables entry
- RAUS override input
- Player creation form
- Alert/injury logging

### 5. Dashboard
- Class overview stats
- Tier distribution chart
- Bucket breakdown
- Recent alerts
- Players missing data (OAI/AAA gaps flagged)

---

## v2 New Features (Planned)

### 1. Age-Relative Production Curve

v1 used a simple linear age weight at the Big Board level. v2 replaces this with a two-layer system that adjusts production scores based on class year AND year-over-year improvement.

**Class Multiplier (base):**
| Class | Multiplier |
|---|---|
| Freshman | 1.15 |
| Sophomore | 1.05 |
| Junior | 1.00 |
| Senior | 0.92 |
| Fifth-Year / Grad | 0.85 |
| International (age-based) | Interpolated by age |

**Improvement Velocity Bonus:**
Pull key stats from current and prior season (TS%, usage, assist rate, steal%, TO rate). Calculate year-over-year delta as a normalized average of percentage changes across those metrics. Cap the delta contribution at ±0.10 so one outlier stat doesn't break the scale.

**Formula:**
```
improvement_delta = CLAMP(avg_yoy_change_across_key_stats, -0.10, +0.10)
age_adjusted_score = raw_score × class_multiplier × (1 + improvement_delta)
```

**Requires:** Previous season stats in the `stats` table (multi-season support already exists via `season` column). The engine compares the two most recent seasons per player to compute deltas.

**Application:** Applied to SSA and used as a modifier in the Big Board composite (replaces the simple `2026 - birth_year` age factor).

---

### 2. Load Capacity Index (LCI)

A new signature metric that captures how well a player's efficiency holds up under offensive burden. This is the usage-efficiency tension metric.

**Core concept:** High usage + high efficiency = carries load. High usage + cratering efficiency = collapses under pressure.

**Formula:**
```
lci = ts_pct × log(usg) × (1 + ast_pct / 100)
```

- `TS%` = efficiency measure
- `log(Usage%)` = load measure (logarithmic so the jump from role player to primary option matters more than primary to dominant)
- `AST%` bonus = rewards players who maintain efficiency while also creating for others (full offensive responsibility)

**All inputs available from Stats table:** `ts_pct`, `usg`, `ast_pct`

**Design decision for v2:** LCI may absorb or partially replace overlapping work currently done by SCR (which uses usage + scoring volume) and SCI (which uses usage + assist rate). During build, evaluate whether LCI can replace SCR/SCI or should sit alongside them. If it replaces them, it simplifies the RAUS pipeline. If alongside, it becomes a standalone metric displayed on scouting cards and potentially feeds into the Big Board composite.

**Stored in:** New column in `raus_scores` table or new `derived_metrics` table.

---

### 3. FT% as a Projection Signal

v1 uses TS% as the primary efficiency indicator. v2 adds FT% as a separate developmental/projection signal.

**Why both:** TS% tells you how efficient a player is NOW. FT% tells you what his shooting COULD BECOME. A player shooting 34% from three but 82% from the line has the mechanical foundation — the three-point shot can develop. A player shooting 38% from three but 64% from the line is a red flag — that three-point percentage may be a mirage built on open catch-and-shoot looks.

**Historical signal:** Players above 78-80% FT in college developed into reliable NBA three-point shooters at a significantly higher rate.

**Application:** Add FT% as a separate input into SCR and UCS shooting projection components. Display as a standalone indicator on scouting cards with a threshold flag:
- ≥ 80% = "Projectable Stroke" (green)
- 72-79% = "Developing Stroke" (yellow)
- < 72% = "Mechanical Concern" (red)

**Already in Stats table:** `ft_pct`

---

### 4. Stocks-to-Foul Ratio (SFR)

New defensive quality metric that separates disciplined defenders from gamblers.

**Formula:**
```
sfr = (stl_per40 + blk_per40) / pf_per40
```

Where `pf_per40 = (pf / mpg) × 40` (or use pf_total / min_total × 40).

**Interpretation:**
| SFR | Meaning |
|---|---|
| > 1.0 | Disciplined, high-IQ defender — generates more events than fouls |
| 0.7–1.0 | Solid defender, reasonable discipline |
| < 0.6 | Gambler or physically overmatched — inflated defensive stats at a cost |

**Application:** Feeds into BOTH:
- **STI** — qualifies defensive playmaking (are those steals real disruption or costly gambling?)
- **DRI** — speaks to switching versatility (can he guard multiple positions without fouling?)

**Bust indicator use:** High raw stocks + low SFR = red flag. Displayed on scouting cards as a defensive discipline badge.

**All inputs available from Stats table:** `stl_per40`, `blk_per40`, `pf` (or pf_total/min_total)

---

### 5. Wingspan-Height Differential Multiplier (WS-H Factor)

v1 stores `ws_minus_h` in Measurables but doesn't systematically apply it. v2 turns it into a scaling multiplier applied to specific metrics.

**Formula:**
```
wsh_factor = 1 + ((ws_minus_h - 2.5) / 25)
```

Baseline is +2.5 inches (NBA average). The `/25` denominator controls scaling aggressiveness.

**Example outputs:**
| WS-H | Factor |
|---|---|
| +6.0 | 1.14 (+14%) |
| +4.0 | 1.06 (+6%) |
| +2.5 | 1.00 (baseline) |
| +1.0 | 0.94 (-6%) |
| 0.0 | 0.90 (-10%) |

**Applied selectively to:**
- **STI** — longer arms = more disruption value
- **DRI** — longer arms = more switching ability
- **FCS** — longer arms = better finishing over contests
- **RSM** — longer arms = more rebounding range

**NOT applied to:** Speed, agility, or creation metrics where length is less relevant.

**Impact:** Two players with identical steal rates get different STI scores if one has +6 wingspan and the other is +1. The +6 guy's defensive disruption is more projectable.

**Already in Measurables table:** `ws_minus_h`

---

### 6. Historical Comp Engine

A similarity-based comparison system that matches prospects against a database of past draft picks and legends.

**Reference Database:**
- **Modern tier:** Last 10 draft classes (2015-2025). For each player, log final college season metrics: OAI tier, SSA tier, SCR, SCI, usage, TS%, FT%, age, class year, position, and NBA career outcome stats (PPG, WS/48 over first 4 seasons).
- **Legend tier:** Hall of Famers and All-NBA caliber players. Stored separately so modern statistical averages aren't skewed by era differences.

**New table: `historical_players`**

| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| name | text | |
| draft_year | integer | |
| draft_pick | integer | |
| tier | text | `modern` or `legend` |
| position | text | |
| college_team | text | |
| class_year | text | |
| age_at_draft | numeric | |
| college_ts_pct | numeric | |
| college_ft_pct | numeric | |
| college_usg | numeric | |
| college_ast_pct | numeric | |
| college_stl_pct | numeric | |
| college_blk_pct | numeric | |
| oai_estimate | numeric | |
| ssa_estimate | numeric | |
| scr_estimate | numeric | |
| sci_estimate | numeric | |
| nba_ppg_first4 | numeric | |
| nba_ws48_first4 | numeric | |
| nba_outcome_label | text | e.g. "All-Star", "Starter", "Rotation", "Bust" |

**Similarity Algorithm:**
Weighted Euclidean distance across key metrics. Prospect's profile is compared against every historical player.

```
distance = sqrt(
  w1 × (prospect.ssa - comp.ssa)² +
  w2 × (prospect.scr - comp.scr)² +
  w3 × (prospect.sci - comp.sci)² +
  w4 × (prospect.ts_pct - comp.ts_pct)² +
  w5 × (prospect.usg - comp.usg)² +
  w6 × (prospect.oai - comp.oai)² +
  w7 × (prospect.age - comp.age)²
)
```

Weights tunable in Settings. Top 3-5 closest matches returned per player.

**Output on scouting cards:**
- "Closest modern comps: Desmond Bane (2020), Herb Jones (2021), Dillon Brooks (2017)"
- "Average career outcome for this cluster: 11.2 PPG, 2.8 WS/48 over first 4 seasons"
- "Legend echo: [name]" (separate comparison, displayed distinctly)

**Build note:** This requires building the historical database first. Can start with a CSV import of ~300 players (30 picks × 10 drafts) and expand over time.

---

### 7. Still Open / Future Consideration

- **Franchise Player Detector** — All-NBA probability identifier (not yet designed)
- **Confidence Score** — sample size weighting + minutes played adjustment
- **Positional Normalization** — guards penalized by rebounding, bigs by shooting
- **OAI vs AAA consolidation** — possibly combine into single metric
- **SSA Refinement** — incorporate PPP / shot quality metrics beyond current inputs
- **SCR/SCI vs LCI redundancy cleanup** — evaluate whether LCI absorbs or replaces overlapping metrics
- **RAUS_Input tab cleanup** — exists in v1, fully deprecated in v2

---

## Data Import

v1 data lives in `Draft_Model_v1_3-23-26.xlsx` with these tabs:
- Players (130 rows)
- Stats (130 rows × 94 stat columns)
- Prospects_DB (130 rows)
- SSA_Input (130 rows × 8 grades each)
- Measurables (130 rows, mostly height/weight/wingspan — OAI/AAA sparse)
- RAUS_Auto (130 rows with computed scores)
- Master_Board (130 rows)
- Player_Alerts
- Settings
- DNA_Archetype (130 rows × 117 columns)

Import priority: Players → Stats → Prospects → SSA_Input → Measurables → recalculate everything else from the engine.

---

## Build Phases

**Phase 1:** Supabase setup + database schema + data import from xlsx
**Phase 2:** Core scoring engine (RAUS + SSA + Big Board composite) as server-side calculations
**Phase 3:** Big Board UI with sorting, filtering, tier badges
**Phase 4:** Scouting cards with radar charts and DNA profiles
**Phase 5:** Data entry / grading interface (SSA sliders, stats forms, overrides)
**Phase 6:** v2 metrics — LCI, SFR, WS-H Factor, FT% projection labels (new derived_metrics table)
**Phase 7:** Age-Relative Production Curve (class multipliers + improvement velocity from multi-season stats)
**Phase 8:** Comparison view (side-by-side cards, overlaid radars)
**Phase 9:** Historical Comp Engine (build reference database, similarity algorithm, display on cards)
**Phase 10:** Dashboard + data gap alerts
**Phase 11:** Draft Archive System — draft_class field, draft results workflow, historical player migration, accuracy tracker
**Phase 12:** Interactive Mock Draft — 30-team board, need-based recommendations, pick trading, prospect pool with card popups

---

## Phase 11 — Draft Archive System

### Purpose
Enable multi-year usage of the tracker. After each draft, players are archived with their scouting data preserved, moved into the historical comp database, and the system resets for the next class while retaining full access to past years.

### Database Changes

**Add to `players` table:**
- `draft_class` (text) — e.g. "2026", "2027". Allows filtering Big Board by year.
- `draft_status` (text) — "prospect", "drafted", "undrafted", "archived"
- `draft_pick` (integer, nullable) — actual pick number if drafted
- `draft_team` (text, nullable) — NBA team that drafted them
- `draft_date` (date, nullable)

### Workflows

**End-of-Season Draft Results:**
1. After the real draft, open the Draft Results view
2. For each player, mark as "drafted" (enter pick number + team) or "undrafted"
3. System copies full scouting profile (all scores, grades, DNA, comps) into `historical_players` table
4. Player moves off the active Big Board but remains fully accessible in the archive

**New Season Setup:**
1. Set the new draft class year (e.g. "2027")
2. Start adding new prospects — they default to the current class
3. Big Board filters to current class by default
4. Toggle dropdown to view any past class

**Accuracy Tracker:**
- For each archived player, add fields for actual NBA stats (updated manually over time): PPG, RPG, APG, WS/48, All-Star selections
- Compare against original projections: RAUS tier vs actual outcome, Big Board rank vs actual pick, SSA vs actual production
- Display as a report card: "2026 Draft — Model Accuracy: 72% of Tier 2+ players became starters or better"
- Over multiple years, builds a track record of the model's predictive power

### Archive View
- Dropdown to select any past draft class
- Full Big Board from that year, frozen as it was at draft time
- Click into any player's scouting card from that year
- Side panel showing actual NBA outcome for drafted players

---

## Phase 12 — Interactive Mock Draft

### Purpose
A full draft day simulation and command center. Preload NBA teams with needs, run mock drafts with smart recommendations, handle trades, and compare mock results against the real draft.

### Database Tables

**`nba_teams`**

| Column | Type | Notes |
|---|---|---|
| team_id | text PK | e.g. "ATL", "BOS", "BKN" |
| team_name | text | e.g. "Atlanta Hawks" |
| conference | text | East / West |
| division | text | |
| logo_url | text | |
| need_1 | text | e.g. "Rim Protector" — maps to style archetypes or buckets |
| need_2 | text | |
| need_3 | text | |
| notes | text | General team context |
| updated_at | timestamptz | |

**`mock_drafts`**

| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| name | text | e.g. "Mock Draft v3 — Post Lottery" |
| draft_class | text | e.g. "2026" |
| status | text | "in_progress", "completed" |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**`mock_draft_picks`**

| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| mock_draft_id | integer FK → mock_drafts | |
| pick_number | integer | 1-60 |
| round | integer | 1 or 2 |
| original_team_id | text FK → nba_teams | Team that originally owned the pick |
| current_team_id | text FK → nba_teams | Team currently holding the pick (after trades) |
| player_id | text FK → players, nullable | Prospect selected (null if pick not yet made) |
| is_traded | boolean DEFAULT false | |
| trade_notes | text | e.g. "Via BKN in Simmons trade" |
| created_at | timestamptz | |

### UI Components

**Draft Board (main view):**
- Visual board showing all 60 picks in order, two rounds
- Each pick slot displays: pick number, team logo, team name, and selected player (if picked)
- Current pick highlighted
- Completed picks show player name + position bucket with tier color coding

**Pick Trading:**
- "Trade Pick" button on any pick slot
- Opens a modal: select the new team receiving the pick, add optional trade notes
- Board instantly reorders to reflect the trade
- Traded picks show a visual indicator (e.g. "via BKN")

**Prospect Pool (sidebar):**
- All undrafted prospects from Big Board, sorted by composite score
- Search and filter by bucket, archetype, tier
- As players are drafted, they disappear from the pool with a brief animation
- Click any player name → scouting card opens as a popup overlay (full card with radar chart, DNA, comps)
- Pool shows a count: "47 of 130 prospects remaining"

**Recommendation Engine:**
For each pick, display 3 recommended players in a highlighted panel above the prospect pool.

**Recommendation logic:**
1. Get the current team's 3 stated needs
2. Map needs to style archetypes and position buckets (e.g. "Rim Protector" matches Big + Rim Protector/Paint Anchor archetypes)
3. Filter available prospects (not yet drafted in this mock) that match at least one need
4. Sort matching prospects by Big Board composite score
5. Return top 3 as recommendations
6. If fewer than 3 match needs, fill remaining slots with BPA (best player available) regardless of need
7. Each recommendation shows: player name, position, archetype, composite score, and which team need they fill
8. Click recommendation → scouting card popup

**Making Picks:**
- Click a player from recommendations or prospect pool to assign them to the current pick
- Confirmation popup: "[Player Name] to [Team] at pick #[X]?"
- Once confirmed: player removed from pool, board advances, recommendations refresh for next team
- "Undo Last Pick" button for mistakes

**Mock Draft History:**
- Save completed mocks with a name (e.g. "Post-Lottery Mock v2")
- View past mocks as completed boards
- After the real draft: "Compare to Actual" view showing side-by-side — your mock pick vs actual pick for each slot
- Track accuracy: "You correctly predicted 8 of 30 first-round picks" and "Average pick deviation: 4.2 spots"

### Recommendation Engine Settings (stored in `settings` table)

```json
{
  "need_archetype_map": {
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
  }
}
```

This maps natural-language team needs to the archetype system so recommendations are driven by the same classification used throughout the entire model.

## Glossary — The Draft Model Dictionary

*A plain-English guide to every custom metric, score, and acronym in this system. No stats degree required.*

---

### The Big Picture Scores

**RAUS (Risk-Adjusted Upside Score)**
The headline number. RAUS is trying to answer the single most important scouting question: *how good will this player be in the NBA?* It's not about what a guy is doing right now in college — it's a projection. RAUS takes a player's skill grades, weights them by importance, and then adjusts for how tough his competition was. A 7.5 RAUS from a guy playing in the SEC means more than a 7.5 from a guy dominating a mid-major, because the SEC number already survived a tougher filter. Think of RAUS as the system's best guess at a player's NBA ceiling, compressed into a single number on a 1-10 scale.

**SSA (Skill Set Assessment)**
If RAUS is the projection, SSA is the scouting report card. It's a weighted average of eight skill categories — shooting, creation, playmaking, defense, and so on — graded manually on a 0-10 scale. The key wrinkle: the weights change by position. A guard's SSA leans heavily on creation and playmaking. A big's SSA cares more about defense and hustle. So a 7.0 SSA for a guard and a 7.0 SSA for a center are earned in totally different ways, which is the whole point — you can't evaluate every player the same way.

**Big Board Composite**
The final draft ranking. This is where everything comes together. The Big Board takes RAUS (projection), SSA (current skills), AAA (physical tools), OAI (raw athleticism), and age, blends them with specific weights, and spits out a single number that determines draft order. RAUS carries the most weight at 45%, because at the end of the day, you're drafting for the NBA, not for college. SSA is 25%, AAA is 15%, age is 10%, and OAI is 5%. The board auto-sorts so the best composite score sits at #1.

---

### The Skill Metrics (RAUS Inputs)

These are the individual building blocks that feed into RAUS. Each one isolates a specific part of a player's game.

**SCR (Self-Creation Rating)**
Can this player create his own shot? SCR measures a player's ability to generate offense without someone else setting him up. A high SCR means the player can get a bucket in a half-court set when the play breaks down — think Luka Doncic pulling up from 28 feet off a broken play versus a guy who can only score when he's wide open. This is one of the hardest skills to find and one of the most valuable in the NBA.

**RPI (Rim Pressure Index)**
How dangerous is this player at the basket? RPI captures a player's ability to attack the rim, finish through contact, and draw fouls. It's the difference between a player who settles for jumpers and one who forces the defense to collapse. A high RPI means the player gets to his spots at the rim and finishes once he's there — think of the guys who live in the paint and have the free throw rate to prove it.

**SCI (Shot Creation Index)**
Similar to SCR but broader — SCI looks at the full scope of a player's ability to create advantageous shooting opportunities, both for himself and others. A player who can break down his defender and kick out to an open shooter scores well here even if his own shot isn't falling. It's measuring offensive gravity more than just scoring.

**Star Index**
A composite of SCR, RPI, and SCI that tries to answer: *does this player have lead-guy potential?* The weighting is 40% SCI, 35% SCR, 25% RPI, with a position bump for wings and bigs because self-creation from a bigger body is rarer and more valuable. A high Star Index doesn't guarantee stardom, but a low one makes it very unlikely — role players almost never score well here.

**UCS (Perimeter Scoring)**
Pure outside scoring ability. Three-point shooting, mid-range game, pull-up jumpers, catch-and-shoot accuracy. A player with a high UCS is someone you trust to space the floor and punish a defense that goes under screens. In the modern NBA, this might be the single most in-demand skill after self-creation.

**FCS (Finishing)**
The rim game — specifically, how well a player converts at the basket. Dunks, layups through traffic, floaters, touch around the rim. FCS doesn't care how you get there (that's RPI's job), it cares what happens once you're there. A player with high RPI but low FCS is a guy who gets to the rim a lot but doesn't actually finish. That's a problem.

**ADR (Decision-Making)**
Basketball IQ in a number. ADR measures a player's ability to make the right play — low turnover rate, good assist-to-turnover ratio, avoiding bad shots. A high ADR player makes his teammates better because the ball doesn't stick and it rarely ends up in the wrong hands. A low ADR player might have all the talent in the world but gives the ball away too much to be trusted.

**STI (Defensive Events)**
Steals, blocks, deflections — the plays that show up in the box score on the defensive end. A high STI means the player is actively disrupting the opposing offense, not just standing in the right spot. Important caveat: STI alone doesn't tell you if someone's a good defender. Some guys rack up steals by gambling on passing lanes, which leaves their team exposed. That's why SFR (Stocks-to-Foul Ratio) exists as a check on this number.

**RSM (Size/Rebounding)**
Rebounding ability adjusted for size. Big men are expected to rebound — it would be weird if they didn't. RSM gives more credit to guards and wings who crash the boards because that's a bonus skill for them, while for bigs it's more of a baseline expectation. A wing with a high RSM is a versatile asset. A center with a low RSM is a problem.

**DRI (Defensive Versatility)**
Can this player guard multiple positions? In the modern NBA, switching on defense is everything. DRI measures a player's ability to defend across positions without getting cooked. A high DRI means you can put this player in a switch-everything scheme and not worry. A low DRI means he's a specialist who can only guard one type of player — that limits his minutes and his value.

---

### The Athletic Metrics

**OAI (Overall Athletic Index)**
Raw athleticism distilled into one number. OAI is built from combine measurables — vertical leap, sprint speed, lane agility, shuttle time. It answers: *how explosive and quick is this player?* A high OAI doesn't mean the player is good, but it means the physical tools are there for the skills to translate. Think of it as the engine under the hood — you still need to know how to drive, but a bigger engine helps.

**AAA (Athletic + Size Composite)**
OAI plus size. AAA extends the athletic profile by factoring in height, weight, and wingspan — because a 6'8" wing who runs a 3.1 three-quarter sprint is a very different prospect than a 6'1" guard who runs the same time. AAA is used more heavily in the Big Board than OAI because it gives a more complete picture of physical upside. A player with elite AAA has the body AND the movement skills, which is the full physical toolkit.

**OAI/AAA Bands**
Instead of just showing a raw number, the system converts OAI and AAA into percentile bands within each position group. A guard is compared to other guards, a big to other bigs. The bands are: Outlier (99th+ percentile), Elite (90th+), Plus (70th+), Average (50th+), and Limited (below 50th). This prevents a slow-footed center from grading out as "elite" just because he's tall.

---

### The Context & Adjustment Metrics

**PTC (Playing Time/Competition Multiplier)**
A context adjustment that accounts for where a player is playing. A guy averaging 18 points in the SEC is doing it against future NBA players every night. A guy averaging 22 points in a low-major conference might be feasting on players who will never sniff a professional roster. PTC scales scores up for tougher leagues (SEC gets a 1.10 multiplier, EuroLeague gets 1.15) and slightly down for weaker ones (low-major gets 0.97). It's the system's way of saying *not all stats are created equal.*

**RAUS Override**
Sometimes the model gets it wrong. A player might have a medical situation that suppressed his stats, or he might be in a system that doesn't showcase his skills, or the eye test just screams something the numbers don't capture. The override lets you manually set a RAUS score that replaces the computed one. If no override is entered, the model's number stands. Think of it as the "I've watched this guy play and I know something the spreadsheet doesn't" button.

**Tier System**
Every player gets assigned a tier based on their RAUS score. The tiers map loosely to NBA outcomes: Generational (perennial MVP candidate), Franchise (All-NBA caliber), All-Star, Starter, Rotation, Development (project pick), and Longshot. Each tier has an anchor score and a range, so a Starter-tier player scores around a 7.0 RAUS, give or take. The tiers give you a quick mental model without needing to remember exact numbers.

---

### v2 New Metrics

**LCI (Load Capacity Index)**
The signature metric. LCI answers the question every NBA GM is really asking: *can this player handle being the guy?* It measures the tension between usage and efficiency. Lots of players are efficient when they only take 10 shots a game. Fewer players stay efficient when they're taking 20. LCI uses a logarithmic scale for usage — because the jump from role player usage to primary option usage is a bigger deal than going from primary to dominant — and gives a bonus for players who create for others while maintaining their own efficiency. A high LCI means the player can carry an offense. A low LCI means he's a complementary piece, not a centerpiece.

**SFR (Stocks-to-Foul Ratio)**
The defensive discipline check. SFR divides a player's combined steals and blocks (per 40 minutes) by his personal fouls (per 40 minutes). If the number is above 1.0, the player creates more defensive disruption than he costs in fouls — that's a disciplined, high-IQ defender. Below 0.6, and you're looking at a gambler — a guy whose steal and block numbers look great until you realize he's also sending opponents to the free throw line constantly. This is a bust indicator. High stocks + low SFR is one of the biggest red flags in the draft.

**FT% Projection Label**
Free throw percentage used as a crystal ball for shooting development. The logic: TS% tells you how efficient a player is right now, but FT% tells you what his shooting could become. Free throws strip away everything — no defense, no shot selection, no system — and isolate pure shooting mechanics. A player shooting 82% from the line probably has a real jumper that just needs more reps. A player shooting 64% from the line might be shooting 38% from three right now, but that three-point percentage is probably a mirage. The system flags players as Projectable Stroke (80%+), Developing Stroke (72-79%), or Mechanical Concern (below 72%).

**WS-H Factor (Wingspan-Height Differential)**
A physical measurement that quietly changes everything. If a player is 6'6" with a 7'0" wingspan, that's a +6 inch differential — meaning his arms are much longer than his height would suggest. The system turns this into a multiplier that boosts specific metrics: defensive disruption (longer arms = more passing lanes covered), finishing (longer arms = harder to block), rebounding (longer arms = bigger catch radius), and switching ability (longer arms = more versatile coverage). Two players with identical steal rates get different defensive grades if one has a +6 wingspan and the other is +1 — because the longer-armed player's defensive impact is more likely to translate to the NBA.

**Age-Adjusted Score**
Not all production is created equal. A freshman averaging 16 and 5 is a more impressive signal than a senior doing the same thing, because the freshman did it with less experience, less physical maturity, and less time in his coach's system. The age curve applies a class multiplier (freshmen get a 15% bump, seniors get an 8% discount) and then adds an improvement velocity bonus — if a player's key stats jumped significantly from last season, that's a strong developmental signal that gets rewarded. The idea is to capture trajectory, not just a snapshot.

**Historical Comp Engine**
The "who does this player remind you of?" question, answered with math instead of vibes. The system maintains a database of every draft pick from the last 10 years plus a separate tier of all-time greats. For each current prospect, it calculates a similarity score across key metrics — skills, athleticism, age, usage, efficiency — and returns the 3-5 closest historical matches. The output looks something like: "His three closest comps are Desmond Bane, Herb Jones, and Dillon Brooks. The average career outcome for players in this cluster is 11 PPG and solid rotation minutes." It's not prophecy — it's pattern recognition, and it gives you a much more honest comp than the lazy "he reminds me of [famous player]" that dominates most draft coverage.

---

### The DNA Archetype System

The DNA system asks: *does this prospect's statistical profile match the fingerprint of an all-time great?* It's not saying the player will become that legend — it's saying the statistical DNA is similar.

Each archetype is named after an NBA icon and has five component scores worth up to 20 points each (100 max). A player needs to score at least 60 to qualify. Some archetypes have physical gates — you can't match the Joker archetype if you're under 6'9" and 240 pounds, because that profile fundamentally requires size.

**The 11 Archetypes:**

**King (LeBron)** — The do-everything force. Elite athleticism combined with elite passing, rim pressure, efficiency, and defensive versatility. If a prospect scores high here, he might be the best player in the draft. The King archetype is the hardest to match because it requires excellence in almost everything.

**Klaw (Kawhi)** — The two-way wing. Elite defense, elite length, strong inside-the-arc scoring, and high-IQ off-ball play. Requires a wingspan differential of +4 or more and a height between 6'5" and 6'8". This archetype identifies the players who can guard the other team's best player and still drop 25 on the other end.

**Air (Jordan)** — The explosive two-way scorer. Combines elite athleticism with dominant inside-the-arc scoring, alpha-level usage, rim pressure, and perimeter defense. This is the archetype for players who take over games through sheer athletic dominance and scoring volume.

**Reaper (KD)** — The tall, skilled scorer. Requires height of 6'8" or taller. Identifies players who combine size with shooting range, scoring volume, efficiency, low turnovers, and some defensive activity. The Reaper archetype is for unicorn scorers — the guys who are too tall to guard on the perimeter and too skilled to stop in the post.

**Wilt** — The physically dominant big. Size-based dominance — rebounding, rim protection, rim finishing, and sheer physical overwhelm. This is the old-school center archetype, the player who controls the game through his physical presence alone.

**PointGod (CP3)** — The floor general. Requires a smaller frame (6'0"-6'5", 170-205 lbs). Identifies players who combine elite passing, elite efficiency, low turnovers, and defensive playmaking. These are the quarterbacks who make everyone around them better.

**Brow (AD)** — The versatile big. Requires height of 6'9"-7'1". Combines rim protection with scoring versatility — the big man who can protect the paint AND step out and create offense. This is the modern stretch-five archetype at its highest level.

**Beard (Harden)** — The high-volume playmaking scorer. Requires a specific build (6'3"-6'6", 215+ lbs). Identifies players who combine enormous scoring volume with playmaking — the guys who dominate the ball and put up 25 and 10 every night.

**Chef (Curry)** — The transformative shooter. Requires elite three-point volume AND efficiency — you need to be shooting a lot of threes and making them at a high rate. This identifies players whose shooting gravity warps the entire defense, creating advantages for everyone else on the floor.

**Joker (Jokic)** — The passing big. Requires 6'9"+ and 240+ lbs. Identifies oversized players who combine passing, scoring efficiency, and low turnovers — the big man who runs the offense from the post or the elbow. This is one of the rarest archetypes because the combination of size and passing skill almost never coexists.

**Diesel (Shaq)** — The unstoppable physical force. Pure size and rim dominance. This archetype identifies the players who don't need finesse because they're simply bigger, stronger, and more explosive than everyone else. In the modern game, pure Diesel prospects are rare.

**DNA Flag (🃏):** When a player scores 80+ on any archetype, they get flagged on the Master Board. This is the system's way of saying: *this player's statistical profile matches an all-time great at an unusually high level. Pay attention.*

---

### Position Buckets & Style Archetypes

**Buckets** are the three broad position categories: Guard, Wing, and Big. Every player is assigned one bucket, and that bucket determines which SSA weights apply and how athletic metrics are compared.

**Style Archetypes** are the more specific labels — 36 total across the three buckets. These describe how a player actually plays, not just his position. A "Primary Playmaker" and a "POA Defender" are both guards, but they do completely different things. The archetype system helps you filter the Big Board by play style, not just talent level. If a team needs a 3-and-D wing, they can filter to that archetype and see who's available at their pick.

---

### Alert & Risk System

**Alert Status** tracks anything that might affect a player's draft stock beyond basketball ability. The statuses range from "Clean" (no concerns) through injury tiers (Minor, Major, Season-Ending) to off-court issues (Arrested, Suspended, Off-Court) and roster status (Transfer/Leaving, Unknown). A player's alert status shows up on his scouting card and in the Big Board so you're never surprised by a red flag you forgot about.
