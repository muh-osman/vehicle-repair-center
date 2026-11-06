// src/utils/uploadFileInChunks.js
import API from "../API/Api";

// const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB per chunk

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB per chunk

export async function uploadFileInChunks(file, { signal, onProgress } = {}) {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const identifier = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  let uploadedBytes = 0;
  let videoPath = null;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunkBlob = file.slice(start, end);
    const chunkSize = end - start;

    const formData = new FormData();
    formData.append("chunk", chunkBlob, `chunk_${chunkIndex}`);
    formData.append("identifier", identifier);
    formData.append("chunkIndex", chunkIndex);
    formData.append("totalChunks", totalChunks);
    formData.append("filename", file.name);

    const res = await API.post("api/upload-video-chunk", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      signal,
      onUploadProgress: (evt) => {
        const overall = uploadedBytes + evt.loaded;
        onProgress?.(Math.min(100, Math.round((overall / file.size) * 100)));
      },
    });

    uploadedBytes += chunkSize;

    if (res.data.completed) {
      videoPath = res.data.video_path;
    }
  }

  return videoPath;
}
