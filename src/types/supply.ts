export interface SupplyItem {
  name: string;
  quantity: number;
  supplier?: string;
  notes?: string;
}

export interface Supply {
  id?: string;
  title: string;
  name: string; // Keeping for backward compatibility
  quantity: number;
  supplier?: string;
  notes?: string;
  etaDate?: string;
  status: 'planned' | 'in_transit' | 'arrived';
  items: SupplyItem[];
  createdAt?: Date;
  updatedAt?: Date;
}
