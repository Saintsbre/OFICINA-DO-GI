import { FieldValue } from 'firebase/firestore';

export type UserProfile = {
  id: string;
  firebaseAuthUid: string;
  name: string;
  email: string;
  role: 'admin' | 'mechanic';
}

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
}

export type Part = {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  stockQuantity: number;
  minStockQuantity: number;
}

export type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export type Vehicle = {
  id: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  vin?: string;
}

export type ServiceOrderStatus = 'open' | 'in progress' | 'completed' | 'cancelled';

export type ServiceOrder = {
  id: string;
  customerId: string;
  vehicleId: string;
  mechanicId: string;
  issueDate: FieldValue;
  completionDate?: FieldValue;
  status: ServiceOrderStatus;
  serviceLineItems: any[]; // Define more specific type later
  partLineItems: any[]; // Define more specific type later
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'partially paid';
  notes?: string;
}

export type FinancialTransaction = {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: FieldValue;
  relatedServiceOrderId?: string;
  category: string;
}
