export type FileDrive = {
  id: string;
  name: string;
  fileType: string;
  parents?: string[];
  media?: string;
  isRestrict?: boolean;
  whitelist?: string[];
}

export type FileResponseSuccess = {
  status: number;
  message: string;
  file?: FileDrive;
  files?: FileDrive[];
}

export type FileResponseError = {
  status: number;
  message: string;
  error?: string;
}