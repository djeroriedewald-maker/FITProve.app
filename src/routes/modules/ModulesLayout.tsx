import { Outlet } from "react-router-dom";

export default function ModulesLayout() {
  // Extra bottom padding i.v.m. BottomNav overlap
  return (
    <div className="pb-16">
      <Outlet />
    </div>
  );
}
