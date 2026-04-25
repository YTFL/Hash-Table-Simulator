# Hash Table Simulator

![License: Educational Use Only](https://img.shields.io/badge/License-Educational%20Use%20Only-darkred)
![React 19](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Vite 6](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind%20CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)
![Motion 12](https://img.shields.io/badge/Motion-12.x-111827)
![Lucide React](https://img.shields.io/badge/Lucide-React-18181B)
![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)

Hash Table Simulator is an interactive, front-end educational simulator for learning how hash tables work.
It visualizes insertion, searching, and deletion across three collision-resolution strategies:

- Separate Chaining
- Linear Probing
- Double Hashing

The app shows each probe step in real time, highlights active cells, and logs every action so users can follow the exact execution path.

## Who This Is For

- Students learning data structures and collision handling
- Instructors who need a visual classroom demo
- Self-learners comparing hashing strategies side by side

## Key Features

- Interactive hash table size control (3 to 50)
- Step-by-step visual playback for each operation
- Runtime log panel explaining every probe and decision
- Support for tombstones (lazy deletion) in open addressing
- Built-in educational note cards covering core hashing concepts

## Supported Algorithms

### 1. Separate Chaining

- Table cells store chains (lists) of keys
- Collisions append to the same chain
- Search and delete traverse the chain

### 2. Linear Probing

- Open addressing strategy
- Collision path follows: $(h_1 + i) \mod m$
- Uses tombstones for safe deletion

### 3. Double Hashing

- Open addressing with a second hash step size
- Probe path follows: $(h_1 + i \cdot h_2) \mod m$
- Helps reduce primary clustering vs linear probing

## Local Setup

### Prerequisites

- Node.js 18+ (recommended)
- npm

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Default dev URL:

- http://localhost:3000

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How To Use

1. Choose an algorithm from the header tabs.
2. Set table size using the slider.
3. Enter a non-negative integer key.
4. Click one of:
    - Insert Key
    - Search
    - Delete
5. Watch the visualization and runtime logs update step by step.
6. Use Reset Environment to clear the table and logs.

Tips:

- Press Enter in the input box to run Insert quickly.
- During an active playback, controls are locked to keep execution consistent.

## Input Rules and Behavior

- Only non-negative integers are accepted.
- Duplicate inserts are rejected.
- Open addressing deletion uses tombstones (DEL markers), not hard removal.
- Insert fails when the table is full and no reusable slot exists.

## Educational Panel

The left panel includes a multi-section theory reference with topics such as:

- Hashing basics
- Collision handling
- Separate chaining
- Open addressing
- Linear probing clustering
- Double hashing
- Applications of hashing

Use the card list to open any topic, then navigate with Previous/Next controls.

## NPM Scripts

- `npm run dev` - start Vite dev server on port 3000
- `npm run build` - create production build
- `npm run preview` - preview the production build locally
- `npm run lint` - run TypeScript type-check (no emit)
- `npm run clean` - remove dist folder

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Motion (animation)
- Lucide React (icons)

## Project Structure

```text
src/
   App.tsx                      # Main layout, controls, playback loop
   components/
      HashVisualizer.tsx         # Table and probe visualization
      EducationalSection.tsx     # Theory cards and modal notes
   lib/
      simulator.ts               # Hashing and operation simulation logic
      types.ts                   # Shared TypeScript types
```

## Troubleshooting

- App does not start:
   - Confirm Node.js is installed and up to date.
   - Delete `node_modules` and run `npm install` again.
- Port 3000 is busy:
   - Stop the process using port 3000, or temporarily change the dev port in `package.json`.
- Type errors in editor:
   - Run `npm run lint` to view TypeScript issues.

## License

This project is licensed under the Educational Use Only License (EUOL) v1.0.
See the LICENSE file for full terms.
