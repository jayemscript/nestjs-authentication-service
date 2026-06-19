export class AuthVerifyResponseDto {
  status!: number;
  message!: string;
  data!: {
    id: string;
    email: string;
    username: string;
    appId: string;
  };
}
