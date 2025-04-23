import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log("Running profile migrations...");

    // Read migration SQL file
    const migrationPath = path.join(
      process.cwd(),
      "migrations",
      "setup_profiles_tables.sql"
    );
    const sql = fs.readFileSync(migrationPath, "utf8");

    // Execute SQL
    console.log("Connecting to Supabase...");
    const { error } = await supabase.rpc("pgmigrate", { query: sql });

    if (error) {
      throw error;
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
runMigration();
