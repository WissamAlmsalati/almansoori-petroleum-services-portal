import api from './api';

// Types for Document Archive
export interface DocumentArchive {
  id: number;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  client_id: number;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
  is_public: boolean;
  expiry_date?: string;
  download_count: number;
  created_at: string;
  updated_at: string;
  client?: {
    id: number;
    name: string;
  };
}

export interface CreateDocumentData {
  file: File;
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  client_id: number;
  is_public?: boolean;
  expiry_date?: string;
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  client_id?: number;
  is_public?: boolean;
  expiry_date?: string;
  file?: File;
}

export interface DocumentFilters {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  category?: string;
  client_id?: number;
  search?: string;
  public_only?: boolean;
  expired_only?: boolean;
}

export interface DocumentStats {
  total_documents: number;
  total_size: number;
  categories_count: number;
  public_documents: number;
  private_documents: number;
  expired_documents: number;
  recent_uploads: number;
}

export interface DocumentResponse {
  success: boolean;
  data: DocumentArchive | DocumentArchive[];
  message: string;
}

export interface DownloadResponse {
  success: boolean;
  data: {
    download_url: string;
    public_download_url: string;
    file_name: string;
  };
  message: string;
}

class DocumentArchiveService {
  private baseUrl = '/documents';

  async getDocuments(filters?: DocumentFilters): Promise<DocumentArchive[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      console.log('Documents API response:', response);
      
      // Handle different response structures
      let data;
      if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data.success && response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
        data = response.data.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else {
        console.warn('Unexpected API response structure:', response.data);
        data = [];
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async getDocument(id: string): Promise<DocumentArchive> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }

  async getDocumentCategories(): Promise<string[]> {
    try {
      const response = await api.get(`${this.baseUrl}/categories`);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error fetching document categories:', error);
      throw error;
    }
  }

  async getDocumentStats(): Promise<DocumentStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error fetching document stats:', error);
      throw error;
    }
  }

  async uploadDocument(data: CreateDocumentData): Promise<DocumentArchive> {
    try {
      console.log('Uploading document with data:', data);
      
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      formData.append('category', data.category);
      if (data.tags) {
        data.tags.forEach(tag => formData.append('tags[]', tag));
      }
      formData.append('client_id', data.client_id.toString());
      formData.append('is_public', (data.is_public || false).toString());
      if (data.expiry_date) formData.append('expiry_date', data.expiry_date);

      const response = await api.post(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Document upload response:', response);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async bulkUploadDocuments(files: File[], category: string, tags: string[], clientId: number, isPublic: boolean = false): Promise<DocumentArchive[]> {
    try {
      console.log('Bulk uploading documents:', { files: files.length, category, tags, clientId, isPublic });
      
      const formData = new FormData();
      files.forEach(file => formData.append('files[]', file));
      formData.append('category', category);
      tags.forEach(tag => formData.append('tags[]', tag));
      formData.append('client_id', clientId.toString());
      formData.append('is_public', isPublic.toString());

      const response = await api.post(`${this.baseUrl}/bulk-upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Bulk upload response:', response);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error bulk uploading documents:', error);
      throw error;
    }
  }

  async updateDocument(id: string, data: UpdateDocumentData): Promise<DocumentArchive> {
    try {
      console.log('Updating document with data:', data);
      
      if (data.file) {
        // Update with file
        const formData = new FormData();
        formData.append('file', data.file);
        if (data.title) formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        if (data.category) formData.append('category', data.category);
        if (data.tags) {
          data.tags.forEach(tag => formData.append('tags[]', tag));
        }
        if (data.client_id) formData.append('client_id', data.client_id.toString());
        if (data.is_public !== undefined) formData.append('is_public', data.is_public.toString());
        if (data.expiry_date) formData.append('expiry_date', data.expiry_date);

        const response = await api.put(`${this.baseUrl}/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('Document update with file response:', response);
        return response.data.success ? response.data.data : response.data;
      } else {
        // Update without file
        const response = await api.put(`${this.baseUrl}/${id}`, data);
        
        console.log('Document update response:', response);
        return response.data.success ? response.data.data : response.data;
      }
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async bulkDeleteDocuments(documentIds: number[]): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/bulk-delete`, {
        data: { document_ids: documentIds }
      });
    } catch (error) {
      console.error('Error bulk deleting documents:', error);
      throw error;
    }
  }

  async getDocumentsByClient(clientId: string): Promise<DocumentArchive[]> {
    try {
      const response = await api.get(`${this.baseUrl}/client/${clientId}`);
      console.log('Documents by client API response:', response);
      
      // Handle different response structures
      let data;
      if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data.success && response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
        data = response.data.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else {
        console.warn('Unexpected API response structure:', response.data);
        data = [];
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching documents by client:', error);
      throw error;
    }
  }

  async getDownloadUrl(id: string): Promise<DownloadResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/download`);
      return response.data;
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  }

  async downloadDocument(id: string): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/download-direct`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  async previewDocument(id: string): Promise<string> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/preview`);
      return response.data.success ? response.data.data.preview_url : response.data.preview_url;
    } catch (error) {
      console.error('Error getting document preview:', error);
      throw error;
    }
  }
}

export default new DocumentArchiveService(); 