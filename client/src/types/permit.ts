// Permit data type matching your specification
export interface PermitRecord {
  id: string;
  address: string;
  city: string;
  type: string;           // Building/Electrical/Plumbing/DP/etc.
  status: string;         // Issued/Approved/Pending/Closed
  submittedDate?: string; // ISO
  issuedDate?: string;    // ISO
  lat?: number;
  lng?: number;
  source: string;         // URL
  sourceUpdatedAt?: string;
}

export interface SmartFetchResponse {
  ok: boolean;
  payload: PermitRecord[] | any;
  confidence: number;
  provenance: Array<{
    source: string;
    ok: boolean;
    data: any;
    fetched_at: number;
  }>;
  notes?: string;
}