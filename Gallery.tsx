
import React, { useState, useEffect, useRef } from 'react';
import { privateDB } from '../services/db';
import { MediaItem } from '../types';

interface GalleryProps {
  onBack: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ onBack }) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const items = await privateDB.getAllMedia();
      setMedia(items.sort((a, b) => b.createdAt - a.createdAt));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setLoading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      const item: MediaItem = {
        id: crypto.randomUUID(),
        name: file.name,
        type: type as 'image' | 'video',
        blob: file,
        createdAt: Date.now(),
      };
      await privateDB.addMedia(item);
    }
    await loadMedia();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this? It will be permanently removed from app storage.')) return;
    await privateDB.deleteMedia(id);
    if (preview?.id === id) setPreview(null);
    await loadMedia();
  };

  return (
    <div className="w-full h-full min-h-screen bg-black flex flex-col animate-in fade-in duration-500">
      {/* Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5 safe-top">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="text-blue-500 font-medium flex items-center gap-1 active:opacity-50 transition-opacity"
          >
            <span className="text-xl">chevron_left</span>
            <span>Back</span>
          </button>
          
          <h1 className="text-white text-lg font-bold tracking-tight">Recents</h1>
          
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center active:scale-90 transition-transform"
          >
            <span className="text-2xl font-light">+</span>
          </button>
        </div>
      </header>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUpload} 
        multiple 
        accept="image/*,video/*" 
        className="hidden" 
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-20 pb-10">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-500 text-sm font-medium">Updating Library</p>
          </div>
        ) : media.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center animate-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 rounded-3xl bg-neutral-900 flex items-center justify-center text-4xl mb-6 shadow-2xl">
              📸
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">No Photos</h2>
            <p className="text-neutral-500 max-w-xs mx-auto leading-relaxed">
              Your hidden gallery is empty. Tap the add button to secure your private media.
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="mt-8 px-8 py-3 bg-blue-500 text-white font-bold rounded-full shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
            >
              Add Media
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 max-w-4xl mx-auto px-0.5">
            {media.map((item) => (
              <MediaThumbnail 
                key={item.id} 
                item={item} 
                onClick={() => setPreview(item)} 
                onDelete={(e) => handleDelete(item.id, e)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Immersive Fullscreen Viewer */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
          {/* Overlay UI */}
          <div className="p-6 flex justify-between items-center text-white bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-10 safe-top">
            <button 
              onClick={() => setPreview(null)} 
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:scale-90 transition-all border border-white/10"
            >
              <span className="text-lg">✕</span>
            </button>
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold truncate max-w-[150px]">{preview.name}</span>
              <span className="text-[10px] text-white/50 uppercase tracking-tighter">
                {new Date(preview.createdAt).toLocaleDateString()}
              </span>
            </div>
            <button 
              onClick={(e) => handleDelete(preview.id, e)} 
              className="w-10 h-10 rounded-full bg-red-500/10 backdrop-blur-md flex items-center justify-center text-red-500 active:scale-90 transition-all border border-red-500/10"
            >
              🗑️
            </button>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-0">
            {preview.type === 'image' ? (
              <img 
                src={URL.createObjectURL(preview.blob)} 
                alt={preview.name} 
                className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-300"
              />
            ) : (
              <video 
                src={URL.createObjectURL(preview.blob)} 
                controls 
                autoPlay 
                className="max-w-full max-h-full animate-in zoom-in-95 duration-300 shadow-2xl"
              />
            )}
          </div>

          {/* Bottom Bar for Preview */}
          <div className="absolute bottom-0 w-full p-8 flex justify-center bg-gradient-to-t from-black/80 to-transparent">
             <button className="px-6 py-2 bg-white/5 backdrop-blur-lg rounded-full text-white/60 text-xs font-bold border border-white/5 tracking-widest uppercase">
               In-App Encrypted Storage
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MediaThumbnail: React.FC<{ item: MediaItem; onClick: () => void; onDelete: (e: React.MouseEvent) => void }> = ({ item, onClick, onDelete }) => {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(item.blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [item]);

  return (
    <div 
      className="aspect-square relative bg-neutral-900 cursor-pointer group overflow-hidden active:scale-95 transition-transform duration-150" 
      onClick={onClick}
    >
      {item.type === 'image' ? (
        <img 
          src={url} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center relative bg-black/20 group-hover:bg-black/0 transition-colors">
          <video src={url} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-transparent transition-all">
             <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
               <span className="text-xl ml-1">▶</span>
             </div>
          </div>
        </div>
      )}
      
      {/* Date Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
         <span className="text-[9px] text-white/70 font-bold uppercase tracking-widest">
           {new Date(item.createdAt).toLocaleDateString()}
         </span>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
        <button 
          onClick={onDelete} 
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full w-9 h-9 flex items-center justify-center text-sm shadow-xl hover:bg-red-500/40 hover:text-white"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default Gallery;
