export class CommonResponseDto<T = unknown> {
  status!: number;
  message!: string;
  data?: T;
}
