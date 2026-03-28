-- Phase 7: Age-Relative Production Curve — add columns to master_board
ALTER TABLE master_board ADD COLUMN IF NOT EXISTS ssa_age_adjusted NUMERIC;
ALTER TABLE master_board ADD COLUMN IF NOT EXISTS class_multiplier NUMERIC;
ALTER TABLE master_board ADD COLUMN IF NOT EXISTS improvement_delta NUMERIC;
