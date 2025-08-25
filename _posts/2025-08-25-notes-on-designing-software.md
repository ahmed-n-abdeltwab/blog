---
layout: article
title: "Notes on Designing Software"
date: 2025-08-25
modify_date: 2025-08-25
excerpt: "My personal notes on a blog I read about software design. The author explained why writing design documents can be more powerful than just code, diagrams, or slides."
tags:
  [
    "Software Design",
    "Backend",
    "Programming",
    "LectureNotes",
    "Reflections",
    "Hussein",
    "Protocols",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: notes-on-designing-software
---

## Overview

I came across a blog titled **“How I Design Software”**. The author shared their personal method for approaching software design.

The key message: instead of relying only on code-first, diagram-first, or slides, they found **writing detailed documents** the most effective way to design systems.

---

## Main Takeaways

### 1. Code-first approach

The author tried prototyping by coding right away.  
Problem: they later felt lost reading the code, struggled to explain the system, and often missed things.  
→ Reminder to myself: jumping into code might feel productive, but it can hide gaps in design thinking.

### 2. Diagram-first approach

They also tried making diagrams.  
Problem: diagrams were either _too detailed_ (hard to follow) or _too high-level_ (like a brochure).  
Diagrams alone weren’t enough — without written context, they lacked real depth.  
Example: Elon Musk once shared Twitter’s architecture diagram. It showed components, but gave little insight into what they really did.

![Twitter architecture diagram](https://pbs.twimg.com/media/Fh6qtzdUAAARaTI?format=jpg&name=large)  
Shared by [Elon](https://twitter.com/elonmusk/status/1593899029531803649?s=20&t=SCUEe1kAmMq_47RzKLy2mg)

### 3. Slides (design-by-powerpoint)

They also tried using slides with bullet points.  
Problem: still easy to miss things, and not good for deeper technical understanding.

---

## The Author’s Approach: Writing

What worked best for them was **writing design documents**.

They explained:

- It takes more time, but produces clarity.
- Writing down every detail forces thinking through gaps.
- These documents become long-term references with real answers.

They compared this to what Seth Godin once said: _“The real way to design software is to spec it out in writing.”_

This idea struck me — I often avoid long writing because it feels slow, but maybe that’s exactly why it works.

---

## Workflow First

The author starts by writing a **workflow document**:

- How the software will be used (step by step).
- Nothing left out, even the obvious.
- This step naturally creates questions to ask stakeholders.

Later, this workflow is refined and shared with non-technical people to check if requirements are covered.

**Note to self:** writing workflows could save me from adding “cool” features without a real use case. (I’ve done that before!)

---

## Design Overview

Next comes the **design overview document**:

- Technical view of the workflow.
- Includes descriptions of UI, frontend, backend, databases, protocols, etc.
- Shows how components interact (but no diagrams yet).

Some parts don’t link directly to user workflows (e.g., health checks, background jobs). Those are still captured here as non-functional requirements.

This is also where the author figures out tricky choices:

- Database type
- Reverse proxy
- Scaling strategy
- Eager vs lazy operations

The document is then reviewed with technical stakeholders, like an RFC.

---

## Component Design

When components become clear, each gets its own detailed document.  
This document is almost like source code in prose: what the component does, inputs/outputs, security issues, limitations.

Sometimes this isn’t needed, but often with time, these docs grow naturally.

---

## Diagrams

Finally, after writing, they draw **design overview diagrams** to visualize interactions.  
Simple blocks, arrows, text — nothing fancy. Google Slides is enough.

Multiple diagrams may exist if the system is complex.

---

## Limitations They Mentioned

- **Time cost** → documents take effort to write and keep updated.
- **Ownership** → if the author leaves, someone else might not maintain the docs.
- **Meetings** → hard to present long docs to people who haven’t read them. (They suggested making slide summaries.)

---

## My Reflections

What I liked most is the honesty: **writing is slow but powerful**.  
I know I usually try to shortcut design with diagrams or quick coding — but maybe investing in structured writing could prevent many mistakes later.

Future me: remember this. Don’t be afraid of the slow, written path when designing. It might save you from messy surprises down the line.

---

## Summary

This blog convinced me that:

- Writing workflows, overviews, and component docs provides lasting clarity.
- Diagrams and slides are useful companions, but not enough alone.
- The main challenge is the discipline of keeping docs updated.

I want to experiment with this approach in my own projects and see how it works for me.
