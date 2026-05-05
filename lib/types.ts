export interface FileShare {
  id: string;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  share_slug: string;
  delete_token_hash: string;
  expires_at: string;
  download_count: number;
  created_at: string;
}

export interface UploadInitResponse {
  signedUploadUrl: string;
  storagePath: string;
  shareSlug: string;
  token: string;
}

export type ExpiryOption = "1h" | "24h" | "7d";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}
