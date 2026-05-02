import { useMemo, useState } from "react";
import { createNewsSchema, newsTagSchema } from "../validation/newsValidation";
import { ZodError } from "zod";

interface FieldValidation {
  isValid: boolean;
  error: string | null;
  touched: boolean;
}

export function useNewsFormValidation(
  title: string,
  slug: string,
  content: string,
  image: string
) {
  const [touchedFields, setTouchedFields] = useState({
    title: false,
    slug: false,
    content: false,
    image: false,
  });

  const titleValidation = useMemo<FieldValidation>(() => {
    try {
      createNewsSchema.shape.title.parse(title);
      return { isValid: true, error: null, touched: touchedFields.title };
    } catch (error) {
      if (error instanceof ZodError) {
        return { isValid: false, error: error.issues[0].message, touched: touchedFields.title };
      }
      return { isValid: false, error: null, touched: touchedFields.title };
    }
  }, [title, touchedFields.title]);

  const slugValidation = useMemo<FieldValidation>(() => {
    try {
      createNewsSchema.shape.slug.parse(slug);
      return { isValid: true, error: null, touched: touchedFields.slug };
    } catch (error) {
      if (error instanceof ZodError) {
        return { isValid: false, error: error.issues[0].message, touched: touchedFields.slug };
      }
      return { isValid: false, error: null, touched: touchedFields.slug };
    }
  }, [slug, touchedFields.slug]);

  const contentValidation = useMemo<FieldValidation>(() => {
    try {
      createNewsSchema.shape.content.parse(content);
      return { isValid: true, error: null, touched: touchedFields.content };
    } catch (error) {
      if (error instanceof ZodError) {
        return { isValid: false, error: error.issues[0].message, touched: touchedFields.content };
      }
      return { isValid: false, error: null, touched: touchedFields.content };
    }
  }, [content, touchedFields.content]);

  const imageValidation = useMemo<FieldValidation>(() => {
    if (!image) return { isValid: true, error: null, touched: touchedFields.image };
    try {
      createNewsSchema.shape.image.parse(image);
      return { isValid: true, error: null, touched: touchedFields.image };
    } catch (error) {
      if (error instanceof ZodError) {
        return { isValid: false, error: error.issues[0].message, touched: touchedFields.image };
      }
      return { isValid: false, error: null, touched: touchedFields.image };
    }
  }, [image, touchedFields.image]);

  const isFormValid = useMemo(
    () =>
      titleValidation.isValid &&
      slugValidation.isValid &&
      contentValidation.isValid &&
      imageValidation.isValid,
    [titleValidation, slugValidation, contentValidation, imageValidation]
  );

  const handleBlur = (field: keyof typeof touchedFields) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const resetTouched = () => {
    setTouchedFields({ title: false, slug: false, content: false, image: false });
  };

  return {
    titleValidation,
    slugValidation,
    contentValidation,
    imageValidation,
    isFormValid,
    handleBlur,
    resetTouched,
  };
}

export function useNewsTagValidation(name: string) {
  const [touched, setTouched] = useState(false);

  const validation = useMemo<FieldValidation>(() => {
    try {
      newsTagSchema.parse({ name });
      return { isValid: true, error: null, touched };
    } catch (error) {
      if (error instanceof ZodError) {
        return { isValid: false, error: error.issues[0].message, touched };
      }
      return { isValid: false, error: null, touched };
    }
  }, [name, touched]);

  const handleBlur = () => setTouched(true);
  const resetTouched = () => setTouched(false);

  return { ...validation, handleBlur, resetTouched };
}
