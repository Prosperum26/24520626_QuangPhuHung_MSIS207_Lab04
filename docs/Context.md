Dưới đây là toàn bộ nội dung văn bản được trích xuất từ 11 slide hình ảnh của bạn, được sắp xếp theo từng slide:

---

### Slide 1 (`image_e1d1de.png`)

* **UIT_S3T**
* **bash - lab4_title_deck.sh**
* **LAB 4: MULTI-ROUTE SPA ARCHITECTURE, CONTEXT FORM ENGINE & FULL-STACK REACT 19 SYSTEMS**
* Bridging Lab 2 & Lab 3 to React Router v7, Synchronous Context Validation & Express/Mongoose 8 REST APIs
* **$ author:** MSc. Tran Vinh Khiem | Smart Software System Team (S3T) | University of Information Technology (UIT - VNUHCM)

---

### Slide 2 (`image_e1d1c0.png`)

* **ARCHITECTURE**
* **Architectural Evolution: Lab 3 $\rightarrow$ Lab 4**
* Scaling from Isolated Hooks to Multi-Route Full-Stack Systems
* **Core Architectural Shifts:**
* Multi-Route Single Page Apps: **Migrating from single-view `useState` state switching to client-side routing with React Router v7.**
* Context Form Engines: **Scaling localized component state into global `Context` providers for complex multi-step forms.**
* Full-Stack Persistence: **Establishing real-time persistence layer connectivity via Express API & MongoDB database.**
* **src/App.jsx – Migration Paradigm** (Code block):

```javascript
// Lab 3: Single-View Hooks (Deprecated)
const [view, setView] = useState('form');

// Lab 4: Context Engine & React Router v7
import { createContext } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';
...;
export const FormCtx = createContext();
const router = createBrowserRouter([
{ path: "/", element: <FormEngine /> }
]);
return <RouterProvider router={router} />;
```

---

### Slide 3 (`image_e1d184.png`)

* **MANIFESTO**
* **Pedagogical Manifesto**
* Core Philosophy & Full-Stack Verification Contract
* > *"HTML is the foundation. CSS enhances presentation. JavaScript enhances behavior. AI enhances the developer."*
  >
* **FULL-STACK VERIFICATION CONTRACT:**

1. Strict Contract-First API design
2. Mandatory client & server validation parity
3. Zero unhandled promise rejections or uncaught effect loops
4. Deterministic state updates in single render passes

---

### Slide 4 (`image_e1d17c.png`)

* **DEPRECATION AUDIT**
* **Deprecation Audit: Part 1**
* Comparing legacy routing & UI packages with modern standard equivalents
* **❌ DEPRECATED (WARNING / ERROR):**

1. React Router v5
   `<Switch>`, `<Redirect>`, exact, activeClassName
2. react-media
   `JSX media query wrapper components`
3. typeface-roboto
   `Legacy monolithic npm font package`
4. defaultProps
   `Component.defaultProps = { ... }`
5. Material-UI v4
   `@material-ui/core`

* **✔️ MODERN STANDARD (SUCCESS):**

1. React Router v7
   `<Routes>`, `<Route>`, `NavLink`
   `className={({isActive}) => ...}`
2. Native CSS Grid layout
   `Native CSS grid & @media queries`
3. Web font CSS loaders
   `Standard @font-face and web loaders`
4. Default JS parameters
   `function Component({ prop = defaultVal })`
5. Headless / native HTML design system
   `Unstyled accessible primitives & semantic HTML`

---

### Slide 5 (`image_e1cdd9.png`)

* **DEPRECATION AUDIT**
* **Deprecation Audit Part 2**
* Legacy Code Anti-Patterns vs. Modern Standards
* **❌ LEGACY ANTI-PATTERNS (DEPRECATED):**
* Missing useEffect Dependencies
* Missing useEffect dependency arrays causing stale closures and infinite loop re-renders.
* 5-Layer Validation Waterfalls
* 5-layer useEffect form validation waterfalls creating complex cascading state.
* Leaky didCancel Boolean Flags
* Leaky didCancel boolean flags allowing memory leaks during async requests.
* Hardcoded Connection Strings
* Hardcoded MongoDB connection strings committed directly to source control.
* Legacy Mongoose Callbacks
* Removed Mongoose 5 callback functions breaking modern async query execution.
* **modern-refactoring.js** (Code block):

```javascript
~ $ refactor --apply modern-standards

// 1. Synchronous derived state
const isValid = useMemo(() => validate(form), [form]);

// 2. AbortController signal cleanup
const controller = new AbortController();
fetch(url, { signal: controller.signal });

// 3. process.env.MONGODB_URI config
const uri = process.env.MONGODB_URI;

// 4. Mongoose 8 async/await query patterns
const user = await User.findById(id).exec();
```

---

### Slide 6 (`image_e1cdba.png`)

* **CURRICULUM ROADMAP**
* **Curriculum Structure**
* 3-Tier Pedagogical Roadmap & Technical Objectives
* **TIER 1: CORE:**
* React Router v7 (`<Outlet>`, `useParams`)
* Synchronous Context Form Validation
* AbortController custom hooks
* **TIER 2: AWARENESS:**
* React.lazy + `<Suspense>`
* Pointer/Keyboard Swipe Queue
* Express + Mongoose 8 async/await
* **TIER 3: LATER LABS:**
* TanStack Query (FKA React Query)
* Next.js React Server Components (RSC)

---

### Slide 7 (`image_e17c25.png`)

* **EXECUTION ROADMAP**
* **Lab Execution Roadmap**
* 180-Minute Timeboxed Engineering Breakdown
* **BLOCK 1 (0-40m):** Setup & WBS Decomposition
* **BLOCK 2 (40-75m):** Sprint 1 Router Migration
* **BLOCK 3 (75-120m):** Sprint 2 Context Form Engine
* **BLOCK 4 (120-155m):** Sprint 3 Full-Stack Custom Hook & Express REST API
* **BLOCK 5 (155-180m):** 3-Minute Live Refactoring Defense & AI Failure Mode Audit

---

### Slide 8 (`image_e17c1c.png`)

* **GOVERNANCE & WORKFLOW**
* **Governance & AI Workflow Protocols**
* Enforcing strict quality gates and commit hygiene for Lab 4
* **project-rules.md & TASK_DECOMPOSITION.md**

1. Strict 4-Stage Contract-First Loop
   `[1] Contract:` Define API & interface spec
   `[2] Fail Test:` Write failing automated test
   `[3] Implement:` Minimal code to satisfy test
   `[4] Refactor:` Clean code while maintaining green tests
2. Atomic Git Commits

* Mandatory per sprint requirement in task decomposition
* Isolated scope per commit using conventional messages
* **zsh – git log --graph --oneline** (Code block):

```bash
~ $ git log --graph --oneline --decorate
* 8f2a1c9 (HEAD -> main) fix: synchronous form validation context
* 4b7e0d2 test: add fail test for form validation
* 19c3f8e feat: add React Router v7 layout
* 0d12e4a docs: define contract spec in project-rules.md
* e5f6a7b init: scaffold lab 4 multi-source SPA
✓ Atomic commit tree verified
✓ Standard conventional commit syntax enforced
```

---

### Slide 9 (`image_e17b83.png`)

* **REFACTORING**
* **Exercise 1.1**
* Performance & Resiliency Architectural Upgrades
* **KEY ARCHITECTURAL HIGHLIGHTS:**
* Code-Splitting: **Dynamic imports via `React.lazy()` for route-level chunking.**
* Suspense Boundaries: **Wrapping routes in `<Suspense fallback="{...}">`.**
* Zero Layout Shift: **Dimension-matched skeleton fallbacks ensuring CLS = 0.**
* Accessibility: **Integrated attributes `aria-busy='true'` & `aria-live='polite'`.**
* **PersonDetail.tsx – Lazy Loading** (Code block):

```tsx
// Dynamic import via React.lazy
const PersonDetail = React.lazy(() =>
  import('./PersonDetail')
);

// Resilient wrapper with Skeleton fallback
<Suspense
  fallback={
    <Skeleton
      aria-busy="true"
      aria-live="polite"
    />
  }
>
  <PersonDetail />
</Suspense>
```

---

### Slide 10 (`image_e17b47.png`)

* **REACT ROUTER V7**
* **Exercises 1.2 & 1.2.1**
* Declarative Syntax Updates & React Router v7 Layout Architecture
* **Declarative Syntax Changes:**
* Replace `<Switch>` with `<Routes>`: **Top-level route container updated to modern matching algorithm.**
* Element Prop Syntax: **Routes defined using `element={<Layout/>}` passing JSX elements directly.**
* Nested Route Layouts: **Shared layouts render child components dynamically via `<Outlet/>`.**
* Active Link Styling: **Functional callback syntax for dynamic navigation highlighting.**
* **App.jsx – React Router v7 Structure** (Code block):

```jsx
// 1. Replace Switch with Routes
import { Routes, Route, NavLink, Outlet } from 'react-router';
function App() {
  return (
    <Routes>
      {/* 2. Element prop & Layout nesting */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  );
}
// 3. Layout with Outlet & Active NavLink
const Layout = () => (
  <nav>
    <NavLink className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink>
  </nav>
  <Outlet />
);
```

Dưới đây là toàn bộ nội dung văn bản được trích xuất từ 11 slide hình ảnh của bạn, được sắp xếp theo từng slide:

---

### Slide 1 (`image_e1d1de.png`)

* **UIT_S3T**
* **bash - lab4_title_deck.sh**
* **LAB 4: MULTI-ROUTE SPA ARCHITECTURE, CONTEXT FORM ENGINE & FULL-STACK REACT 19 SYSTEMS**
* Bridging Lab 2 & Lab 3 to React Router v7, Synchronous Context Validation & Express/Mongoose 8 REST APIs
* **$ author:** MSc. Tran Vinh Khiem | Smart Software System Team (S3T) | University of Information Technology (UIT - VNUHCM)

---

### Slide 2 (`image_e1d1c0.png`)

* **ARCHITECTURE**
* **Architectural Evolution: Lab 3 $\rightarrow$ Lab 4**
* Scaling from Isolated Hooks to Multi-Route Full-Stack Systems
* **Core Architectural Shifts:**
* Multi-Route Single Page Apps: **Migrating from single-view `useState` state switching to client-side routing with React Router v7.**
* Context Form Engines: **Scaling localized component state into global `Context` providers for complex multi-step forms.**
* Full-Stack Persistence: **Establishing real-time persistence layer connectivity via Express API & MongoDB database.**
* **src/App.jsx – Migration Paradigm** (Code block):

```javascript
// Lab 3: Single-View Hooks (Deprecated)
const [view, setView] = useState('form');

// Lab 4: Context Engine & React Router v7
import { createContext } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';
...;
export const FormCtx = createContext();
const router = createBrowserRouter([
{ path: "/", element: <FormEngine /> }
]);
return <RouterProvider router={router} />;
```

---

### Slide 3 (`image_e1d184.png`)

* **MANIFESTO**
* **Pedagogical Manifesto**
* Core Philosophy & Full-Stack Verification Contract
* > *"HTML is the foundation. CSS enhances presentation. JavaScript enhances behavior. AI enhances the developer."*
  >
* **FULL-STACK VERIFICATION CONTRACT:**

1. Strict Contract-First API design
2. Mandatory client & server validation parity
3. Zero unhandled promise rejections or uncaught effect loops
4. Deterministic state updates in single render passes

---

### Slide 4 (`image_e1d17c.png`)

* **DEPRECATION AUDIT**
* **Deprecation Audit: Part 1**
* Comparing legacy routing & UI packages with modern standard equivalents
* **❌ DEPRECATED (WARNING / ERROR):**

1. React Router v5
   `<Switch>`, `<Redirect>`, exact, activeClassName
2. react-media
   `JSX media query wrapper components`
3. typeface-roboto
   `Legacy monolithic npm font package`
4. defaultProps
   `Component.defaultProps = { ... }`
5. Material-UI v4
   `@material-ui/core`

* **✔️ MODERN STANDARD (SUCCESS):**

1. React Router v7
   `<Routes>`, `<Route>`, `NavLink`
   `className={({isActive}) => ...}`
2. Native CSS Grid layout
   `Native CSS grid & @media queries`
3. Web font CSS loaders
   `Standard @font-face and web loaders`
4. Default JS parameters
   `function Component({ prop = defaultVal })`
5. Headless / native HTML design system
   `Unstyled accessible primitives & semantic HTML`

---

### Slide 5 (`image_e1cdd9.png`)

* **DEPRECATION AUDIT**
* **Deprecation Audit Part 2**
* Legacy Code Anti-Patterns vs. Modern Standards
* **❌ LEGACY ANTI-PATTERNS (DEPRECATED):**
* Missing useEffect Dependencies
* Missing useEffect dependency arrays causing stale closures and infinite loop re-renders.
* 5-Layer Validation Waterfalls
* 5-layer useEffect form validation waterfalls creating complex cascading state.
* Leaky didCancel Boolean Flags
* Leaky didCancel boolean flags allowing memory leaks during async requests.
* Hardcoded Connection Strings
* Hardcoded MongoDB connection strings committed directly to source control.
* Legacy Mongoose Callbacks
* Removed Mongoose 5 callback functions breaking modern async query execution.
* **modern-refactoring.js** (Code block):

```javascript
~ $ refactor --apply modern-standards

// 1. Synchronous derived state
const isValid = useMemo(() => validate(form), [form]);

// 2. AbortController signal cleanup
const controller = new AbortController();
fetch(url, { signal: controller.signal });

// 3. process.env.MONGODB_URI config
const uri = process.env.MONGODB_URI;

// 4. Mongoose 8 async/await query patterns
const user = await User.findById(id).exec();

```

---

### Slide 6 (`image_e1cdba.png`)

* **CURRICULUM ROADMAP**
* **Curriculum Structure**
* 3-Tier Pedagogical Roadmap & Technical Objectives
* **TIER 1: CORE:**
* React Router v7 (`<Outlet>`, `useParams`)
* Synchronous Context Form Validation
* AbortController custom hooks
* **TIER 2: AWARENESS:**
* React.lazy + `<Suspense>`
* Pointer/Keyboard Swipe Queue
* Express + Mongoose 8 async/await
* **TIER 3: LATER LABS:**
* TanStack Query (FKA React Query)
* Next.js React Server Components (RSC)

---

### Slide 7 (`image_e17c25.png`)

* **EXECUTION ROADMAP**
* **Lab Execution Roadmap**
* 180-Minute Timeboxed Engineering Breakdown
* **BLOCK 1 (0-40m):** Setup & WBS Decomposition
* **BLOCK 2 (40-75m):** Sprint 1 Router Migration
* **BLOCK 3 (75-120m):** Sprint 2 Context Form Engine
* **BLOCK 4 (120-155m):** Sprint 3 Full-Stack Custom Hook & Express REST API
* **BLOCK 5 (155-180m):** 3-Minute Live Refactoring Defense & AI Failure Mode Audit

---

### Slide 8 (`image_e17c1c.png`)

* **GOVERNANCE & WORKFLOW**
* **Governance & AI Workflow Protocols**
* Enforcing strict quality gates and commit hygiene for Lab 4
* **project-rules.md & TASK_DECOMPOSITION.md**

1. Strict 4-Stage Contract-First Loop
   `[1] Contract:` Define API & interface spec
   `[2] Fail Test:` Write failing automated test
   `[3] Implement:` Minimal code to satisfy test
   `[4] Refactor:` Clean code while maintaining green tests
2. Atomic Git Commits

* Mandatory per sprint requirement in task decomposition
* Isolated scope per commit using conventional messages
* **zsh – git log --graph --oneline** (Code block):

```bash
~ $ git log --graph --oneline --decorate
* 8f2a1c9 (HEAD -> main) fix: synchronous form validation context
* 4b7e0d2 test: add fail test for form validation
* 19c3f8e feat: add React Router v7 layout
* 0d12e4a docs: define contract spec in project-rules.md
* e5f6a7b init: scaffold lab 4 multi-source SPA
✓ Atomic commit tree verified
✓ Standard conventional commit syntax enforced

```

---

### Slide 9 (`image_e17b83.png`)

* **REFACTORING**
* **Exercise 1.1**
* Performance & Resiliency Architectural Upgrades
* **KEY ARCHITECTURAL HIGHLIGHTS:**
* Code-Splitting: **Dynamic imports via `React.lazy()` for route-level chunking.**
* Suspense Boundaries: **Wrapping routes in `<Suspense fallback="{...}">`.**
* Zero Layout Shift: **Dimension-matched skeleton fallbacks ensuring CLS = 0.**
* Accessibility: **Integrated attributes `aria-busy='true'` & `aria-live='polite'`.**
* **PersonDetail.tsx – Lazy Loading** (Code block):

```tsx
// Dynamic import via React.lazy
const PersonDetail = React.lazy(() =>
  import('./PersonDetail')
);

// Resilient wrapper with Skeleton fallback
<Suspense
  fallback={
    <Skeleton
      aria-busy="true"
      aria-live="polite"
    />
  }
>
  <PersonDetail />
</Suspense>
```

---

### Slide 10 (`image_e17b47.png`)

* **REACT ROUTER V7**
* **Exercises 1.2 & 1.2.1**
* Declarative Syntax Updates & React Router v7 Layout Architecture
* **Declarative Syntax Changes:**
* Replace `<Switch>` with `<Routes>`: **Top-level route container updated to modern matching algorithm.**
* Element Prop Syntax: **Routes defined using `element={<Layout/>}` passing JSX elements directly.**
* Nested Route Layouts: **Shared layouts render child components dynamically via `<Outlet/>`.**
* Active Link Styling: **Functional callback syntax for dynamic navigation highlighting.**
* **App.jsx – React Router v7 Structure** (Code block):

```jsx
// 1. Replace Switch with Routes
import { Routes, Route, NavLink, Outlet } from 'react-router';
function App() {
  return (
    <Routes>
      {/* 2. Element prop & Layout nesting */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  );
}
// 3. Layout with Outlet & Active NavLink
const Layout = () => (
  <nav>
    <NavLink className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink>
  </nav>
  <Outlet />
);
```

Dưới đây là nội dung văn bản được trích xuất từ các slide hình ảnh tiếp theo:

---



Dưới đây là nội dung văn bản được trích xuất từ 10 slide hình ảnh tiếp theo:

---

### Slide 11 (`image_e17860.png`)

* **EXERCISE 1.3.2**
* **Exercise 1.2.2**
* Refactoring for Master-Detail Views via React Router & CSS Grid
* **DESIGN REQUIREMENTS:**

1. Responsive CSS Grid Layout
   `grid-template-columns: minmax(280px, 1fr) 2fr`
2. Safe URL Param Extraction
   **Extract dynamic route IDs seamlessly using the `useParams()` hook.**
3. Robust Fallback & 404 Handling
   **Locate entity via `people.find()`; render 404 state if ID is invalid.**
4. Semantic HTML Definition Lists
   **Structure detailed attribute key-value pairs using `<dl>`, `<dt>`, and `<dd>`.**

* **PersonDetail.jsx** (Code block):

```jsx
// Lookup logic & JSX rendering
const PersonDetail = ({ people }) => {
  const { id } = useParams();
  const person = people.find(p => p.id === id);

  if (!person) return <NotFoundState />;

  return (
    <dl className="person-details">
      <dt>Name:</dt>
      <dd>{person.name}</dd>
      <dt>Role:</dt>
      <dd>{person.role}</dd>
    </dl>
  );
};

```

---

### Slide 12 (`image_e177c2.png`)

* **SPRINT 1 (40-75m)**
* **IN-CLASS SPRINT EXECUTION**
* **Responsive Master-Detail Directory & Case Dossier Router**
* **sprint-1-requirements.md:**

> `> Requirements Check:`

* **Fulfill `PeopleLayout.jsx` & `PersonDetail.jsx` component contract using React Router v7 `<Outlet/>` and `useParams()`.**
* **Complete 2 Atomic Git Commits (`feat: router layout`, `feat: detail route handling`).**
* **Pass DevTools Checkpoints (no console warnings, clean URL parameter parsing).**

---

### Slide 13 (`image_e177a5.png`)

* **ANTI-PATTERN**
* **Exercise 1.3: Legacy Validation Anti-Patterns**
* Deconstructing useEffect Chaining Across InputField & SimpleForm
* **❌ CRITICAL ARCHITECTURAL FLAWS:**
  Chaining 5 useEffect Hooks in Form State:
* Cascading Re-renders: **State synchronizations between `InputField` and `SimpleForm` trigger up to 5 redundant render cycles per keystroke.**
* Race Conditions: **Rapid user typing causes asynchronous effect updates to resolve out of order, corrupting state.**
* Infinite Loop Risk: **Mutual state dependencies risk triggering React's `Maximum update depth exceeded` exception.**
* **execution_trace.log** (Log block):

```text
~ $ trace-render-cycle --target Ex1.6
[1] User Event: onChange('a')
 ├──> InputField render (local state)
 ├──> useEffect #1: syncToParent()
 │     └──> SimpleForm render (parent state)
 │           ├──> useEffect #2: validateField()
 │           ├──> useEffect #3: calcFormValidity()
 │           └──> useEffect #4: syncErrorsToChild()
 │                 └──> InputField re-render (errors)
 │                       └──> useEffect #5: autoScrollToError()
------------------------------------------------------------
🚨 CASCADE DETECTED: 5 re-renders / 1 keypress
💥 Uncaught Error: Max update depth exceeded

```

---

### Slide 14 (`image_e17787.png`)

* **ARCHITECTURE**
* **Synchronous Form Validation Engine**
* Single Render Pass Engine Architecture
* **Core Architectural Mechanics:**
* Synchronous Evaluation
* **Computes field errors and form validity synchronously during render using `createContext()` and `useContext()`.**
* Stable Unique Binding
* **Ensures stable, deterministic element binding across re-renders with `useId()`.**
* Accessible Messaging
* **Binds validation feedback directly to screen readers via `aria-invalid` and `aria-describedby` attributes.**
* **FormContext.tsx** (Code block):

```tsx
// FormContext.Provider Implementation
const FormContext = createContext<FormState>(null!)
export function FormProvider({ values, rules, children }) {
  // 1. Synchronous evaluation during render
  const errors = evaluateErrors(values, rules);
  const isValid = Object.keys(errors).length === 0;
  // 2. Stable accessibility element binding
  const fieldId = useId();

  return (
    <FormContext.Provider value={{ errors, isValid, fieldId }}>
      {children}
    </FormContext.Provider>
  );
}

```

---

### Slide 15 (`image_e1776b.png`)

* **SPRINT 2 (75-120m)**
* **Context-Driven Multi-Field Form Engine**
* & Live `<ShowData/>` Inspector
* `> Requirements Check:`
* **Fulfill `SimpleForm.jsx` & `InputField.jsx` context contracts for synchronous validation without `useEffect`.**
* **Render live `<ShowData/>` JSON inspector on valid submit.**
* **Complete 3 Atomic Git Commits: `feat: form context`, `feat: input field validation`, `feat: inspector output`.**

---

### Slide 16 (`image_e17764.png`)

* **EXERCISE 1.7.1**
* **Data Fetching & Express Hygiene**
* Refactoring async React state hooks & securing API route handlers
* **Architecture & Hygiene Checklist:**
* Custom Hook Refactoring: **Extracted state logic into `useForumMessages.js` using `AbortController` signal to prevent memory leaks and out-of-order race conditions on fast channel switching.**
* Semantic UI Rendering: **Rendered semantic keyed `<React.Fragment key="{msg.id}">` inside definition lists (`<dl>`).**
* CORS Middleware: **Configured cross-origin resource sharing in Express via `cors()`.**
* Payload Security: **Applied strict POST payload validation on incoming requests.**
* **useForumMessages.js** (Code block):

```javascript
import { useState, useEffect } from 'react';
export function useForumMessages(channelId) {
  const [msgs, setMsgs] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/channels/${channelId}/messages`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => setMsgs(data))
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });
    return () => controller.abort();
  }, [channelId]);
  return msgs;
}

```

---

### Slide 17 (`image_e17746.png`)

* **SPRINT 3 EXECUTION**
* **Full-Stack Custom Hook `useForumMessages` & Live Channel Switcher**
* `> Requirements Check:`
* **Implement full-stack data fetching across channels (`'nasa'`, `'esports-tribunal'`, `'notNasa'`).**
* **Network verification under simulated Slow 3G in Chrome DevTools to confirm in-flight requests are cleanly cancelled via `AbortController` on rapid channel switches.**
* **Save full-stack error log verification.**

---

### Slide 18 (`image_e1749e.png`)

* **EVALUATION // BLOCK 5**
* **Live Defense Protocol & AI Audit**
* Interactive Code Defense & Engineering Verification Evaluation
* **Live Refactoring Defense:**
  `> 3-Minute Timeboxed Protocol`
* Code Architecture: **Articulate overall system design and module relationships live.**
* State Choice Defense: **Defend choices for local, global, or persistent state management.**
* Injected Bug Resolution: **Demonstrate real-time debugging and fix for a live injected fault.**
* **AI_FAILURE_AUDIT.md:**
  `[EVALUATION] Worth 15% of Total Lab Grade`
  Audit Documentation Requirements:
* AI Code Failures: **Log all non-functional AI-generated implementations.**
* Hallucinated APIs & Loops: **Record phantom methods and broken effect loops.**
* Engineering Verification: **Detail manual analysis and exact steps taken to resolve issues.**

---

### Slide 19 (`image_e17483.png`)

* **Production Multi-Route Photo & Evidence Gallery SPA**
* React Router v7
* **HOMEWORK 1 SPECIFICATION**
* **Core Requirements:**
* `1. Deep Linking:` **Implement deep linking with `useSearchParams()` for category filters and modal photo views.**
* `2. Lightbox View:` **Native HTML `<dialog>` element for modal lightbox views.**
* `3. Quality & Accessibility:` **Full WCAG 2.2 AA accessibility compliance and 100/100 Lighthouse performance score.**

---

### Slide 20 (`image_e1747b.png`)

* **HOMEWORK 1**
* **Full-Stack Interactive Card-Swipe Deck**
* **'Hen Ho Nhung Khong Yeu' Edition**
* **CORE REQUIREMENTS**
* **Specification Checklist:**
* Dual Keyboard/Pointer Event Listener: **Handles responsive swipe queue operations across devices.**
* LIFO Undo Stack: **Dedicated stack implementation for restoring swiped cards in sequence.**
* Asymmetric Score Calculation: **Dynamic game metrics calculated via purely derived state.**
* Full-Stack Persistence Layer: **Backend powered by Express and Mongoose 8 async/await models.**

### Slide 21 (`image_e17444.png`)

* **HOMEWORK 2**
* **Full-Stack Esports Fair-Play Appeal Tribunal**
* Himass & TanVuu Case Study Specification
* **SPECIFICATION // SYSTEM CORE REQUIREMENTS**
* Deliverables & Technical Requirements:
* Multi-Route Dossier Navigation: **Build dynamic player case routing via `/dossier/:playerID`.**
* Appeal Form Engine: **Implement a context-driven form system featuring real-time field validation.**
* Zero-Drift SLA Countdown Hook: **Develop `useAppealSlaTimer()` synchronized strictly against system clock delta.**
* Post-Mortem Audit: **Submit a complete `AI_FAILURE_AUDIT.md` architecture analysis.**

---

### Slide 22 (`image_e17425.png`)

* **SLIDE 23 — SPRINT 1 CODE CONTRACT: PEOPLELAYOUT.JSX & PERSONDETAIL.JSX**
* Nested React Router v7 `<Outlet/>`, `<NavLink/>`, `useParams`, `people.find()` 404 boundary, and semantic `<dl>/<dt>/<dd>`
* **PeopleLayout.jsx** (Code block):

```javascript
import { NavLink, Outlet } from 'react-router';

export default function PeopleLayout({ people }) {
  return (
    <div className="people-frame">
      <nav className="sidebar">
        {people.map((p) => (
          <NavLink
            key={p.id}
            to={`/people/${p.id}`}
            className={({ isActive }) =>
              isActive ? 'active-link' : 'link'
            }
          >
            {p.name}
          </NavLink>
        ))}
      </nav>
      {/* Render layout frame wrapping child routes */}
      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
}
```

* **PersonDetail.jsx** (Code block):

```javascript
import { useParams } from 'react-router';

export default function PersonDetail({ people }) {
  // Parameter extraction with useParams
  const { id } = useParams();
  // Record retrieval: people.find()
  const person = people.find((p) => p.id === id);

  // Explicit 404 boundary guard
  if (!person) {
    return <div role="alert">404: Person Not Found</div>;
  }

  // Accessible semantic HTML rendering
  return (
    <dl className="person-details">
      <dt>Name</dt><dd>{person.name}</dd>
      <dt>Role</dt><dd>{person.role}</dd>
    </dl>
  );
}
```

---

### Slide 23 (`image_e17408.png`)

* **Slide 24 — Sprint 2 Code Contract (Part A): SimpleForm.jsx & FormContext.js**
* Synchronous derived validation errors in render pass with zero useEffect waterfalls
* **SimpleForm.jsx** (Code block):

```javascript
// Zero useEffect validation architecture
export const SimpleForm = () => {
  const [values, setValues] = useState(initial);
  // Synchronous derived validation in render pass
  const errors = validateForm(values);
  // Eliminates multi-pass render waterfalls
  return (
    <FormContext.Provider
      value={{ values, errors, setValues }}
    >
      <FormUI errors={errors} />
    </FormContext.Provider>
  );
};
```

* **FormContext.js** (Code block):

```javascript
// 1. Context initialization
import { createContext, useContext } from 'react';
export const FormContext = createContext(null);

// 2. Provider pattern encapsulation
<FormContext.Provider
  value={{ values, errors, handleChange }}
>
  {children}
</FormContext.Provider>

// 3. Custom hook abstraction
export const useFormContext = () => {
  return useContext(FormContext);
};

```

---

### Slide 24 (`image_e173e8.png`)

* **Slide 25 — Sprint 2 Code Contract (Part B): InputField.jsx & ShowData.jsx**
* `useId()` label binding, `aria-invalid`, `aria-describedby`, and semantic `<dl>` JSON inspector
* **InputField.jsx** (Code block):

```javascript
import { useId } from 'react';
export const InputField = ({ label, error, ...props }) => {
  // 1. Unique ID generation & error linking
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span id={errorId} role="alert">{error}</span>
      )}
    </div>
  );
};
```

* **ShowData.jsx** (Code block):

```javascript
export const ShowData = ({ data }) => {
  // Semantic JSON state inspector using <dl>
  // Replaces unstructured JSON.stringify dumps
  return (
    <dl className="json-inspector">
      {Object.entries(data).map(([key, val]) => (
        <div key={key} className="data-row">
          <dt>{key}</dt>
          <dd>{String(val)}</dd>
        </div>
      ))}
    </dl>
  );
};
```

---

### Slide 25 (`image_e173ca.png`)

* **Slide 26 — Sprint 3 Code Contract (Part A): useForumMessages.js Custom Hook**
* `AbortController` cleanup, `signal.aborted` guard in try/catch/finally, and POST message helper
* **useForumMessages.js** (Code block):

```javascript
import { useState, useEffect } from 'react';

export const useForumMessages = (forumId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController(); // AbortController instantiation inside useEffect
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/forums/${forumId}/messages`, { signal: controller.signal });
        const result = await res.json();
        if (!controller.signal.aborted) { setData(result); }
      } catch (err) {
        if (!controller.signal.aborted) { console.error(err); }
      } finally {
        if (!controller.signal.aborted) { setLoading(false); } // signal.aborted guard logic
      }
    };
    fetchMessages();
    return () => controller.abort(); // Cleanup function returning abort call
  }, [forumId]);

  const postMessage = (payload) => { /* integrated POST helper -> trigger refetch */ };
  return { data, loading, postMessage };
};
```

---

### Slide 26 (`image_e173ab.png`)

* **SLIDE 27 — SPRINT 3 CODE CONTRACT (PART B): EXPRESS REST API SERVER**
* CORS middleware, `GET /api/messages/:forum`, and `POST` payload validation with `crypto.randomUUID()`
* **server.js – Express Setup & GET /api/messages/:forum** (Code block):

```javascript
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.get('/api/messages/:forum', async (req, res) => {
  const messages = await db.getMessagesByForum(req.params.forum);
  res.json(messages);
});
```

* **server.js – POST Payload Validation & ID Generation** (Code block):

```javascript
app.post('/api/messages/:forum', async (req, res) => {
  if (!req.body.text || !req.body.author)
    return res.status(400).json({ error: 'Missing required fields' });

  const newMessage = { id: crypto.randomUUID(), ...req.body, timestamp: new Date() };
  await db.addMessage(req.params.forum, newMessage);
  res.status(201).json(newMessage);
});
```

---

### Slide 27 (`image_e173a4.png`)

* **Slide 28 — Live Defense Challenge Bank: 4 Real-Time Refactoring Prompts**
* URL Search Params Sync via `useSearchParams`, Cross-Field Validation, Auto-Retry Backoff, Protected Route Guard
* **URL Search Params Sync:**
* **Challenge:** Refactor local component state to synchronize with the URL query string using React Router's `useSearchParams`.
* **Objective:** Ensure deep linkability and state persistence across page reloads for filters and pagination.
* **Cross-Field Validation:**
* **Challenge:** Implement complex validation logic that depends on multiple form fields simultaneously (e.g., Confirm Password matching Password).
* **Objective:** Extend the synchronous validation derived state pattern without introducing `useEffect`.
* **Auto-Retry Backoff:**
* **Challenge:** Enhance `useForumMessages.js` fetch logic to automatically retry failed network requests.
* **Objective:** Implement exponential backoff algorithm within async flow while respecting `AbortController` signals.
* **Protected Route Guard:**
* **Challenge:** Create a Higher-Order Component or wrapper component to secure specific routes.
* **Objective:** Intercept unauthorized access attempts and redirect users to login while preserving target URL.

---

### Slide 28 (`image_e17387.png`)

* **SLIDE 29 — TOP 5 AI HALLUCINATIONS IN ROUTING, FORMS & FULL-STACK CODE**
* React Router v5 `<Switch>` mixups, `useEffect` validation loops, hardcoded DB secrets, removed Mongoose 5 callbacks, unlabelled IconButtons
* **01. REACT ROUTER v5 `<SWITCH>` MIXUPS**
* AI models hallucinate outdated v5 syntax (`<Switch>`, `component={...}`) in React Router v7 projects, causing compilation errors.
* **02. USEEFFECT VALIDATION LOOPS**
* AI incorrectly suggests using `useEffect` to trigger form validation state updates, creating infinite render loops and lag.
* **03. HARDCODED DB SECRETS**
* Generative AI produces connection strings with embedded plaintext MongoDB URIs and passwords instead of `process.env`.
* **04. REMOVED MONGOOSE 5 CALLBACKS**
* Generative AI produces legacy callback patterns (`.exec((err, doc) => ...)`), which were completely removed in Mongoose 8.
* **05. UNLABELLED ICONBUTTONS**
* AI code omits critical `aria-label` attributes on icon-only buttons, failing WCAG 2.2 AA accessibility standards.

---

### Slide 29 (`image_e170df.png`)

* **Slide 30 — Homework 3 Code Contract: PhotoGalleryLayout.jsx & Native HTML5 `<dialog>` Modal**
* Upgrading `useSearchParams` and WCAG 2.2 AA focus management
* **PhotoGalleryLayout.jsx** (Code block):

```javascript
// 1. URL query string synchronization
const [searchParams, setSearchParams] = useSearchParams();
// 2. Modal state derived directly from URL
const selectedPhotoId = searchParams.get('photoId');
// 3. HTML5 <dialog> ref binding
const dialogRef = useRef(null);
// 4. Focus trap & open trigger (WCAG 2.2 AA Focus Management)
useEffect(() => {
  if (selectedPhotoId) dialogRef.current?.showModal();
  else dialogRef.current?.close();
}, [selectedPhotoId]);
// 5. Close handler syncing back to URL
return <dialog ref={dialogRef} onClose={() => setSearchParams({})}>...</dialog>;
```

---

### Slide 30 (`image_e170c0.png`)

* **Slide 31 — Homework 4 Code Contract (Frontend): SwipeDeck.jsx**
* 'Hen Ho Nhung Khong Yeu' Edition — Pointer/Keyboard ArrowLeft/ArrowRight/ArrowUp/Backspace handlers, LIFO Undo Stack, and Asymmetric Score Derived State
* **SwipeListeners.jsx (Event Handling)** (Code block):

```javascript
// Keyboard Navigation Mapping
const handleKeyDown = (e) => {
  if (e.key === 'ArrowLeft') swipe('left');
  if (e.key === 'ArrowRight') swipe('right');
  if (e.key === 'ArrowUp') swipe('up');
  if (e.key === 'Backspace') undoLastSwipe();
};
// Pointer Event Gesture Tracking
const [startPos, setStartPos] = useState(null);
const handlePointerDown = (e) => {
  setStartPos({ x: e.clientX, y: e.clientY });
};
const handlePointerUp = (e) => {
  const dx = e.clientX - startPos.x;
  if (dx > 50) swipe('right');
  if (dx < -50) swipe('left');
};
```

* **SwipeState.jsx (State & Logic)** (Code block):

```javascript
// LIFO Undo Stack Implementation
const [history, setHistory] = useState([]);
const undoLastSwipe = () => {
  setHistory(prev => prev.slice(0, -1));
};
// Asymmetric Score Derived State
const score = history.reduce((acc, action) => {
  if (action.type === 'LIKE') {
    return acc + 10;
  } else {
    return acc - 5;
  }
}, 0);
// Derived state re-calculates cleanly on render
```

Dưới đây là nội dung văn bản được trích xuất từ các slide tiếp theo:

---

### Slide 32 (`image_e1709c.png`)

* **SLIDE 32 — HOMEWORK 4 CODE CONTRACT (BACKEND): MODERN EXPRESS + MONGOOSE 8 SERVER**
* `process.env.MONGODB_URI` security, removing deprecated `useNewUrlParser`/`useUnifiedTopology` flags, and async/await GET/POST endpoints
* **server.js – Mongoose 8 Server Implementation** (Code block):

```javascript
// 1. Environment Variable Security Guard
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');

// 2. Modern Connection Syntax (Zero Deprecated Flags in Mongoose 8)
await mongoose.connect(process.env.MONGODB_URI);

// 3. Async/Await GET Endpoint (Optimized read via .lean())
app.get('/api/profiles', async (req, res) => {
  const profiles = await Profile.find().lean();
  res.json(profiles);
});

// 4. Async/Await POST Endpoint with Try/Catch Block
app.post('/api/swipe', async (req, res) => {
  try {
    const record = await Swipe.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
```

---

### Slide 33 (`image_e1707f.png`)

* **SLIDE 33 — HOMEWORK 4 CODE CONTRACT: FAIRPLAYAPPEALPORTAL.JSX & USEAPPEALSLATIMER.JS**
* Multi-Route Dossiers for Himass & TanVuu, Disproportionality Derived Matrix, and Zero-Drift Appeal SLA Countdown with `visibilitychange`
* **FairPlayAppealPortal.jsx** (Code block):

```jsx
// Multi-Route Dossier routing for team members Himass & TanVuu
<Route path="/dossier/himass" element={<DossierView user="Himass" />} />
<Route path="/dossier/tanvuu" element={<DossierView user="TanVuu" />} />

// Disproportionality Derived Matrix computation during render
const matrix = useMemo(() => computeMatrix(dossierData), [dossierData]);
```

* **useAppealSlaTimer.js** (Code block):

```javascript
// High-precision countdown hook with zero tab-drift using Page Visibility API
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') resyncTimerWithServer();
}); // Recalculates remaining time against absolute system clock timestamps
```

---

### Slide 34 (`image_e17063.png`)

* **Slide 34 — Complete Continuity Matrix (Lab 2 Lab 3 Lab 4) & Repository Submission Tree**
* Architectural evolution across labs and required Git repository directory structure
* **continuity_matrix.arch:**
* **LAB 2: Foundations & Synchronous State**
  Synchronous state management, UI component structure, & core reactive data flow.
* **LAB 3: Asynchronous Hooks & REST APIs**
  Custom async hooks, RESTful API endpoints integration, side-effect orchestration.
* **LAB 4: Full-Stack Contracts & Defense**
  End-to-end full-stack type safety contracts, live defense validation, & robust audit compliance.
* **git_repository_tree:**

```bash
$ tree -a --level=1 .
📂 repository-root/
├── project-rules.md
│   └── Team coding standards & lint rules
├── TASK_DECOMPOSITION.md
│   └── Sprint planning & work breakdown
├── AI_FAILURE_AUDIT.md
│   └── Documented AI hallucinations & manual fixes
└── .env.example
    └── Environment variable template without secrets
```

---

### Final Slide (`image_e17046.png`)

* **bash – execute final_directive.sh – 80x24**
* `> execute final_directive.sh`
  `[STATUS: DIRECTIVE EXECUTED SUCCESSFULLY]`
* **"Generate with AI. Verify with Engineering."**
* **UIT – VNUHCM**
  Smart Software System Team (S3T)
  MSc. Tran Vinh Khiem
* **END OF PRESENTATION**
