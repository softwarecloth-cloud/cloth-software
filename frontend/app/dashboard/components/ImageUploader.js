"use client";

import { useRef, useState } from "react";
import uploadToCloudinary, { isImageFile } from "@/app/utils/uploadToCloudinary";

/**
 * Multi-image picker for a product. Optional by design — a product with no
 * photos is fine.
 *
 * `value`    array of { url, publicId }
 * `onChange` called with the next array whenever an image is added or removed
 *
 * Uploads go straight to Cloudinary from the browser; only the resulting URL and
 * public_id are handed back. Removing a thumbnail drops it from the list that
 * gets saved — the underlying Cloudinary asset is left in place (deleting it
 * needs a signed server call we don't make here).
 */
export default function ImageUploader({
  value = [],
  onChange,
  label = "Photos",
  max = 12,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");

  const images = Array.isArray(value) ? value : [];
  const room = Math.max(0, max - images.length);

  const pick = async (e) => {
    const files = Array.from(e.target.files || []);
    // Let the same file be chosen again later (e.g. after removing it).
    e.target.value = "";
    if (!files.length) return;

    setError("");

    const accepted = files.filter(isImageFile);
    const rejected = files.length - accepted.length;
    const toUpload = accepted.slice(0, room);

    const messages = [];
    if (rejected) messages.push(`${rejected} file(s) skipped — not an image`);
    if (accepted.length > room)
      messages.push(`Only ${max} images allowed — extra ones skipped`);

    setUploading((n) => n + toUpload.length);
    const uploaded = [];
    for (const file of toUpload) {
      try {
        const { url, publicId } = await uploadToCloudinary(file);
        uploaded.push({ url, publicId });
      } catch (err) {
        messages.push(err?.message || `Could not upload ${file.name}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }

    if (uploaded.length) onChange?.([...images, ...uploaded]);
    if (messages.length) setError(messages.join(" · "));
  };

  const removeAt = (i) => {
    setError("");
    onChange?.(images.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}{" "}
          <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <span className="text-xs text-neutral-400">
          {images.length}/{max}
        </span>
      </div>

      {images.length > 0 ? (
        <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={img.url + i}
              className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {!disabled ? (
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label="Remove image"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100 hover:bg-black/80"
                >
                  ✕
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={pick}
        disabled={disabled || uploading > 0 || room === 0}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading > 0 || room === 0}
        className="w-full rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        {uploading > 0
          ? `Uploading ${uploading} image${uploading > 1 ? "s" : ""}…`
          : room === 0
            ? `Maximum ${max} images`
            : images.length
              ? "+ Add more images"
              : "+ Add images"}
      </button>

      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
