
import React, { useState, useEffect } from 'react';
import { Note } from '../types';

interface NotesProps {
  onBack: () => void;
}

const Notes: React.FC<NotesProps> = ({ onBack }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('calc_notes');
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  const saveNotes = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem('calc_notes', JSON.stringify(updated));
  };

  const createNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'New Note',
      content: '',
      updatedAt: Date.now(),
    };
    saveNotes([newNote, ...notes]);
    setActiveNote(newNote);
  };

  const updateActiveNote = (updates: Partial<Note>) => {
    if (!activeNote) return;
    const updated = notes.map(n => n.id === activeNote.id ? { ...n, ...updates, updatedAt: Date.now() } : n);
    saveNotes(updated);
    setActiveNote({ ...activeNote, ...updates });
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
    if (activeNote?.id === id) setActiveNote(null);
  };

  return (
    <div className="w-full h-full min-h-screen bg-white text-black flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-neutral-50 border-b border-neutral-200">
        <button onClick={onBack} className="text-orange-500 font-medium">Back</button>
        <h1 className="font-bold">Notes</h1>
        <button onClick={createNote} className="text-orange-500 font-medium">New</button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeNote ? (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 flex items-center justify-between border-b bg-white">
              <button onClick={() => setActiveNote(null)} className="text-orange-500">← All Notes</button>
              <button onClick={() => deleteNote(activeNote.id)} className="text-red-500">Delete</button>
            </div>
            <input 
              type="text" 
              value={activeNote.title}
              onChange={(e) => updateActiveNote({ title: e.target.value })}
              className="px-6 py-4 text-2xl font-bold outline-none border-none placeholder:text-neutral-300"
              placeholder="Title"
            />
            <textarea 
              value={activeNote.content}
              onChange={(e) => updateActiveNote({ content: e.target.value })}
              className="px-6 py-2 flex-1 outline-none border-none resize-none text-lg leading-relaxed placeholder:text-neutral-300"
              placeholder="Start writing..."
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {notes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400 p-8 text-center">
                <span className="text-6xl mb-4">📓</span>
                <p>Private thoughts belong here.</p>
              </div>
            ) : (
              <div className="divide-y">
                {notes.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => setActiveNote(note)}
                    className="p-6 hover:bg-neutral-50 cursor-pointer active:bg-neutral-100 transition-colors"
                  >
                    <h3 className="font-bold text-lg mb-1 truncate">{note.title || 'Untitled'}</h3>
                    <p className="text-neutral-500 line-clamp-2 text-sm">{note.content || 'No content'}</p>
                    <span className="text-[10px] text-neutral-300 mt-2 block uppercase tracking-widest">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
