export interface Note {
    id:string;
    position: Vector2D;
    size: Vector2D;
    content: string;
    color: string;
    zIndex: number;
}

export interface Vector2D {
    x: number;
    y: number;
}