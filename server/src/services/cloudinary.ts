import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";
import { env } from "../config/env.js";

const isConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

type CloudinaryUpload = {
  url: string;
  publicId: string;
};

export function uploadImage(file: Express.Multer.File, subfolder: string): Promise<CloudinaryUpload> {
  if (!isConfigured) {
    const error = new Error("Cloudinary is not configured on the server") as Error & { status: number };
    error.status = 503;
    throw error;
  }

  const safeFolder = subfolder.replace(/[^a-zA-Z0-9/_-]/g, "-");
  const options: UploadApiOptions = {
    folder: `${env.CLOUDINARY_FOLDER}/${safeFolder}`,
    resource_type: "image",
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  };

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result?: UploadApiResponse) => {
      if (error || !result) return reject(error ?? new Error("Cloudinary upload failed"));
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(file.buffer);
  });
}
