import type { ErrorRequestHandler, RequestHandler } from "express";

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  const status = typeof error?.status === "number" ? error.status : 500;
  res.status(status).json({ message: error instanceof Error ? error.message : "Internal server error" });
};
