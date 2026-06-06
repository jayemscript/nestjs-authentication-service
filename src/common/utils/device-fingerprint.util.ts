//src/common/utils/device-fingerprint.util.ts
import { Request } from 'express';
import { DeviceType } from '../enums/device-type.enum';

export class DeviceFingerprintUtil {
  static extractDeviceInfo(req: Request): {
    deviceType: DeviceType;
    deviceName: string;
    userAgent: string;
    ipAddress: string;
  } {
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = this.getClientIp(req);
    const deviceType = this.detectDeviceType(userAgent);
    const deviceName = this.extractDeviceName(userAgent);

    return {
      deviceType,
      deviceName,
      userAgent,
      ipAddress,
    };
  }

  private static getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }

  private static detectDeviceType(userAgent: string): DeviceType {
    if (
      /mobile|android|iphone|ipod|blackberry|windows phone/i.test(userAgent)
    ) {
      return DeviceType.MOBILE;
    }
    if (/tablet|ipad|android|playbook/i.test(userAgent)) {
      return DeviceType.TABLET;
    }
    return DeviceType.DESKTOP;
  }

  private static extractDeviceName(userAgent: string): string {
    if (/iphone/i.test(userAgent)) return 'iPhone';
    if (/ipad/i.test(userAgent)) return 'iPad';
    if (/android/i.test(userAgent)) return 'Android Device';
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/macintosh/i.test(userAgent)) return 'Mac';
    if (/linux/i.test(userAgent)) return 'Linux';
    return 'Unknown Device';
  }

  static generateDeviceFingerprint(deviceInfo: any): string {
    const { userAgent, ipAddress } = deviceInfo;
    const crypto = require('crypto');
    return crypto
      .createHash('sha256')
      .update(`${userAgent}-${ipAddress}`)
      .digest('hex');
  }
}