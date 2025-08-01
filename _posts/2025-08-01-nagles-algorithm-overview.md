---
layout: article
title: "Understanding Nagle's Algorithm and Why It's Often Disabled"
date: 2025-08-01
modify_date: 2025-08-01
excerpt: "A clear, personal overview of Nagle’s Algorithm, its role in TCP, why it causes unexpected delays, and why developers often disable it."
tags:
  [
    "Networking",
    "Backend",
    "LectureNotes",
    "TCP",
    "Hussein",
    "Protocols",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: nagles-algorithm-overview
---

## Introduction

I once faced a strange problem: my client app was running fine, but responses from the server were randomly delayed. The network was working, so what was causing the hold-up? In a lecture I attended, the instructor suggested a hidden culprit: **Nagle’s Algorithm**. As he put it, _"If I have data, please send it. Don't wait... Send the data immediately"_. In other words, Nagle’s Algorithm can buffer small packets instead of sending them at once, which can explain those mysterious delays.

## Core Concepts / Overview

**Nagle’s Algorithm** is an old TCP feature designed to save bandwidth in the early days of the Internet (the Telnet era). Back then, every TCP packet carried about a 40-byte header (20 bytes IP + 20 bytes TCP). Sending a single keystroke (1 byte) in a Telnet session meant wasting 40 bytes on overhead. Nagle’s Algorithm was created to avoid that waste by _waiting until the outgoing data buffer can fill a full packet_ (the Maximum Segment Size, or MSS) before actually sending it. Put simply, it holds back small writes until they can fill a packet. As the lecturer summarized: _"Combine the small segments and send them into one segment, fill the segment and then send it"_.

## Key Characteristics

- **Bundles small packets:** It waits and accumulates data until it can send a full MSS packet.
- **Reduces header overhead:** By filling packets, it avoids wasting the \~40-byte TCP/IP header on tiny payloads.
- **Immediate send if no unacknowledged data:** If there is no data currently unacknowledged in flight, it will send data immediately.
- **Applies only on the sender side:** It only buffers data where it is sent. In other words, the client or server that calls send() is affected.

## Advantages & Disadvantages

- **Pros:**

  - Reduces bandwidth waste by avoiding many tiny packets.

- **Cons:**

  - Adds unpredictable delay, since sending can wait for an ACK round-trip.
  - Hurts performance in real-time or encrypted setups (for example, TLS handshakes) where low latency is important.

In practice, many developers find that the cost (delay) outweighs the benefit (saved bytes) in modern networks.

## Practical Implementations / Examples

- **Small writes example:** Suppose the MSS is 1460 bytes. If an app writes 500 bytes, Nagle’s Algorithm will _not_ send it immediately (500 < 1460). When the app then writes another 960 bytes, the two chunks add up to 1460, and one full packet is sent. During this time the app has to wait, causing delay.
- **Large write example:** If we send 5000 bytes at once (with MSS = 1460), that is three full packets (4380 bytes) plus a leftover 620 bytes. Nagle’s will send the three full packets right away, but the final 620-byte packet will wait for an ACK before sending. This effectively introduces roughly a round-trip delay for the last piece.
- **Disabling with TCP_NODELAY:** To avoid these delays, one can disable Nagle’s Algorithm by setting the `TCP_NODELAY` option on the socket. This tells TCP to send segments immediately. In fact, major libraries do this by default. For example, in 2016 the author of curl found a slow TLS handshake was caused by Nagle’s buffering. He reported _“we now enable TCP_NODELAY by default”_ in curl. In other words, `curl` now disables Nagle and sends packets without delay.

## Conclusion

In summary, Nagle’s Algorithm tries to help older networks by reducing overhead, but in modern apps it often hurts more than it helps. Many developers (myself included) would rather have low latency than save a few bytes. As one curator of TCP implementations noted after wrestling with slow handshakes, _“We now enable TCP_NODELAY by default”_. In practice, most backends and client libraries disable Nagle by default, valuing quick responses over tiny bandwidth savings.
