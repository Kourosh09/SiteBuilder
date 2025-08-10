import { z } from "zod";

// Enhanced Zod schema for permit validation
export const PermitSchema = z.object({
  id: z.string(),
  address: z.string().min(3),
  city: z.string(),
  type: z.string().optional().default("Permit"),
  status: z.string().optional().default("Unknown"),
  submittedDate: z.string().datetime().optional().nullable(),
  issuedDate: z.string().datetime().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  source: z.string().url(),
  sourceUpdatedAt: z.string().datetime().optional().nullable(),
});

export type Permit = z.infer<typeof PermitSchema>;
export type PermitRecord = Permit; // Alias for backward compatibility

export interface SmartFetchResponse {
  ok: boolean;
  payload: Permit[] | any;
  confidence: number;
  provenance: Array<{
    source: string;
    ok: boolean;
    data: any;
    fetched_at: number;
  }>;
  notes?: string;
}