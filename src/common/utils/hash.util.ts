//src/common/utils/hash.util.ts
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

export class HashUtil {
  static async hashPassword(
    password: string,
    rounds: number = 10,
  ): Promise<string> {
    return bcrypt.hash(password, rounds);
  }

  static async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateRandomHash(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
