export type FileDrive = {
  id: string;
  name: string;
  fileType: string;
  parents?: string[];
  media?: string;
  isRestrict?: boolean;
  whitelist?: string[];
}

export type ParentsFolder = {
  id: string;
  name: string;
  currentName?: string;
};

export type FileResponse = {
  status: number;
  message: string;
  id?: string;
  file?: FileDrive;
  files?: FileDrive[];
  parents?: ParentsFolder[];
  error?: string;
}
