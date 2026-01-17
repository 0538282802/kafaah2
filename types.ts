
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  TECHNICIAN = 'TECHNICIAN',
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  INCOMPLETE = 'INCOMPLETE',
  REACTIVATED = 'REACTIVATED'
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  CASH_PENDING = 'CASH_PENDING'
}

export interface MaintenanceRequest {
  id: string;
  serviceType: string;
  description: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  location: { 
    lat: number; 
    lng: number; 
    address: string;
    googleMapsUrl?: string;
  };
  estimatedCost: number;
  partsRequested: boolean;
  status: RequestStatus;
  paymentStatus: PaymentStatus;
  date: string;
  appointmentTime?: string;
  technicianName?: string;
  customerName?: string;
  customerPhone?: string; // الحقل الجديد للفلترة والخصوصية
  phoneOrCode?: string;    // لتسهيل تواصل الفني
  incompleteReason?: string;
  incompleteNotes?: string;
  paymentMethod?: string;
  warrantyExpiryDate?: string;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  phoneOrCode: string;
  location?: { lat: number; lng: number; address: string };
}
