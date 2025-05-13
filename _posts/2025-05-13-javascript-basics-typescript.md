---
layout: article
title: "Understanding JavaScript Basics in TypeScript"
date: 2025-05-13
modify_date: 2025-05-13
excerpt: "This lecture note covers key JavaScript concepts like equality, references, and null vs. undefined, as explained in TypeScript Deep Dive, to help you write better code."
tags: ["JavaScript", "TypeScript", "Equality", "References", "Null", "Undefined", "LectureNotes"]
mathjax: true
mathjax_autoNumber: true
key: javascript-basics-typescript
---

## Introduction

In this lecture, we’re diving into some important JavaScript basics that you’ll see in TypeScript, straight from pages 16 to 24 of *TypeScript Deep Dive*. The goal is to understand how JavaScript works under the hood—like how it compares things, handles objects, and deals with missing values—so we can write safer and smarter code. The main takeaway? Knowing these quirks helps us avoid bugs and use TypeScript’s tools better.

---

## Core Concepts/Overview

These pages focus on JavaScript ideas that TypeScript builds on. Since TypeScript is basically JavaScript with extra features (like type checking), we need to get the foundation right. Here’s what it’s about:

Imagine JavaScript as the engine of your car, and TypeScript as the dashboard that warns you when something’s off. To use the dashboard well, you need to know how the engine behaves. These sections explain some tricky engine parts—like how JavaScript compares values, shares objects, and handles “nothing.”

---

## Key Characteristics

Let’s break down the big topics from these pages:

### Your JavaScript is TypeScript
- **What it means**: Any JavaScript code you write works in TypeScript because TypeScript is just JavaScript with added tools (like types).
- *Why it’s cool*: You don’t need to learn a whole new language—just add TypeScript to what you already know.
- Example: Rename a `.js` file to `.ts`, and it still runs, but now TypeScript can check it for mistakes.

### Making JavaScript Better
- **What it does**: TypeScript catches weird JavaScript behaviors that don’t make sense and stops them.
- Examples of weird stuff JavaScript allows (but TypeScript flags):
  - `[] + []` → JavaScript says `""` (empty string), but TypeScript errors out because it’s nonsense.
  - `"hello" - 1` → JavaScript gives `NaN` (not a number), but TypeScript warns you.
- *Think of it like*: TypeScript is a friend who says, “Hey, that doesn’t add up,” before you mess up.

### Equality
- **Two ways to compare**: JavaScript has `==` (loose) and `===` (strict).
- **Loose equality (`==`)**: Tries to guess types (e.g., `5 == "5"` is true because it converts the string to a number).
- **Strict equality (`===`)**: Checks value *and* type (e.g., `5 === "5"` is false because one’s a number, one’s a string).
- > ProTip: “Always use `===` and `!=` except for null checks.”
- *Why?* Loose equality can trick you (e.g., `0 == ""` is true, which is confusing).

### References
- **What’s a reference?**: In JavaScript, objects (like `{}` or arrays) aren’t copied—they’re shared through pointers.
- Example:
  ```javascript
  var foo = {};
  var bar = foo; // bar points to the same object
  foo.baz = 123;
  console.log(bar.baz); // 123, because they’re the same!
  ```
- **Equality with objects**: `===` checks if two variables point to the *same object*, not if they look the same.
  - `{a: 123} === {a: 123}` is false (different objects).
- *Think of it like*: Two people holding the same balloon—change it, and both see the change.

### Null vs. Undefined
- **Undefined**: Something hasn’t been set up yet (e.g., a variable you declared but didn’t give a value).
- **Null**: Something is deliberately empty or unavailable right now.
- **How to check them**:
  - Use `== null` to catch both (e.g., `if (arg == null)` means it’s either null or undefined).
  - *Why not strict `===` here?* Because you usually don’t care which one it is—just that it’s “nothing.”
- Example:
  ```javascript
  function foo(arg) {
    if (arg == null) {
      console.log("Arg is missing!");
    }
  }
  ```
- *Real-world*: Undefined is like an empty box you forgot to fill; null is a box you labeled “empty” on purpose.

---

## Advantages & Disadvantages

### Advantages
- **Fewer bugs**: TypeScript warns you about weird JavaScript stuff (like `[] + {}`) before it runs.
- **Easier learning**: You can start with JavaScript and add TypeScript features slowly.
- **Clear code**: Knowing references and null/undefined helps you avoid surprises.

### Disadvantages
- **Still need JavaScript knowledge**: TypeScript doesn’t hide JavaScript’s quirks—you have to learn them anyway.
- *Not in the book but my thought*: It might feel like extra work to check `===` or handle references manually.

---

## Practical Implementations/Examples

Here are some examples from the pages to show these ideas in action:

1. **Equality Check**:
   ```javascript
   console.log(5 === "5"); // false (TypeScript warns if you try `==`)
   console.log(0 === ""); // false (no confusion here)
   ```

2. **References in Action**:
   ```javascript
   var foo = {};
   var bar = foo;
   foo.baz = 123;
   console.log(bar.baz); // 123 (same object!)
   ```

3. **Null/Undefined Check**:
   ```javascript
   function foo(arg) {
     if (arg == null) {
       console.log("No value yet!");
     } else {
       console.log(arg);
     }
   }
   foo(); // "No value yet!" (arg is undefined)
   foo(null); // "No value yet!" (arg is null)
   ```

---

## Conclusion

These pages taught me that JavaScript has some tricky parts—like loose equality, shared objects (references), and the difference between null and undefined—but TypeScript helps us handle them better. The key takeaway is to use `===` for comparisons, understand that objects are shared, and check for “nothing” with `== null`. I think it’s cool how TypeScript builds on JavaScript without changing it too much—it’s like adding training wheels to a bike I already know how to ride!


