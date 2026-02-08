import { type Note } from "../types/note.types";

const DB_KEY = "sticky_notes_data";

const mockDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const NoteAPI = {
  async fetchNotes(): Promise<Note[]> {
    await mockDelay(300);
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  async updateNote(
    id: string,
    updates: Partial<Note>,
    signal?: AbortSignal,
  ): Promise<void> {
    await mockDelay(300);

    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    const mockDatabase = JSON.parse(localStorage.getItem(DB_KEY) || "[]");

    const idx = mockDatabase.findIndex((note: Note) => note.id === id);
    if (idx > -1) {
      mockDatabase[idx] = { ...mockDatabase[idx], ...updates };
      localStorage.setItem(DB_KEY, JSON.stringify(mockDatabase));
    }
  },

  async deleteNote(id: string): Promise<void> {
    await mockDelay(300);
    const mockDatabase = JSON.parse(localStorage.getItem(DB_KEY) || "[]");
    const idx = mockDatabase.findIndex((note: Note) => note.id === id);
    if (idx !== -1) {
      const updated = [
        ...mockDatabase.slice(0, idx),
        ...mockDatabase.slice(idx + 1),
      ];
      localStorage.setItem(DB_KEY, JSON.stringify(updated));
    }
  },

  async createNote(note: Note): Promise<void> {
    await mockDelay(300);
    const mockDatabase = JSON.parse(localStorage.getItem(DB_KEY) || "[]");
    localStorage.setItem(DB_KEY, JSON.stringify([...mockDatabase, note]));
  },
};
