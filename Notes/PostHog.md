# 📊 PostHog — Complete Guide for TechEvents Project

> This document covers everything you need to know about **PostHog** — what it is, why we use it, how it works, and how it fits into the **TechEvents Next.js** application. It also includes a comparison with other industry-standard tools every software engineer should know.

---

## 📋 Table of Contents

1. [What is PostHog?](#1-what-is-posthog)
2. [Key Features](#2-key-features)
3. [Why We Use PostHog in TechEvents](#3-why-we-use-posthog-in-techevents)
4. [Core Concept — Event Tracking](#4-core-concept--event-tracking)
5. [Setting Up PostHog in Next.js](#5-setting-up-posthog-in-nextjs)
6. [Capturing Events](#6-capturing-events)
7. [Feature Flags](#7-feature-flags)
8. [Session Recording](#8-session-recording)
9. [Environment Variables](#9-environment-variables)
10. [PostHog Dashboard Overview](#10-posthog-dashboard-overview)
11. [Industry Standard Tools Comparison](#11-industry-standard-tools-comparison)
12. [What Every Software Engineer Should Know](#12-what-every-software-engineer-should-know)
13. [Useful Resources](#13-useful-resources)

---

## 1. What is PostHog?

**PostHog** is an **open-source product analytics platform** that helps you understand how users interact with your application. Instead of guessing why users leave or which features they use, PostHog gives you real data — behavioral patterns, session recordings, funnels, and more.

It answers the most important product questions:

- 🤔 *"Where are users dropping off in the signup flow?"*
- 🔍 *"Which features are actually being used?"*
- 📉 *"Why are users not converting?"*
- 🐛 *"What did the user do right before the error occurred?"*

What makes PostHog stand out from tools like Google Analytics is that it is **open-source** and **self-hostable**, meaning your user data stays within your own infrastructure if needed — a major advantage for privacy-conscious teams.

---

## 2. Key Features

PostHog is an all-in-one platform. Here's a breakdown of what it offers:

### 🎬 Session Recording
Watch real recordings of user sessions — exactly what they clicked, scrolled, and typed. This is invaluable for spotting confusing UX or bugs you'd never find just by reading logs.

### 📍 Event Tracking
Manually or automatically capture user actions — button clicks, page views, form submissions, and any custom interaction you define in your code.

### 🚩 Feature Flags
Toggle features on or off for specific users or percentage groups without redeploying your app. Ideal for gradual rollouts, beta testing, and safely releasing new functionality.

### 🧪 A/B Testing
Run experiments to compare two versions of a page or feature and see which one performs better based on real user behavior.

### 🔽 Funnels
Visualize multi-step user flows — for example, track how many users go from "View Event" → "Register" → "Complete Checkout" and identify exactly where they drop off.

### 🗺️ Heatmaps
See where users click most on a page using visual overlays — helps prioritize UI improvements.

### 👤 User Journey Analysis
Follow individual users across their entire session history, understand cohorts of users, and segment them by behavior or properties.

---

## 3. Why We Use PostHog in TechEvents

In the **TechEvents Next.js** project, PostHog helps us make data-driven decisions rather than assumptions:

| Use Case | How It Helps TechEvents |
|---|---|
| 🔍 Track event page views | Know which tech events are most popular |
| 📝 Monitor registrations | See where users drop off in the signup funnel |
| 🚩 Feature flags | Safely roll out new features to a subset of users |
| 🎬 Session replays | Debug UX issues without user reports |
| 📊 Conversion funnels | Measure how many visitors actually register for events |
| 🔒 Privacy-safe analytics | No data sold to third parties |

PostHog lets us understand our users without compromising their privacy — a key benefit over tools like Google Analytics.

---

## 4. Core Concept — Event Tracking

The foundation of PostHog (and all product analytics tools) is **event tracking**. An event is any meaningful action a user takes in your app.

### How It Works

You call `posthog.capture()` at the right moment in your code, passing an event name and optional properties:

```javascript
posthog.capture('event_name', {
  property_key: 'property_value',
  another_key: 123,
});
```

PostHog records this event, ties it to the current user, and makes it available for analysis in the dashboard.

### Real Examples for TechEvents

```javascript
// User viewed an event listing
posthog.capture('event_viewed', {
  event_id: 'evt_123',
  event_title: 'ReactConf 2026',
  category: 'Frontend',
});

// User clicked Register button
posthog.capture('register_button_clicked', {
  event_id: 'evt_123',
  source: 'event_detail_page',
});

// User completed registration
posthog.capture('registration_completed', {
  event_id: 'evt_123',
  user_type: 'new_user',
});
```

These three events alone let you build a funnel: `event_viewed → register_button_clicked → registration_completed` — and see the exact conversion rate at each step.

---

## 5. Setting Up PostHog in Next.js

### Step 1 — Create a Free Account

Go to 👉 [https://app.posthog.com/signup](https://app.posthog.com/signup) and create an account. After setup, you'll get your **API Key** and **Host URL** from the project settings.

### Step 2 — Install the SDK

```bash
npm install posthog-js
```

### Step 3 — Initialize PostHog

Create a PostHog provider to wrap your app. In Next.js App Router, create a `providers.jsx` file:

```jsx
// app/providers.jsx
'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PHProvider({ children }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: false, // We'll handle this manually
    });
  }, []);

  return (
    <PostHogProvider client={posthog}>
      {children}
    </PostHogProvider>
  );
}
```

### Step 4 — Wrap Your Root Layout

```jsx
// app/layout.jsx
import { PHProvider } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PHProvider>
          {children}
        </PHProvider>
      </body>
    </html>
  );
}
```

### Step 5 — Track Page Views Automatically

Create a `PageViewTracker` component:

```jsx
// components/PageViewTracker.jsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
      });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}
```

Add it inside your layout within a `<Suspense>` boundary.

---

## 6. Capturing Events

Once PostHog is initialized, capturing events anywhere in your app is simple.

### Using the Hook (React Components)

```jsx
'use client';

import { usePostHog } from 'posthog-js/react';

export default function RegisterButton({ event }) {
  const posthog = usePostHog();

  const handleRegister = () => {
    posthog.capture('register_button_clicked', {
      event_id: event._id,
      event_title: event.title,
      event_date: event.date,
    });

    // Continue with registration logic...
  };

  return (
    <button onClick={handleRegister}>
      Register for Event
    </button>
  );
}
```

### Identifying Users

When a user logs in, tell PostHog who they are so events are tied to a specific identity:

```javascript
posthog.identify(user._id, {
  email: user.email,
  name: user.name,
  role: user.role,
});
```

### Resetting on Logout

```javascript
posthog.reset(); // Clears the current user identity
```

---

## 7. Feature Flags

Feature flags let you control which users see which features — without changing code or redeploying.

### Check a Feature Flag in Code

```jsx
'use client';

import { useFeatureFlagEnabled } from 'posthog-js/react';

export default function EventPage() {
  const showNewLayout = useFeatureFlagEnabled('new-event-layout');

  return (
    <div>
      {showNewLayout ? <NewEventLayout /> : <OldEventLayout />}
    </div>
  );
}
```

### How to Create a Flag in the Dashboard

1. Go to **PostHog Dashboard → Feature Flags**
2. Click **New Feature Flag**
3. Set the key (e.g., `new-event-layout`)
4. Define rollout — e.g., 50% of users, or specific user emails
5. Save → your code immediately picks it up

No redeployment needed. You can roll back instantly by toggling the flag off.

---

## 8. Session Recording

PostHog records real user sessions automatically once enabled. You can watch exactly what a user did before a bug occurred or where they got confused in your UI.

### Enable in Initialization

```javascript
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: 'https://app.posthog.com',
  session_recording: {
    maskAllInputs: true,      // Hides passwords and form inputs for privacy
    maskTextSelector: '*',    // Optional: mask all text
  },
});
```

### Where to View Recordings

Go to **PostHog Dashboard → Session Replay** → filter by user, date, or events they triggered.

---

## 9. Environment Variables

Add these to your `.env.local` file:

```env
# .env.local

NEXT_PUBLIC_POSTHOG_KEY=phc_your_api_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

> ✅ Both variables are prefixed with `NEXT_PUBLIC_` because PostHog runs in the **browser** (client-side) and needs access to these values on the frontend.

> ⚠️ Still, never commit `.env.local` to GitHub. Add it to `.gitignore`.

```
# .gitignore
.env.local
.env*.local
```

---

## 10. PostHog Dashboard Overview

After logging into [app.posthog.com](https://app.posthog.com), here's what you'll find:

### 📈 Insights
Build custom charts and queries over your captured events. Answer questions like "how many users registered this week?" with a few clicks.

### 🔽 Funnels
Define a multi-step user flow and see the conversion rate at each step. Instantly identify where users are dropping off.

### 🎬 Session Replay
Watch recordings of real user sessions. Filter by events they triggered, errors they encountered, or pages they visited.

### 🚩 Feature Flags
Create, manage, and roll out feature flags across your user base without touching your codebase.

### 🧪 Experiments (A/B Testing)
Set up experiments linked to feature flags. PostHog automatically measures which variant performs better.

### 👥 Persons & Cohorts
View individual user profiles and group users into cohorts (e.g., "users who registered for more than 2 events").

### 🗺️ Heatmaps
Visual overlay showing where users click most on any page of your app.

---

## 11. Industry Standard Tools Comparison

PostHog is one of many tools in the analytics and observability space. Here's how it compares to the industry landscape:

### 📊 Product Analytics

| Tool | Best For | Notes |
|---|---|---|
| **PostHog** | Full-stack, open-source, privacy-first | Used in TechEvents — self-hostable |
| **Mixpanel** | Startups, event-based tracking | Very popular, easy to set up |
| **Amplitude** | Mid to large companies | Powerful behavioral analytics |
| **Heap** | Auto-capture without manual tracking | Retroactively analyze any event |

### 🌐 Web & Traffic Analytics

| Tool | Best For | Notes |
|---|---|---|
| **Google Analytics (GA4)** | General website traffic | Most widely used, free |
| **Plausible** | Privacy-friendly lightweight analytics | No cookies, GDPR compliant |
| **Fathom** | Simple, privacy-focused | Paid but very clean |

### 🎬 Session Recording & Heatmaps

| Tool | Best For | Notes |
|---|---|---|
| **Hotjar** | Heatmaps + session recordings | Most famous in this category |
| **Microsoft Clarity** | Free, powerful heatmaps | Surprisingly good for a free tool |
| **FullStory** | Enterprise session replay | Very detailed, higher cost |

### 🧪 A/B Testing & Feature Flags

| Tool | Best For | Notes |
|---|---|---|
| **PostHog** | Feature flags + experiments | Built-in, no extra tool needed |
| **LaunchDarkly** | Enterprise feature flags | Industry standard for flags |
| **Optimizely** | Large-scale experimentation | Industry standard for A/B testing |
| **GrowthBook** | Open-source alternative | Great free option |

### 🐛 Error & Performance Monitoring

| Tool | Best For | Notes |
|---|---|---|
| **Sentry** | Error tracking | Used by almost every company |
| **Datadog** | Enterprise monitoring & observability | Very powerful, enterprise pricing |
| **LogRocket** | Session replay + error tracking | Combines two categories in one |

---

## 12. What Every Software Engineer Should Know

You don't need to master every tool, but here's what matters in practice:

### Must-Know Tools

**Sentry** is nearly universal — you will encounter it in almost every engineering job. It catches JavaScript errors automatically and shows you the exact stack trace, user context, and what happened before the crash.

**Google Analytics** knowledge is expected for most frontend roles. Understanding GA4 events and conversion goals is considered a baseline skill.

**Feature flags** via LaunchDarkly or PostHog are increasingly common in modern product teams. Engineers are often responsible for wrapping new features in flags before shipping.

**Hotjar or Microsoft Clarity** are frequently set up by engineers even though they're primarily used by product and UX teams.

### The Core Concept You Must Understand

Regardless of which tool your company uses, the **mental model is the same**:

> You fire a named event when something meaningful happens. The tool records it. Your team analyzes it.

```javascript
// This pattern is universal across PostHog, Mixpanel, Amplitude, Segment, etc.
analytics.track('event_name', {
  property: 'value',
});
```

Master this pattern and you can work with any analytics tool — the APIs are all variations of the same idea.

### Quick Cheat Sheet

| Situation | Recommended Tool |
|---|---|
| App crashing in production | **Sentry** |
| Website traffic overview | **Google Analytics / Plausible** |
| User behavior & funnels | **PostHog / Mixpanel** |
| Rolling out a new feature safely | **PostHog Feature Flags / LaunchDarkly** |
| Watching what users do on screen | **PostHog Session Replay / Hotjar** |
| A/B testing a landing page | **PostHog Experiments / Optimizely** |

---

## 13. Useful Resources

| Resource | Link |
|---|---|
| 🌐 PostHog Website | [posthog.com](https://posthog.com) |
| 📖 Official Documentation | [posthog.com/docs](https://posthog.com/docs) |
| ⚛️ Next.js Integration Guide | [posthog.com/docs/libraries/next-js](https://posthog.com/docs/libraries/next-js) |
| 🚩 Feature Flags Docs | [posthog.com/docs/feature-flags](https://posthog.com/docs/feature-flags) |
| 🎬 Session Replay Docs | [posthog.com/docs/session-replay](https://posthog.com/docs/session-replay) |
| 🐙 GitHub (Open Source) | [github.com/PostHog/posthog](https://github.com/PostHog/posthog) |
| 🎛️ PostHog Dashboard | [app.posthog.com](https://app.posthog.com) |

---

## ✅ Summary

PostHog gives the TechEvents project a complete analytics stack in a single tool — replacing what would normally require Mixpanel + Hotjar + LaunchDarkly + a separate A/B testing platform.

The three things it does for TechEvents right now:

1. **Tracks user behavior** — page views, event registrations, button clicks
2. **Records sessions** — so we can watch real users navigate the app
3. **Enables feature flags** — so new features can be safely rolled out without redeployment

The key engineering habit to build is capturing **meaningful events at meaningful moments** — and PostHog's dashboard will turn that raw data into actionable product insights.

---

> 📌 *This document was created for the [TechEvents-Nextjs](https://github.com/HaiderAli2027/TechEvents-Nextjs) project.*