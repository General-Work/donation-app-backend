export enum User_Role {
  Client = 'Client',
  Admin = 'Admin',
  SuperAdmin = 'Super Admin',
  Developer = 'Developer',
}

export enum Donation_Type {
  OneTime = 'One Time',
  Recurring = 'Recurring', // Regularly scheduled donations (e.g., monthly)
  InKind = 'In-Kind', // Donations in the form of goods or services
  Fundraiser = 'Fundraiser', // Donations raised during a specific campaign or event
  Pledge = 'Pledge',
}

export enum Payment_Status {
  paid = 'paid',
  notPaid = 'not paid',
}

export enum MOMO_PROVIDERS {
  mtn = 'mtn',
  telecel = 'vod',
  at = 'atl',
}

export enum PAYMENT_OPTIONS {
  momo = 'mobile_money',
  card = 'card',
  cash = 'cash',
}

export enum Withdrawal_Status {
  pending = 'pending',
  approved = 'approved',
  declined = 'declined',
}
