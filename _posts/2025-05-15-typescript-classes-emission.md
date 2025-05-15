---
layout: article
title: "Understanding TypeScript Classes and Their JavaScript Output"
date: 2025-05-15
modify_date: 2025-05-15
excerpt: "This lecture covers the basics of classes in TypeScript, including their syntax, features like inheritance and access modifiers, and how they are transpiled into JavaScript."
tags: ["TypeScript", "Classes", "JavaScript", "Transpilation", "LectureNotes"]
mathjax: true
mathjax_autoNumber: true
key: typescript-classes-emission
---

## Introduction

Hey there! Today, we’re diving into **classes** in TypeScript, a super useful feature for organizing code. The goal is to understand how they work and how TypeScript turns them into JavaScript. These notes come from pages 33 to 43 of *TypeScript Deep Dive*, and they’re perfect for getting ready for an exam or explaining this to a friend. Imagine you’re building a game—classes could help you manage characters easily. The big takeaway? Classes make coding cleaner and more powerful.

---

## Core Concepts/Overview

So, what are **classes** in TypeScript? They’re like blueprints for creating objects—think of them as templates for things like a game character with a name and health. TypeScript adds this feature to JavaScript to make coding more structured, especially if you’re used to languages like Java. The cool part? TypeScript classes turn into JavaScript code that works everywhere, even in older browsers.

Here’s the simple version: you define a class with properties (like `x` and `y` for a point) and methods (like `add` to combine points). Then, TypeScript “transpiles” it—converts it into plain JavaScript—so it runs smoothly.

---

## Key Characteristics

Let’s break down the main features of **classes**:

- **Constructors:**
  - This is how you set up a new object. It’s like saying, “Here’s a new point with `x` and `y` values.”
  - Example: `constructor(x: number, y: number) { this.x = x; this.y = y; }`

- **Inheritance:**
  - One class can “extend” another, reusing its code. Think of a 3D point adding a `z` to a 2D point.
  - Uses the `extends` keyword, and you call `super()` to get the parent’s setup.

- **Static Members:**
  - These belong to the class itself, not individual objects. Like a counter for how many objects exist.
  - Example: `static instances = 0;`—shared across all instances.

- **Access Modifiers:**
  - Control who can use properties or methods:
    - **`public`:** Anyone can access it (default).
    - **`private`:** Only the class itself can use it.
    - **`protected`:** The class and its children can use it.

- **Abstract Classes:**
  - These are templates you can’t use directly—you have to extend them.
  - Great for setting rules that other classes follow.

*Side note:* TypeScript’s classes are just a simpler way to write JavaScript’s prototype-based system.

---

## Advantages & Disadvantages

### Advantages:
- **Clear Structure:** Classes organize your code logically.
- **Reusability:** Inheritance lets you reuse code without rewriting it.
- **Familiarity:** If you know OOP from other languages, this feels natural.

### Disadvantages:
- **Slight Overhead:** Extra syntax might slow things down a tiny bit.
- **Learning Curve:** You need to understand how they become JavaScript.

---

## Practical Implementations/Examples

Let’s see **classes** in action with a simple example from the book:

```typescript
class Point {
    constructor(public x: number, public y: number) {}
    add(point: Point) {
        return new Point(this.x + point.x, this.y + point.y);
    }
}

class Point3D extends Point {
    constructor(x: number, y: number, public z: number) {
        super(x, y);
    }
    add(point: Point3D) {
        const point2D = super.add(point);
        return new Point3D(point2D.x, point2D.y, this.z + point.z);
    }
}
```

- **What’s happening?** `Point` creates a 2D point, and `Point3D` extends it to 3D by adding `z`. The `add` method combines points.
- **Real-world use:** Imagine tracking positions in a 3D game—super handy!

Now, how does this become JavaScript? TypeScript wraps the class in a function that runs immediately after it’s defined—called an **Immediately Invoked Function Expression (IIFE)**. Here’s the output for `Point`:

```javascript
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.add = function(point) {
        return new Point(this.x + point.x, this.y + point.y);
    };
    return Point;
})();
```

For `Point3D`, since it uses inheritance, TypeScript adds a helper function called `__extends`. Here’s what it looks like:

```javascript
var Point3D = (function (_super) {
    __extends(Point3D, _super);
    function Point3D(x, y, z) {
        _super.call(this, x, y);
        this.z = z;
    }
    Point3D.prototype.add = function(point) {
        var point2D = _super.prototype.add.call(this, point);
        return new Point3D(point2D.x, point2D.y, this.z + point.z);
    };
    return Point3D;
})(Point);
```

### Under the Hood: How Inheritance Works

You might wonder why TypeScript wraps the class in this IIFE thing. It’s there to capture the base class (`Point`) in a variable called `_super`. This makes it easy for `Point3D` to use `Point`’s code, which is key for inheritance.

Inside the IIFE, you see `__extends(Point3D, _super)`. This is a helper function TypeScript creates when you use inheritance. It does two jobs:
1. Copies any shared (static) properties from the base class to the new class.
2. Sets up a chain so `Point3D` can use `Point`’s methods and properties.

This chain is called the **prototype chain** in JavaScript. Imagine it like a family tree: if you don’t have a skill, you might get it from your parents. In JavaScript, every object has a prototype—an object it can “look up to.” If a method isn’t on `Point3D`, JavaScript checks `Point`. The `__extends` function sets this up by linking `Point3D`’s prototype to `Point`’s prototype.

In the code, `Point3D` uses `_super` to call `Point`’s `add` method with `super.add()`. This builds on `Point` while adding the `z` part for 3D.

*Good news:* You don’t need to understand this to use TypeScript classes—the compiler does the hard work. But knowing it can help if you’re fixing bugs or tweaking JavaScript directly.

*Fun fact:* TypeScript only adds `__extends` if you use inheritance. If not, it skips it to keep your code light.

### Prototypes and the Role of `__proto__`, `new`, and `this`

Let’s dig a bit deeper into how JavaScript makes this work with **prototypes**. Think of a prototype as a backup plan: it’s an object that another object can borrow properties or methods from. In JavaScript, every object has a prototype, and you can peek at it with `__proto__` (but it’s better to let the system handle it).

When TypeScript turns a class into JavaScript, it uses this prototype system. For our `Point` class:
- The `Point` function has a `prototype` property, which holds methods like `add`.
- When you write `new Point(0, 10)`, here’s what happens:
  1. JavaScript creates a fresh object.
  2. It sets that object’s `__proto__` to `Point.prototype`, linking it to the methods.
  3. It runs the constructor with `this` pointing to the new object, setting `x` and `y`.
- Inside the `add` method, `this` means “the object I’m working with right now,” so `this.x` is the `x` of that specific point.

Now, with inheritance—like `class Point3D extends Point`—TypeScript connects the prototypes. The `__extends` helper makes sure `Point3D.prototype.__proto__` points to `Point.prototype`. This creates a chain:
- If `Point3D` doesn’t have a method, JavaScript checks `Point`’s prototype.

Here’s how it plays out with `new Point3D(1, 2, 3)`:
- A new object is born.
- Its `__proto__` is set to `Point3D.prototype`.
- The constructor runs, and `super(x, y)` (which becomes `_super.call(this, x, y)`) sets up the `Point` part with `this` as the new object.
- When you call `point3D.add(anotherPoint3D)`, it finds `add` on `Point3D.prototype`. Inside that method, `super.add(point)` reaches back to `Point.prototype`’s `add`, still using `this` as the `Point3D` object.

The prototype chain looks like this:

```
point3D_instance --> Point3D.prototype --> Point.prototype --> Object.prototype --> null
```

If something’s missing, JavaScript climbs this chain until it finds it or hits `null`.

This setup is powerful but can feel tricky. Luckily, TypeScript hides most of it. You write classes like in other languages, and it handles the JavaScript details for you—perfect for focusing on your code without the fuss!

---

## Conclusion

To wrap up, **classes** in TypeScript are a game-changer for writing organized, reusable code. They let you define objects with properties and methods, add features like inheritance, and still work as JavaScript in the end. Seeing how TypeScript turns classes into JavaScript—especially with inheritance—shows how clever the language is. I love how they make big projects feel simple—definitely a must-know for TypeScript! Next time you code, try a class—it’s like giving your code a clear plan.

