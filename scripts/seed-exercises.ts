/**
 * Seed stub.
 * Volgende PR: import Free Exercise DB JSON -> normalize -> insert into public.exercises
 * Houd .env lokaal (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) – deel geen secrets.
 */
import fs from "node:fs/promises";
// import { createClient } from "@supabase/supabase-js";

async function main() {
  // const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  // const raw = await fs.readFile("./data/free-exercises.json", "utf8");
  // const items = JSON.parse(raw);

  // TODO: map items to schema, upload media posters later.
  await fs.stat('.');
  console.log("Seed script stub. Volgende PR voegt echte import toe.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
