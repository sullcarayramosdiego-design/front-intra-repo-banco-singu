---
name: react
description: Professional skill for building production-grade React applications with TypeScript. Covers component architecture, state management patterns, data fetching with TanStack Query + Suspense, React 19 Actions and new hooks (useActionState, useFormStatus, use()), React Compiler, testing strategy, accessibility (a11y), error handling, observability, security, and performance optimization. Framework-agnostic — applicable to Next.js, Vite, Remix, or custom setups. Use this skill for any React component, hook, form, data fetching, or architecture question.
license: MIT
metadata:
  authors: "Fembyte"
  version: "3.0.0"
---

# Professional React Skill — Production-Grade Architecture

**Always consult [react.dev](https://react.dev/learn) and [react.dev/reference](https://react.dev/reference/react) for latest APIs.**

---

## 0. BEFORE YOU WRITE ANY CODE — Consistency Protocol

> **This section is mandatory. Skip it and you will break project consistency.**

Every time you are asked to create or modify anything in an existing React project, you MUST run this audit first. No exceptions.

### Step 1 — Audit existing components

```
Does a similar component already exist in src/shared/ui/?
  YES → extend or compose it. Never create a duplicate.
  NO  → create it there if it's reusable, or in src/features/<name>/components/ if it's feature-specific.
```

### Step 2 — Read the design system

Before writing a single style value, check:
- `src/styles/theme.ts` or `src/shared/ui/theme.ts` for design tokens
- Any existing CSS variables or Tailwind config (`tailwind.config.ts`)
- Existing component patterns in `src/shared/ui/`

- **ONLY use tokens that already exist.**
- Never introduce raw color or spacing values outside of the theme.
- If a needed token is missing, ADD IT to the theme first, then use it.

### Step 3 — Inherit naming conventions

Before naming a new component, hook, or file, look at 2–3 existing components and match their pattern exactly.

| Type | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase | `BlogCard.tsx`, `AuthGuard.tsx` |
| Hooks | camelCase, prefixed `use` | `useAuth.ts`, `usePagination.ts` |
| Utilities | camelCase | `formatDate.ts`, `cn.ts` |
| Context providers | PascalCase + `Provider` | `AuthProvider.tsx` |
| Types/Interfaces | PascalCase, prefixed `I` or plain | `UserProfile`, `ApiResponse<T>` |
| Feature folders | kebab-case | `blog/`, `user-profile/` |
| Page routes | kebab-case | `blog-post.tsx`, `[slug].tsx` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_POSTS_PER_PAGE` |
| CSS/Tailwind classes | Match existing project pattern | — |

### Step 4 — Check the rendering strategy

Before adding data-fetching or server logic:
- Is this a Client Component (`'use client'`) or Server Component (Next.js)?
- If the project uses SSR/SSG, does the page already have a defined strategy?
- Match the existing pattern — don't introduce `'use client'` where a Server Component suffices.

### Step 5 — Consistency checklist before delivering code

Before responding with any code, verify:

- [ ] No raw color or spacing values outside the theme
- [ ] No duplicate component that already exists in `shared/ui/`
- [ ] Components follow PascalCase; hooks follow `use` prefix
- [ ] All component props are typed with TypeScript interfaces
- [ ] New shared components placed in `shared/ui/`, feature-specific in `features/<name>/`
- [ ] All event handlers are properly typed (`React.ChangeEvent`, `React.FormEvent`, etc.)
- [ ] No `any` types unless absolutely necessary and documented
- [ ] No inline `style={{}}` for layout (use CSS/Tailwind classes or CSS modules)
- [ ] All form elements have associated `<label>` or `aria-label`
- [ ] No missing key props in lists
- [ ] No direct DOM manipulations — use `useRef` + effects
- [ ] All async operations have proper error handling (try/catch or `.catch`)
- [ ] All components that can fail have error boundaries

---

## 1. Professional Project Structure

Feature-based hierarchy — each feature owns its components, hooks, styles, and tests.

```
src/
  features/
    blog/
      components/
        BlogCard/
          BlogCard.tsx
          BlogCard.test.tsx
          BlogCard.stories.tsx
        BlogGrid/
          BlogGrid.tsx
          BlogGrid.test.tsx
          BlogGrid.module.css
      hooks/
        useBlogPosts.ts
        useLikePost.ts
      api/
        blogService.ts
        blogTypes.ts
      index.ts                  → re-exports public API
    auth/
      components/
        LoginForm/
          LoginForm.tsx
          LoginForm.test.tsx
          LoginForm.module.css
        AuthGuard.tsx
      hooks/
        useAuth.ts
        useSession.ts
      api/
        authService.ts
        authTypes.ts
      context/
        AuthContext.tsx
      index.ts
  shared/
    ui/                         → atomic, reusable UI components
      Button/
        Button.tsx
        Button.test.tsx
        Button.module.css
        variants/
          PrimaryButton.tsx
          SecondaryButton.tsx
      Modal/
        Modal.tsx
        Modal.test.tsx
        Modal.module.css
      Input/
        Input.tsx
        Input.test.tsx
      Card/
        Card.tsx
        Card.module.css
    layouts/
      RootLayout.tsx
      AuthLayout.tsx
      DashboardLayout.tsx
    hooks/
      useDebounce.ts
      useMediaQuery.ts
      useIntersectionObserver.ts
    lib/
      constants.ts
      utils.ts
      cn.ts                     → className utility (clsx + tailwind-merge)
      validators.ts
    types/
      common.ts
      api.ts
    api/
      httpClient.ts             → Axios/fetch wrapper with interceptors
    styles/
      globals.css               → global styles, reset, tailwind directives
      theme.ts                  → design tokens object
    middleware/
      errorHandler.ts           → global error handling
      authGuard.ts              → route protection
  pages/                        → route pages (framework-dependent)
    home/
      HomePage.tsx
    blog/
      BlogListPage.tsx
      BlogPostPage.tsx
    auth/
      LoginPage.tsx
  app/                          → Next.js App Router (if applicable)
  store/                        → global state (if needed)
  test/
    setup.ts                    → test configuration
    mocks/
      handlers.ts               → MSW handlers
      server.ts                 → MSW server
```

### Where does a new file go? Decision tree

```
Is it used in more than one feature?
  YES → src/shared/ui/ (component) or src/shared/lib/ (utility)
  NO  → src/features/<feature-name>/components/

Is it a page/route?
  YES → src/pages/ or src/app/

Is it a custom hook?
  YES → src/shared/hooks/ (global) or src/features/<name>/hooks/ (feature)

Is it an API call or service?
  YES → src/shared/api/ (global) or src/features/<name>/api/ (feature)

Is it a React context?
  YES → src/shared/context/ or src/features/<name>/context/
```

### Configuration files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript strict mode with path aliases |
| `vite.config.ts` / `next.config.ts` | Build tool configuration |
| `vitest.config.ts` or `jest.config.ts` | Test runner config |
| `playwright.config.ts` | E2E test config |
| `.eslintrc.cjs` | Linting with `eslint-plugin-react` + `eslint-plugin-react-hooks` |
| `.prettierrc` | Code formatting |
| `tailwind.config.ts` | Tailwind CSS design tokens (if used) |
| `chromatic.config.ts` | Visual regression (if used) |

---

## 2. Component Architecture

### Component types and patterns

#### Presentational Components (Pure/Stateless)

Receive data via props, no side effects, no state (or only UI state).

```tsx
// src/shared/ui/Card/Card.tsx
export interface CardProps {
  title: string;
  description: string;
  variant?: 'default' | 'elevated';
  children?: React.ReactNode;
  className?: string;
}

export function Card({ title, description, variant = 'default', children, className }: CardProps) {
  return (
    <article className={cn('card', `card--${variant}`, className)}>
      <h3 className="card__title">{title}</h3>
      {description && <p className="card__description">{description}</p>}
      {children && <div className="card__content">{children}</div>}
    </article>
  );
}
```

#### Container Components (Smart/Connected)

Handle data fetching, state management, and side effects. Delegate rendering to presentational components.

> **React 19+ / Modern pattern:** The preferred approach is using TanStack Query + `<Suspense>` + Error Boundaries instead of managing `loading`/`error` state manually inside the component (see Section 4). The `if (loading) return <Spinner />` inside containers is considered a legacy pattern.

```tsx
// src/features/blog/components/BlogPostContainer.tsx
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/shared/ui/Card';
import { blogService } from '@/features/blog/api/blogService';
import type { BlogPost } from '@/features/blog/api/blogTypes';
import { Skeleton } from '@/shared/ui/Skeleton';
import { ErrorBoundary } from '@/shared/middleware/ErrorBoundary';

export interface BlogPostContainerProps {
  postId: string;
}

// Inner component — only renders when data is ready (Suspense handles loading)
function BlogPostCard({ postId }: BlogPostContainerProps) {
  const { data: post } = useQuery<BlogPost>({
    queryKey: ['blog-post', postId],
    queryFn: () => blogService.getPost(postId),
  });

  if (!post) return null;
  return <Card title={post.title} description={post.excerpt} />;
}

// Outer component — owns the loading and error boundaries
export function BlogPostContainer({ postId }: BlogPostContainerProps) {
  return (
    <ErrorBoundary fallback={(error, reset) => (
      <div role="alert">
        <p>Failed to load post: {error.message}</p>
        <button onClick={reset}>Retry</button>
      </div>
    )}>
      <Suspense fallback={<Skeleton lines={4} />}>
        <BlogPostCard postId={postId} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

#### Compound Components

Related components that share implicit state via React Context.

```tsx
// src/shared/ui/Tabs/Tabs.tsx
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs compound components must be used within <Tabs>');
  return ctx;
}

// --- Root ---
export interface TabsProps {
  defaultTab: string;
  children: ReactNode;
  onChange?: (tab: string) => void;
}

export function Tabs({ defaultTab, children, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const handleChange = useCallback((tab: string) => {
    setActiveTab(tab);
    onChange?.(tab);
  }, [onChange]);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleChange }}>
      <div role="tablist" className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

// --- Tab Button ---
export interface TabProps {
  id: string;
  children: ReactNode;
}

export function Tab({ id, children }: TabProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  return (
    <button
      role="tab"
      id={`tab-${id}`}
      aria-selected={activeTab === id}
      aria-controls={`panel-${id}`}
      onClick={() => setActiveTab(id)}
      className={cn('tab', { 'tab--active': activeTab === id })}
    >
      {children}
    </button>
  );
}

// --- Tab Panel ---
export interface TabPanelProps {
  id: string;
  children: ReactNode;
}

export function TabPanel({ id, children }: TabPanelProps) {
  const { activeTab } = useTabsContext();
  if (activeTab !== id) return null;
  return (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} className="tab-panel">
      {children}
    </div>
  );
}
```

### Sub-folder Pattern for Complex Components

When a component grows beyond ~150 lines or accumulates sub-parts, promote it to a folder:

```
shared/ui/DataTable/
  DataTable.tsx             → main component
  DataTable.module.css
  DataTable.test.tsx
  DataTable.stories.tsx
  parts/
    TableHeader.tsx
    TableRow.tsx
    TablePagination.tsx
    TableFilters.tsx
  hooks/
    useTableSort.ts
    useTableSelection.ts
  utils/
    columnHelpers.ts
  index.ts                  → re-exports public API
```

`DataTable/index.ts`:
```ts
export { DataTable } from './DataTable';
export type { DataTableProps, Column } from './DataTable';
```

---

## 3. State Management Architecture

### Decision tree for state placement

```
Is the state used by only one component?
  YES → useState / useReducer (local state)
  NO  → Is it used by a component and its direct children?
          YES → Prop drilling (lift state up)
          NO  → Is it used across unrelated parts of the tree?
                  YES → React Context (for low/medium frequency updates)
                  NO  → Zustand / Jotai / Redux Toolkit (for high frequency or complex state)
```

### Local State

```tsx
// UI state — component-scoped
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState<FormValues>(initialValues);
const [validationErrors, dispatch] = useReducer(errorsReducer, {});
```

### Shared State via Context

```tsx
// src/shared/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/features/auth/api/authService';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      isAuthenticated: user !== null,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

### Complex Global State (Zustand — recommended for non-Next.js apps)

```tsx
// src/store/cartStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        totalItems: 0,
        totalPrice: 0,

        addItem: (item) => set((state) => {
          const existing = state.items.find(i => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

        removeItem: (id) => set((state) => ({
          items: state.items.filter(i => i.id !== id),
        })),

        updateQuantity: (id, quantity) => set((state) => ({
          items: state.items.map(i =>
            i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i
          ),
        })),

        clearCart: () => set({ items: [] }),
      }),
      { name: 'cart-storage', partialize: (state) => ({ items: state.items }) }
    )
  )
);

// Derived state via getters
useCartStore.subscribe((state) => {
  const totalItems = state.items.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice = state.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  // You can update these in the store or compute them externally
});
```

### State Directory Structure

```
src/
  store/                    → Zustand stores (global state)
    cartStore.ts
    uiStore.ts
    notificationStore.ts
  context/                  → React Context providers
    AuthContext.tsx
    ThemeContext.tsx
    NotificationContext.tsx
  hooks/                    → Shared custom hooks
    useLocalStorage.ts
    useDebounce.ts
    useMediaQuery.ts
```

---

## 4. Hooks Architecture

### Rules of Hooks (strict)

- **Call hooks only at the top level** — never inside conditions, loops, or nested functions.
- **Call hooks only from React functions** — components or custom hooks.
- **Name custom hooks with `use` prefix** — this enables the linter.

### Custom hook patterns

> **Data fetching:** Don't write manual fetch hooks with `useEffect` for production apps. The React docs explicitly call out problems with this approach — race conditions (even with cleanup), no cache, no deduplication, and poor SSR support. Use **TanStack Query** instead.

```tsx
// [OK] Recommended: TanStack Query for data fetching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { BlogPost } from '@/features/blog/api/blogTypes';

// Reading data
export function useBlogPost(postId: string) {
  return useQuery<BlogPost>({
    queryKey: ['blog-post', postId],
    queryFn: () => blogService.getPost(postId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// List with filters
export function useBlogPosts(filters?: { category?: string; page?: number }) {
  return useQuery({
    queryKey: ['blog-posts', filters],
    queryFn: () => blogService.getPosts(filters),
    placeholderData: (prev) => prev, // keeps old data while loading new page
  });
}

// Mutations (create / update / delete)
export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => blogService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}
```

> **Legacy `useFetch` with `useEffect`** — still valid for non-production/simple scripts, but avoid in apps: no caching, no deduplication, waterfall-prone, and SSR-incompatible. If you absolutely need manual fetching, add `AbortController` cleanup.

### Hook composition pattern

```tsx
// Compose smaller hooks into feature-specific hooks (using TanStack Query)
function useBlogPostWithActions(postId: string) {
  const { data: post, isLoading, error } = useBlogPost(postId); // from TanStack Query
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const likeMutation = useMutation({
    mutationFn: () => blogService.likePost(postId),
    onSuccess: () => addNotification({ type: 'success', message: 'Post liked!' }),
    onError: () => addNotification({ type: 'error', message: 'Failed to like post' }),
  });

  const canEdit = user?.role === 'admin' || user?.id === post?.authorId;

  return { post, isLoading, error, canEdit, likePost: likeMutation.mutate };
}
```

### Suspense-integrated data hooks

When using TanStack Query with Suspense, use `useSuspenseQuery` — it removes the need for `isLoading` checks inside the component:

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';

function BlogPostCard({ postId }: { postId: string }) {
  // Never returns undefined — Suspense handles loading, ErrorBoundary handles errors
  const { data: post } = useSuspenseQuery<BlogPost>({
    queryKey: ['blog-post', postId],
    queryFn: () => blogService.getPost(postId),
  });

  return <Card title={post.title} description={post.excerpt} />;
}

// Parent wraps with Suspense + ErrorBoundary (see Section 2 Container pattern)
```

### React 19: `use()` hook — consuming Promises and Context

React 19 introduces `use()`, a new primitive that reads a Promise or Context inside render. It works natively with `<Suspense>`:

```tsx
import { use, Suspense } from 'react';

// Consuming a Promise (works with Suspense)
function BlogPostContent({ postPromise }: { postPromise: Promise<BlogPost> }) {
  const post = use(postPromise); // suspends until resolved
  return <h1>{post.title}</h1>;
}

// Consuming Context (replaces useContext — can be called conditionally)
function ThemeButton() {
  const theme = use(ThemeContext); // same as useContext but callable inside conditions
  return <button className={theme.buttonClass}>Click</button>;
}

// Usage
function BlogPostPage({ postId }: { postId: string }) {
  const postPromise = blogService.getPost(postId); // create promise outside
  return (
    <Suspense fallback={<Skeleton />}>
      <BlogPostContent postPromise={postPromise} />
    </Suspense>
  );
}
```

> **Note:** `use()` is not a replacement for TanStack Query in complex apps (no caching, deduplication, or background refetch). Use it for simpler one-off cases or passing already-fetched promises from Server Components.

---

## 4.5. React 19: Forms, Actions, and New APIs

React 19 introduced a new model for form handling that replaces manual `useState` + event handler patterns with declarative Actions.

### `useActionState` — async form state management

```tsx
import { useActionState } from 'react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Action: runs on submit (can be a Server Action in Next.js)
async function loginAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await authService.login(parsed.data);
  if (!result.ok) return { error: 'Invalid credentials' };
  
  redirect('/dashboard');
  return {};
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction}>
      <label>
        Email
        <input type="email" name="email" required />
      </label>
      <label>
        Password
        <input type="password" name="password" required />
      </label>
      {state?.error && <p role="alert">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
```

### `useFormStatus` — pending state for child components

`useFormStatus` must be used in a **child** of the `<form>`, not the form component itself:

```tsx
import { useFormStatus } from 'react-dom';

// [OK] Correct — in a child component of the form
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}

// [NO] Wrong — useFormStatus inside the same component that has <form>
function LoginForm() {
  const { pending } = useFormStatus(); // won't work here
  return <form>...</form>;
}
```

### `useOptimistic` — instant optimistic UI

```tsx
import { useOptimistic, useActionState } from 'react';

function CommentList({ comments, addComment }: {
  comments: Comment[];
  addComment: (text: string) => Promise<void>;
}) {
  const [optimisticComments, addOptimistic] = useOptimistic(
    comments,
    (state, newText: string) => [...state, { id: 'temp', text: newText, pending: true }]
  );

  const [, formAction] = useActionState(async (_: null, formData: FormData) => {
    const text = formData.get('comment') as string;
    addOptimistic(text);      // immediately shows the new comment
    await addComment(text);   // confirms with server
    return null;
  }, null);

  return (
    <>
      {optimisticComments.map(c => (
        <p key={c.id} style={{ opacity: c.pending ? 0.5 : 1 }}>{c.text}</p>
      ))}
      <form action={formAction}>
        <input name="comment" />
        <SubmitButton />
      </form>
    </>
  );
}
```

### When to use each form pattern

| Pattern | When to use |
|---------|-------------|
| `useActionState` + `<form action={...}>` | Standard forms, async submissions, Server Actions |
| Traditional `useState` + `onSubmit` | Complex multi-step forms, or when you need fine-grained field control |
| React Hook Form | Forms with many fields, complex cross-field validation |
| `useOptimistic` | Immediately reflect UI changes before server confirms |

### `forwardRef` deprecation in React 19

In React 19, refs are passed as **regular props** — `forwardRef` is no longer needed for function components:

```tsx
// [OK] React 19+ — ref as a regular prop
export function Input({ ref, ...props }: React.InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement>;
}) {
  return <input ref={ref} {...props} />;
}

// [NO] Old pattern — forwardRef (still works but deprecated)
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ ...props }, ref) => <input ref={ref} {...props} />
);
```

> `forwardRef` continues to work in React 19 for backward compatibility, but new code should use the ref-as-prop approach. A codemod is available to migrate automatically.

### Server / Client component directives (Next.js / Remix with RSC)

```tsx
// 'use server' — marks an async function as a Server Action
// Only available in frameworks (Next.js App Router, Remix)
'use server';
export async function createPost(formData: FormData) {
  const title = formData.get('title');
  await db.posts.create({ data: { title } });
  revalidatePath('/blog');
}

// 'use client' — marks a component tree as client-side
// Anything using useState, useEffect, event handlers needs this
'use client';
export function InteractiveWidget() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

> This skill is framework-agnostic. `'use server'` / `'use client'` are available in Next.js App Router and Remix with RSC. In plain Vite/CRA apps, `useActionState` still works client-side — just omit the `'use server'` directive and call your API normally inside the action function.

---

## 5. Performance Optimization

### React Compiler — automatic memoization (React 19+, stable Oct 2025)

React Compiler (formerly "React Forget") analyzes your components at **build time** and automatically inserts memoization. With the compiler enabled, **most manual `useMemo`, `useCallback`, and `React.memo` usage becomes unnecessary**.

```bash
# Install
npm install -D babel-plugin-react-compiler
```

```js
// babel.config.js
module.exports = {
  plugins: [
    ['babel-plugin-react-compiler', {
      target: '19', // or '18'
    }],
  ],
};
```

**What the compiler handles automatically:**
- Memoizing expensive computations (replaces `useMemo`)
- Stabilizing callback references (replaces `useCallback`)
- Skipping re-renders for unchanged props (replaces `React.memo`)

**When manual memoization is still needed:**
- Components with **side effects** that depend on specific reference identity
- Situations where you need **correctness guarantees** (not just performance)
- Libraries/utilities that the compiler can't statically analyze

> **For new projects:** Enable React Compiler and drop manual `useMemo`/`useCallback`/`React.memo` by default. Measure and add manual hints only where the compiler bails out.

> **For existing projects:** Adopt incrementally with `compilationMode: 'annotation'` — opt in file by file with `'use memo'` directive.

### Memoization decision guide

| Tool | When to use | When NOT to use |
|------|-------------|-----------------|
| `React.memo` | Without compiler: component re-renders with same props frequently | With React Compiler enabled (it handles this automatically) |
| `useMemo` | Without compiler: expensive computations (filtering, sorting) | With React Compiler enabled; primitive values; simple operations |
| `useCallback` | Without compiler: passing callbacks to memoized children | With React Compiler enabled; callbacks that don't cause re-renders |

### Code splitting

```tsx
// Route-based lazy loading
import { lazy, Suspense } from 'react';

const BlogPostPage = lazy(() => import('@/pages/blog/BlogPostPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/DashboardPage'));

// Component-level splitting for heavy components
const RichTextEditor = lazy(() => import('@/shared/ui/RichTextEditor'));
const ChartWidget = lazy(() => import('@/shared/ui/ChartWidget'));
```

### Performance anti-patterns — NEVER do these

```tsx
// [NO] Inline functions in render (breaks memo)
<ExpensiveComponent onClick={() => handleClick(id)} />

// [OK] Use useCallback or stable reference
const handleClick = useCallback(() => handleItemClick(id), [id, handleItemClick]);
<ExpensiveComponent onClick={handleClick} />

// [NO] Inline objects in render (breaks memo)
<ExpensiveComponent style={{ color: 'red' }} />

// [OK] Stable reference
const style = useMemo(() => ({ color: 'red' }), []);
<ExpensiveComponent style={style} />

// [NO] Computed value without useMemo
const sortedPosts = posts.sort((a, b) => a.date - b.date);

// [OK] Memoized
const sortedPosts = useMemo(() =>
  [...posts].sort((a, b) => a.date - b.date),
  [posts]
);

// [NO] Index as key
{items.map((item, i) => <Item key={i} />)}

// [OK] Stable unique key
{items.map(item => <Item key={item.id} />)}

// [NO] Lifting all state up unnecessarily
// (causes entire tree to re-render)

// [NO] Unnecessary useEffect for derived state
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState(''); // [NO] Derived state
useEffect(() => setFullName(`${firstName} ${lastName}`), [firstName, lastName]);

// [OK] Compute at render
const fullName = `${firstName} ${lastName}`;
```

---

## 6. Testing Strategy

### Unit tests

Test pure functions, utilities, and isolated logic.

```tsx
// src/shared/lib/__tests__/validators.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, sanitizeHtml } from '../validators';

describe('validateEmail', () => {
  it('returns true for valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test@sub.domain.co')).toBe(true);
  });

  it('returns false for invalid emails', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('requires at least 8 characters', () => {
    expect(validatePassword('short')).toBe(false);
    expect(validatePassword('longenough123')).toBe(true);
  });

  it('requires uppercase, lowercase, and number', () => {
    expect(validatePassword('alllowercase1')).toBe(false);
    expect(validatePassword('ALLUPPERCASE1')).toBe(false);
    expect(validatePassword('Valid123')).toBe(true);
  });
});
```

### Component/Integration tests

Test component rendering, user interactions, and state changes. Use `@testing-library/react`.

```tsx
// src/shared/ui/Button/__tests__/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn--primary');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn--ghost');
  });
});
```

#### Form interaction tests

```tsx
// src/features/auth/components/LoginForm/__tests__/LoginForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  it('shows validation errors for empty fields', async () => {
    render(<LoginForm onSuccess={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('calls onSuccess after successful submission', async () => {
    const onSuccess = vi.fn();
    render(<LoginForm onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'ValidPass123');
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('displays server errors', async () => {
    const mockService = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    render(<LoginForm onSuccess={vi.fn()} loginService={mockService} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'WrongPass');
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

### E2E tests (Playwright)

Critical flows to automate:

```ts
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication flow', () => {
  test('user can register, login, and access protected routes', async ({ page }) => {
    // Registration
    await page.goto('/register');
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'ValidPass123');
    await page.fill('[name="confirmPassword"]', 'ValidPass123');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard after registration
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible();

    // Logout
    await page.click('[data-testid="logout-button"]');
    await expect(page).toHaveURL(/\/login/);

    // Login
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'ValidPass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'WrongPass');
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"]')).toContainText(/invalid/i);
  });
});

test.describe('Blog CRUD', () => {
  test('admin can create, edit, and delete a post', async ({ page }) => {
    // Login as admin first
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'AdminPass123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Create post
    await page.goto('/admin/posts/new');
    await page.fill('[name="title"]', 'E2E Test Post');
    await page.fill('[name="content"]', 'This is a test post content');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Post created')).toBeVisible();

    // Edit post
    await page.click('text=E2E Test Post');
    await page.fill('[name="title"]', 'E2E Test Post (Updated)');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Post updated')).toBeVisible();

    // Delete post
    await page.click('[data-testid="delete-post"]');
    await page.click('[data-testid="confirm-delete"]');
    await expect(page.locator('text=Post deleted')).toBeVisible();
  });
});
```

### Testing configuration

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.*', 'src/**/*.stories.*', 'src/vite-env.d.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

// MSW setup
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => { server.resetHandlers(); cleanup(); });
afterAll(() => server.close());
```

---

## 7. Accessibility (a11y) and UX

### Semantic HTML requirements

**Never use generic elements that should be semantic:**

```tsx
// [NO] Wrong
<div onClick={() => {}} role="button" tabIndex={0}>Click me</div>

// [OK] Correct
<button onClick={() => {}}>Click me</button>

// [NO] Wrong — nav as div
<div className="navigation"><a href="/">Home</a></div>

// [OK] Correct
<nav aria-label="Main navigation"><a href="/">Home</a></nav>

// [NO] Wrong — heading without hierarchy
<div className="title">Page Title</div>

// [OK] Correct
<h1>Page Title</h1>

// [NO] Wrong — image without alt
<img src="logo.png" />

// [OK] Correct
<img src="logo.png" alt="Company Name" />
<img src="icon.png" alt="" /> {/* decorative: empty alt */}
```

### ARIA and keyboard navigation

#### Modals

```tsx
// src/shared/ui/Modal/Modal.tsx
import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Save and restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus the dialog after animation
      requestAnimationFrame(() => dialogRef.current?.focus());
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Trap focus within modal
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }, []);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="modal"
        onKeyDown={handleKeyDown}
      >
        <header className="modal__header">
          <h2 id="modal-title" className="modal__title">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="modal__close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
```

#### Tabs (with full keyboard support)

```tsx
// src/shared/ui/Tabs/TabList.tsx
// ... (extends the compound component pattern from section 2)
// Keyboard: Arrow keys to switch tabs, Home/End for first/last

function Tab({ id, children }: TabProps) {
  const { activeTab, setActiveTab, tabsRef } = useTabsContext();
  const tabRef = useRef<HTMLButtonElement>(null);
  const isActive = activeTab === id;

  useEffect(() => {
    if (isActive) {
      tabsRef.current[id] = tabRef.current;
    }
  }, [isActive, id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const tabIds = Object.keys(tabsRef.current);
    const currentIndex = tabIds.indexOf(id);

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        const nextId = tabIds[(currentIndex + 1) % tabIds.length];
        setActiveTab(nextId);
        tabsRef.current[nextId]?.focus();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        const prevId = tabIds[(currentIndex - 1 + tabIds.length) % tabIds.length];
        setActiveTab(prevId);
        tabsRef.current[prevId]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        setActiveTab(tabIds[0]);
        tabsRef.current[tabIds[0]]?.focus();
        break;
      case 'End':
        e.preventDefault();
        setActiveTab(tabIds[tabIds.length - 1]);
        tabsRef.current[tabIds[tabIds.length - 1]]?.focus();
        break;
    }
  };

  return (
    <button
      ref={tabRef}
      role="tab"
      id={`tab-${id}`}
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveTab(id)}
      onKeyDown={handleKeyDown}
      className={cn('tab', { 'tab--active': isActive })}
    >
      {children}
    </button>
  );
}
```

### Focus management

```tsx
// Custom hook for focus management
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement;

    // Find focusable elements
    const getFocusable = () =>
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), ' +
        'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

    // Focus first element
    const focusable = getFocusable();
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const current = getFocusable();
      const first = current[0];
      const last = current[current.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler);
      previouslyFocused?.focus();
    };
  }, [isActive]);

  return containerRef;
}
```

### Accessibility checklist

- [ ] All images have `alt` text (empty `alt=""` for decorative)
- [ ] All form inputs have associated `<label>` or `aria-label`
- [ ] All buttons have accessible names (visible text or `aria-label`)
- [ ] Custom controls have appropriate `role` and `aria-*` attributes
- [ ] Keyboard navigation works: Tab, Shift+Tab, Enter, Escape, Arrow keys
- [ ] Focus order follows visual order
- [ ] Visible focus indicators (`:focus-visible`) on all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large)
- [ ] Error messages are associated with inputs via `aria-describedby` or `aria-errormessage`
- [ ] Live regions (`aria-live`, `role="status"`, `role="alert"`) for dynamic content
- [ ] Skip navigation link present on pages with repetitive navigation
- [ ] Language attribute set on `<html>` element
- [ ] Zoom/scale works without horizontal scroll up to 400%

---

## 8. Styling Architecture

### Styling decision guide

| Approach | When to use |
|----------|-------------|
| Tailwind CSS | Utility-first, design tokens via config, rapid prototyping |
| CSS Modules | Scoped styles, component-specific CSS, no runtime cost |
| CSS-in-JS (styled-components, emotion) | Dynamic styles based on props, theming |
| Plain CSS / @layer | Global styles, resets, animations |

### CSS Modules pattern

```tsx
// src/shared/ui/Button/Button.module.css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
  line-height: 1.5;
}

.btn:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary {
  background-color: var(--color-primary);
  color: white;
}

.primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.ghost {
  background: transparent;
  color: var(--color-foreground);
}

.ghost:hover:not(:disabled) {
  background-color: var(--color-muted);
}

.sm { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
.lg { padding: 0.75rem 1.5rem; font-size: 1rem; }
```

```tsx
// src/shared/ui/Button/Button.tsx
import styles from './Button.module.css';
import { cn } from '@/shared/lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        styles.btn,
        styles[variant],
        styles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
```

### Tailwind pattern

```tsx
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563eb', hover: '#1d4ed8', light: '#dbeafe' },
        muted: '#f1f5f9',
        border: '#e2e8f0',
        ring: '#93c5fd',
      },
      spacing: {
        '4.5': '1.125rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

```tsx
// Usage
export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-primary text-white hover:bg-primary-hover': variant === 'primary',
          'bg-transparent text-foreground hover:bg-muted': variant === 'ghost',
          'px-2.5 py-1.5 text-xs': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
```

---

## 9. Observability and Error Handling

### Error Boundaries

Every application must have error boundaries at appropriate levels:

```tsx
// src/shared/middleware/ErrorBoundary.tsx
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  name?: string; // Component name for logging
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    console.error(`[ErrorBoundary${this.props.name ? `:${this.props.name}` : ''}]`, error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to external monitoring (Sentry, Datadog, etc.)
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      // Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error!, this.handleReset);
      }
      return this.props.fallback || (
        <div role="alert" className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={this.handleReset}>Try again</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### Error boundary placement strategy

```
RootLayout
├── ErrorBoundary (global — catches unhandled errors)
│   └── App
│       ├── ErrorBoundary (navigation/layout)
│       │   └── Sidebar + Header
│       ├── ErrorBoundary (routing)
│       │   └── <Outlet />
│       │       ├── ErrorBoundary (feature: blog)
│       │       │   └── BlogList
│       │       ├── ErrorBoundary (feature: settings)
│       │       │   └── SettingsForm
│       └── ErrorBoundary (async data)
│           └── DataTable
```

### Error pages

```tsx
// src/pages/NotFoundPage.tsx — 404
export function NotFoundPage() {
  return (
    <main className="error-page">
      <h1>404 — Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <a href="/">Go home</a>
    </main>
  );
}

// src/pages/ErrorPage.tsx — 500 / generic
export interface ErrorPageProps {
  status?: number;
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorPage({
  status = 500,
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorPageProps) {
  return (
    <main className="error-page" role="alert">
      <h1>{status} — {title}</h1>
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>Try again</button>}
      <a href="/">Go home</a>
    </main>
  );
}
```

### Async error handling pattern

> **Prefer TanStack Query** for data fetching — it has built-in error handling, retry, and Error Boundary integration. Use `throwOnError: true` to let errors bubble to the nearest `<ErrorBoundary>`:

```tsx
// TanStack Query with Error Boundary integration
export function useBlogPost(postId: string) {
  return useQuery<BlogPost>({
    queryKey: ['blog-post', postId],
    queryFn: () => blogService.getPost(postId),
    throwOnError: true, // bubbles to nearest <ErrorBoundary>
    retry: 2,
  });
}

// In the component tree:
<ErrorBoundary fallback={<ErrorFallback />}>
  <Suspense fallback={<Skeleton />}>
    <BlogPostCard postId={postId} />
  </Suspense>
</ErrorBoundary>
```

If you need a lightweight utility for one-off async operations (not data fetching), a `useAsync` pattern is acceptable, but always report errors to monitoring:

```tsx
export function useAsync<T, E = Error>(
  asyncFn: () => Promise<T>,
  deps: unknown[] = []
) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: E | null;
  }>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState(prev => ({ ...prev, loading: true, error: null }));

    asyncFn()
      .then(data => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch(error => {
        if (!cancelled) {
          setState({ data: null, loading: false, error });
          captureException(error); // Always report
        }
      });

    return () => { cancelled = true; };
  }, deps);

  return state;
}
```

### Monitoring and telemetry

#### Structured logging middleware

```tsx
// src/shared/middleware/monitoring.ts
interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  component?: string;
  action?: string;
  userId?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

class MonitoringService {
  private static instance: MonitoringService;
  private sessionId = crypto.randomUUID();

  static getInstance() {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  log(entry: Omit<LogEntry, 'timestamp'>) {
    const fullEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    // Console in development
    if (process.env.NODE_ENV === 'development') {
      const fn = entry.level === 'error' ? console.error
        : entry.level === 'warn' ? console.warn
        : console.log;
      fn(`[${entry.level.toUpperCase()}]`, entry.message, entry.metadata ?? '');
    }

    // In production, send to external service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternal(fullEntry);
    }
  }

  private sendToExternal(entry: LogEntry) {
    // POST /api/monitoring/logs or use Sentry/Datadog SDK
    // Sentry.captureMessage(entry.message, { level: entry.level, extra: entry });
    // Datadog: window.DD_RUM?.addAction(entry.action ?? 'unknown', entry);
  }
}

export const monitoring = MonitoringService.getInstance();
```

#### React component telemetry hook

```tsx
// src/shared/hooks/usePerformanceTracking.ts
import { useEffect, useRef } from 'react';

export function usePerformanceTracking(componentName: string) {
  const mountTime = useRef(Date.now());

  useEffect(() => {
    // Track mount duration
    const duration = Date.now() - mountTime.current;

    monitoring.log({
      level: 'info',
      message: `${componentName} mounted`,
      component: componentName,
      action: 'mount',
      duration,
    });

    return () => {
      const unmountTime = Date.now();
      const lifetime = unmountTime - mountTime.current;

      monitoring.log({
        level: 'info',
        message: `${componentName} unmounted`,
        component: componentName,
        action: 'unmount',
        duration: lifetime,
      });
    };
  }, [componentName]);
}
```

#### API interceptor pattern

```tsx
// src/shared/api/httpClient.ts
import { monitoring } from '@/shared/middleware/monitoring';

type RequestInterceptor = (config: RequestInit & { url: string }) => RequestInit & { url: string };
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;
type ErrorInterceptor = (error: Error) => never;

class HttpClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const startTime = performance.now();

    // Apply request interceptors (auth headers, etc.)
    let config = { url, ...options };
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    try {
      const response = await fetch(config.url, config);

      // Apply response interceptors (error normalization, etc.)
      let processedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        processedResponse = await interceptor(processedResponse);
      }

      const duration = performance.now() - startTime;

      monitoring.log({
        level: 'info',
        message: `API ${options.method || 'GET'} ${url}`,
        action: 'api_request',
        duration,
        metadata: { status: response.status, url },
      });

      if (!processedResponse.ok) {
        throw new ApiError(
          `HTTP ${processedResponse.status}: ${processedResponse.statusText}`,
          processedResponse.status
        );
      }

      return processedResponse.json();
    } catch (error) {
      const duration = performance.now() - startTime;

      monitoring.log({
        level: 'error',
        message: `API Error: ${options.method || 'GET'} ${url}`,
        action: 'api_error',
        duration,
        metadata: { error: String(error), url },
      });

      for (const interceptor of this.errorInterceptors) {
        interceptor(error as Error);
      }

      throw error;
    }
  }

  get<T>(url: string) { return this.request<T>(url); }
  post<T>(url: string, body: unknown) {
    return this.request<T>(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  }
  put<T>(url: string, body: unknown) { ... }
  delete<T>(url: string) { ... }
}

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export const httpClient = new HttpClient();
```

---

## 10. Security and Resilience

### Content Security Policy (CSP)

```tsx
// Set CSP via meta tag or HTTP headers
// In index.html or server middleware:

// Option 1: Meta tag (limited)
<meta
  httpEquiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'strict-dynamic' 'nonce-{random}';
    style-src 'self' 'unsafe-inline';
    img-src 'self' https: data:;
    font-src 'self' data:;
    connect-src 'self' https://api.example.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  "
/>

// Option 2: HTTP header (recommended — in server response)
// Content-Security-Policy: default-src 'self'; script-src 'self'; ...
```

```tsx
// React hook for nonce-based script loading
export function useScriptNonce() {
  const [nonce] = useState(() => {
    if (typeof window === 'undefined') return '';
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!meta) return '';
    const content = meta.getAttribute('content') || '';
    const match = content.match(/'nonce-([^']+)'/);
    return match ? match[1] : '';
  });
  return nonce;
}
```

### CORS configuration

```ts
// For API servers (Express, Next.js API routes, etc.)
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-Request-Id'],
  credentials: true,
  maxAge: 86400, // 24 hours — preflight cache
};
```

### XSS prevention

```tsx
// [NO] NEVER use dangerouslySetInnerHTML with unsanitized content
<div dangerouslySetInnerHTML={{ __html: userContent }} /> // HIGHLY DANGEROUS

// [OK] Use DOMPurify if HTML rendering is required
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// [OK] Prefer React's built-in escaping
<div>{userContent}</div> // React escapes all text content by default

// [OK] For URLs, validate protocols
function safeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

<a href={safeUrl(userProvidedLink)}>Link</a>
```

### CSRF protection

```tsx
// API interceptor — attach CSRF token to mutating requests
httpClient.addRequestInterceptor((config) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers = {
        ...config.headers,
        'X-CSRF-Token': csrfToken,
      };
    }
  }
  return config;
});
```

### Form input validation and sanitization

```tsx
// Zod schema for form validation (recommended)
import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export type UserFormData = z.infer<typeof userSchema>;
```

```tsx
// Form validation hook
import { useState, useCallback } from 'react';
import type { ZodSchema, ZodError } from 'zod';

export function useFormValidation<T>(schema: ZodSchema<T>) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validate = useCallback((data: unknown): data is T => {
    const result = schema.safeParse(data);
    if (result.success) {
      setErrors({});
      return true;
    }

    const fieldErrors: Partial<Record<keyof T, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof T;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    setErrors(fieldErrors);
    return false;
  }, [schema]);

  const clearErrors = useCallback(() => setErrors({}), []);

  return { errors, validate, clearErrors };
}
```

### Rate limiting (client-side)

```tsx
// Custom hook for rate-limited actions
export function useRateLimit(limit: number, windowMs: number) {
  const timestamps = useRef<number[]>([]);

  const isAllowed = useCallback((): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove old timestamps
    timestamps.current = timestamps.current.filter(t => t > windowStart);

    if (timestamps.current.length >= limit) {
      return false;
    }

    timestamps.current.push(now);
    return true;
  }, [limit, windowMs]);

  const timeUntilNextAllowed = useCallback((): number => {
    if (timestamps.current.length < limit) return 0;
    const oldest = timestamps.current[0];
    return Math.max(0, windowMs - (Date.now() - oldest));
  }, [limit, windowMs]);

  return { isAllowed, timeUntilNextAllowed };
}

// Usage
function SubmitButton() {
  const { isAllowed, timeUntilNextAllowed } = useRateLimit(5, 60_000); // 5 per minute

  const handleSubmit = async () => {
    if (!isAllowed()) {
      const waitSeconds = Math.ceil(timeUntilNextAllowed() / 1000);
      alert(`Please wait ${waitSeconds} seconds before trying again`);
      return;
    }
    // proceed with submission
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### Sensible security defaults

```tsx
// HTTP headers configuration (for server/framework config)
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '0', // Deprecated but disables old broken behavior
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};
```

---

## 11. Evaluation and Failure Detection

### Anti-pattern Mapping

| # | Anti-pattern | Severity | Description | Solution |
|---|-------------|----------|-------------|----------|
| 1 | **Mixing server and client logic** |  CRITICAL | Using server-only code (DB queries, secrets) in Client Components | Separate Server/Client components; use Server Components for data, pass as props |
| 2 | **Missing key props in lists** |  CRITICAL | Using array index as `key` or omitting `key` | Use stable unique IDs; never use index |
| 3 | **Direct DOM manipulation** |  CRITICAL | Using `document.querySelector`, `innerHTML`, or jQuery | Use `useRef` + effects; React Portal for modals |
| 4 | **Unnecessary effects** |  HIGH | `useEffect` for derived state or event handlers | Compute at render; use `useMemo` for expensive calcs |
| 5 | **Prop drilling without context** |  HIGH | Passing props through 4+ levels | Use Context composition or component composition |
| 6 | **Giant components** |  HIGH | Components > 200 lines with multiple responsibilities | Split into smaller components; use composition |
| 7 | **State outside React** |  HIGH | Modifying global variables directly without React state | Use `useState`, `useReducer`, or Zustand |
| 8 | **Memory leaks** |  HIGH | Subscriptions, intervals, or listeners without cleanup | Always return cleanup from `useEffect`; use AbortController |
| 9 | **Over-optimization** |  MEDIUM | Wrapping everything in `useMemo`/`useCallback`/`React.memo` | Enable React Compiler (auto-memoization); profile first if manual hints needed |
| 10 | **Ignoring error boundaries** |  HIGH | No error boundaries around async sections | Add ErrorBoundary at route level and widget level |
| 11 | **Missing loading states** |  MEDIUM | No skeleton/spinner during data fetching | Wrap async components in `<Suspense fallback={<Skeleton />}>` at the tree level |
| 12 | **Swallowing errors** |  CRITICAL | Empty `catch(e) {}` or `try/catch` without feedback | Always log errors; show user feedback; use monitoring |
| 13 | **Inline styles for layout** |  MEDIUM | Using `style={{ margin: '16px' }}` for layout | Use CSS classes, modules, or Tailwind utilities |
| 14 | **Brittle selectors in tests** |  MEDIUM | Using CSS class names or DOM structure for queries | Use `getByRole`, `getByLabelText`, `getByTestId` |
| 15 | **No form validation** |  CRITICAL | Submitting forms without client-side validation | Use Zod schemas; validate on blur and submit |

### Rúbrica de Niveles de Dominio

#### Básico — Sintaxis y Componentes Simples

**Qué sabe hacer:**
- Crear componentes funcionales con TypeScript
- Usar `useState` y `useEffect` correctamente
- Pasar props con tipos definidos
- Renderizar listas con `key`
- Manejar eventos básicos (onClick, onChange)
- Usar `children` y slots básicos

**Código esperado:**
```tsx
interface Props {
  name: string;
  onDelete: (id: string) => void;
}

export function Item({ name, onDelete }: Props) {
  return (
    <li>
      {name}
      <button onClick={() => onDelete(id)}>Delete</button>
    </li>
  );
}
```

#### Intermedio — Gestión de Estado, APIs, Validaciones

**Qué sabe hacer:**
- Crear hooks personalizados con composición
- Usar `useReducer` para lógica de estado compleja
- Implementar Context API con providers anidados
- Integrar APIs externas con loading/error/empty states
- Validar formularios con Zod
- Implementar React Router (rutas anidadas, guards)
- Escribir tests unitarios y de integración
- Usar `useCallback` y `useMemo` correctamente
- Implementar lazy loading y code splitting

**Código esperado:**
```tsx
export function useProductList(categoryId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth();

  const { loading, error } = useAsync(
    () => productService.getByCategory(categoryId),
    [categoryId]
  );

  const filtered = useMemo(
    () => products.filter(p => user?.role === 'admin' || p.visible),
    [products, user]
  );

  return { products: filtered, loading, error };
}
```

#### Avanzado — Arquitectura, Optimización, Sistemas Distribuidos

**Qué sabe hacer:**
- Diseñar arquitecturas composicionales (compound components, render props)
- Implementar virtual scrolling para listas grandes (TanStack Virtual)
- Manejar concurrencia con transiciones y deferred values (useTransition, useDeferredValue)
- Optimizar bundles con module federation o micro-frontends
- Diseñar sistemas de caché multinivel (SWR / TanStack Query)
- Implementar patrones de renderizado avanzados (server components, streaming SSR)
- Diseñar estrategias de testing completas (unit + integration + E2E + visual regression)
- Implementar sistemas de monitoreo y telemetría custom
- Manejar estado global con stores complejas (Zustand + persist + devtools)
- Implementar Web Workers para cómputo pesado

**Código esperado:**
```tsx
// Compound component with context-based state machine
function useTabsStateMachine(defaultTab: string) {
  const [state, dispatch] = useReducer(
    (state: TabsState, action: TabsAction): TabsState => {
      switch (action.type) {
        case 'SELECT_TAB':
          // Log analytics event
          monitoring.log({
            level: 'info',
            message: `Tab switched: ${state.active} -> ${action.tab}`,
            action: 'tab_switch',
            metadata: { from: state.active, to: action.tab },
          });
          return { ...state, active: action.tab };
        default:
          return state;
      }
    },
    { active: defaultTab, orientation: 'horizontal' }
  );
  return { state, dispatch };
}
```

### Cuellos de Bota (Common Failure Points in Production)

| # | Bottleneck | Detection | Solution |
|---|-----------|-----------|----------|
| 1 | **Unnecessary re-renders** | React DevTools Profiler; slow UI updates | Memoize with `React.memo`; split state; lift content |
| 2 | **Large bundle size** | Lighthouse; `webpack-bundle-analyzer` | Code splitting; lazy loading; tree shaking |
| 3 | **Expensive computations on main thread** | Long tasks in Performance tab | `useDeferredValue`; Web Workers; virtualization |
| 4 | **Memory leaks** | Heap snapshots growing over time | Cleanup effects; remove event listeners; cancel fetch |
| 5 | **N+1 API calls** | Network tab; waterfall chart | Batch requests; use TanStack Query deduplication |
| 6 | **Render blocking CSS/JS** | Lighthouse; critical rendering path | Inline critical CSS; preload key resources; defer non-critical |
| 7 | **Large images** | Lighthouse; slow LCP | Use `next/image` or `loading="lazy"`; responsive images |
| 8 | **Missing CDN/edge caching** | Slow TTFB for static assets | Set `Cache-Control` headers; use CDN |
| 9 | **Unoptimized fonts** | CLS > 0.1 | `font-display: swap`; preload; self-host |
| 10 | **State thrashing** | Frequent `setState` in quick succession | Debounce; batch updates; use `useReducer` |

---

## 12. Quick Reference

### CLI commands

| Command | Purpose |
|---------|---------|
| `npm create vite@latest` | Create new Vite + React project |
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run test` | Run unit/integration tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript checks |
| `npx storybook dev` | Start Storybook |
| `npx playwright test` | Run E2E tests |

### Architecture principles

1. **Audit first, write second** — always check existing components and conventions before adding anything new
2. **Single responsibility** — each component does one thing well; split when > 200 lines
3. **TypeScript everywhere** — no `any`, no untyped props
4. **Composition over inheritance** — prefer compound components, render props, and children
5. **Data down, events up** — pass data as props, callbacks for changes
6. **State as low as necessary** — keep state local; lift only when truly shared
7. **Accessibility is not optional** — semantic HTML, keyboard nav, ARIA where needed
8. **Test behavior, not implementation** — test what the user sees and does
9. **Errors must be visible** — to users (fallback UI) and to developers (monitoring)
10. **Performance is a feature** — measure before optimizing; use React DevTools profiler

### Component type decision guide

| Question | Answer |
|----------|--------|
| Renders UI only, no state? | Presentational component |
| Fetches data, manages state? | Container component |
| Used in multiple features? | `src/shared/ui/` |
| Used in one feature only? | `src/features/<name>/components/` |
| Wraps behavior around children? | Compound component (Context) |
| Renders differently based on prop? | Variants pattern |
| Needs dynamic child injection? | Slot/render prop pattern |

### State placement decision guide

| Question | Answer |
|----------|--------|
| Used by one component? | `useState` / `useReducer` |
| Used by parent + children? | Lift state up + pass as props |
| Used by unrelated components? | React Context (low frequency) or Zustand (high frequency) |
| Persisted across sessions? | `persist` middleware (zustand) or `localStorage` |
| Synchronized with server? | TanStack Query / SWR (use `useSuspenseQuery` for Suspense integration) |
| URL-shareable state? | URL search params |

### Accessibility checklist

- [ ] Semantic HTML elements used (`<nav>`, `<button>`, `<h1-h6>`, `<main>`, etc.)
- [ ] All images have `alt` text
- [ ] All form inputs have associated `<label>` or `aria-label`
- [ ] All interactive elements are keyboard accessible
- [ ] Visible focus indicators with `:focus-visible`
- [ ] Color contrast ≥ 4.5:1 for normal text
- [ ] Error messages linked to inputs via `aria-describedby`
- [ ] Dynamic content uses `aria-live` regions
- [ ] Skip navigation link present

### Error handling checklist

- [ ] ErrorBoundary at root level (global catch)
- [ ] ErrorBoundary per route section
- [ ] ErrorBoundary around async data widgets
- [ ] All async operations have try/catch
- [ ] User-facing error messages are helpful
- [ ] Errors are logged to monitoring service
- [ ] 404 and 500 pages exist
- [ ] Retry mechanisms for recoverable errors

### Security checklist

- [ ] CSP headers configured
- [ ] CORS restricted to known origins
- [ ] No `dangerouslySetInnerHTML` without DOMPurify
- [ ] All user inputs validated with Zod schemas
- [ ] Authentication tokens stored in httpOnly cookies (not localStorage)
- [ ] CSRF protection on mutating requests
- [ ] Rate limiting on login/registration endpoints
- [ ] No sensitive data in client bundle or URL params
- [ ] Permissions Policy restricts powerful APIs

### Resources

- [React Official Docs](https://react.dev/learn)
- [React API Reference](https://react.dev/reference/react)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [React Compiler Docs](https://react.dev/learn/react-compiler)
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [useActionState](https://react.dev/reference/react/useActionState)
- [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)
- [use() hook](https://react.dev/reference/react/use)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/docs/intro)
- [Vitest](https://vitest.dev/guide/)
- [Zod](https://zod.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [React Router](https://reactrouter.com/en/main)
- [Storybook](https://storybook.js.org/docs/react/get-started)
- [WCAG Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [web.dev Performance](https://web.dev/learn-core-web-vitals/)
