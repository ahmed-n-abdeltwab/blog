---
layout: article
title: "Shopify's Switch from UUID to ULID for Database Optimization"
date: 2025-06-10
modify_date: 2025-06-10
excerpt: "Exploring Shopify's transition from UUID to ULID for idempotency keys to boost database performance in payment systems."
tags:
  [
    "Database",
    "Programming",
    "LectureNotes",
    "Shopify",
    "ULID",
    "Database Discussions",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: shopify-ulid-optimization
---

## Optimizing Database Performance: Shopify's Switch from UUID to ULID for Idempotency Keys

## Introduction

Have you ever wondered why your database feels sluggish, especially when handling unique identifiers like UUIDs? I recently attended a fascinating lecture that dove into how Shopify tackled this exact problem in their payment system. They switched from UUIDs to ULIDs for their _idempotency keys_, and the results were impressive—a 50% reduction in insert times! This change not only boosted performance but also highlighted the power of thoughtful data modeling.

The lecture centered on Shopify’s strategies for building resilient payment systems, with a spotlight on step six from their blog, _[10 Tips for Building Resilient Payment Systems](https://shopify.engineering/building-resilient-payment-systems)_: using idempotency keys to ensure safe retries without duplicate transactions. Shopify’s real-world challenge of processing millions of payments daily brought this topic to life. Initially, their use of UUIDs caused performance bottlenecks due to random data scattering in the database. By adopting ULIDs, which are time-ordered, they streamlined operations significantly.

_My key takeaway?_ Choosing the right identifier can make or break your database’s efficiency, especially for time-sensitive tasks like payments.

## Core Concepts/Overview

In payment systems, _idempotency keys_ are unique identifiers that prevent duplicate processing. For example, if a customer’s payment request fails due to a network glitch, the system can retry the request using the same key, ensuring the payment isn’t charged twice. Shopify’s payment infrastructure relies heavily on these keys to maintain trust and reliability.

Originally, Shopify used UUIDs (Universally Unique Identifiers) as idempotency keys. UUIDs are 128-bit random identifiers, perfect for ensuring uniqueness without a centralized system. However, their randomness creates chaos in databases like MySQL, which use B-tree indexes. Random UUIDs lead to scattered data pages, forcing frequent disk I/O operations and slowing down inserts and reads.

To solve this, Shopify switched to ULIDs (Universally Unique Lexicographically Sortable Identifiers). ULIDs are also 128-bit but include a 48-bit timestamp followed by 80 bits of randomness. This structure makes ULIDs sortable by time, aligning perfectly with payment requests that are typically valid for short periods (e.g., 24 hours). The time-based ordering ensures new data is inserted sequentially, reducing disk access and optimizing performance.

## Key Characteristics

Here’s a breakdown of UUIDs and ULIDs:

| **Identifier** | **Structure**                        | **Strengths**                           | **Weaknesses**                             |
| -------------- | ------------------------------------ | --------------------------------------- | ------------------------------------------ |
| **UUID**       | 128-bit random                       | Globally unique, no coordination needed | Randomness scatters data, slows indexing   |
| **ULID**       | 48-bit timestamp + 80-bit randomness | Time-ordered, sortable, unique          | Potential contention, larger storage needs |

- **UUIDs**:

  - Guarantee uniqueness across systems.
  - Randomness causes inefficient B-tree indexing, leading to buffer pool thrashing.
  - Poor data locality increases disk I/O.

- **ULIDs**:
  - Chronological ordering improves data locality.
  - Timestamp aids debugging without extra metadata.
  - Sequential inserts target the same database pages, enhancing efficiency.

## Advantages & Disadvantages

Switching to ULIDs brought significant benefits for Shopify, but it’s not a one-size-fits-all solution. Here’s a closer look:

- **Advantages of ULIDs**:

  - **Faster Inserts**: Sequential data placement cut insert times by 50%, as new payment requests target the “tail” of the B-tree ([Understanding Software Idempotency](https://codinginterviewsmadesimple.substack.com/p/understanding-software-idempotency)).
  - **Efficient Reads**: Recent ULIDs are likely in memory, speeding up queries for time-sensitive payment retries.
  - **Simplified Debugging**: The timestamp in ULIDs provides context, reducing the need for additional joins.
  - **Ideal for Payments**: Time-ordered keys match the short-lived nature of payment requests.

- **Disadvantages**:
  - **Contention Risks**: Multiple threads writing to the same page can cause locking issues, though Shopify’s use case mitigates this.
  - **Storage Overhead**: 128-bit ULIDs increase memory and storage needs, especially for secondary indexes.
  - **Not Universal**: ULIDs shine for time-based data but may not help in scenarios with random read patterns, like URL shortening.

For Shopify’s high-throughput payment system, the pros clearly outweighed the cons, making ULIDs a brilliant choice.

## Practical Implementations/Examples

The lecture didn’t include specific code snippets, but implementing the switch likely involved updating Shopify’s database schema to use ULIDs instead of UUIDs for idempotency keys. This would mean generating ULIDs for new payment requests and adjusting any API or database logic to handle the new identifier format.

For developers interested in trying this, ULID libraries exist for many languages:

- Python: Use the `ulid` package to generate ULIDs.
- JavaScript: The `ulid` library simplifies ULID creation.
- Ruby: Shopify’s stack likely used a similar library, given their Ruby on Rails foundation.

Here’s a conceptual example of how ULIDs might be used in a payment system:

1. **Generate ULID**: When a payment request is initiated, create a ULID (e.g., `01JJP9VSVRWSMP4QEJTYYFSJE8`).
2. **Store Request**: Save the request in the database with the ULID as the primary key.
3. **Handle Retries**: If a retry occurs, check the ULID to return the original result, preventing duplicate charges.

This approach leverages ULIDs’ time-based ordering to keep data organized and accessible.

## Conclusion

Shopify’s transition from UUIDs to ULIDs for idempotency keys showcases the impact of smart data modeling. By addressing the performance pitfalls of random UUIDs, ULIDs delivered a 50% reduction in insert times, making payment processing faster and more reliable. The time-based ordering of ULIDs optimized both inserts and reads, perfectly suiting Shopify’s time-sensitive payment operations.
