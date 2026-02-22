# 🗄️ Caching in Next.js — Complete Reference

## 📋 Table of Contents

1. [What is Caching?](#1-what-is-caching)
2. [use cache Directive](#2-use-cache-directive)
3. [cacheLife — Cache Duration](#3-cachelife--cache-duration)
4. [cacheTag — Targeted Revalidation](#4-cachetag--targeted-revalidation)
   - [Idempotent Tags](#41-idempotent-tags)
   - [Multiple Tags](#42-multiple-tags)
5. [revalidateTag vs revalidatePath](#5-revalidatetag-vs-revalidatepath)
6. [The 4 Caching Layers in Next.js](#6-the-4-caching-layers-in-nextjs)
7. [Opting Out of Cache](#7-opting-out-of-cache)
8. [Production Best Practices](#8-production-best-practices)

---

## 1. What is Caching?

Caching means **storing the result of an expensive operation** (like a database query or API call) so the next request gets the saved result instantly — without re-running the operation.

```
Without Cache:  Request → DB Query (200ms) → Response
With Cache:     Request → Cached Result (2ms) → Response
```

In Next.js, caching works at multiple levels — components, data fetches, routes, and full pages — giving you fine-grained control over what gets cached and for how long.

---

## 2. `use cache` Directive

`"use cache"` is Next.js's built-in way to cache the output of a **component, function, or data fetch**. It is the modern replacement for `fetch()` cache options and `unstable_cache`.

### On a Server Component

```tsx
// app/events/page.tsx
import { unstable_cache as cache } from "next/cache";

async function getEvents() {
  "use cache";
  const events = await Event.find({});
  return JSON.parse(JSON.stringify(events));
}

export default async function EventsPage() {
  const events = await getEvents();
  return <EventList events={events} />;
}
```

### On a Full Component

```tsx
async function FeaturedEvents() {
  "use cache";

  const events = await getFeaturedEvents();
  return (
    <section>
      {events.map((e) => (
        <EventCard key={e._id} event={e} />
      ))}
    </section>
  );
}
```

### Why Use It?

| Without `use cache`           | With `use cache`             |
| ----------------------------- | ---------------------------- |
| DB hit on every request       | DB hit once, result reused   |
| Slow page loads under traffic | Instant responses from cache |
| High database load            | Minimal database load        |
| No control over staleness     | Full control via `cacheLife` |

> **Key point:** `"use cache"` turns your function or component into a **cached unit**. Next.js stores its output and serves it for all subsequent requests until the cache is invalidated.

---

## 3. `cacheLife` — Cache Duration

`cacheLife` defines **how long** the cached result stays fresh before Next.js re-runs the function to get new data.

### Syntax

```ts
import { cacheLife } from "next/cache";

async function getEvents() {
  "use cache";
  cacheLife("hours");

  return await Event.find({});
}
```

### Built-in Profiles

Next.js ships with predefined `cacheLife` profiles:

| Profile     | `stale` | `revalidate` | `expire` | Best For                   |
| ----------- | ------- | ------------ | -------- | -------------------------- |
| `"seconds"` | 0s      | 1s           | 60s      | Live scores, stock prices  |
| `"minutes"` | 0s      | 1 min        | 10 min   | Frequently updated feeds   |
| `"hours"`   | 5 min   | 1 hour       | 1 day    | Event listings, blog posts |
| `"days"`    | 5 min   | 1 day        | 2 weeks  | Stable reference data      |
| `"weeks"`   | 5 min   | 1 week       | 1 month  | Static content             |
| `"max"`     | 30 days | 30 days      | 1 year   | Rarely changing content    |

### Custom cacheLife

You can define your own duration in `next.config.ts`:

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    dynamicIO: true,
    cacheLife: {
      eventListings: {
        stale: 30, // serve stale for 30 seconds
        revalidate: 300, // revalidate every 5 minutes
        expire: 3600, // expire after 1 hour
      },
    },
  },
};
```

Then use it:

```ts
async function getEvents() {
  "use cache";
  cacheLife("eventListings");
  return await Event.find({});
}
```

### Understanding the Three Values

```
stale      → How long to serve the cached result without checking for updates
revalidate → How often to refresh the cache in the background
expire     → Maximum time before cache is completely discarded
```

---

## 4. `cacheTag` — Targeted Revalidation

`cacheTag` lets you **label** a cached result with a tag. Later, you can invalidate only the caches that carry that tag — leaving everything else untouched.

This is more precise than `revalidatePath` which blows away an entire page's cache.

### Basic Usage

```ts
import { cacheTag } from "next/cache";

async function getEvents() {
  "use cache";
  cacheTag("events");

  return await Event.find({});
}
```

Now whenever you call `revalidateTag("events")`, only this cached result is invalidated.

### Real Example — After Creating an Event

```ts
// actions/event.actions.ts
"use server";

import { revalidateTag } from "next/cache";

export async function createEvent(data: EventData) {
  try {
    await connectDB();
    await Event.create(data);
    revalidateTag("events"); // only invalidates caches tagged "events"
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create event." };
  }
}
```

---

### 4.1 Idempotent Tags

An **idempotent tag** means the tag produces the **same cache invalidation result no matter how many times you call it**. Calling `revalidateTag("events")` once or ten times has exactly the same outcome — all caches tagged `"events"` are invalidated once.

```ts
// Safe to call multiple times — result is always the same
revalidateTag("events");
revalidateTag("events"); // no extra effect, idempotent
revalidateTag("events"); // still safe
```

This matters in production when:

- Retry logic might call your server action more than once
- Multiple concurrent requests trigger the same mutation
- Webhook handlers fire duplicate events

> **Rule:** Always design your tags to be idempotent. Never make cache invalidation depend on "how many times" it was called.

---

### 4.2 Multiple Tags

A single cached function can carry **multiple tags**, giving you flexible invalidation options.

```ts
async function getEventsByCategory(category: string) {
  "use cache";
  cacheTag("events"); // broad tag
  cacheTag(`category-${category}`); // specific tag
  cacheTag("homepage"); // also affects homepage

  return await Event.find({ category });
}
```

Now you can invalidate at different levels of granularity:

```ts
revalidateTag("events"); // clears ALL event caches
revalidateTag("category-frontend"); // clears only frontend category cache
revalidateTag("homepage"); // clears only homepage-related caches
```

### Dynamic Tags per Record

Tag individual records so you can invalidate a single item:

```ts
async function getEventBySlug(slug: string) {
  "use cache";
  cacheTag("events");
  cacheTag(`event-${slug}`); // unique tag per event

  return await Event.findOne({ slug });
}
```

When that specific event is updated:

```ts
export async function updateEvent(slug: string, data: EventData) {
  await Event.findOneAndUpdate({ slug }, data);
  revalidateTag(`event-${slug}`); // only this event's cache is cleared
}
```

---

## 5. `revalidateTag` vs `revalidatePath`

Both invalidate cache — but they work differently:

|               | `revalidateTag`                    | `revalidatePath`                 |
| ------------- | ---------------------------------- | -------------------------------- |
| **Targets**   | Any cached function with that tag  | Everything cached for a URL      |
| **Precision** | Surgical — only matching caches    | Broad — entire page cache        |
| **Use when**  | You know exactly what data changed | You want to refresh a whole page |
| **Example**   | `revalidateTag("events")`          | `revalidatePath("/events")`      |

### When to Use Each

```ts
// Use revalidateTag when data is shared across multiple pages
revalidateTag("events"); // clears cache on /events, /, /dashboard, etc.

// Use revalidatePath when you only care about one specific page
revalidatePath("/events"); // only clears the /events page
```

> For most production apps, **`revalidateTag` is preferred** — it's more precise and works across pages.

---

## 6. The 4 Caching Layers in Next.js

Next.js caches at four different levels. Understanding all four prevents confusion:

### Layer 1 — Request Memoization

Within a **single render**, identical `fetch()` calls are automatically deduplicated. If two components both fetch `/api/events`, only one actual HTTP request is made.

```
Scope: Single request lifecycle
Automatic: Yes
```

### Layer 2 — Data Cache

Persistent cache for `fetch()` results and `"use cache"` functions. Survives across requests and deployments (on Vercel).

```
Scope: Across all requests
Automatic: Yes (opt-out with { cache: "no-store" })
```

### Layer 3 — Full Route Cache

Next.js caches the **full rendered HTML** of static routes at build time. Served as static files — fastest possible response.

```
Scope: Static routes only
Automatic: Yes for static pages
```

### Layer 4 — Router Cache (Client-side)

The browser stores previously visited pages in memory. Navigating back to a page is instant without any server request.

```
Scope: Browser session
Automatic: Yes
Duration: 30 seconds (dynamic) / 5 minutes (static)
```

---

## 7. Opting Out of Cache

Sometimes you explicitly need **fresh data on every request** — user dashboards, admin panels, real-time feeds.

### Opt out of fetch cache

```ts
const data = await fetch("/api/events", {
  cache: "no-store", // never cache this fetch
});
```

### Opt out of route cache

```ts
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic';  // always render fresh

export default async function Dashboard() {
  const data = await getUserData();
  return <DashboardView data={data} />;
}
```

### Opt out with noStore()

```ts
import { unstable_noStore as noStore } from "next/cache";

async function getUserProfile() {
  noStore(); // this function's result is never cached
  return await User.findById(userId);
}
```

---

## 8. Production Best Practices

- ✅ **Tag everything** — always add `cacheTag` to cached functions so you can invalidate precisely
- ✅ **Use `revalidateTag` over `revalidatePath`** in server actions — more precise and cross-page
- ✅ **Choose `cacheLife` intentionally** — don't leave duration undefined; always pick the right profile
- ✅ **Dynamic tags per record** — use `cacheTag(\`event-\${slug}\`)` for item-level invalidation
- ✅ **Keep tags idempotent** — multiple calls to `revalidateTag` should always be safe
- ✅ **Opt out for user-specific pages** — dashboards, profiles, and account pages must use `force-dynamic`
- ✅ **Combine tags** — tag a function with both a broad tag (`"events"`) and a specific one (`"event-abc"`)
- ✅ **Never cache sensitive data** — authentication state, payment info, and personal data must never be cached at the route level

---

## Quick Reference Cheat Sheet

```ts
// Cache a function
async function getData() {
  "use cache";
  cacheLife("hours");
  cacheTag("events");
  cacheTag(`event-${id}`);
  return await db.query();
}

// Invalidate after mutation
revalidateTag("events"); // broad
revalidateTag(`event-${slug}`); // specific

// Opt out completely
export const dynamic = "force-dynamic";
noStore();
fetch(url, { cache: "no-store" });
```

---

> 📌 _Reference for the [TechEvents-Nextjs](https://github.com/HaiderAli2027/TechEvents-Nextjs) project._
