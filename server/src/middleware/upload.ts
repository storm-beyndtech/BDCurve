import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      const error = new Error("Only image uploads are supported") as Error & { status: number };
      error.status = 415;
      return callback(error);
    }
    callback(null, true);
  },
});
