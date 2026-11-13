---
title: "Introducing the Real-World Engineering track"
date: 2026-11-13
description: "Rheton now has a second track: debug, implement or extend a real codebase with a failing test suite while an AI interviewer talks you through it."
---

Rheton now has two tracks. Alongside **Algorithmic**, the classic LeetCode-style coding round, you can now practice **Real-World Engineering**: a hands-on round in a real codebase, with a terminal, an editor and a failing test suite.

## Why we built it

More and more interviews ask you to do the work, not just solve a puzzle.

The clearest example is Stripe. According to candidate reports, its loop includes a debugging round, often called the "Bug Bash" or "Bug Squash", that "gives you an unfamiliar repository with a failing test or open issue", and an integration round that asks you "to implement a small feature inside an unfamiliar codebase" ([Aced, formerly Exponent](https://www.aced.io/guides/stripe-swe-interview)).

AI is speeding the shift up. Once assistants could solve classic interview questions in seconds, companies started redesigning their rounds:

- **Canva** replaced its algorithms and data structures interview with problems it describes as "more complex, ambiguous, and realistic", and candidates are expected to use AI to solve them ([Canva Engineering](https://canva.dev/blog/engineering/yes-you-can-use-ai-in-our-interviews)).
- **Meta** began piloting an AI-enabled coding round in October 2025 that replaces one of the two onsite coding interviews ([CoderPad](https://coderpad.io/blog/hiring-developers/ai-in-the-interview-is-not-cheating-it-is-the-job-according-to-meta/)). A former Meta engineer describes it as a multi-file project you iterate on, sometimes debugging one file and then extending others ([interviewing.io](https://interviewing.io/blog/how-to-use-ai-in-meta-s-ai-assisted-coding-interview-with-real-prompts-and-examples)).
- **Interview platforms see the same thing.** CoderPad's CEO says AI-era interview questions are "1000-2000 line code bases, and you have to add a feature in a short amount of time" ([interviewing.io](https://interviewing.io/blog/how-is-ai-changing-interview-processes-not-much-and-a-whole-lot)). Hello Interview describes a "growing chasm" between Big Tech's LeetCode-style rounds and "a new wave of practical, project-based coding assessments" led by smaller companies ([Hello Interview](https://hellointerview.substack.com/p/how-tech-coding-assessments-are-splintering)).

Developers want it too. In HackerRank's 2025 survey of more than 13,000 people, 66% of developers said they'd rather be evaluated on real-world skills, and 78% said assessments don't align with real-world tasks ([HackerRank](https://www.hackerrank.com/reports/developer-skills-report-2025)).

To be fair, algorithm rounds aren't going away. In interviewing.io's 2025 survey, none of the 52 FAANG interviewers who responded said their company had dropped algorithmic questions, and the change was concentrated at startups ([interviewing.io](https://interviewing.io/blog/how-is-ai-changing-interview-processes-not-much-and-a-whole-lot)). That's why we're keeping the Algorithmic track. But if you're interviewing at a company that hands you a repository instead of a whiteboard, you need to practice a different skill: finding your way around code you didn't write, fast.

## How it works

You open a small repository in a terminal and editor in your browser. Every problem comes with a briefing, the way a teammate would describe it, and a test suite that tells you when you're done. There are three kinds of problems:

- **Debug.** Something's broken in working code. Reproduce it, find the root cause and fix it.
- **Implement.** The design is there but the core is stubbed out. Fill it in to meet the spec and pass the tests.
- **Extend.** Add a feature to an existing codebase without breaking what already works, following the conventions you find there.

The bank launches with 19 problems across all three kinds and three difficulty levels, in Python, from an ignored feature flag kill switch to a rate limiter, a dependency resolver and Raft log replication.

The interviewer works like a real one. It briefs you, asks what you're thinking, nudges you if you're stuck, and when you're done asks why your fix works and how it would hold up in production. It doesn't watch your screen or hand you the answer. You talk it through, the same way you would in the room.

When the exercise ends, Rheton captures your changes and runs the test suite one last time. Your summary is based on the code you actually shipped, not just on what you said, and covers how you read the code, how you solved the problem, how you verified it, and how you communicated along the way.

## Try it

Pick **Real-World Engineering** on the Setup page to start. It's included on the Free plan. Plus lets you choose a specific problem from the bank instead of getting one at random.

We'd love to hear how it goes. Come tell us on [Discord](https://discord.gg/9eRqFKq2vY), or email **support@rheton.io**.
