import {
  type FC,
  type ReactElement,
  useEffect,
  useCallback,
  useRef,
  useState,
} from "react";
import { NoteComponent } from "./note.component";
import { type Note } from "../types/note.types";
import { NoteAPI } from "../services/noteApi";

const COLORS = ["#fff9c4", "#ffecb3", "#e1f5fe", "#f3e5f5", "#e8f5e9"];

export const BoardComponent: FC = (): ReactElement => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isTrashActive, setIsTrashActive] = useState<boolean>(false);
  const trashRef = useRef<HTMLDivElement>(null);

  // pendingUpdates for buffer, abortContrllerRef for race condition
  const pendingUpdates = useRef<Map<string, Partial<Note>>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    NoteAPI.fetchNotes().then(setNotes);
  }, []);

  //debounce: no update after 0.5s, checking if need updates.
  useEffect(() => {
    const syncTimer = setTimeout(async () => {
      if (pendingUpdates.current.size === 0) {
        return;
      }
      //no note updates in buffer, return.

      abortControllerRef.current?.abort();
      //abort old reqest if it has, avoid old data updates cover new data updates.

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const updatesToSync = new Map(pendingUpdates.current);
      pendingUpdates.current.clear();
      //put updated data to updatesToSync and clear pendingUpdates buffer.

      try {
        await Promise.all(
          Array.from(updatesToSync.entries()).map(([id, upds]) =>
            NoteAPI.updateNote(id, upds, controller.signal)
          )
        );
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Old sync aborted, merging data for next cycle...");
        } else {
          console.error("Sync failed, rolling back data for retry:", err);
        }
        updatesToSync.forEach((val, id) => {
          const currentInPending = pendingUpdates.current.get(id) || {};
          pendingUpdates.current.set(id, { ...val, ...currentInPending });
        });
        //put failed update data back to pendingUpdates for next update
      }
    }, 500);

    return () => {
      clearTimeout(syncTimer);
    };
  }, [notes]);

  const addNote = async (): Promise<void> => {
    const currentNotesLength = notes.length;
    const newNote: Note = {
      id: Date.now().toString(),
      position: { x: 50 + Math.random() * 50, y: 50 + Math.random() * 50 },
      size: { x: 200, y: 200 },
      content: "",
      color: COLORS[currentNotesLength % COLORS.length],
      // cycles the color value through colors array
      zIndex: currentNotesLength + 1,
    };

    setNotes((prevNotes) => [...prevNotes, newNote]);
    await NoteAPI.createNote(newNote);
  };

  const updateNote = useCallback((id: string, updates: Partial<Note>): void => {
    //use useCallback hook to keep this arrow function reference stable.
    setNotes((prevNotes) => {
      const toUpdateNoteIndex = prevNotes.findIndex((note) => note.id === id);

      if (toUpdateNoteIndex < 0) {
        return prevNotes;
      }

      const updatedNote = { ...prevNotes[toUpdateNoteIndex], ...updates };

      const current = pendingUpdates.current.get(id) || {};
      pendingUpdates.current.set(id, { ...current, ...updates });
      //store updates to buffer

      return [
        ...prevNotes.slice(0, toUpdateNoteIndex),
        updatedNote,
        ...prevNotes.slice(toUpdateNoteIndex + 1),
      ];
    });
    //using Array.findIndex and Array.slice to concat array,
    //it will have better efficiency when the notes array is very large
    //compared with traditional Array.map
    //setNotes(prev => prev.map(note => note.id === id ? { ...note, ...updates } : note));
  }, []);

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    //use useCallback hook to keep this arrow function reference stable.
    setNotes((prevNotes) => {
      const toDeleteNoteIndex = prevNotes.findIndex((note) => note.id === id);

      if (toDeleteNoteIndex < 0) {
        return prevNotes;
      }

      return [
        ...prevNotes.slice(0, toDeleteNoteIndex),
        ...prevNotes.slice(toDeleteNoteIndex + 1),
      ];
    });
    //same here, using Array.findIndex and Array.slice to concat array,
    //it will have better efficiency when the notes array is very large
    //compared with traditional Array.filter
    //setNotes(prevNotes => prevNotes.filter(note => note.id !== id));

    await NoteAPI.deleteNote(id);
  }, []);

  const focusNote = useCallback((id: string) => {
    //use useCallback hook to keep this arrow function reference stable.

    setNotes((prevNotes) => {
      const maxZ =
        prevNotes.length > 0
          ? Math.max(...prevNotes.map((note) => note.zIndex))
          : 0;

      const toUpdateNoteIndex = prevNotes.findIndex((note) => note.id === id);
      if (
        toUpdateNoteIndex < 0 ||
        prevNotes[toUpdateNoteIndex].zIndex === maxZ
      ) {
        return prevNotes;
      }

      const updatedNote = { ...prevNotes[toUpdateNoteIndex], zIndex: maxZ + 1 };

      const currentInPending = pendingUpdates.current.get(id) || {};
      pendingUpdates.current.set(id, { ...currentInPending, zIndex: maxZ + 1 });
      //store updates to buffer.

      return [
        ...prevNotes.slice(0, toUpdateNoteIndex),
        updatedNote,
        ...prevNotes.slice(toUpdateNoteIndex + 1),
      ];
    });
  }, []);

  return (
    <div className="board">
      <header className="header-container">
        <h1 className="board-header">
          Shufei Gong's <span className="board-header-span">sticky notes</span>
        </h1>
        <p className="board-header-text">Created by React + TypeScript</p>
      </header>
      <div className="controls">
        <button onClick={addNote} className="add-btn">
          + New Note
        </button>
      </div>

      <div
        ref={trashRef}
        className={`trash-zone ${isTrashActive ? "active" : ""}`}
      >
        <span>{isTrashActive ? "RELEASE TO DELETE" : "TRASH"}</span>
      </div>

      {notes.map((note) => (
        <NoteComponent
          key={note.id}
          note={note}
          onUpdate={updateNote}
          onDelete={deleteNote}
          trashRef={trashRef}
          isTrashActive={isTrashActive}
          setTrashActive={setIsTrashActive}
          onFocus={focusNote}
        />
      ))}
    </div>
  );
};
