// Validation utility functions for forms

export const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address",
  },
  password: {
    minLength: 8,
    message: "Password must be at least 8 characters long",
  },
  name: {
    minLength: 2,
    maxLength: 50,
    message: "Name must be between 2 and 50 characters",
  },
  bio: {
    maxLength: 500,
    message: "Bio must not exceed 500 characters",
  },
  rating: {
    min: 1,
    max: 5,
    message: "Rating must be between 1 and 5",
  },
  date: {
    message: "Please enter a valid date",
  },
  futureDate: {
    message: "Date must be in the future",
  },
};

export function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return { isValid: false, message: "Email is required" };
  }
  const trimmedEmail = email.trim().toLowerCase();
  if (!validationRules.email.pattern.test(trimmedEmail)) {
    return { isValid: false, message: validationRules.email.message };
  }
  return { isValid: true, value: trimmedEmail };
}

export function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return { isValid: false, message: "Password is required" };
  }
  if (password.length < validationRules.password.minLength) {
    return { isValid: false, message: validationRules.password.message };
  }
  return { isValid: true, value: password };
}

export function validateName(name) {
  if (!name || typeof name !== "string") {
    return { isValid: false, message: "Name is required" };
  }
  const trimmedName = name.trim();
  if (
    trimmedName.length < validationRules.name.minLength ||
    trimmedName.length > validationRules.name.maxLength
  ) {
    return { isValid: false, message: validationRules.name.message };
  }
  return { isValid: true, value: trimmedName };
}

export function validateBio(bio) {
  if (!bio || typeof bio !== "string") {
    return { isValid: true, value: "" };
  }
  if (bio.length > validationRules.bio.maxLength) {
    return { isValid: false, message: validationRules.bio.message };
  }
  return { isValid: true, value: bio.trim() };
}

export function validateRating(rating) {
  if (!rating || typeof rating !== "number") {
    return { isValid: false, message: "Rating is required" };
  }
  if (rating < validationRules.rating.min || rating > validationRules.rating.max) {
    return { isValid: false, message: validationRules.rating.message };
  }
  return { isValid: true, value: rating };
}

export function validateDate(date) {
  if (!date) {
    return { isValid: false, message: "Date is required" };
  }
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return { isValid: false, message: validationRules.date.message };
  }
  return { isValid: true, value: parsedDate };
}

export function validateFutureDate(date) {
  const dateValidation = validateDate(date);
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (dateValidation.value < now) {
    return { isValid: false, message: validationRules.futureDate.message };
  }
  return { isValid: true, value: dateValidation.value };
}

export function validateDateRange(startDate, endDate) {
  const startValidation = validateDate(startDate);
  if (!startValidation.isValid) {
    return startValidation;
  }

  const endValidation = validateDate(endDate);
  if (!endValidation.isValid) {
    return endValidation;
  }

  if (endValidation.value <= startValidation.value) {
    return {
      isValid: false,
      message: "End date must be after start date",
    };
  }

  return {
    isValid: true,
    value: { start: startValidation.value, end: endValidation.value },
  };
}

export function validateComment(comment) {
  if (!comment || typeof comment !== "string") {
    return { isValid: false, message: "Comment is required" };
  }
  const trimmedComment = comment.trim();
  if (trimmedComment.length < 10) {
    return { isValid: false, message: "Comment must be at least 10 characters" };
  }
  if (trimmedComment.length > 1000) {
    return { isValid: false, message: "Comment must not exceed 1000 characters" };
  }
  return { isValid: true, value: trimmedComment };
}

export function getValidationErrors(formData, schema) {
  const errors = {};
  let isValid = true;

  for (const [field, rules] of Object.entries(schema)) {
    const value = formData[field];
    
    if (rules.required && (!value || (typeof value === "string" && !value.trim()))) {
      errors[field] = `${field} is required`;
      isValid = false;
      continue;
    }

    if (value && rules.validator) {
      const result = rules.validator(value);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
      }
    }
  }

  return { isValid, errors };
}
