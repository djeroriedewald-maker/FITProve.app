import{c as a,R as x,j as e,M as i,D as l}from"./index-Dk9Y66no.js";import{F as u,D as k}from"./footprints-C2RuI6Cg.js";/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=a("Flame",[["path",{d:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",key:"96xj49"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=a("Gauge",[["path",{d:"m12 14 4-4",key:"9kzdfg"}],["path",{d:"M3.34 19a10 10 0 1 1 17.32 0",key:"19p75a"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=a("HeartPulse",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}],["path",{d:"M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27",key:"1uw2ng"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=a("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=a("Timer",[["line",{x1:"10",x2:"14",y1:"2",y2:"2",key:"14vaq8"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11",key:"17fdiu"}],["circle",{cx:"12",cy:"14",r:"8",key:"1e1u0o"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o=a("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]),n=[{id:"k1",title:"Calories",value:"450 kcal",icon:e.jsx(h,{className:"h-5 w-5"}),group:"today"},{id:"k2",title:"Steps",value:"12,340",icon:e.jsx(u,{className:"h-5 w-5"}),group:"today"},{id:"k3",title:"Workout time",value:"62 min",icon:e.jsx(y,{className:"h-5 w-5"}),group:"today"},{id:"k4",title:"Heart rate (avg)",value:"142 bpm",icon:e.jsx(c,{className:"h-5 w-5"}),group:"today"},{id:"k5",title:"Water",value:"2.1 L",icon:e.jsx(k,{className:"h-5 w-5"}),group:"today"},{id:"k6",title:"Sleep",value:"7 h 20 m",icon:e.jsx(i,{className:"h-5 w-5"}),group:"today"},{id:"k7",title:"Workouts (week)",value:5,icon:e.jsx(l,{className:"h-5 w-5"}),group:"week"},{id:"k8",title:"Run distance (week)",value:"24.8 km",icon:e.jsx(o,{className:"h-5 w-5"}),group:"week"},{id:"k9",title:"Avg pace (week)",value:"5:18 /km",icon:e.jsx(p,{className:"h-5 w-5"}),group:"week"},{id:"k10",title:"Strength sessions",value:2,icon:e.jsx(g,{className:"h-5 w-5"}),group:"week"},{id:"k11",title:"Workouts (month)",value:18,icon:e.jsx(l,{className:"h-5 w-5"}),group:"month"},{id:"k12",title:"Run distance (month)",value:"102 km",icon:e.jsx(o,{className:"h-5 w-5"}),group:"month"},{id:"k13",title:"Avg HR (month)",value:"139 bpm",icon:e.jsx(c,{className:"h-5 w-5"}),group:"month"},{id:"k14",title:"Sleep avg (month)",value:"7 h 05 m",icon:e.jsx(i,{className:"h-5 w-5"}),group:"month"}],w=[{id:"today",label:"Today"},{id:"week",label:"Week"},{id:"month",label:"Month"},{id:"all",label:"All"}];function j(){const[s,r]=x.useState("all"),d=s==="all"?n:n.filter(t=>(t.group??"today")===s);return e.jsxs("main",{className:"mx-auto w-full max-w-screen-md px-4 py-6 sm:py-8",children:[e.jsxs("header",{className:"mb-4 sm:mb-6",children:[e.jsx("h1",{className:"text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50",children:"Stats"}),e.jsx("p",{className:"text-sm text-zinc-600 dark:text-zinc-400",children:"Full KPI overview. Tap a filter to focus on today, this week, or this month."})]}),e.jsx("div",{className:"mb-4 flex flex-wrap gap-2",children:w.map(t=>{const m=s===t.id;return e.jsx("button",{onClick:()=>r(t.id),className:`rounded-full px-3 py-1.5 text-sm transition-colors ${m?"bg-orange-600 text-white dark:bg-orange-500":"border border-zinc-300/60 bg-white/80 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700/60 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:bg-zinc-900"}`,children:t.label},t.id)})}),e.jsx("section",{className:"grid grid-cols-2 gap-3 sm:grid-cols-3",children:d.map(t=>e.jsxs("div",{className:`rounded-xl border border-zinc-200/60 bg-white/80 p-3 shadow-sm 
                       dark:border-zinc-800/60 dark:bg-zinc-900/70`,children:[e.jsx("div",{className:"mb-1 text-lg text-orange-600 dark:text-orange-400",children:t.icon}),e.jsx("div",{className:"text-sm font-medium text-zinc-700 dark:text-zinc-300",children:t.title}),e.jsx("div",{className:"text-base font-semibold text-zinc-900 dark:text-zinc-50",children:t.value})]},t.id))})]})}export{j as default};
