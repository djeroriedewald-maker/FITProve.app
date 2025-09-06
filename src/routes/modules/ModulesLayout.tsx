// src/routes/modules/ModulesLayout.tsx
import { Outlet } from "react-router-dom";

/**
 * Belangrijk: GEEN auto-redirects hier.
 * Geen useEffect met navigate(), geen <Navigate to="..."/>.
 * Dit component levert alleen de layout en een <Outlet/>.
 */
export default function ModulesLayout() {
  return (
    <div className="min-h-dvh">
      <Outlet />
    </div>
  );
}
