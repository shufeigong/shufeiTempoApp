import { type FC, type ReactElement, type RefObject, memo, useRef } from 'react';
import { type Note, type Vector2D } from '../types/note.types';
import { checkDivOverlap } from '../utils/note.utils';

interface NoteComponentProps {
    note: Note;
    onUpdate: (id: string, updates: Partial<Note>) => void;
    onDelete: (id: string) => void;
    onFocus: (id: string) => void;
    trashRef: RefObject<HTMLDivElement | null>;
    isTrashActive: boolean;
    setTrashActive: (active: boolean) => void;
}

const arePropsEqual = (prevProps:NoteComponentProps, nextProps:NoteComponentProps):boolean => {
    return prevProps.note === nextProps.note && prevProps.isTrashActive === nextProps.isTrashActive;
    //only when note updated or trash become active, trigger this note re-render,
    //otherwise, let it go without re-render.
}

export const NoteComponent:FC<NoteComponentProps> = memo(({
    note, 
    onUpdate, 
    onDelete, 
    onFocus, 
    trashRef, 
    isTrashActive, 
    setTrashActive
}:NoteComponentProps):ReactElement => {

    const noteRef = useRef<HTMLDivElement>(null);
  
    const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
      onFocus(note.id);
      const offset: Vector2D = {
        x: event.clientX - note.position.x,
        y: event.clientY - note.position.y
      };
  
      const moveHandler = (mouseEvent: MouseEvent) => {
        const newPos = { x: mouseEvent.clientX - offset.x, y: mouseEvent.clientY - offset.y };
        onUpdate(note.id, { position: newPos });
  
        if (noteRef.current && trashRef.current) {
          const isDivOverlap = checkDivOverlap(
            noteRef.current.getBoundingClientRect(),
            trashRef.current.getBoundingClientRect()
          );  
        setTrashActive(isDivOverlap);
        }
      };
  
      const upHandler = () => {
        if(noteRef.current && trashRef.current){
            const isDivOverlap = checkDivOverlap(
                noteRef.current.getBoundingClientRect(),
                trashRef.current.getBoundingClientRect()
            );

            if(isDivOverlap){onDelete(note.id);}
        }
        setTrashActive(false);
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
      };
  
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
    };
  
    const handleResize = (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      const startSize = { ...note.size };
      const startMouse = { x: event.clientX, y: event.clientY };
  
      const moveHandler = (mouseEvent: MouseEvent) => {
        onUpdate(note.id, {
          size: {
            x: Math.max(150, startSize.x + (mouseEvent.clientX - startMouse.x)),
            y: Math.max(150, startSize.y + (mouseEvent.clientY - startMouse.y))
          }
        });
      };
  
      const upHandler = () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
      };
  
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
    };
  
    return (
      <div
        ref={noteRef}
        className="note"
        style={{
          transform: `translate3d(${note.position.x}px, ${note.position.y}px, 0)`,
          width: note.size.x,
          height: note.size.y,
          backgroundColor: note.color,
          zIndex: note.zIndex
        }}
      >
        <div className="note-header" onMouseDown={handleMove} />
        <div className="note-body">
            <textarea
                value={note.content}
                onChange={(event) => onUpdate(note.id, { content: event.target.value })}
                onFocus={() => onFocus(note.id)}
                onMouseDown={(event) => { event.stopPropagation(); onFocus(note.id); }}
                placeholder="Start typing..."
            />
        </div>
        <div className="resizer" onMouseDown={handleResize} />
      </div>
    );
}, arePropsEqual);