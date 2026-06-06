//src/common/utilts/validatiors.util.ts
import { REGEX } from '../constants/regex.constants';
import { MESSAGES } from '../constants/messages.constants';

export class ValidatorsUtil {
  static validateEmail(email: string): boolean {
    return REGEX.EMAIL.test(email);
  }

  static validateUsername(username: string): boolean {
    return REGEX.USERNAME.test(username);
  }

  static validatePassword(
    password: string,
    minLength: number = 8,
  ): {
    valid: boolean;
    message?: string;
  } {
    if (password.length < minLength) {
      return {
        valid: false,
        message: MESSAGES.VALIDATION.WEAK_PASSWORD,
      };
    }

    if (!REGEX.PASSWORD.test(password)) {
      return {
        valid: false,
        message: 'Password must contain uppercase, lowercase, and numbers',
      };
    }

    return { valid: true };
  }

  static validatePhone(phone: string): boolean {
    return REGEX.PHONE.test(phone);
  }

  static validateUUID(uuid: string): boolean {
    return REGEX.UUID.test(uuid);
  }

  static validateSlug(slug: string): boolean {
    return REGEX.SLUG.test(slug);
  }
}