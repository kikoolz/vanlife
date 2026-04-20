import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateRating,
  validateComment,
} from "../utils/validation";

describe("Validation Utils", () => {
  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      expect(validateEmail("test@example.com").isValid).toBe(true);
      expect(validateEmail("user.name+tag@domain.co.uk").isValid).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(validateEmail("").isValid).toBe(false);
      expect(validateEmail("invalid").isValid).toBe(false);
      expect(validateEmail("@example.com").isValid).toBe(false);
      expect(validateEmail("test@").isValid).toBe(false);
    });

    it("should trim and lowercase email", () => {
      const result = validateEmail("  TEST@EXAMPLE.COM  ");
      expect(result.isValid).toBe(true);
      expect(result.value).toBe("test@example.com");
    });
  });

  describe("validatePassword", () => {
    it("should validate correct passwords", () => {
      expect(validatePassword("password123").isValid).toBe(true);
      expect(validatePassword("abcdefgh").isValid).toBe(true);
    });

    it("should reject short passwords", () => {
      expect(validatePassword("").isValid).toBe(false);
      expect(validatePassword("short").isValid).toBe(false);
      expect(validatePassword("1234567").isValid).toBe(false);
    });
  });

  describe("validateName", () => {
    it("should validate correct names", () => {
      expect(validateName("John Doe").isValid).toBe(true);
      expect(validateName("AB").isValid).toBe(true);
    });

    it("should reject invalid names", () => {
      expect(validateName("").isValid).toBe(false);
      expect(validateName("   ").isValid).toBe(false);
    });

    it("should trim name", () => {
      const result = validateName("  John Doe  ");
      expect(result.isValid).toBe(true);
      expect(result.value).toBe("John Doe");
    });
  });

  describe("validateRating", () => {
    it("should validate correct ratings", () => {
      expect(validateRating(1).isValid).toBe(true);
      expect(validateRating(5).isValid).toBe(true);
      expect(validateRating(3).isValid).toBe(true);
    });

    it("should reject invalid ratings", () => {
      expect(validateRating(0).isValid).toBe(false);
      expect(validateRating(6).isValid).toBe(false);
      expect(validateRating(-1).isValid).toBe(false);
    });
  });

  describe("validateComment", () => {
    it("should validate correct comments", () => {
      expect(validateComment("This is a valid comment").isValid).toBe(true);
      expect(validateComment("a".repeat(10)).isValid).toBe(true);
    });

    it("should reject invalid comments", () => {
      expect(validateComment("").isValid).toBe(false);
      expect(validateComment("short").isValid).toBe(false);
    });
  });
});
