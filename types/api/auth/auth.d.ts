export interface UserSession {
  id: string;
  name: string;
  username: string;
  image: string;
  role: string;
}

export interface SessionType {
  user: UserSession;
  expires: string;
}