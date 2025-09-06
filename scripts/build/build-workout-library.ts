/**
 * build-workout-library.ts
 * Stub voor CI: valide TypeScript zonder placeholder-ellipsis.
 * Later kun je hier de echte builder in hangen; voor nu purposely no-op.
 */

// Exporteer een named functie (handig voor mogelijke imports/tests)
export async function buildWorkoutLibrary(): Promise<void> {
  // no-op: deze stub bestaat alleen om lint/typecheck te laten slagen
}

// Handige main-export voor CLI-gebruikers / scripts, maar NIET auto-runnen in lint.
export async function main(): Promise<void> {
  // call de builder zodat de export "gebruikt" is
  await buildWorkoutLibrary();
}

// Default export zodat afhankelijkheden vrij kunnen kiezen welke export ze gebruiken.
export default main;
