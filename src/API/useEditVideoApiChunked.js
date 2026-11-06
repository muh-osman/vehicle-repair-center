// src/API/useEditVideoApiChunked.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "./Api";
import { toast } from "react-toastify";
import { uploadFileInChunks } from "../Utils/uploadFileInChunks";

export const useEditVideoApiChunked = (setUploadProgress) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, videosFiles, videoTypes, employeeNames, signal }) => {
      const totalBytes = videosFiles.reduce((sum, f) => sum + f.size, 0);
      let doneBytes = 0;
      const uploadedVideos = [];

      for (let i = 0; i < videosFiles.length; i++) {
        const file = videosFiles[i];

        const videoPath = await uploadFileInChunks(file, {
          signal,
          onProgress: (filePercent) => {
            const fileBytesDone = (filePercent / 100) * file.size;
            const overall = Math.round(((doneBytes + fileBytesDone) / totalBytes) * 100);
            setUploadProgress(overall);
          },
        });

        doneBytes += file.size;
        setUploadProgress(Math.round((doneBytes / totalBytes) * 100));

        uploadedVideos.push({
          video_path: videoPath,
          video_type: videoTypes[i],
          employee_name: employeeNames[i],
        });
      }

      const res = await API.post(`api/new-edit-video-chunked/${id}`, { videos: uploadedVideos }, { signal });
      return res.data;
    },

    onSuccess: () => {
      qc.prefetchQuery({ queryKey: ["videos"] });
    },

    onError: (err) => {
      const wasCancelled = err?.code === "ERR_CANCELED" || err?.name === "CanceledError" || err?.name === "AbortError";
      if (wasCancelled) return;
      console.error(err);
      const errorMessage = err?.response?.data?.message || err?.message || "An error occurred";
      toast.error(errorMessage);
    },
  });
};
