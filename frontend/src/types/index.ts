export interface DocumentItem {
  id: string;
  filename: string;
  file_type: string;
  category: string;
  total_pages: number;
  word_count: number;
  char_count: number;
  chunks_count: number;
  has_summary: boolean;
  has_entities: boolean;
}

export interface DocumentPage {
  page_number: number;
  text: string;
  tables: string[][][];
}

export interface DocumentChunk {
  chunk_id: string;
  page_number: number;
  text: string;
  word_count?: number;
}

export interface ActionItem {
  item: string;
  owner: string;
  deadline: string;
}

export interface ExecutiveSummary {
  title: string;
  executive_summary: string;
  risk_score: 'Low' | 'Medium' | 'High' | string;
  key_takeaways: string[];
  action_items: ActionItem[];
}

export interface ExtractedEntity {
  category: 'Financial' | 'Dates' | 'Parties' | 'Obligations' | 'Legal & Risk' | 'Clinical Metrics' | 'Trial Parameters' | 'Hardware & Compute' | 'Regulatory' | 'Guidance' | string;
  name: string;
  detail: string;
  page: number;
}

export interface DocumentDetail extends DocumentItem {
  pages: DocumentPage[];
  full_text: string;
  chunks: DocumentChunk[];
  summary?: ExecutiveSummary | null;
  entities?: ExtractedEntity[] | null;
}

export interface Citation {
  page: number;
  snippet: string;
  chunk_id: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  mode?: 'live' | 'demo' | 'fallback';
  timestamp: string;
}

export interface DiffChange {
  section: string;
  type: 'Modified' | 'Added' | 'Removed' | string;
  severity: 'Low' | 'Medium' | 'High' | string;
  old_value: string;
  new_value: string;
  analysis: string;
}

export interface DiffResult {
  doc1_title: string;
  doc2_title: string;
  changes: DiffChange[];
}
