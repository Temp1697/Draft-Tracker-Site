-- ============================================================
-- DEV ONLY: Allow anon access for development
-- Run this AFTER supabase_schema.sql
-- Replace with proper auth policies before going to production
-- ============================================================

-- Drop the authenticated-only policies and replace with permissive ones
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'players', 'prospects', 'stats', 'measurables',
      'ssa_input', 'raus_scores', 'ssa_scores', 'athletic_scores',
      'dna_scores', 'master_board', 'player_alerts', 'settings',
      'derived_metrics', 'historical_players', 'player_comps'
    ])
  LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS "Allow all for authenticated" ON %I', t);
      EXECUTE format('CREATE POLICY "Allow all for anon" ON %I FOR ALL USING (true) WITH CHECK (true)', t);
    EXCEPTION WHEN undefined_table THEN
      -- skip tables that don't exist yet
      NULL;
    END;
  END LOOP;
END $$;
