import { Request, Response } from "express";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    code: "not_found",
    message: "The requested resource was not found",
    data: null,
  });
};
