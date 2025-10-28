'use client';

import { useState } from 'react';

interface ImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  isPrimary: boolean;
}

export default function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: UploadedImage[] = [];

    for (let i = 0; i < Math.min(files.length, maxImages - images.length); i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB`);
        continue;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      newImages.push({
        id: Math.random().toString(36).substring(7),
        url: previewUrl,
        file,
        isPrimary: images.length === 0 && i === 0, // First image is primary by default
      });
    }

    onChange([...images, ...newImages]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeImage = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id);
    // If we removed the primary image, make the first image primary
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
      updatedImages[0].isPrimary = true;
    }
    onChange(updatedImages);
  };

  const setPrimaryImage = (id: string) => {
    onChange(
      images.map(img => ({
        ...img,
        isPrimary: img.id === id,
      }))
    );
  };

  const moveImage = (id: string, direction: 'left' | 'right') => {
    const index = images.findIndex(img => img.id === id);
    if (
      (direction === 'left' && index === 0) ||
      (direction === 'right' && index === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          dragActive
            ? 'border-primary-600 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={images.length >= maxImages}
        />

        <label
          htmlFor="image-upload"
          className={`cursor-pointer ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <p className="text-lg font-medium text-gray-700 mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, GIF up to 5MB ({images.length}/{maxImages} images)
          </p>
        </label>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`relative group rounded-lg overflow-hidden border-2 ${
                image.isPrimary ? 'border-primary-600' : 'border-gray-200'
              }`}
            >
              <div className="aspect-square">
                <img
                  src={image.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlay with controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {/* Move left */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(image.id, 'left')}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                    title="Move left"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Move right */}
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(image.id, 'right')}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                    title="Move right"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Primary badge */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  Primary
                </div>
              )}

              {/* Set as primary button */}
              {!image.isPrimary && (
                <button
                  type="button"
                  onClick={() => setPrimaryImage(image.id)}
                  className="absolute top-2 left-2 bg-white bg-opacity-90 hover:bg-opacity-100 px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition"
                >
                  Set as Primary
                </button>
              )}

              {/* Image number */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-sm text-gray-600">
          The first image is your primary photo and will be displayed as the main image.
          Drag images to reorder or click "Set as Primary" to change the primary image.
        </p>
      )}
    </div>
  );
}
