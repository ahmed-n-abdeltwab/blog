---
layout: article
title: "Understanding Distributed Transactions"
date: 2025-06-18
modify_date: 2025-06-18
excerpt: "A lecture note on distributed transactions, covering their purpose, challenges, and solutions like atomic clocks, compensating transactions, event-driven architectures, and monoliths."
tags:
  [
    "Database",
    "Microservices",
    "Distributed Systems",
    "LectureNotes",
    "Database Discussions",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: distributed-transactions
---

## Understanding Distributed Transactions

## Introduction

What are distributed transactions? They are transactions that involve multiple services or databases, ensuring that all parts of the transaction either succeed together or fail together. This is crucial for maintaining data consistency in systems where different components might be handling different parts of a process.

For example, think about ordering something online. When you place an order, several things need to happen: the order needs to be created, your payment needs to be processed, and then the item needs to be shipped. In a traditional setup, all these steps might be handled by a single application, making it easy to manage the transaction. But in a microservices architecture, each of these steps could be managed by a separate service, each with its own database. That’s where distributed transactions come in—to make sure that if one part fails, the whole process can be handled appropriately.

*The key takeaway for me is that while distributed transactions are necessary for consistency in distributed systems, they are not without their challenges.* There are different ways to implement them, each with its pros and cons, and choosing the right approach depends on the specific needs of the application.

## Core Concepts

In traditional monolithic applications, transactions are managed within a single database, making it easy to ensure **ACID** properties ([Atomicity, Consistency, Isolation, Durability](https://en.wikipedia.org/wiki/ACID)). For instance, in an e-commerce application, creating an order and processing payment can be wrapped in a single transaction. If the payment fails, the order creation is rolled back, maintaining consistency.

However, in a **microservices** architecture, each service has its own database, which could be of different types (e.g., Postgres, MongoDB). For example, the order service might create an order in its database, while the payment service processes the payment in another. If the payment fails after the order is created, there’s no automatic way to roll back the order creation because they are separate transactions in different databases. This can lead to inconsistencies, like having an order without a corresponding payment, which is undesirable.

**Distributed transactions** provide mechanisms to coordinate these operations across services to maintain consistency. They ensure that all parts of the transaction either complete successfully or fail without leaving the system in an inconsistent state, as explained in [Distributed transaction - Wikipedia](https://en.wikipedia.org/wiki/Distributed_transaction).

## Key Characteristics

Distributed transactions have several defining features:

- **Span multiple services or databases**: They involve operations across different systems, unlike traditional transactions confined to one database.
- **Ensure atomicity**: They guarantee that all operations succeed or none do, even across distributed components.
- **Handle failures**: They include mechanisms to roll back or compensate for partial failures to avoid inconsistencies.
- **Require coordination**: They often use protocols like the two-phase commit (2PC) or other methods to synchronize actions across systems.

## Solutions to Distributed Transactions

The lecture outlined several approaches to manage distributed transactions, each with its own strengths and weaknesses. Here’s a breakdown:

### 1. Google’s Atomic Clocks (Spanner)

- **How it works**: Google uses atomic clocks to synchronize databases with extremely precise timing, allowing accurate tracking of transaction order across distributed systems, as used in their Spanner database.
- **Advantages**: Highly effective for ensuring consistency across distributed systems.
- **Disadvantages**: Extremely expensive and impractical for most organizations due to the specialized hardware required.

### 2. Compensating Transactions

- **How it works**: If part of the transaction fails, actions already completed are manually reversed. For example, if payment fails after order creation, the order is deleted.
- **Advantages**: More accessible as it doesn’t require specialized hardware.
- **Disadvantages**: Complex to implement, error-prone, and requires additional logic for reversals, which can be challenging to manage.

### 3. Event-Driven Architecture (e.g., Kafka, RabbitMQ)

- **How it works**: Services communicate via events through a message queue. For instance, an order service creates an order and publishes an “order created” event, which the payment service listens to and processes, as described in [Distributed transactions: What, why, and how | Cockroach Labs](https://www.cockroachlabs.com/blog/distributed-transactions-what-why-and-how-to-build-a-distributed-transactional-application/).
- **Advantages**: Decouples services, enhances scalability, and improves fault tolerance.
- **Disadvantages**: Adds complexity due to the need to manage message queues as critical components.

### 4. Returning to a Monolith or Mini-Monolith

- **How it works**: Consolidate related services (e.g., order, payment, shipment) into a single service or mini-monolith using a shared database, allowing traditional ACID transactions.
- **Advantages**: Simplifies transaction management and reduces complexity.
- **Disadvantages**: Sacrifices microservices benefits like independent scaling and technology diversity.

| **Solution**                     | **Advantages**                              | **Disadvantages**                          |
|----------------------------------|---------------------------------------------|--------------------------------------------|
| Google’s Atomic Clocks (Spanner) | Highly effective for consistency            | Expensive, impractical for most            |
| Compensating Transactions        | Accessible, no special hardware needed      | Complex, error-prone, extra logic required |
| Event-Driven Architecture        | Scalable, decoupled, fault-tolerant         | Complex message queue management           |
| Monolith/Mini-Monolith           | Simplifies transactions, easy to manage     | Loses microservices benefits               |

## Practical Implementations/Examples

The lecture provided a clear example of an e-commerce system to illustrate distributed transactions:

- **Monolithic Approach**: In a single application, creating an order, processing payment, and scheduling shipment are handled within one transaction. If any step fails, the entire transaction is rolled back, ensuring consistency.
- **Microservices Approach**: Each step is managed by a separate service:
  - **Order Service**: Creates the order in its database.
  - **Payment Service**: Processes the payment in a different database.
  - **Shipment Service**: Schedules the shipment.
  To manage this as a distributed transaction, an event-driven approach could be used:
  1. The order service creates the order and publishes an “order created” event to a message queue like Kafka.
  2. The payment service listens, processes the payment, and publishes a “payment successful” or “payment failed” event.
  3. Based on the payment outcome, the order service updates or cancels the order.

Another example is X’s transition from a monolithic architecture to microservices to handle high traffic during events like the World Cup. This shift allowed scaling specific components independently but introduced the need for distributed transactions to maintain consistency across services, as noted in the lecture.

## Conclusion

This lecture has given me a solid understanding of **distributed transactions** and their importance in modern software architecture, particularly in **microservices** environments. I’ve learned about various solutions, from high-tech approaches like Google’s atomic clocks to practical methods like event-driven architectures, each with its own trade-offs.
