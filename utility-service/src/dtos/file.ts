export interface UploadedFileDto {
  file: any | string;
  type: "File" | "Link";
  extension?: string;
}
