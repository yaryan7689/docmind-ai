import type { 
  DocumentItem, 
  DocumentDetail, 
  ExecutiveSummary, 
  ExtractedEntity, 
  DiffResult, 
  Citation 
} from '../types';

const API_BASE = '/api';

export const api = {
  async getProviders(): Promise<any> {
    const res = await fetch(`${API_BASE}/analysis/providers`);
    if (!res.ok) throw new Error('Failed to fetch provider info');
    return res.json();
  },

  async getDocuments(): Promise<DocumentItem[]> {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async getDocumentDetail(id: string): Promise<DocumentDetail> {
    const res = await fetch(`${API_BASE}/documents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch document detail');
    return res.json();
  },

  async uploadDocument(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete document');
  },

  async resetDemo(): Promise<void> {
    const res = await fetch(`${API_BASE}/documents/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset demo documents');
  },

  async getSummary(
    docId: string, 
    provider?: string, 
    apiKey?: string, 
    model?: string,
    forceRefresh?: boolean
  ): Promise<ExecutiveSummary> {
    const res = await fetch(`${API_BASE}/analysis/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        doc_id: docId, 
        provider, 
        api_key: apiKey, 
        model, 
        force_refresh: forceRefresh 
      }),
    });
    if (!res.ok) throw new Error('Failed to generate summary');
    return res.json();
  },

  async getEntities(
    docId: string, 
    provider?: string, 
    apiKey?: string, 
    model?: string,
    forceRefresh?: boolean
  ): Promise<{ entities: ExtractedEntity[] }> {
    const res = await fetch(`${API_BASE}/analysis/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        doc_id: docId, 
        provider, 
        api_key: apiKey, 
        model, 
        force_refresh: forceRefresh 
      }),
    });
    if (!res.ok) throw new Error('Failed to extract entities');
    return res.json();
  },

  async compareDocuments(
    docId1: string, 
    docId2: string, 
    provider?: string, 
    apiKey?: string
  ): Promise<DiffResult> {
    const res = await fetch(`${API_BASE}/analysis/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc_id_1: docId1, doc_id_2: docId2, provider, api_key: apiKey }),
    });
    if (!res.ok) throw new Error('Failed to compare documents');
    return res.json();
  },

  async streamChat(
    docId: string,
    query: string,
    history: Array<{ role: string; content: string }>,
    provider: string | undefined,
    apiKey: string | undefined,
    model: string | undefined,
    onChunk: (text: string) => void,
    onCitations: (citations: Citation[]) => void,
    onDone: (mode: string) => void,
    onError: (err: any) => void
  ) {
    try {
      const response = await fetch(`${API_BASE}/analysis/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc_id: docId,
          query,
          conversation_history: history,
          provider: provider || undefined,
          api_key: apiKey || undefined,
          model: model || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.type === 'citations' && data.citations) {
                onCitations(data.citations);
              } else if (data.type === 'delta' && data.text) {
                onChunk(data.text);
              } else if (data.type === 'done') {
                onDone(data.mode || 'live');
              }
            } catch (err) {
              console.warn('SSE parse error:', err);
            }
          }
        }
      }
    } catch (err) {
      onError(err);
    }
  },
};
