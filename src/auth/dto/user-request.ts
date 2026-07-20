export class UserRequest extends Request {
  user!: { userId: number };
  cookies?: { [key: string]: string };
}
