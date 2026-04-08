export interface JwtPayload {
  sub: number;
  email: string | null;
  phoneNumber: string | null;
}
