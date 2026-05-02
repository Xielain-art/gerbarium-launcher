import { z } from "zod";

export const createNewsSchema = z.object({
  title: z
    .string()
    .min(3, "Заголовок должен содержать минимум 3 символа")
    .max(200, "Заголовок не должен превышать 200 символов"),
  slug: z
    .string()
    .min(3, "Слаг должен содержать минимум 3 символа")
    .max(100, "Слаг не должен превышать 100 символов")
    .regex(/^[a-z0-9-]+$/, "Слаг может содержать только строчные буквы, цифры и дефисы"),
  content: z
    .string()
    .min(10, "Содержание должно содержать минимум 10 символов"),
  image: z
    .string()
    .url("Изображение должно быть валидным URL")
    .optional()
    .or(z.literal("")),
  tagIds: z.array(z.string()).optional(),
});

export const updateNewsSchema = z.object({
  title: z
    .string()
    .min(3, "Заголовок должен содержать минимум 3 символа")
    .max(200, "Заголовок не должен превышать 200 символов")
    .optional(),
  slug: z
    .string()
    .min(3, "Слаг должен содержать минимум 3 символа")
    .max(100, "Слаг не должен превышать 100 символов")
    .regex(/^[a-z0-9-]+$/, "Слаг может содержать только строчные буквы, цифры и дефисы")
    .optional(),
  content: z
    .string()
    .min(10, "Содержание должно содержать минимум 10 символов")
    .optional(),
  image: z
    .string()
    .url("Изображение должно быть валидным URL")
    .optional()
    .or(z.literal("")),
  tagIds: z.array(z.string()).optional(),
});

export const newsTagSchema = z.object({
  name: z
    .string()
    .min(2, "Название тега должно содержать минимум 2 символа")
    .max(50, "Название тега не должно превышать 50 символов"),
});

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
export type NewsTagInput = z.infer<typeof newsTagSchema>;
