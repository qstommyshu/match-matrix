-- Option 1: pgmigrate function (used by run_migrations.js)
CREATE OR REPLACE FUNCTION pgmigrate(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

GRANT EXECUTE ON FUNCTION pgmigrate(text) TO authenticated;
GRANT EXECUTE ON FUNCTION pgmigrate(text) TO anon;
GRANT EXECUTE ON FUNCTION pgmigrate(text) TO service_role;

-- Option 2: exec_sql function (used by direct_migration.js)
CREATE OR REPLACE FUNCTION exec_sql(sql_statement text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_statement;
END;
$$;

GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role; 