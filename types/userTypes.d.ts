export interface User {
  name: string;
  username: string;
  role: string;
}

export interface ChangedUser {
  name?: string;
  username: string;
  role: string;
}

export interface RegisterUser {
  name: string;
  username: string;
  password: string;
}
