
export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  blob: Blob;
  createdAt: number;
}

export type ViewState = 'calculator' | 'home' | 'gallery' | 'notes';

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}
