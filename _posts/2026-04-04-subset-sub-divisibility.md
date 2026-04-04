---
layout: article
title: "Counting Divisible Subset Sums: An Olympiad-Level Puzzle"
date: 2026-04-04
modify_date: 2026-04-04
excerpt: "Learn how to count subsets with divisible sums using generating functions, modular arithmetic, and dynamic programming. Break down this complex problem into digestible parts with interactive demos and real-world applications."
tags:
  [
    "math",
    "competitive programming",
    "puzzle",
    "c++",
    "generating functions",
    "dynamic programming"
  ]
mathjax: true
mathjax_autoNumber: true
key: subset-sub-divisibility
---

Inspired by the brilliant [3Blue1Brown video on generating functions](https://www.youtube.com/watch?v=bOXCLR3Wric), this post explores an elegant Olympiad-level counting problem. We'll break it down step by step, using generalized variables so you can apply the solution to different cases.

---

## Part 1: Understanding the Puzzle

### The Problem Statement

Given two positive integers $n$ and $k$ (where $2 \leq k \leq n$), we want to answer:

> How many subsets of $\\{1, 2, 3, \ldots, n\\}$ have a sum divisible by $k$?

### A Small Example: Building Intuition

Let's start with $n = 3$ and $k = 2$ to see what's happening.

The set is $\\{1, 2, 3\\}$, and all possible subsets are:

$$\emptyset, \\{1\\}, \\{2\\}, \\{3\\}, \\{1,2\\}, \\{1,3\\}, \\{2,3\\}, \\{1,2,3\\}$$

Their sums are:

$$0, 1, 2, 3, 3, 4, 5, 6$$

For $k = 2$ (divisible by 2), we count subsets with even sums:
- $\emptyset$ → sum = $0$ ✓
- $\\{2\\}$ → sum = $2$ ✓
- $\\{1, 3\\}$ → sum = $4$ ✓
- $\\{1, 2, 3\\}$ → sum = $6$ ✓

Answer: 4 subsets

### Why This Gets Hard Fast

For $n = 2000$, the total number of subsets is $2^{2000}$. This number is so astronomically large that it exceeds the number of atoms in the observable universe! Clearly, we can't iterate through every subset.

We need a smarter approach.

---

## Part 2: Breaking Down the Solution

### Step 2.1: Counting Total Subsets

For any set with $n$ elements, each element has 2 choices: either it's "in" the subset or "out" of the subset.

Think of it as $n$ light switches, each with 2 positions:

$$\text{Total subsets} = \underbrace{2 \times 2 \times \cdots \times 2}_{n \text{ times}} = 2^n$$

This is our foundation. For $n = 2000$, we have $2^{2000}$ total subsets.

### Step 2.2: Distributing Subsets by Remainder

When we divide subset sums by $k$, we get remainders: $0, 1, 2, \ldots, k-1$.

We want to count subsets in the "remainder 0" bucket (divisible by $k$).

You might think each bucket gets an equal share: $\frac{2^n}{k}$ subsets each. But that's not quite right! The distribution is slightly uneven due to the mathematical structure of the problem.

### Step 2.3: The Balanced Distribution Formula

The exact count uses this formula:

$$\boxed{\text{Count} = \frac{2^n + (k-1) \cdot 2^{n/k}}{k}}$$

Let's decode each part using generalized variables:

| Symbol | Meaning | Example ($n=2000, k=5$) |
|--------|---------|-------------------------|
| $n$ | Size of the set | $2000$ |
| $k$ | Divisor we're checking | $5$ |
| $2^n$ | Total subsets | $2^{2000}$ |
| $2^{n/k}$ | Correction factor | $2^{400}$ |
| $(k-1)$ | Symmetry multiplier | $4$ |

The formula works because:
1. $2^n$ gives us the total population
2. $2^{n/k}$ captures the periodicity (every $k$ numbers form a "cycle")
3. $(k-1)$ accounts for symmetry in the remainder distribution
4. Dividing by $k$ gives us the count for one specific remainder bucket

### Step 2.4: Why $n/k$ in the Exponent?

Think of a clock with $k$ hours. As we add numbers $1, 2, 3, \ldots, n$, their remainders (mod $k$) cycle around this clock.

- Every $k$ consecutive numbers complete one full cycle
- In the range $1$ to $n$, we have $\frac{n}{k}$ complete cycles
- Each cycle contributes a factor to the correction term

This is why the exponent is $\frac{n}{k}$, not $n$ or $\frac{n}{2k}$.

---

## Part 3: Implementation Approaches

### Approach A: Mathematical Formula (Fast)

For large $n$, we use modular arithmetic and binary exponentiation.

Time complexity: $O(\log n)$

```cpp
#include <iostream>
using namespace std;

// Binary exponentiation with modular arithmetic
long long power(long long base, long long exp, long long mod) {
    long long result = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1) {
            result = (__int128)result * base % mod;
        }
        base = (__int128)base * base % mod;
        exp >>= 1;
    }
    return result;
}

// Modular inverse using Fermat's Little Theorem
// Works when mod is prime: a^(-1) ≡ a^(mod-2) (mod mod)
long long modInverse(long long n, long long mod) {
    return power(n, mod - 2, mod);
}

int main() {
    long long n = 2000;  // Size of set
    long long k = 5;     // Divisor
    long long mod = 1e9 + 7;  // Result modulo this prime
    
    // Formula: (2^n + (k-1) * 2^(n/k)) / k
    long long total_subsets = power(2, n, mod);
    long long correction = (k - 1) * power(2, n / k, mod) % mod;
    
    long long numerator = (total_subsets + correction) % mod;
    long long result = (numerator * modInverse(k, mod)) % mod;
    
    cout << "Subsets divisible by " << k << ": " << result << endl;
    
    return 0;
}
```

### Approach B: Dynamic Programming (Flexible)

For smaller $n$ or when you need to track the process, use DP.

Time complexity: $O(n \cdot k)$

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n = 20;  // Size of set (smaller for DP)
    int k = 5;   // Divisor
    long long mod = 1e9 + 7;
    
    // dp[i][r] = number of subsets using first i elements with sum ≡ r (mod k)
    vector<vector<long long>> dp(n + 1, vector<long long>(k, 0));
    dp[0][0] = 1;  // Empty subset has sum 0
    
    for (int i = 1; i <= n; i++) {
        for (int r = 0; r < k; r++) {
            // Don't include element i
            dp[i][r] = dp[i-1][r];
            
            // Include element i (value = i)
            int prev_remainder = (r - i % k + k) % k;
            dp[i][r] = (dp[i][r] + dp[i-1][prev_remainder]) % mod;
        }
    }
    
    cout << "Subsets divisible by " << k << ": " << dp[n][0] << endl;
    
    return 0;
}
```

---

## Part 4: Interactive Demo

Try changing the values of $n$ and $k$ to see how the formula works:

<div id="demo-container" style="border: 2px solid #3498db; padding: 20px; border-radius: 10px; margin: 20px 0; background-color: #f8f9fa;">
  <h3 style="margin-top: 0;">Subset Divisibility Calculator</h3>
  
  <div style="margin: 15px 0;">
    <label for="input-n" style="display: inline-block; width: 150px; font-weight: bold;">Set size (n):</label>
    <input id="input-n" type="number" value="10" min="1" max="100" style="padding: 5px; width: 100px; border: 1px solid #ccc; border-radius: 4px;">
  </div>
  
  <div style="margin: 15px 0;">
    <label for="input-k" style="display: inline-block; width: 150px; font-weight: bold;">Divisor (k):</label>
    <input id="input-k" type="number" value="3" min="2" max="20" style="padding: 5px; width: 100px; border: 1px solid #ccc; border-radius: 4px;">
  </div>
  
  <button onclick="calculateSubsets()" style="background-color: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 10px;">Calculate</button>
  
  <div id="result-output" style="margin-top: 20px; padding: 15px; background-color: #e8f4f8; border-radius: 5px; display: none;">
    <h4 style="margin-top: 0; color: #2c3e50;">Results:</h4>
    <p><strong>Total subsets:</strong> <span id="total-subsets"></span></p>
    <p><strong>Subsets divisible by k:</strong> <span id="divisible-subsets"></span></p>
    <p><strong>Percentage:</strong> <span id="percentage"></span>%</p>
  </div>
  
  <canvas id="distribution-graph" width="600" height="300" style="margin-top: 20px; border: 1px solid #ddd; display: none;"></canvas>
</div>

<script>
function calculateSubsets() {
    const n = parseInt(document.getElementById('input-n').value);
    const k = parseInt(document.getElementById('input-k').value);
    
    if (n < 1 || k < 2 || k > n) {
        alert('Please ensure n ≥ 1 and 2 ≤ k ≤ n');
        return;
    }
    
    // Calculate using DP for visualization (works for small n)
    const dp = Array(n + 1).fill(0).map(() => Array(k).fill(0));
    dp[0][0] = 1;
    
    for (let i = 1; i <= n; i++) {
        for (let r = 0; r < k; r++) {
            dp[i][r] = dp[i-1][r];
            const prevRemainder = (r - i % k + k) % k;
            dp[i][r] += dp[i-1][prevRemainder];
        }
    }
    
    const totalSubsets = Math.pow(2, n);
    const divisibleSubsets = dp[n][0];
    const percentage = ((divisibleSubsets / totalSubsets) * 100).toFixed(2);
    
    // Display results
    document.getElementById('total-subsets').textContent = totalSubsets.toLocaleString();
    document.getElementById('divisible-subsets').textContent = divisibleSubsets.toLocaleString();
    document.getElementById('percentage').textContent = percentage;
    document.getElementById('result-output').style.display = 'block';
    
    // Draw distribution graph
    drawGraph(dp[n], k);
}

function drawGraph(distribution, k) {
    const canvas = document.getElementById('distribution-graph');
    const ctx = canvas.getContext('2d');
    canvas.style.display = 'block';
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = canvas.width / k;
    const maxValue = Math.max(...distribution);
    const scale = (canvas.height - 40) / maxValue;
    
    // Draw bars
    for (let i = 0; i < k; i++) {
        const barHeight = distribution[i] * scale;
        const x = i * barWidth;
        const y = canvas.height - barHeight - 20;
        
        // Bar color (highlight remainder 0)
        ctx.fillStyle = i === 0 ? '#e74c3c' : '#3498db';
        ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
        
        // Label
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('r=' + i, x + barWidth / 2, canvas.height - 5);
        ctx.fillText(distribution[i], x + barWidth / 2, y - 5);
    }
    
    // Title
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Distribution of Subsets by Remainder (mod ' + k + ')', 10, 15);
}

// Calculate on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', calculateSubsets);
} else {
    calculateSubsets();
}
</script>

---

## Part 5: Real-World Applications

While counting subsets of 2000 numbers might seem abstract, the underlying mathematics (generating functions and roots of unity) powers many real-world technologies:

### A. Digital Signal Processing (DSP)

The "roots of unity filter" in our formula is the same principle behind the Discrete Fourier Transform (DFT).

When your phone processes audio or decodes a Wi-Fi signal, it breaks complex waves into discrete frequencies using these mathematical filters—just like we filtered subsets by their remainder.

### B. Cryptography & Error Correction

Reed-Solomon codes (used in QR codes, CDs, and satellite communication) rely on polynomial mathematics and modular arithmetic.

If data gets corrupted during transmission, the system checks if certain sums match expected divisibility properties. A mismatch reveals which bits were flipped.

### C. Load Balancing in Distributed Systems

When distributing tasks across $k$ servers, engineers use modular arithmetic to ensure even distribution.

The same combinatorial formulas help predict whether one server (or "remainder bucket") will be overloaded compared to others.

### D. Combinatorial Chemistry

Scientists use generating functions to count molecular structures (isomers).

If they need molecules with specific symmetry or bonding patterns (like a sum divisible by a certain value), these formulas predict how many such structures exist before lab work begins.

---

## Part 6: Key Takeaways & Summary

Here's what we learned:

1. For a set of size $n$, there are $2^n$ total subsets
2. Subsets distribute across $k$ remainder buckets when we divide sums by $k$
3. The count of subsets divisible by $k$ is: $\frac{2^n + (k-1) \cdot 2^{n/k}}{k}$
4. We can compute this efficiently using modular arithmetic ($O(\log n)$) or DP ($O(n \cdot k)$)
5. The mathematics generalizes to any $n$ and $k$—just plug in different values!

The beauty of this problem is how it transforms an impossible brute-force task into an elegant mathematical formula. By understanding the structure and periodicity of remainders, we can calculate answers for astronomically large sets.

---

## Resources & Further Reading

- [3Blue1Brown: Generating Functions](https://www.youtube.com/watch?v=bOXCLR3Wric) - The video that inspired this post
- [Codeforces: Subset Sum Problems](https://codeforces.com/blog/entry/54090) - Competitive programming perspective
- [Generating Functions on Wikipedia](https://en.wikipedia.org/wiki/Generating_function) - Mathematical background
- [Modular Arithmetic Tutorial](https://www.khanacademy.org/computing/computer-science/cryptography/modarithmetic/a/what-is-modular-arithmetic) - Khan Academy
- [Dynamic Programming Patterns](https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns) - LeetCode guide

