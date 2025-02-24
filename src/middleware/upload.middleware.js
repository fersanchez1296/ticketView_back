import multer from "multer";
import path from "path";
import { __dirname, __filename } from "../config/config.js";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "src", "temp");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

export const uploadMiddleware = upload.array("files", 10);
