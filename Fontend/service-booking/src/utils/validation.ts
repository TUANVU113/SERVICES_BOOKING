import { LoginPayload } from "@/types/auth";

export interface ValidationErrors {
  email?: string;
  password?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

// Regex validate standard email format
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateLoginForm = (data: LoginPayload): ValidationResult => {
  const errors: ValidationErrors = {};

  // Check email
  const trimmedEmail = data.email.trim();
  if (!trimmedEmail) {
    errors.email = "Vui lòng nhập địa chỉ Email";
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = "Định dạng Email không hợp lệ (Ví dụ: user@gmail.com)";
  }

  // Check password
  if (!data.password) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (data.password.length < 1) {
    errors.password = "Mật khẩu không được bỏ trống";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
