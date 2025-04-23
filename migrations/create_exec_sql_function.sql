-- Create a simple function to execute SQL directly
CREATE OR REPLACE FUNCTION exec_sql(sql_statement text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_statement;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role; 