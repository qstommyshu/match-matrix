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

async function runDirectMigration() {
  try {
    console.log("Running direct SQL migration...");

    // First, execute the SQL functions file
    const functionsPath = path.join(
      process.cwd(),
      "src",
      "db",
      "migrations",
      "03_create_sql_functions.sql"
    );

    if (fs.existsSync(functionsPath)) {
      console.log("Executing SQL functions creation...");
      const functionsSql = fs.readFileSync(functionsPath, "utf8");

      // Execute the full file directly since it contains multiple function definitions
      try {
        await supabase.rpc("exec_sql", { sql_statement: functionsSql });
      } catch (error) {
        console.log(
          "SQL functions may already exist or there was an error:",
          error.message
        );
        // Continue even if this fails - the functions might already exist
      }
    }

    // Now execute the profile tables creation
    const migrationPath = path.join(
      process.cwd(),
      "src",
      "db",
      "migrations",
      "04_setup_profiles_tables.sql"
    );

    const sql = fs.readFileSync(migrationPath, "utf8");

    // Split SQL into separate statements
    const statements = sql
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);

      try {
        const { error } = await supabase.rpc("exec_sql", {
          sql_statement: statement + ";",
        });

        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          console.error(`Statement: ${statement}`);
          // Continue with other statements
        }
      } catch (error) {
        console.error(`Exception executing statement ${i + 1}:`, error.message);
        console.error(`Statement: ${statement}`);
        // Continue with other statements
      }
    }

    console.log("Direct migration completed!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
runDirectMigration();
