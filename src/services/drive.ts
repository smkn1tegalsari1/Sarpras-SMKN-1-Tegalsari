// Google Workspace OAuth Scopes configured for Google Drive integration
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
];

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  createdTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  owners?: { displayName: string; emailAddress: string; photoLink?: string }[];
  shared?: boolean;
  starred?: boolean;
  trashed?: boolean;
}

// In-memory token cache to adhere to Workspace Skill (No localStorage for tokens)
let inMemoryAccessToken: string | null = null;

export const setCachedDriveToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getCachedDriveToken = (): string | null => {
  return inMemoryAccessToken;
};

// List files from Google Drive
export async function listDriveFiles(
  accessToken: string,
  options?: {
    q?: string;
    pageSize?: number;
    pageToken?: string;
    orderBy?: string;
    fields?: string;
  }
): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  const params = new URLSearchParams();
  const defaultFields =
    'nextPageToken, files(id, name, mimeType, size, modifiedTime, createdTime, webViewLink, webContentLink, iconLink, thumbnailLink, owners, shared, starred, trashed)';
  params.set('fields', options?.fields || defaultFields);
  params.set('pageSize', String(options?.pageSize || 30));
  params.set('supportsAllDrives', 'true');
  params.set('includeItemsFromAllDrives', 'true');

  let query = 'trashed = false';
  if (options?.q) {
    query += ` and (${options.q})`;
  }
  params.set('q', query);

  if (options?.orderBy) {
    params.set('orderBy', options.orderBy);
  } else {
    params.set('orderBy', 'folder,modifiedTime desc');
  }

  if (options?.pageToken) {
    params.set('pageToken', options.pageToken);
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal mengambil berkas Drive: ${response.statusText}`);
  }

  return response.json();
}

// Create a folder in Google Drive
export async function createDriveFolder(
  accessToken: string,
  name: string,
  parentFolderId?: string
): Promise<DriveFile> {
  const metadata: { name: string; mimeType: string; parents?: string[] } = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const response = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal membuat folder: ${response.statusText}`);
  }

  return response.json();
}

// Upload a file (Blob / File) with multipart upload to Google Drive
export async function uploadDriveFile(
  accessToken: string,
  file: File | Blob,
  fileName: string,
  parentFolderId?: string,
  mimeType?: string
): Promise<DriveFile> {
  const metadata: { name: string; mimeType?: string; parents?: string[] } = {
    name: fileName,
  };
  if (mimeType) {
    metadata.mimeType = mimeType;
  }
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json; charset=UTF-8' })
  );
  form.append('file', file);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,mimeType,size,webViewLink,webContentLink,modifiedTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal mengunggah berkas ke Drive: ${response.statusText}`);
  }

  return response.json();
}

// Delete file from Google Drive (Requires user confirmation before invoking)
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<void> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?supportsAllDrives=true`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal menghapus berkas Drive: ${response.statusText}`);
  }
}
