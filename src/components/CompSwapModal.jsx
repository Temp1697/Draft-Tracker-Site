import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

const OUTCOME_OPTIONS = ['All', 'MVP', 'All-NBA', 'All-Star', 'Starter', 'Role Player', 'Out of League', 'Bust']
const TIER_OPTIONS = ['All', 'modern', 'legend']
const POSITION_OPTIONS = ['All', 'PG', 'SG', 'SF', 'PF', 'C']

export default function CompSwapModal({ open, onClose, onSelect, currentPlayerId, currentComps }) {
  const [historicalPlayers, setHistoricalPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPosition, setFilterPosition] = useState('All')
  const [filterOutcome, setFilterOutcome] = useState('All')
  const [filterTier, setFilterTier] = useState('All')
  const [draftYearMin, setDraftYearMin] = useState('')
  const [draftYearMax, setDraftYearMax] = useState('')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    supabase
      .from('historical_players')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) console.error('Error loading historical players:', error)
        setHistoricalPlayers(data || [])
        setLoading(false)
      })
  }, [open])

  // Compute similarity percentages from existing comps data
  const similarityMap = useMemo(() => {
    const map = new Map()
    if (currentComps) {
      for (const c of currentComps) {
        if (c.historical_player_id && c.similarity_distance != null) {
          map.set(c.historical_player_id, Math.max(0, 100 - c.similarity_distance * 10))
        }
      }
    }
    return map
  }, [currentComps])

  const filtered = useMemo(() => {
    let list = historicalPlayers

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(p => p.name?.toLowerCase().includes(q))
    }
    if (filterPosition !== 'All') {
      list = list.filter(p => p.position === filterPosition)
    }
    if (filterOutcome !== 'All') {
      list = list.filter(p => p.nba_outcome_label === filterOutcome)
    }
    if (filterTier !== 'All') {
      list = list.filter(p => p.tier === filterTier)
    }
    if (draftYearMin) {
      list = list.filter(p => p.draft_year >= Number(draftYearMin))
    }
    if (draftYearMax) {
      list = list.filter(p => p.draft_year <= Number(draftYearMax))
    }

    // Sort by similarity percentage (highest first), then by name
    list = [...list].sort((a, b) => {
      const simA = similarityMap.get(a.id) ?? -1
      const simB = similarityMap.get(b.id) ?? -1
      if (simB !== simA) return simB - simA
      return (a.name || '').localeCompare(b.name || '')
    })

    return list
  }, [historicalPlayers, search, filterPosition, filterOutcome, filterTier, draftYearMin, draftYearMax, similarityMap])

  if (!open) return null

  return (
    <div className="comp-swap-overlay" onClick={onClose}>
      <div className="comp-swap-modal" onClick={e => e.stopPropagation()}>
        <div className="comp-swap-header">
          <h3>Select Historical Comp</h3>
          <button className="comp-swap-close" onClick={onClose}>&times;</button>
        </div>

        <div className="comp-swap-filters">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="comp-swap-search"
            autoFocus
          />
          <div className="comp-swap-filter-row">
            <select value={filterPosition} onChange={e => setFilterPosition(e.target.value)}>
              {POSITION_OPTIONS.map(p => <option key={p} value={p}>{p === 'All' ? 'All Positions' : p}</option>)}
            </select>
            <select value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)}>
              {OUTCOME_OPTIONS.map(o => <option key={o} value={o}>{o === 'All' ? 'All Outcomes' : o}</option>)}
            </select>
            <select value={filterTier} onChange={e => setFilterTier(e.target.value)}>
              {TIER_OPTIONS.map(t => <option key={t} value={t}>{t === 'All' ? 'All Tiers' : t}</option>)}
            </select>
            <input
              type="number"
              placeholder="Year min"
              value={draftYearMin}
              onChange={e => setDraftYearMin(e.target.value)}
              className="comp-swap-year"
            />
            <input
              type="number"
              placeholder="Year max"
              value={draftYearMax}
              onChange={e => setDraftYearMax(e.target.value)}
              className="comp-swap-year"
            />
          </div>
        </div>

        <div className="comp-swap-count">{filtered.length} players</div>

        <div className="comp-swap-list">
          {loading ? (
            <div className="comp-swap-loading">Loading historical players...</div>
          ) : filtered.length === 0 ? (
            <div className="comp-swap-empty">No players match filters</div>
          ) : (
            filtered.map(hp => {
              const sim = similarityMap.get(hp.id)
              const stkpg = ((hp.spg_first4 ?? 0) + (hp.bpg_first4 ?? 0)).toFixed(1)
              return (
                <div
                  key={hp.id}
                  className="comp-swap-row"
                  onClick={() => onSelect(hp)}
                >
                  <div className="comp-swap-row-main">
                    <span className="comp-swap-name">{hp.name}</span>
                    <span className="comp-swap-meta">
                      {hp.draft_year && `${hp.draft_year}`}
                      {hp.draft_pick && ` #${hp.draft_pick}`}
                      {hp.position && ` · ${hp.position}`}
                    </span>
                  </div>
                  <div className="comp-swap-row-stats">
                    {hp.nba_ppg_first4 != null && <span>{Number(hp.nba_ppg_first4).toFixed(1)} PPG</span>}
                    {hp.rpg_first4 != null && <span>{Number(hp.rpg_first4).toFixed(1)} RPG</span>}
                    {hp.apg_first4 != null && <span>{Number(hp.apg_first4).toFixed(1)} APG</span>}
                    <span>{stkpg} STKPG</span>
                    {hp.nba_ws48_first4 != null && <span>{Number(hp.nba_ws48_first4).toFixed(3)} WS/48</span>}
                  </div>
                  <div className="comp-swap-row-right">
                    {hp.nba_outcome_label && (
                      <span className="comp-swap-outcome">{hp.nba_outcome_label}</span>
                    )}
                    {sim != null && (
                      <span className="comp-swap-sim">{sim.toFixed(0)}% match</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <style>{`
        .comp-swap-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7); z-index: 9999;
          display: flex; align-items: center; justify-content: center;
        }
        .comp-swap-modal {
          background: #1a1a2e; border: 1px solid #333;
          border-radius: 12px; width: 90vw; max-width: 800px;
          max-height: 80vh; display: flex; flex-direction: column;
          color: #e0e0e0;
        }
        .comp-swap-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 20px; border-bottom: 1px solid #333;
        }
        .comp-swap-header h3 { margin: 0; font-size: 16px; }
        .comp-swap-close {
          background: none; border: none; color: #888; font-size: 22px;
          cursor: pointer; padding: 0 4px;
        }
        .comp-swap-close:hover { color: #fff; }
        .comp-swap-filters { padding: 12px 20px; border-bottom: 1px solid #222; }
        .comp-swap-search {
          width: 100%; padding: 8px 12px; border-radius: 6px;
          border: 1px solid #444; background: #111; color: #e0e0e0;
          font-size: 14px; margin-bottom: 8px; box-sizing: border-box;
        }
        .comp-swap-filter-row {
          display: flex; gap: 8px; flex-wrap: wrap;
        }
        .comp-swap-filter-row select,
        .comp-swap-filter-row input {
          padding: 6px 8px; border-radius: 4px; border: 1px solid #444;
          background: #111; color: #e0e0e0; font-size: 12px;
        }
        .comp-swap-year { width: 80px; }
        .comp-swap-count {
          padding: 6px 20px; font-size: 11px; color: #666;
          border-bottom: 1px solid #222;
        }
        .comp-swap-list {
          flex: 1; overflow-y: auto; padding: 4px 0;
        }
        .comp-swap-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 20px; cursor: pointer;
          border-bottom: 1px solid #1a1a2e;
        }
        .comp-swap-row:hover { background: #252545; }
        .comp-swap-row-main { flex: 1; min-width: 0; }
        .comp-swap-name { font-weight: 600; font-size: 13px; display: block; }
        .comp-swap-meta { font-size: 11px; color: #888; }
        .comp-swap-row-stats {
          display: flex; gap: 8px; font-size: 11px; color: #aaa;
          flex-shrink: 0;
        }
        .comp-swap-row-right {
          display: flex; flex-direction: column; align-items: flex-end;
          gap: 2px; flex-shrink: 0; min-width: 80px;
        }
        .comp-swap-outcome {
          font-size: 10px; padding: 2px 6px; border-radius: 3px;
          background: #333; color: #ccc;
        }
        .comp-swap-sim { font-size: 10px; color: #60A5FA; }
        .comp-swap-loading, .comp-swap-empty {
          padding: 40px 20px; text-align: center; color: #666;
        }
      `}</style>
    </div>
  )
}
