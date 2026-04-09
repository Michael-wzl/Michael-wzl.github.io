---
title: "LinuxLingo"
excerpt: "Group project for NUS CS2113 Software Engineering & Object-Oriented Programming. A Java CLI application for learning Linux commands through an interactive shell simulator and a built-in quiz system, backed by an in-memory virtual file system. Available [on GitHub](https://github.com/AY2526S2-CS2113-T10-2/tp)."
collection: portfolio
---

LinuxLingo is a **command-line application for learning Linux commands** through an interactive shell simulator and a built-in quiz system. It is designed for Computer Science students who want to build confidence with the Linux command line by typing real commands, seeing real output, and testing their knowledge — all within a safe, in-memory virtual file system (VFS) that never touches real files.

See the [GitHub repo](https://github.com/AY2526S2-CS2113-T10-2/tp) for full source code, documentation, and releases.

## Architecture

The application is organized into five main components:

| Component | Responsibility |
| --- | --- |
| **CLI** | Handles user I/O (`Ui`) and top-level command dispatch (`MainParser`) |
| **Shell** | Parses and executes shell commands in a simulated Linux environment |
| **Exam** | Manages exam sessions — question presentation, answer checking, scoring |
| **Storage** | Reads/writes data on the real file system (question banks, VFS snapshots) |
| **VFS** | In-memory virtual file system that all shell commands operate on |

## Shell Simulator

The Shell Simulator provides a Linux-like command-line environment backed by an in-memory VFS. All file and directory operations are performed within this VFS — **no real files are created, modified, or deleted**.

**36 supported commands across 8 categories:**

| Category | Commands |
| --- | --- |
| Navigation | `cd`, `ls`, `pwd` |
| File Operations | `mkdir`, `touch`, `rm`, `cp`, `mv`, `cat`, `echo`, `diff`, `tee` |
| Text Processing | `head`, `tail`, `grep`, `find`, `wc`, `sort`, `uniq` |
| Permissions | `chmod` |
| Information | `man`, `tree`, `which`, `whoami`, `date` |
| Alias & History | `alias`, `unalias`, `history` |
| Environment | `save`, `load`, `reset`, `envlist`, `envdelete` |
| Utility | `help`, `clear` |

**Advanced shell features:**

- Piping (`|`), output redirection (`>`, `>>`), input redirection (`<`)
- Command chaining with `&&`, `||`, and `;`
- Glob expansion (`*`, `?`) against the VFS
- Variable expansion (`$USER`, `$HOME`, `$PWD`, `$?`)
- Alias resolution with circular-reference protection
- Tab completion and command history (via JLine 3)
- Typo suggestions using Levenshtein edit distance

## Shell Parsing Pipeline

The parser transforms raw input into a structured `ParsedPlan` through two stages:

1. **Tokenization** — a char-by-char state machine with three states (`NORMAL`, `IN_SINGLE_QUOTE`, `IN_DOUBLE_QUOTE`) that recognizes operators, quotes, and escape sequences.
2. **Plan Building** — groups tokens into `Segment` objects separated by operators, each segment holding a command name, arguments, and optional redirect information.

The execution engine (`ShellSession.runPlan()`) iterates the plan, chaining stdout/stdin across pipe boundaries, and evaluating `&&`/`||` conditions based on exit codes.

## Exam System

The exam module supports three question types:

| Type | Description |
| --- | --- |
| **MCQ** | Multiple-choice questions on Linux concepts |
| **FITB** | Fill-in-the-blank questions |
| **PRAC** | Practical questions — user types real shell commands in a temporary VFS; answer is verified by checking VFS state against `Checkpoint` objects |

Exam sessions can be started interactively (topic selection prompt), directly via CLI args (`exam -t navigation -n 5`), or as a single random question (`exam -random`).

## VFS Design

- **Tree structure** of `FileNode` objects — `Directory` uses a `LinkedHashMap` for ordered, O(1) lookup by name.
- **`Permission`** models Unix 9-character permission strings, supporting both octal and symbolic `chmod` notation.
- **`deepCopy()`** at every level enables snapshot-based features (saving/loading environments, isolated PRAC exam VFS instances).
- All path operations go through `VirtualFileSystem` — shell commands never use `java.io` or `java.nio.file` for simulated files.
