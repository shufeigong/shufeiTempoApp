# Shufei Gong's Sticky Notes Application

A high-performance, real-time sticky notes board built with React and TypeScript.
## Architecture
This project implements a **Buffered State Synchronization** pattern. UI interactions update the local state immediately, while changes are queued in a `Ref`-based Map. A synchronization engine monitors this buffer and pushes batches to the mock server only after user activity pauses.

```
src/
├── components/
│   ├── board.component.tsx    // Main container managing note layout.
│   └── note.component.tsx     // Individual note component.
│
├── services/
│   └── noteApi.ts             // Mock API layer CRUD operations with LocalStorage.
│
├── types/
│   └── note.types.ts          // TypeScript interfaces.
│
├── utils/
│   └── note.utils.ts          // Helper functions.
│
├── App.tsx                    // Root component that bootstraps the Board and global providers.
└── App.css                    // Global stylesheets
```
## Development Setup
In your teminal
1. Run `git clone https://github.com/shufeigong/shufeiTempoApp.git`.
2. Run `cd [your/path/to]/shufei-tempo-app`.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open http://localhost:5173/ in your browser.

See screen record for result:


https://github.com/user-attachments/assets/fb1eea9c-dd29-4ffb-8dd0-a2c8da51fce9


## Key Features
- **Fluid UX**: Hand-written Drag & Resize logic using `translate3d` for 60fps performance.
- **Smart Sync**: Debounced API synchronization (500ms) to minimize server load.
- **Resilience**: Map-based update buffering with `AbortController` to handle race conditions and automatic retry on failure.
- **Optimistic UI**: Instant local updates with background persistence.

## Implementation Details
- **Component Memoization**: Notes use a custom `arePropsEqual` comparator to prevent unnecessary re-renders.
- **Collision Detection**: Implemented a geometric overlap algorithm for the "Drag to Trash" feature.
- **Type Safety**: Fully typed with TypeScript interfaces for both state and API payloads.



