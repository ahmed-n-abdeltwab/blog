---
layout: article
title: "How I Prepare for Google Summer of Code"
date: 2025-11-17
modify_date: 2025-11-17
excerpt: "My tips and advice for anyone who wants to get into Google Summer of Code."
tags:
  [
    "advice",
    "Google Summer of Code",
    "guides",
  ]
key: pre-gsoc
---

## Intro

Many people have asked me about my journey — how I managed to get selected for Google Summer of Code (GSoC) as a freshman. Here’s my story and the lessons I learned along the way.

I believe selection is a mix of **skill and luck**. You’ll meet people who are highly skilled but not lucky enough, and others who seem lucky without being the best in their field. Derek Muller has a great video explaining the complex relationship between hard work and luck when it comes to success. I recommend watching it: [Why Being Delusional is a Superpower](https://www.youtube.com/watch?v=3LopI4YeC4I).

But aside from luck — which is in Allah’s hands — this blog will focus on **what you *can* control**, and how you can increase your chances of being selected.

---

## What is Google Summer of Code (GSoC)?


### [![Google Summer of Code 2024](https://github.com/Sing-Li/bbug/raw/master/images/gsoclogo.jpg)](https://summerofcode.withgoogle.com)


Google Summer of Code, or GSoC, is a global program where contributors get to work with **real open-source organizations**.
It’s a chance to contribute to software projects that people actually use — and get guidance from experienced developers along the way. Oh, and Google gives you a stipend if you complete your project successfully.

Here’s what you should know:

* **Duration:** About 3 months in the summer (usually June to August).
* **Organizations:** Hundreds of open-source orgs participate each year.
* **Mentors:** Each project has mentors who guide you and answer your questions.
* **Stipend:** Yes, Google pays you for your work once you finish the project.
* **Skills you’ll learn:** Coding, documentation, problem solving, communication, teamwork, and project management.

Why join GSoC?

* You work on real projects used by thousands of people.
* You get mentorship from experienced developers.
* You build your CV with recognized open-source contributions — “Google” on your resume looks really good!
* You learn to manage your time, communicate professionally, and work independently.
* You become part of a global community of developers who love open source.

GSoC is more than just writing code — it’s about **learning, growing, and contributing**.
Even if you feel like a beginner, you can succeed if you’re motivated, curious, and willing to learn.


---

## Who Is This Blog For?

* **You already know how to program.**
  You understand how things work, and you can solve easy to medium-level problems solving.

* **You can read and write in English.**
  I assume you can read English since this blog is written in English.
  But if you are using a translator, please don’t rely on it. Go and learn English — it’s one of the most important skills for communication in Github.

* **You are a student or a developer who wants the word “Google” on your CV.**


---

## Start

How do you even begin preparing for GSoC?

The GSoC 2026 program starts in March, but you don’t have to wait until then to look for an organization to contribute to. Most people get stuck at the same question:

**“Which organization should I choose?”**

There are hundreds of them, and the choices can feel overwhelming.

Many people on YouTube or blogs say things like:  
*“I already knew which organization I wanted.”*  
or  
*“I felt inspired and picked the one that matched my passion.”*

But my experience was completely different — and probably similar to yours.

I had **no idea** which organization to pick.  
I didn’t even know what **Rocket.Chat** was at the beginning.  
So I did what any engineer would do: I tried to act smart.

I went to GitHub… but not just GitHub.  
I used the list of **accepted organizations from the previous year**:  
You can use this: [Accepted Organizations – GSoC 2025](https://summerofcode.withgoogle.com/programs/2025/organizations)

### Why use last year's list?

Don’t wait for the new year’s accepted organizations.  
If you want to get into open source early — and let the community know who you are — you must **start before everyone else**.

<!-- <div align="center">
    <img src="https://images.unsplash.com/photo-1519576122146-ccfda6b8693f" width="80%" height="100%" class="center">
    <p>Photo by <a href="https://unsplash.com/@noahdavis">Noah Näf</a> on <a href="https://unsplash.com/">Unsplash</a></p>
</div> -->

Most organizations that join GSoC usually return the next year because the program helps them grow. Some even use a part of their budget specifically for GSoC.  
Still, feel free to ask in their chat or Slack if they plan to join again in 2026.

### How to filter organizations

Open the 2025 organizations list and use the search bar. Search for things you know or want to work with:

- “python”
- “javascript”
- “typescript”
- “c++”
- “react”
- “spring boot”
- …anything you’re comfortable with.

Then open each organization from the results and read their project ideas.  
Use your browser’s search (`Ctrl+F`) to scan for keywords so you don’t waste time — save your energy for the important work later.

At this point, try to narrow your options down to **2 organizations** and **2 projects**.  
This increases your chances and keeps your focus sharp.

### My Choices

For me, the final two were:

- **Rocket.Chat**  
  They had a backend project using TypeScript — and that matched my skills.  
  (Later, this is the project I got accepted into.)

- **AsyncAPI**  
  They wanted to mentor new maintainers for the AsyncAPI Generator.  
  They required JavaScript and some experience with AsyncAPI.  
  I knew JavaScript, but I had never used AsyncAPI before — but I had no problem learning it and trying to become a maintainer.

Next, I’ll explain what I did with both organizations, so you can see the exact steps I followed.

I started first with **Rocket.Chat**.

I read the project description carefully, then joined their chat group where they discussed the project. I asked questions, tried to understand the idea deeply, and explored all the documents they shared. The team was genuinely helpful. They created a dedicated channel for the project and shared everything I needed to get started. The mentor was super supportive and guided me to the right documents.

After reading everything, I decided to do something extra — something that would help me stand out and increase my chances of getting accepted.

So I started working on a small part of the project.  
I shared my progress, my problems, and my solutions in the chat channel.  
This got the mentor interested in me, and eventually, that effort played a big role in my acceptance. Yes, I was lucky — but you can create your own luck too.

---

You may say:  
**“Ahmed, you said this blog is about preparing for GSoC, not telling stories.”**

I know. I went off track a little — but trust me, you’ll appreciate this story by the end. Stay with me.

---

After I made a pull request (a very small one), I chose a task that helped me understand the big picture — nothing more, nothing less.  
That was enough to show the mentor that I was serious about the project.

Then I wrote my proposal.  
A simple one. I read blogs and articles about how to write a good GSoC proposal, and I mentioned my previous contribution to Rocket.Chat in it.

For **AsyncAPI**, they asked candidates to build a test app using the AsyncAPI Generator.  
I built the app, wrote the proposal, and submitted it.

And that’s it.  
(Okay, not really — if it were that easy, everyone would get accepted.)  
But these steps were mine, and some advice I’ll share comes from others who succeeded too.

---

## Advice

### 1. Learn Git and GitHub
Git is one of the most important tools you must understand before contributing to open source.  
You should know:

- how version control works  
- basic CLI commands  
- how to create and manage branches  
- how to write a proper Pull Request on GitHub  

I recommend watching Ahmed Sami’s video:  
[Git and GitHub](https://www.youtube.com/watch?v=Q6G-J54vgKc)  
But you can watch any resource you like — the important part is to master Git before starting.

---

### 2. Read the Project Documentation

Before writing any code, **read the documentation**. This is a very important step, but many people ignore it.
Sometimes we spend hours trying to understand a task, while the answer is already written in the docs.
Reading documentation saves you time — you benefit from the time others already spent writing it.
So don’t skip this skill.

Start by cloning the project, installing the dependencies, and setting up the development environment.

Look for important files such as:

* `CONTRIBUTING.md`
* `README.md`
* Developer setup guides
* Architecture or technical documents

Being able to install and run a project locally is a real skill.
The faster you understand the setup, the faster you can contribute.

---

### 3. Communicate Well
Find where the community communicates — Slack, Discord, IRC, mailing lists, anything.

Good communication builds trust between you and the mentors.  
Don’t disappear for long periods, and don’t be a “ghost contributor.”  
Share your progress, ask questions, but **ask responsibly**.

Most projects clearly write rules like “ask in the channel, not in DMs.”  
Please respect these rules.

Also, be professional.  
Don’t say:  
> “Tell me how to install this thing.”

Instead, say:  
> “Hi, when you have time, I need 5 minutes of help.  
> I searched and read the docs, but I’m blocked on X and Y. Could you guide me?”

Always be respectful and patient.  
Remember: mentors have jobs, families, and lives. They are not online 24/7.

---

### 4. Quality Matters More Than Quantity

* One clear message is better than 100 messy ones.  
* One good Pull Request is better than 100 weak PRs.  
* Read before asking.  
* Don’t rush.

Be concise and explain your issue in simple steps.  
A small but clean contribution is always more valuable than many low-quality ones.  
Most answers are already in the documentation — show that you tried before asking for help.  
Slow, steady, and high-quality work always wins in open source.

---

### 5. Good Proposals Are Going to Win

Ask your mentor **before submitting** how they prefer the proposal to be written.  
When you finish your first draft, send it to them and request a review **before the deadline**.  
Keep improving it based on their feedback until they say the proposal looks good.

If the mentor doesn’t reply, look at previous contributors’ proposals from last year.  
You can use repositories like this one:  
[Accepted GSoC 2025 Proposals Archive](https://github.com/SammanSarkar/GSoC_archive_2025)

These examples will give you a solid idea of what a winning proposal looks like.

---

## Do’s and Don’ts

### Do’s

**1. Start early**  
Begin exploring organizations months before the official list is released. Early preparation gives you a huge advantage.

**2. Read before asking**  
Most answers are already in the docs, issues, or chat history.  
Show that you tried first — mentors respect that.

**3. Contribute something small**  
Even a tiny PR shows interest, effort, and seriousness.  
It also helps you understand the project better.

**4. Communicate professionally**  
Be polite, direct, and respectful.  
Ask clear questions and don’t expect instant replies.

**5. Focus on learning**  
Whether you get accepted or not, the skills you gain stay with you.  
Improve your communication, coding, documentation, and proposal writing.

---

### Don’ts

**1. Don’t disappear**  
Inconsistency is one of the biggest reasons candidates are ignored.  
Stay active — even a quick message of your progress is enough.

**2. Don’t spam messages or PRs**  
Low-quality, rushed contributions do more harm than good.  
Quality > Quantity.

**3. Don’t DM mentors unless allowed**  
Respect the rules. If the org says “Ask in the channel,” follow that.  
DM only when they explicitly say it’s okay.

**4. Don’t copy proposals**  
Use proposal archives to learn, not to clone.  
Mentors can immediately spot copied work.

**5. Don’t wait until the deadline**  
Late proposals, late questions, and late contributions reduce your chances dramatically.  
Prepare early, submit early.

**6. Don’t ignore project rules or guidelines**  
Always read `CONTRIBUTING.md` and `README.md` carefully.  
Most problems beginners face are already explained there.

**7. Don’t flood the project with too many pull requests**  
Sending many low-quality PRs will hurt your chances.  
Take your time, understand the issue, and submit meaningful contributions.


---

## Ending

The truth is: there is no “perfect path” to GSoC.
Everyone’s journey looks different — mine, yours, your friend’s, all unique.
Some people get in because they are skilled.
Some get in because they are lucky.
Most get in because they show effort, communicate well, and keep improving.

If you read documentation, contribute something meaningful, talk to mentors with respect, and write a clear proposal — then you already did your part.
The rest is in Allah’s hands.

Whether you get accepted or not, GSoC is not the end goal.
The real value is the skills you gain, the people you meet, and the confidence you build by contributing to real open-source projects. That experience will stay with you forever.

If you reached this point, thank you for reading.
I hope this blog gives you clarity, motivation, and a realistic path to follow.

> Start early.
> Learn with patience.
> Communicate with respect.
> And always focus on quality.

If you ever get accepted — congratulations.
If not — don’t stop. Open source will open doors for you in ways you don’t expect.

Good luck on your GSoC journey.
And may Allah make it easy for you.
