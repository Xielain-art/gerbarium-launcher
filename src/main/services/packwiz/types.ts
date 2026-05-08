export type SupportedHashFormat = "sha1" | "sha256" | "sha512" | "md5";

export type PackwizPack = {
  name?: string;
  author?: string;
  version?: string;
  packFormat?: string;
  index: {
    file: string;
    hashFormat?: string;
    hash?: string;
  };
  versions?: {
    minecraft?: string;
    fabric?: string;
    [key: string]: string | undefined;
  };
};

export type PackwizIndexFile = {
  file: string;
  hash?: string;
  hashFormat?: string;
  alias?: string;
  metafile?: boolean;
  preserve?: boolean;
};

export type PackwizIndex = {
  hashFormat?: string;
  files: PackwizIndexFile[];
};

export type PackwizDownload = {
  url?: string;
  hashFormat?: string;
  hash?: string;
  mode?: string;
};

export type PackwizModFile = {
  name?: string;
  filename?: string;
  side?: "client" | "server" | "both";
  download?: PackwizDownload;
  option?: unknown;
  update?: unknown;
};

export type PackwizResolvedFile = {
  localPath: string;
  displayPath: string;
  downloadUrl: string;
  hash: string;
  hashFormat: string;
  source: "index" | "metafile";
};
