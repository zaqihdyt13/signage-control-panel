import multer from "multer";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        Object.assign(new Error("Unsupported file type"), {
          statusCode: 400,
        }),
      );
    }

    callback(null, true);
  },
});
