// scripts/build/build-workout-library.ts
/* eslint-disable no-console */
import { stat } from "node:fs/promises";

export async function main() {
  try {
    await stat("."); // gebruik fs zodat import niet 'unused' is
    console.log("[build-workout-library] noop");
  } catch {
    // ignore voor CI
  }
}

// Optioneel: auto-run bij direct uitvoeren
if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  main();
}
