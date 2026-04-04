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

Inspired by the brilliant [3Blue1Brown video on generating functions](https://www.youtube.com/watch?v=bOXCLR3Wric), this post explores an elegant Olympiad-level counting problem.

---

### The Problem

Given two positive integers $n$ and $k$ (where $2 \le k \le n$), answer this:

> How many subsets of $\lbrace 1, 2, 3, \ldots, n \rbrace$ have a sum divisible by $k$?

Let's say $n = 2000$ and $k = 5$. You need to count how many subsets have sums divisible by 5.

Your first instinct: iterate through all subsets, sum each one, check divisibility.

**The problem:** There are $2^{2000}$ subsets.

To put this in perspective:
- The number of atoms in the observable universe: $\approx 10^{80}$
- The value of $2^{2000}$: $\approx 10^{602}$

Even if you could check one trillion subsets per second, you'd need more time than the age of the universe—multiplied by itself, many times over.

**Brute force is not just slow. It's impossible.**

---

### The Total Population

Before we can count a subset, we need to understand the full landscape.

For a set with $n$ elements, each element has exactly 2 choices:
- It's **in** the subset
- It's **out** of the subset

Think of $n$ light switches, each with 2 positions:

$$\text{Total subsets} = \underbrace{2 \times 2 \times \cdots \times 2}_{n \text{ times}} = 2^n$$

For $n = 2000$, we have $2^{2000}$ total subsets. This is our starting point.

### The Remainder Buckets

When we divide any subset's sum by $k$, we get a remainder from $\lbrace 0, 1, 2, \ldots, k-1 \rbrace$.

We want subsets in the "remainder 0" bucket—those divisible by $k$.

**Naive guess:** Each of the $k$ buckets gets an equal share, so:

$$\text{Count} \stackrel{?}{=} \frac{2^n}{k}$$

But this is **wrong**. The distribution isn't perfectly uniform.

**Why?** Because the numbers $1, 2, 3, \ldots, n$ have structure. They cycle through remainders in a predictable pattern. This creates subtle imbalances.

### The Correction Factor

The exact formula accounts for this imbalance:

$$\boxed{\text{Count} = \frac{2^n + (k-1) \cdot 2^{n/k}}{k}}$$

Let's decode each component:

| Symbol | Meaning | Role |
|--------|---------|------|
| $2^n$ | Total subsets | The full population |
| $2^{n/k}$ | Correction factor | Captures periodicity |
| $(k-1)$ | Symmetry multiplier | Balances non-zero remainders |
| $\div k$ | Bucket selector | Extracts one remainder class |

**The key insight:** $2^{n/k}$ appears because the remainders cycle every $k$ numbers. In the range $1$ to $n$, we have $\frac{n}{k}$ complete cycles. Each cycle contributes a multiplicative factor to the correction term.

Imagine a clock with $k$ hours. As we add numbers $1, 2, 3, \ldots, n$, their remainders (mod $k$) tick around this clock.

- Every $k$ consecutive numbers complete one full rotation
- In the range $1$ to $n$, we have $\frac{n}{k}$ complete rotations
- Each rotation contributes a factor of 2 to the correction term
- Thus: $2^{n/k}$

**Example:** For $n = 15$ and $k = 3$:
- Numbers $1, 2, 3$ → remainders $1, 2, 0$ (one cycle)
- Numbers $4, 5, 6$ → remainders $1, 2, 0$ (two cycles)
- Numbers $7, 8, 9$ → remainders $1, 2, 0$ (three cycles)
- And so on...
- Total cycles: $\frac{15}{3} = 5$
- Correction factor: $2^5 = 32$

---

## See the Math in Motion

Before we write any code, let's validate the formula interactively. Adjust $n$ and $k$ below and watch how the correction factor and target count respond in real-time.

<div id="demo-container" style="border: 2px solid #3498db; padding: 20px; border-radius: 10px; margin: 20px 0; background-color: #f8f9fa;">
  <h3 style="margin-top: 0;">Subset Divisibility Calculator</h3>
  
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
    <div>
      <div style="margin: 15px 0;">
        <label for="input-n" style="display: inline-block; width: 150px; font-weight: bold;">Set size (n):</label>
        <input id="input-n" type="range" value="10" min="1" max="30" style="width: 150px;" oninput="updateValues()">
        <span id="n-value" style="margin-left: 10px; font-weight: bold; color: #3498db;">10</span>
      </div>
      
      <div style="margin: 15px 0;">
        <label for="input-k" style="display: inline-block; width: 150px; font-weight: bold;">Divisor (k):</label>
        <input id="input-k" type="range" value="3" min="2" max="10" style="width: 150px;" oninput="updateValues()">
        <span id="k-value" style="margin-left: 10px; font-weight: bold; color: #e74c3c;">3</span>
      </div>
    </div>
    
    <div id="live-metrics" style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
      <h4 style="margin-top: 0; color: #2c3e50;">Live Metrics:</h4>
      <p style="margin: 8px 0;"><strong>Total Subsets (2<sup>n</sup>):</strong> <span id="live-total" style="color: #27ae60;">1024</span></p>
      <p style="margin: 8px 0;"><strong>Correction Factor (2<sup>n/k</sup>):</strong> <span id="live-correction" style="color: #f39c12;">8</span></p>
      <p style="margin: 8px 0;"><strong>Target Subsets:</strong> <span id="live-target" style="color: #e74c3c;">342</span></p>
      <p style="margin: 8px 0; font-size: 12px; color: #7f8c8d;">Formula: (2<sup>n</sup> + (k-1)·2<sup>n/k</sup>) / k</p>
    </div>
  </div>
  
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
    <div>
      <h4 style="color: #2c3e50;">Remainder Distribution</h4>
      <canvas id="distribution-graph" width="400" height="300" style="border: 1px solid #ddd; border-radius: 5px; background-color: white;"></canvas>
    </div>
    
    <div>
      <h4 style="color: #2c3e50;">Growth Visualization (n vs Subsets)</h4>
      <canvas id="growth-graph" width="400" height="300" style="border: 1px solid #ddd; border-radius: 5px; background-color: white;"></canvas>
    </div>
  </div>
  
  <div id="formula-breakdown" style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 5px; border: 1px solid #ffc107;">
    <h4 style="margin-top: 0; color: #856404;">Formula Breakdown:</h4>
    <p id="formula-text" style="font-family: monospace; color: #212529;"></p>
  </div>
</div>

<script>
let currentN = 10;
let currentK = 3;

function updateValues() {
    currentN = parseInt(document.getElementById('input-n').value);
    currentK = parseInt(document.getElementById('input-k').value);
    
    document.getElementById('n-value').textContent = currentN;
    document.getElementById('k-value').textContent = currentK;
    
    calculateSubsets();
}

function calculateSubsets() {
    const n = currentN;
    const k = currentK;
    
    if (n < 1 || k < 2 || k > n) {
        return;
    }
    
    // Calculate metrics
    const totalSubsets = Math.pow(2, n);
    const correctionFactor = Math.pow(2, n / k);
    const numerator = totalSubsets + (k - 1) * correctionFactor;
    const targetSubsets = Math.floor(numerator / k);
    
    // Update live metrics
    document.getElementById('live-total').textContent = formatNumber(totalSubsets);
    document.getElementById('live-correction').textContent = formatNumber(correctionFactor);
    document.getElementById('live-target').textContent = formatNumber(targetSubsets);
    
    // Update formula breakdown
    document.getElementById('formula-text').innerHTML = 
        `(${formatNumber(totalSubsets)} + ${k-1} × ${formatNumber(correctionFactor)}) / ${k} = ${formatNumber(targetSubsets)}`;
    
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
    
    // Draw graphs
    drawDistributionGraph(dp[n], k);
    drawGrowthGraph(n, k);
}

function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(0);
}

function drawDistributionGraph(distribution, k) {
    const canvas = document.getElementById('distribution-graph');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const padding = 40;
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;
    const barWidth = graphWidth / k;
    const maxValue = Math.max(...distribution);
    const scale = graphHeight / maxValue;
    
    // Draw axes
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw bars
    for (let i = 0; i < k; i++) {
        const barHeight = distribution[i] * scale;
        const x = padding + i * barWidth;
        const y = canvas.height - padding - barHeight;
        
        ctx.fillStyle = i === 0 ? '#e74c3c' : '#3498db';
        ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
        
        // X-axis labels
        ctx.fillStyle = '#2c3e50';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(i, x + barWidth / 2, canvas.height - padding + 15);
        
        // Value labels
        ctx.fillStyle = '#2c3e50';
        ctx.font = '10px Arial';
        ctx.fillText(distribution[i], x + barWidth / 2, y - 5);
    }
    
    // Axis labels
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Remainder (mod ' + k + ')', canvas.width / 2, canvas.height - 5);
    
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Count', 0, 0);
    ctx.restore();
}

function drawGrowthGraph(n, k) {
    const canvas = document.getElementById('growth-graph');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const padding = 40;
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;
    
    // Draw axes
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Generate data points
    const maxN = Math.min(n + 5, 30);
    const points = [];
    let maxY = 0;
    
    for (let i = 1; i <= maxN; i++) {
        const total = Math.pow(2, i);
        const correction = Math.pow(2, i / k);
        const target = (total + (k - 1) * correction) / k;
        points.push({ x: i, total, target });
        maxY = Math.max(maxY, total);
    }
    
    const scaleX = graphWidth / maxN;
    const scaleY = graphHeight / Math.log2(maxY);
    
    // Draw total subsets line
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, i) => {
        const x = padding + p.x * scaleX;
        const y = canvas.height - padding - Math.log2(p.total) * scaleY;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Draw target subsets line
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, i) => {
        const x = padding + p.x * scaleX;
        const y = canvas.height - padding - Math.log2(p.target) * scaleY;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Highlight current n
    const currentPoint = points[n - 1];
    const currentX = padding + currentPoint.x * scaleX;
    const currentY = canvas.height - padding - Math.log2(currentPoint.target) * scaleY;
    
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Axis labels
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Set Size (n)', canvas.width / 2, canvas.height - 5);
    
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('log₂(Subsets)', 0, 0);
    ctx.restore();
    
    // Legend
    ctx.font = '11px Arial';
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(canvas.width - 150, 20, 15, 3);
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'left';
    ctx.fillText('Total (2ⁿ)', canvas.width - 130, 25);
    
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(canvas.width - 150, 35, 15, 3);
    ctx.fillStyle = '#2c3e50';
    ctx.fillText('Divisible by k', canvas.width - 130, 40);
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateValues);
} else {
    updateValues();
}
</script>

### What You're Seeing

**Left graph:** The distribution of subsets across remainder buckets. Notice that remainder 0 (red bar) is slightly larger than the others—this is the correction factor at work.

**Right graph:** Exponential growth on a logarithmic scale. The green line shows total subsets ($2^n$), and the red line shows divisible subsets. They grow in parallel, but the gap between them is determined by $k$.

**Key observation:** As you increase $k$, the correction factor shrinks (because $n/k$ decreases), and the distribution becomes more uniform.

---

### Approach A: Mathematical Formula (Fast, Large $n$)

When $n$ is huge (like $n = 2000$), we use the closed-form formula with modular arithmetic.

**Time complexity:** $O(\log n)$  
**Space complexity:** $O(1)$  
**Best for:** Competitive programming, large $n$, single queries

```cpp
#include <iostream>
using namespace std;

// Binary exponentiation with modular arithmetic
// Computes (base^exp) % mod in O(log exp) time
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
// For prime mod: a^(-1) ≡ a^(mod-2) (mod mod)
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

### Approach B: Dynamic Programming (Flexible, Small $n$)

When $n$ is moderate (say, $n \le 10^4$) and you need to track the process or handle variations, use DP.

**Time complexity:** $O(n \cdot k)$  
**Space complexity:** $O(n \cdot k)$ (can be optimized to $O(k)$)  
**Best for:** Educational purposes, debugging, extensions (e.g., "count subsets with sum exactly $m$")

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n = 20;  // Size of set
    int k = 5;   // Divisor
    long long mod = 1e9 + 7;
    
    // dp[i][r] = number of subsets using first i elements with sum ≡ r (mod k)
    vector<vector<long long>> dp(n + 1, vector<long long>(k, 0));
    dp[0][0] = 1;  // Empty subset has sum 0
    
    for (int i = 1; i <= n; i++) {
        for (int r = 0; r < k; r++) {
            // Option 1: Don't include element i
            dp[i][r] = dp[i-1][r];
            
            // Option 2: Include element i (value = i)
            int prev_remainder = (r - i % k + k) % k;
            dp[i][r] = (dp[i][r] + dp[i-1][prev_remainder]) % mod;
        }
    }
    
    cout << "Subsets divisible by " << k << ": " << dp[n][0] << endl;
    
    // Bonus: Print distribution across all remainders
    cout << "\nDistribution by remainder:\n";
    for (int r = 0; r < k; r++) {
        cout << "Remainder " << r << ": " << dp[n][r] << endl;
    }
    
    return 0;
}
```

**Space optimization:** Since `dp[i]` only depends on `dp[i-1]`, we can use two 1D arrays instead of a 2D array, reducing space to $O(k)$.

---

## Where This Fits in the Real World

The mathematics we've explored—generating functions, roots of unity, modular arithmetic—powers technologies you use every day.

### 1. Digital Signal Processing (DSP)

The "roots of unity filter" in our formula is the foundation of the Discrete Fourier Transform (DFT).

When your phone processes audio or decodes a Wi-Fi signal, it breaks complex waves into discrete frequencies using these mathematical filters—just like we filtered subsets by their remainder.

**Connection:** Both problems involve partitioning a large space (subsets or signals) into equivalence classes (remainders or frequencies) using periodic structure.

### 2. Cryptography & Error Correction

Reed-Solomon codes (used in QR codes, CDs, and satellite communication) rely on polynomial mathematics and modular arithmetic.

If data gets corrupted during transmission, the system checks if certain sums match expected divisibility properties. A mismatch reveals which bits were flipped.

**Connection:** The DP approach is similar to how error-correcting codes track "syndrome" values—remainders that indicate corruption.

### 3. Load Balancing in Distributed Systems

When distributing tasks across $k$ servers, engineers use modular arithmetic to ensure even distribution.

The same combinatorial formulas help predict whether one server (or "remainder bucket") will be overloaded compared to others.

**Connection:** Our formula quantifies imbalance. If the correction factor is large, the distribution is uneven; if small, it's nearly uniform.

### 4. Combinatorial Chemistry

Scientists use generating functions to count molecular structures (isomers).

If they need molecules with specific symmetry or bonding patterns (like a sum divisible by a certain value), these formulas predict how many such structures exist before lab work begins.

**Connection:** The DP table is a generating function in disguise. Each entry encodes a polynomial coefficient representing "ways to achieve this state."

---

## Resources & Further Reading

- [3Blue1Brown: Generating Functions](https://www.youtube.com/watch?v=bOXCLR3Wric) - The video that inspired this post
- [Codeforces: Subset Sum Problems](https://codeforces.com/blog/entry/54090) - Competitive programming perspective
- [Generating Functions on Wikipedia](https://en.wikipedia.org/wiki/Generating_function) - Mathematical background
- [Modular Arithmetic Tutorial](https://www.khanacademy.org/computing/computer-science/cryptography/modarithmetic/a/what-is-modular-arithmetic) - Khan Academy
- [Dynamic Programming Patterns](https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns) - LeetCode guide
