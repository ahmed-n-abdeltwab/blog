---
layout: article
title: "Test Input Generation with Java PathFinder"
date: 2025-07-27
modify_date: 2025-07-27
excerpt: "A personal reflection on using Java PathFinder (JPF) to automatically generate test inputs for complex data structures."
tags: [Java, Testing, ModelChecking, SymbolicExecution, JPF]
mathjax: false
key: test-input-generation-jpf
---

## Introduction

Writing tests for code that manipulates complex data structures (like balanced trees or linked lists) is challenging and time-consuming. The paper *“Test Input Generation with Java PathFinder”* shows how the NASA model checker **Java PathFinder (JPF)** can help automate this task. JPF is an explicit-state model checker built on its own Java Virtual Machine, and it was originally developed at NASA Ames. The authors use JPF to generate test inputs for methods in `java.util.TreeMap` (which uses a red-black tree internally) to achieve good code coverage. The key idea is that *symbolic execution* and model checking can work together: JPF explores program paths with symbolic values and uses the path conditions to build actual tests for those paths. In practice, this means we can cover hard-to-reach branches of code without writing all test cases by hand, which is very appealing for safety-critical software (like NASA’s).

## Core Concepts / Overview

**What is Java PathFinder (JPF)?** JPF is a tool to *verify* Java programs by exploring all possible executions. It includes its own Java bytecode interpreter (a special Java VM) so it can track program state and systematically explore choices (including *nondeterministic* choices). In this context, “model checking” means JPF can check for bugs (like exceptions or assertion failures) by examining each possible path. It was first used on mission-critical software (for example, to check a real-time OS and even a prototype Mars Rover at NASA).

**What is symbolic execution?** Instead of running the program on concrete inputs, symbolic execution uses *symbolic values* for inputs and tracks constraints on them. Each path through the code accumulates a *path condition* (a logical formula) that describes what inputs would follow that path. For instance, if the code has `if (x > y)`, the two branches will add `x>y` or `x<=y` to the condition. By exploring paths symbolically, we can reason about all inputs at once. The JPF framework instruments the Java program so that it builds these symbolic states and path conditions during model checking.

**What are red-black trees and why a case study?** Red-black trees are self-balancing binary search trees where each node is colored **red** or **black**, and the colors obey specific rules. For example, every red node must have black children, and every path from the root to a leaf has the same number of black nodes. Java’s `TreeMap` uses a red-black tree to store data. Testing methods that insert or delete nodes in such a tree is hard because the tree must remain valid (i.e. satisfy its invariant). In the paper, the authors focus on generating tests for core TreeMap methods (`put` and `remove`) to cover as many branches in their code as possible. Red-black trees make a great example, since they have a rich structure (colors, pointers, etc.) and a complex invariant to maintain.

&#x20;*Figure: Examples of small red-black trees (each node is colored red or black) used in the TreeMap case study. The JPF repOk method checks these coloring properties.*

## Key Characteristics

* **Straight model checking as testing:** Here we simply run JPF on the program under test and let the model checker generate behaviors. For example, the paper shows code that randomly calls `put` or `remove` on a TreeMap in a loop (using `Verify.randomBool()`), and then JPF explores all executions of that loop up to some number of elements. In effect, JPF treats all sequences of operations on the TreeMap as inputs. This is like using model checking to do testing: it will report any assertion violations and also record which branches of code it reached. If the environment is not fully specified (for instance we limit the number of elements), model checking reduces to testing the program with those inputs. One example given is:

  ```java
  public static void main(String[] args) {
      while (true) {
          if (Verify.randomBool()) 
              t.put(elems[Verify.random(N-1)], null);
          else 
              t.remove(elems[Verify.random(N-1)]);
      }
  }
  ```

  Here JPF will explore all combinations of `put`/`remove` calls up to size N. The advantage is that it can handle even concurrent or complex code and give good path coverage for small input sizes. The downside is scalability: the number of states explodes quickly as N grows. Indeed, Table 1 in the paper shows that by N=5 the model checker ran out of memory.

* **Black-box input generation using preconditions:** This approach ignores the internal code of `put`/`remove` and only uses the *precondition* (invariant) of the data structure to generate inputs. In JPF this means symbolically executing the `repOk` method (the Java predicate that checks if a tree is a valid red-black tree) with **lazy initialization**. By doing so, JPF enumerates all *non-isomorphic* valid input trees up to a bound on size. In practice, JPF tries to build all trees that make `repOk(tree)` true, using lazy init to backtrack early when the invariant is broken. Then for each generated tree, the test framework runs operations (like delete or insert) on it to measure coverage. This method guarantees we get *all* small valid inputs (complete structural coverage up to size N). In the TreeMap example, they found all input trees up to size 5 and used them to test deletion and insertion. The benefit is that we systematically cover the data-structure shapes; the drawback is that it can produce many inputs (the number of valid trees grows quickly) and it doesn’t focus on specific code branches.

* **White-box generation with symbolic execution and conservative preconditions:** In white-box mode, JPF uses symbolic execution on the actual code of `put`/`remove` to achieve branch coverage. JPF is told to check for reaching each branch of the code (encoded as properties), and it reports counterexamples for each uncovered branch. Each counterexample comes with a *symbolic heap* (structure of objects) and a *path condition* on primitives that drive that path. The framework then *solves* these constraints to build concrete test inputs. A key feature is using a *conservative precondition* during lazy initialization: when JPF builds an input structure field-by-field, it uses a version of `repOk` that only fails if the initialized part already violates the invariant. This prevents JPF from pursuing clearly bad partial trees while allowing uncertainty on uninitialized parts. When a complete path is found, the symbolic input (with “clouds” for unspecified parts) is concretized by running the real `repOk` again to fill in values and using an SMT solver for the path constraints. This approach tightly links inputs to code coverage: it generates exactly the inputs needed to cover each path.

* **Lazy initialization and conservative `repOk`:** In our context, lazy initialization means JPF doesn’t build full objects up front. If the code under test accesses a field (like a pointer to a node) that hasn’t been set, JPF nondeterministically picks one of: null, a new object, or an existing object (to allow aliasing). This way we don’t need an upfront bound on structure size. To handle the red-black invariant, a *conservative* `repOk` is used during this process: when checking a partially-built tree, it only rejects it if the nodes already in place break the invariant. For example, if it sees two red nodes connected, it backtracks immediately; but if some fields are still uninitialized, it tentatively continues. This pruning greatly improves efficiency over naively generating all possible trees and then filtering.

* **Concretizing symbolic structures into test inputs:** Once JPF has a symbolic result (a heap with some slots “unknown” and a path condition on ints), we turn it into an actual Java object to test the code. The paper’s method is to first reconstruct a concrete object graph that matches the symbolic structure (setting uninitialized references to null or new nodes) and that satisfies the invariant. Then the path condition constraints are solved (with a solver) to pick actual integer values. In practice, they *symbolically execute* the `repOk` on the symbolic structure to flesh it out, and then a solver picks values for any remaining primitives. This two-step solving ensures we only test *valid* red-black trees. The authors note that not all symbolic heaps that passed the conservative check will become valid trees, so this final check (and solver step) is needed.

## Advantages & Disadvantages

* **Straight model checking (random Test generation):**

  * *Scalability:* Very poor for large sizes. The results show that coverage stagnates by N=4 and JPF runs out of memory by N=5.
  * *Precision/coverage:* For small N, it often achieves good code coverage (e.g. 86–100% on helper methods with N=4). It also handles concurrent code well.
  * *Test size:* Generates a huge state space (table shows 10k+ states at N=4), which is impractical to store as individual tests. It’s more suited as a broad check for bugs, not fine-grained coverage.
  * *Pros:* Good “first pass” method for finding obvious issues; covers behavior paths naturally.
  * *Cons:* Cannot scale; many states; may miss deep branches tied to structural constraints.

* **Black-box (structure-based) generation:**

  * *Scalability:* Better than brute force. Using lazy initialization, they generated all valid trees up to size 6 (33 total) with reasonable time (212 seconds) and memory (see Table 2). It prunes on invariant violations, so it considers far fewer candidates than naive enumeration.
  * *Precision/coverage:* It ensures *all* small valid input shapes are covered. In the case study, this achieved maximal structural coverage: by size 5 it covered all branches of the methods (including 100% for `fixAfterDeletion`). However, it’s not guided by the code, so it might produce tests that only hit easier code paths, unless combined with running the methods on those inputs.
  * *Test size:* The number of generated structures grows quickly (e.g. 84 tests from all trees up to size 5). But the paper reports it was still manageable (they got 86 tests by size 6).
  * *Pros:* Systematic coverage of input domain; relatively low memory.
  * *Cons:* May generate redundant or irrelevant tests; coverage of code is incidental to covering valid inputs.

* **White-box (symbolic) generation:**

  * *Scalability:* In the experiment, it found all needed tests in 72 seconds using about 5 MB memory. They limited tree size ≤5 and it worked. In general, it can still face explosion if paths are many or constraints hard.
  * *Precision/coverage:* Very high. It achieved the optimal branch coverage (like 100% for `fixAfterDeletion`) with far fewer tests. In fact, covering all 53 branches took only 11 unique tests.
  * *Test size:* Very small. The symbolic approach finds *minimal* inputs to hit each branch. In their case, 11 tests (including various tree sizes) covered all code.
  * *Pros:* Targeted coverage with solver help; automatically avoids infeasible inputs.
  * *Cons:* Requires an SMT solver and may need manual tuning of constraints; duplicates must be pruned; may get stuck if constraints are too complex.

## Why It Was Created and Why NASA Moved On

JPF was created to improve the **reliability of Java software** in critical systems. NASA Ames developed it to check Java programs systematically, because Java was being used in mission-critical applications (e.g. avionics, rover planning). For example, JPF found bugs in an embedded OS (DEOS) and was even used to generate input sequences for a prototype Mars Rover. Model checking Java allowed NASA to handle concurrency and nondeterminism in a way traditional testing did not.

Why did NASA and others eventually move away? Several reasons come to mind: JPF is powerful but heavy. It suffers from the usual combinatorial explosion of model checking. It also requires working in an older Java subset (no native methods) and a complex configuration. According to Wikipedia, the last stable release was in 2010, suggesting limited ongoing development. In the years since, the research community has produced newer tools that address some of JPF’s limitations (see below). For example, NASA folks created **Symbolic PathFinder (SPF)**, an extension of JPF that integrates modern SMT solvers and better handling of constraints. In general, teams may favor more scalable static checkers or specialized symbolic engines for larger codebases. In short, JPF was a milestone, but it was eventually “passed on” to newer frameworks better suited for current projects.

## Modern Alternatives to Java PathFinder

Several tools have similar goals of test generation for complex inputs:

* **Korat** is a Java tool for generating complex data structures given a `repOk` predicate. It exhaustively searches for all structures up to a given size by executing the `repOk` on fully constructed candidates. Unlike JPF’s black-box approach, Korat does not use symbolic execution for primitive fields — it simply iterates through possible values. It’s widely used for data-structure testing (e.g. linked lists, trees).

* **TestEra** (based on Alloy) generates inputs from a logical specification of the structure. It translates the `repOk` conditions into an Alloy model and uses a SAT solver to find models (valid structures). TestEra focuses purely on structural constraints and explores all small models in the given bounds. It, like Korat, handles only the structure and then must pair those with operations to test code.

* **Symbolic PathFinder (SPF)** is an extension of JPF for Java symbolic execution. It supports richer data types and uses modern SMT solvers (like Z3) to solve path conditions. SPF can also integrate with annotations and provides better performance. In practice, SPF is more up-to-date than classic JPF for test generation. (For C code, there are analogous tools like KLEE, and for .NET there’s Pex, which show the trend toward SMT-based symbolic testing.)

* **Other frameworks**: Tools like CBMC/JBMC do bounded model checking for C/Java. Concolic engines (DART, CUTE) mix concrete and symbolic runs. There are also fuzz testers (AFL, etc.), but they don’t guarantee coverage. The general idea is that if JPF feels old, nowadays one might use these more recent symbolic execution tools or even unit-test generators that integrate static analysis.

Each alternative has trade-offs. Korat/TestEra focus on structures (black-box) with no code insight. Symbolic engines (SPF, KLEE) give high coverage but can be slower or require complex setup. JPF’s unique niche was the combination of a pure Java model checker with a symbolic execution library – something that many successors still try to replicate.

## What Makes JPF Stand Out

JPF’s strength is its **deep integration with Java** and its combination of techniques. Because JPF *is* a Java VM, it can run arbitrary Java bytecode and systematically track program state (including the heap and threads). Unlike some tools that require you to rewrite or annotate your code extensively, JPF works on plain Java with some instrumentation. With extensions, it adds symbolic execution so it can do both **explicit-state model checking** and **symbolic testing** in one framework. It also introduced lazy heap initialization for test inputs, letting you reason about unbounded data structures without fixing a maximum size ahead of time. In the paper’s own words, the framework can be used uniformly for both white-box and black-box testing. In summary, JPF stands out by being a fully Java-based model checker that also understands symbolic constraints and data-structure invariants. This gives it flexibility: you can drive it like a tester (black-box) or like a verifier (white-box) within the same tool.

## Practical Implementations/Examples

A concrete example from the paper is a small Java function that swaps two integers if one is larger. The code looks like this (simplified from the paper):

```java
int x, y;
if (x > y) {
    x = x + y;
    y = x - y;
    x = x - y;
    if (x > y) {
        assert(false);
    }
}
```

If we run this symbolically with JPF, we get a *symbolic execution tree*. The figure below (from a similar example) shows such a tree. Each node is labeled with the program state (variables `x`, `y` as symbolic values and a path condition `PC`). Branches represent decisions (`x > y` or not).

&#x20;*Figure: A symbolic execution tree for a small program (nodes show symbolic values and path conditions). Leaf nodes where the condition becomes false are pruned. JPF would explore each valid path until an assertion or the end is reached.*

In this tree, the root has `PC: true` (no constraints). Then one branch assumes `x > y` (adding `PC: X>Y`) and the other assumes `x <= y`. The tree grows with constraints at each branch. When a path condition becomes unsatisfiable (like `X>Y & Y>X`), that branch ends with “FALSE!”.

JPF actually does something similar for the TreeMap code. It lazily creates tree nodes and assigns colors, tracking a heap configuration symbolically. When JPF reports a counterexample path, it provides the partial tree (with “clouds” for unknown parts) and the conditions on integer keys. The paper’s Figure 10 (not shown here) then solves those constraints to fill in the tree.

For example, one test input they got for covering a branch might be a red-black tree of size 3 with certain colored nodes. They would generate that by solving the symbolic structure into a concrete `TreeMap`.

No actual images of TreeMap are embedded here, but the swap example above illustrates the basic idea. Another code snippet from the paper shows how they instrument the TreeMap class (Figure 5 in the paper), but the key takeaway is that JPF runs these programs with the special setup (Verify calls, lazy fields) behind the scenes.

## Conclusion

The main takeaway for me is that combining model checking and symbolic execution can powerfully automate test generation for tricky data structures. I was surprised that the *white-box* approach needed only 11 input trees to cover all branches of the TreeMap helpers. That means a very small test suite could give nearly complete coverage. This seems very useful: instead of guessing test cases, the tool finds exactly what’s needed.

Also, the *lazy initialization* and *conservative repOk* ideas were neat. They let JPF reason about infinite possibilities (all trees) by building them on demand and pruning early.

In a modern context, one could apply these lessons to testing our own Java code. If I write code that manipulates a complex object graph, I could use SPF or a similar tool to symbolically execute it and generate tests. Even though JPF itself is a bit old, its ideas live on in tools like Symbolic PathFinder or even newer frameworks. Reflecting on this paper, I feel more confident that automated tools can handle data structures; it would be interesting to try JPF or SPF on a current project (like testing a library with lists or trees). Overall, this was a helpful deep dive into how model checking meets unit testing.
