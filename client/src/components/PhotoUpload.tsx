import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface PhotoUploadProps {
  tileId: string;
}

export function PhotoUpload({ tileId }: PhotoUploadProps) {
  const { photos, addPhoto, deletePhoto } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tilePhotos = photos.filter(p => p.tileId === tileId);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith("image/")
    );

    for (const file of files) {
      await processFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      await processFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFile = async (file: File) => {
    return new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        
        // Create thumbnail
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSize = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const thumbnail = canvas.toDataURL("image/jpeg", 0.7);

          addPhoto({
            tileId,
            base64Data: base64,
            thumbnail,
            timestamp: new Date().toISOString(),
          });
          
          resolve();
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);
    });
  };

  const lightboxSlides = tilePhotos.map(photo => ({
    src: photo.base64Data,
  }));

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/30 hover:border-muted-foreground/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          data-testid="input-photo-upload"
        />
        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop images here, or{" "}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-primary hover:underline font-medium"
              data-testid="button-browse-photos"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-muted-foreground">
            Images are stored locally in your browser
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      {tilePhotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tilePhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
              onClick={() => setLightboxIndex(index)}
              data-testid={`photo-${photo.id}`}
            >
              <img
                src={photo.thumbnail}
                alt="Uploaded photo"
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  deletePhoto(photo.id);
                }}
                data-testid={`button-delete-photo-${photo.id}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {tilePhotos.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon className="w-16 h-16 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No photos yet. Upload some to get started!
          </p>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex >= 0 && (
        <Lightbox
          open={lightboxIndex >= 0}
          index={lightboxIndex}
          close={() => setLightboxIndex(-1)}
          slides={lightboxSlides}
        />
      )}
    </div>
  );
}
