# ⚡ Server Actions & Mutations in Next.js

## What are Server Actions?

Server Actions are **async functions that run on the server** — triggered directly from client components or forms without needing to create a separate API route.

Instead of this flow:

```
Client → fetch('/api/create-event') → API Route → Database
```

You do this:

```
Client → calls server function directly → Database
```

They are defined with the `"use server"` directive.

---

## Basic Syntax

```ts
// actions/event.actions.ts
"use server";

import { connectDB } from "@/database/db";
import Event from "@/database/event.model";

export async function createEvent(data: EventData) {
  await connectDB();

  const event = await Event.create({
    title: data.title,
    description: data.description,
    image: data.image,
  });

  return JSON.parse(JSON.stringify(event));
}
```

---

## Calling a Server Action from a Client Component

```tsx
"use client";

import { createEvent } from "@/actions/event.actions";

export default function CreateEventForm() {
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await createEvent({ title: "ReactConf", ... });
    console.log(result);
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Mutations & Revalidation

After a mutation (create, update, delete), you need to **revalidate the cache** so the UI reflects the latest data.

```ts
"use server";

import { revalidatePath } from "next/cache";

export async function deleteEvent(eventId: string) {
  await connectDB();
  await Event.findByIdAndDelete(eventId);

  revalidatePath("/events"); // refreshes the /events page cache
}
```

| Function                    | When to Use                |
| --------------------------- | -------------------------- |
| `revalidatePath("/events")` | Revalidate a specific page |
| `revalidatePath("/")`       | Revalidate the homepage    |
| `revalidateTag("events")`   | Revalidate by cache tag    |

---

## Error Handling

Always wrap server actions in `try/catch` and return a structured response:

```ts
"use server";

export async function createEvent(data: EventData) {
  try {
    await connectDB();
    const event = await Event.create(data);
    return { success: true, data: JSON.parse(JSON.stringify(event)) };
  } catch (error) {
    return { success: false, error: "Failed to create event." };
  }
}
```

Then on the client:

```ts
const res = await createEvent(formData);
if (!res.success) toast.error(res.error);
```

---

## Server Actions vs API Routes

|                   | Server Actions            | API Routes            |
| ----------------- | ------------------------- | --------------------- |
| **Boilerplate**   | Minimal                   | More setup            |
| **Best for**      | Form mutations, CRUD      | Public APIs, webhooks |
| **Callable from** | React components directly | `fetch()` only        |
| **Type Safety**   | Full end-to-end           | Manual                |
| **Revalidation**  | Built-in                  | Manual                |

> **Rule of thumb:** Use **Server Actions** for internal mutations. Use **API Routes** for endpoints consumed by external services or mobile apps.

---

## Production Best Practices

- ✅ Always call `connectDB()` at the top of every action
- ✅ Return plain objects — use `JSON.parse(JSON.stringify(data))` to strip Mongoose metadata
- ✅ Always `revalidatePath()` after any create, update, or delete
- ✅ Wrap everything in `try/catch` with meaningful error messages
- ✅ Never trust client input — validate with **Zod** before hitting the database
- ✅ Keep actions in a dedicated `/actions` folder, one file per model

---

## Folder Structure

```
techevents/
├── actions/
│   ├── event.actions.ts     ← all event mutations
│   └── user.actions.ts      ← all user mutations
├── app/
│   ├── api/                 ← only for external-facing routes
│   └── events/
├── database/
│   └── event.model.ts
```

---

> 📌 _Reference for the [TechEvents-Nextjs](https://github.com/HaiderAli2027/TechEvents-Nextjs) project._
