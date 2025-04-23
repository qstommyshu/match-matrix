-- Create a function to run SQL migrations
CREATE OR REPLACE FUNCTION pgmigrate(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION pgmigrate(text) TO authenticated;
GRANT EXECUTE ON FUNCTION pgmigrate(text) TO anon;
GRANT EXECUTE ON FUNCTION pgmigrate(text) TO service_role; 