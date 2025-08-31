# FITProve — Phase 3 (News & Stats)

This pack adds two new routes with ready-made UI:
- **/news** — simple news feed with cards (mock data)
- **/stats** — basic stats dashboard with tiles (mobile‑first + dark mode aware)

No external deps beyond what you already have (React + Tailwind + lucide-react).

## Files included
```
src/
  routes/
    News.tsx
    Stats.tsx
  components/
    ui/
      ArticleCard.tsx
  data/
    news.ts
```
> If your router and bottom nav already include **Stats** and **News**, you only need these files. If not, add the routes to your router the way you did in Phase 1 (lazy routes).

## How to apply (your preferred workflow)
1) Switch to `main`, then create a feature branch named **feat/news-stats-routes**.
2) Drop the files from this zip into your project keeping the same paths.
3) Start the dev server and open **/news** and **/stats** to verify dark + light mode.
4) Commit, push, open PR → ensure CI is green → merge.

## Optional: sample router snippet (only if you still need routes)
```tsx
// Example only — skip if you already have routes.
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

const Home = lazy(() => import("./routes/Home"));
const Coach = lazy(() => import("./routes/Coach"));
const Stats = lazy(() => import("./routes/Stats"));
const News  = lazy(() => import("./routes/News"));

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/coach", element: <Coach /> },
  { path: "/stats", element: <Stats /> },
  { path: "/news", element: <News /> },
]);
```
