---
layout: article
title: "Making Backend Requests Safe: Understanding Idempotency"
date: 2025-07-31
modify_date: 2025-07-31
excerpt: "Lecture notes on backend idempotency: how to safely retry requests without duplicating actions, with examples and implementation tips."
tags:
  [
    "Backend",
    "Programming",
    "LectureNotes",
    "Idempotency",
    "Hussein",
    "Protocols",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
key: backend-idempotency
---

## Introduction

Ever clicked a button twice and wondered if the action happened twice? That’s where **idempotency** comes in. In this lecture, I learned why making backend requests idempotent is important. For example, posting a comment might duplicate text, which is annoying but not critical. But charging a credit card twice would be disastrous. The main goal of idempotency is to make a repeated request have **no extra effect** on the system. A real-world example: if my YouTube comment was sent but I lost connection, I might try again. Without idempotency, the comment could post twice. The core insight is: **idempotency means a request can be retried safely without changing the state twice**.

## Core Concepts/Overview

Idempotency means _“repeatable without side effects.”_ If I retry the same request, the backend should recognize it and not do it again. In web terms, HTTP **GET** requests are idempotent by definition (they shouldn’t change anything), while **POST** requests are not. We **try** to make POST or other state-changing calls idempotent in practice. Usually this involves identifying requests uniquely so duplicates can be detected.

## Key Characteristics

- **Unique Request ID:** Attach a unique ID (like a UUID) to each request. The server stores which IDs it has seen.
- **Duplicate Check:** On receiving a request, check if the ID was already processed. If yes, skip the action.
- **Upsert Pattern:** Use database upsert (insert-or-update) or similar logic so the second attempt just updates or does nothing.
- **GET vs POST:** By default, GET is safe to retry (no side effects), POST is not. Browsers and proxies may retry GET automatically.
- **Proxies and Retries:** Middle layers (like CDNs) might retry requests on network errors, so idempotency helps avoid unintended repeats.

## Advantages & Disadvantages

- **Advantages:**

  - _Safety:_ Prevents duplicate processing (critical for payments, bookings, etc.).
  - _User Experience:_ The client or proxies can retry requests without fear of double side-effects.
  - _Consistency:_ Makes the system more reliable under failures (like timeouts or retries).

- **Disadvantages:**

  - _Overhead:_ Requires tracking request IDs or maintaining a lookup table in the backend.
  - _Complexity:_ Adds code to check and store IDs, or use upsert logic.
  - _Latency:_ A database lookup to check the ID might slightly slow down each request.
  - _Design Constraints:_ You must carefully use HTTP methods (avoid misusing GET for changes).

## Practical Implementations/Examples

We often use a unique **idempotency token** per request. For example, in code:

```pseudo
function handleRequest(req) {
  let id = req.idempotencyKey; // unique per request
  if (database.hasProcessed(id)) {
    return; // already done, skip
  }
  // Process the request
  database.markProcessed(id);
  // e.g., insert order, charge credit card, etc.
}
```

In SQL, we could do something like:

```sql
INSERT INTO orders (id, item, quantity)
VALUES ('uuid-123', 'book', 1)
ON CONFLICT (id) DO NOTHING;
```

This way, if the same `id` is used again, the second insert has no effect. Many payment APIs (like Stripe) use idempotency keys this way.

## Conclusion

Idempotency is all about being safe on retries. The key takeaway: always assume a request **might come again**, and design it so the second time doesn’t cause harm. Learning this helped me appreciate why some APIs ask for a unique key on requests. Personally, I find it a critical pattern—especially in financial systems—to avoid charging or processing something twice. Now I know to always think about idempotency when designing backend operations.
