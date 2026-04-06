export interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
  totalUnits: number;
  occupiedUnits: number;
  monthlyRevenue: number;
  image?: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  name: string;
  type: 'apartment' | 'room' | 'bed';
  status: 'occupied' | 'vacant' | 'reserved';
  rent: number;
  tenantId?: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  unitId: string;
  propertyId: string;
  propertyName: string;
  unitName: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  deposit: number;
  balance: number;
  status: 'active' | 'inactive' | 'pending';
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyName: string;
  unitName: string;
  amount: number;
  method: 'MTN MoMo' | 'Airtel Money' | 'Cash' | 'Bank Transfer';
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
  type: 'rent' | 'deposit' | 'maintenance';
}

export interface MaintenanceRequest {
  id: string;
  tenantName: string;
  propertyName: string;
  unitName: string;
  issue: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  dateSubmitted: string;
  dateResolved?: string;
}

export const properties: Property[] = [
  { id: '1', name: 'Kololo Heights', location: 'Kololo, Kampala', type: 'Apartments', totalUnits: 12, occupiedUnits: 10, monthlyRevenue: 18000000 },
  { id: '2', name: 'Ntinda Gardens', location: 'Ntinda, Kampala', type: 'Rental Rooms', totalUnits: 20, occupiedUnits: 17, monthlyRevenue: 8500000 },
  { id: '3', name: 'Muyenga Villas', location: 'Muyenga, Kampala', type: 'Apartments', totalUnits: 8, occupiedUnits: 8, monthlyRevenue: 24000000 },
  { id: '4', name: 'Entebbe Court', location: 'Entebbe', type: 'Mixed', totalUnits: 15, occupiedUnits: 11, monthlyRevenue: 9900000 },
  { id: '5', name: 'Jinja Road Flats', location: 'Jinja Road, Kampala', type: 'Bedsitters', totalUnits: 30, occupiedUnits: 25, monthlyRevenue: 12500000 },
];

export const tenants: Tenant[] = [
  { id: '1', name: 'Sarah Nakamya', phone: '+256 770 123 456', email: 'sarah@email.com', unitId: 'u1', propertyId: '1', propertyName: 'Kololo Heights', unitName: 'Apt 3A', leaseStart: '2024-01-01', leaseEnd: '2024-12-31', rentAmount: 1800000, deposit: 1800000, balance: 0, status: 'active' },
  { id: '2', name: 'James Okello', phone: '+256 780 234 567', unitId: 'u2', propertyId: '1', propertyName: 'Kololo Heights', unitName: 'Apt 5B', leaseStart: '2024-03-01', leaseEnd: '2025-02-28', rentAmount: 1500000, deposit: 1500000, balance: 750000, status: 'active' },
  { id: '3', name: 'Grace Auma', phone: '+256 750 345 678', email: 'grace@email.com', unitId: 'u3', propertyId: '2', propertyName: 'Ntinda Gardens', unitName: 'Room 12', leaseStart: '2024-06-01', leaseEnd: '2025-05-31', rentAmount: 450000, deposit: 450000, balance: 0, status: 'active' },
  { id: '4', name: 'Peter Mugisha', phone: '+256 700 456 789', unitId: 'u4', propertyId: '3', propertyName: 'Muyenga Villas', unitName: 'Villa 2', leaseStart: '2024-02-01', leaseEnd: '2025-01-31', rentAmount: 3000000, deposit: 3000000, balance: 1500000, status: 'active' },
  { id: '5', name: 'Fatuma Nabbanja', phone: '+256 760 567 890', unitId: 'u5', propertyId: '2', propertyName: 'Ntinda Gardens', unitName: 'Room 7', leaseStart: '2024-04-01', leaseEnd: '2025-03-31', rentAmount: 400000, deposit: 400000, balance: 400000, status: 'active' },
  { id: '6', name: 'David Ssempijja', phone: '+256 790 678 901', unitId: 'u6', propertyId: '4', propertyName: 'Entebbe Court', unitName: 'Unit 8', leaseStart: '2024-07-01', leaseEnd: '2025-06-30', rentAmount: 900000, deposit: 900000, balance: 0, status: 'active' },
  { id: '7', name: 'Agnes Nalwoga', phone: '+256 710 789 012', unitId: 'u7', propertyId: '5', propertyName: 'Jinja Road Flats', unitName: 'Flat 15', leaseStart: '2024-01-15', leaseEnd: '2025-01-14', rentAmount: 500000, deposit: 500000, balance: 250000, status: 'active' },
  { id: '8', name: 'Moses Kato', phone: '+256 770 890 123', unitId: 'u8', propertyId: '1', propertyName: 'Kololo Heights', unitName: 'Apt 7C', leaseStart: '2023-09-01', leaseEnd: '2024-08-31', rentAmount: 2000000, deposit: 2000000, balance: 0, status: 'inactive' },
];

export const payments: Payment[] = [
  { id: '1', tenantId: '1', tenantName: 'Sarah Nakamya', propertyName: 'Kololo Heights', unitName: 'Apt 3A', amount: 1800000, method: 'MTN MoMo', date: '2024-12-01', status: 'completed', reference: 'MM-2024-001', type: 'rent' },
  { id: '2', tenantId: '2', tenantName: 'James Okello', propertyName: 'Kololo Heights', unitName: 'Apt 5B', amount: 750000, method: 'Airtel Money', date: '2024-12-03', status: 'completed', reference: 'AM-2024-002', type: 'rent' },
  { id: '3', tenantId: '3', tenantName: 'Grace Auma', propertyName: 'Ntinda Gardens', unitName: 'Room 12', amount: 450000, method: 'Cash', date: '2024-12-05', status: 'completed', reference: 'CSH-2024-003', type: 'rent' },
  { id: '4', tenantId: '4', tenantName: 'Peter Mugisha', propertyName: 'Muyenga Villas', unitName: 'Villa 2', amount: 1500000, method: 'Bank Transfer', date: '2024-12-02', status: 'completed', reference: 'BT-2024-004', type: 'rent' },
  { id: '5', tenantId: '5', tenantName: 'Fatuma Nabbanja', propertyName: 'Ntinda Gardens', unitName: 'Room 7', amount: 200000, method: 'MTN MoMo', date: '2024-12-10', status: 'pending', reference: 'MM-2024-005', type: 'rent' },
  { id: '6', tenantId: '6', tenantName: 'David Ssempijja', propertyName: 'Entebbe Court', unitName: 'Unit 8', amount: 900000, method: 'MTN MoMo', date: '2024-12-01', status: 'completed', reference: 'MM-2024-006', type: 'rent' },
  { id: '7', tenantId: '7', tenantName: 'Agnes Nalwoga', propertyName: 'Jinja Road Flats', unitName: 'Flat 15', amount: 250000, method: 'Airtel Money', date: '2024-12-08', status: 'completed', reference: 'AM-2024-007', type: 'rent' },
  { id: '8', tenantId: '1', tenantName: 'Sarah Nakamya', propertyName: 'Kololo Heights', unitName: 'Apt 3A', amount: 1800000, method: 'MTN MoMo', date: '2024-11-01', status: 'completed', reference: 'MM-2024-008', type: 'rent' },
];

export const maintenanceRequests: MaintenanceRequest[] = [
  { id: '1', tenantName: 'Sarah Nakamya', propertyName: 'Kololo Heights', unitName: 'Apt 3A', issue: 'Leaking kitchen tap', priority: 'medium', status: 'in_progress', dateSubmitted: '2024-12-05' },
  { id: '2', tenantName: 'James Okello', propertyName: 'Kololo Heights', unitName: 'Apt 5B', issue: 'Broken window latch', priority: 'low', status: 'open', dateSubmitted: '2024-12-10' },
  { id: '3', tenantName: 'Peter Mugisha', propertyName: 'Muyenga Villas', unitName: 'Villa 2', issue: 'No hot water', priority: 'high', status: 'open', dateSubmitted: '2024-12-12' },
  { id: '4', tenantName: 'Grace Auma', propertyName: 'Ntinda Gardens', unitName: 'Room 12', issue: 'Electrical socket not working', priority: 'urgent', status: 'in_progress', dateSubmitted: '2024-12-08' },
  { id: '5', tenantName: 'Agnes Nalwoga', propertyName: 'Jinja Road Flats', unitName: 'Flat 15', issue: 'Ceiling paint peeling', priority: 'low', status: 'resolved', dateSubmitted: '2024-11-20', dateResolved: '2024-12-01' },
];

export const monthlyRevenueData = [
  { month: 'Jul', collected: 52000000, expected: 62000000 },
  { month: 'Aug', collected: 55000000, expected: 62000000 },
  { month: 'Sep', collected: 58000000, expected: 64000000 },
  { month: 'Oct', collected: 60000000, expected: 65000000 },
  { month: 'Nov', collected: 61000000, expected: 66000000 },
  { month: 'Dec', collected: 57000000, expected: 66000000 },
];

export const paymentMethodData = [
  { name: 'MTN MoMo', value: 45, color: 'hsl(48, 96%, 53%)' },
  { name: 'Airtel Money', value: 25, color: 'hsl(0, 72%, 51%)' },
  { name: 'Cash', value: 20, color: 'hsl(142, 52%, 36%)' },
  { name: 'Bank Transfer', value: 10, color: 'hsl(210, 80%, 52%)' },
];

export function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString('en-UG')}`;
}
