// export const credentials = {
//   username: 'Trupti',
//   password: 'Trupti@123'
// };

// export const credentials = {
//   email: 'amit@gmail.com',
//   password: 'Amit@123'
// };
export const credentials = {
  email: 'user123@gmail.com',
  password: 'User@123'
};

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER_MIS: 'MANAGER_MIS',
  ACCOUNTANT_FINANCE: 'ACCOUNTANT_FINANCE',
  SUPERVISOR: 'SUPERVISOR',
  CLIENT: 'CLIENT',
  CLIENT_HR_ADMIN: 'CLIENT_HR_ADMIN',
  VENDOR: 'VENDOR',
  VENDOR_SUPERVISOR: 'VENDOR_SUPERVISOR',
  DRIVER: 'DRIVER'
};

export const USERTYPE = {
  iscabProvider: 1,
  isVendor: 2,
  isDriver: 3,
  isCompanyUser: 4,
  superAdmin: 5,
  isVendorUser: 6,
  iscabProviderUser: 7,
  isCompanyAdminUser: 8
};

const UserTypeNames = {
  iscabProvider: 'Cab Provider',
  isVendor: 'Vendor',
  isDriver: 'Driver',
  isCompanyUser: 'Company User',
  // superAdmin: 'Super Admin',
  isVendorUser: 'Vendor User',
  iscabProviderUser: 'Cab Provider User',
  isCompanyAdminUser: 'Company Admin User'
};

export const MAPPING_USER_TYPE_NAMES = {
  'Cab Provider': 1,
  Vendor: 2,
  Driver: 3,
  'Company User': 4,
  'Super Admin': 5,
  'Vendor User': 6,
  'Cab Provider User': 7,
  'Company Admin User': 8
};

export const AvailableUserTypeOptions = Object.values(UserTypeNames);

// export const DEFAULT_HOME_PAGE_BASED_ON_ROLES = {
//   ADMIN: '/dashboard',
//   DRIVER: '/driver-management',
//   VENDOR: '/vendor-management'
// };
export const DEFAULT_HOME_PAGE_BASED_ON_ROLES = {
  7: '/profile',
  6: '/profile',
  5: '/dashboard',
  3: '/driver-management',
  2: '/profile',
  1: '/profile'
};

export const PermissionsEnum = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  WRITE: 'WRITE',
  READWRITE: 'READWRITE'
};

export const AvailablePermissions = Object.values(PermissionsEnum);

export const StatusOptionEnum = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

export const AvailableStatusOptions = Object.values(StatusOptionEnum);

export const PAN_CARD_REGEX_PATTERN = /^[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/;

export const GSTIN_NUMBER_REGEX_PATTERN = /^[A-Z0-9]{15}$/;

export const EMAIL_REGEX_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PIN_CODE_REGEX_PATTERN = /^[1-9][0-9]{5}$/;

export const MOBILE_NUMBER_REGEX_PATTERN = /^\d{10}$/; // Matches exactly 10 digits

export const DOCUMENT_TITLE = {
  '/landing': 'Landing',
  '/login': 'Login',
  '/register': 'Register',
  '/dashboard': 'Dashboard',
  '/driver-management': 'Manage Driver',
  '/vendor-management': 'Manage Vendor',
  '/company-management': 'Manage Company',
  '/user-management': 'Manage User',
  '/role-management': 'Manage Role',
  '/vehicle-management': 'Manage Vehicle',
  '/contract-management': 'Manage Contract',
  '/zone-management/zone': 'Manage Zone',
  '/zone-management/zoneType': 'Manage Zone Type'
};

// ######################################## OTHER CONSTANT ###################################
export const MAX_TEXTFIELD_LENGTH = 100;

export const GENDER = {
  MALE: 'Male',
  FEMALE: 'Female'
  // OTHER: 'Other'
};

export const ACTION = {
  DELETE: 'delete',
  EDIT: 'edit',
  CREATE: 'create',
  VIEW: 'view'
};

export const FUEL_TYPE = {
  1: 'Petrol',
  2: 'Diesel',
  3: 'CNG',
  4: 'Electric Vehicles'
};

export const PERMISSIONS = {
  CREATE: 'Create',
  READ: 'Read',
  UPDATE: 'Update',
  DELETE: 'Delete'
};

export const AVAILABLE_PERMISSION = Object.values(PermissionsEnum);

export function getCaseInsensitiveValue(obj, key) {
  const matchedKey = Object.keys(obj).find((k) => k.toLowerCase() === key.toLowerCase());
  return matchedKey ? obj[matchedKey] : undefined;
}

export const MODULE = {
  ROSTER: 'Roster',
  DASHBOARD: 'Dashboard',
  USER: 'User',
  COMPANY: 'Company',
  VENDOR: 'Vendor',
  DRIVER: 'Driver',
  CAB: 'Cabs',

  ROLE: 'Role',
  ZONE: 'Zone',
  TRIP: 'Trip',
  ZONE_TYPE: 'ZoneType',
  STATE_TAX: 'stateTax',
  TAX_CHARGE: 'taxCharges',
  CAB_TYPE: 'CabType',
  CAB_RATE: 'CabRate',
  CAB_RATE_VENDOR: 'vendorCabRate',
  CAB_RATE_DRIVER: 'driverCabRate',

  INVOICE: 'Invoice',
  REPORT: 'Reports',
  LOAN: 'Loan',
  ADVANCE: 'Advance',
  ADVANCE_TYPE: 'AdvanceType',

  USER_SETTING: 'userSettings',
  INVOICE_SETTING: 'invoiceSettings',
  ROSTER_SETTING: 'rosterSettings',
  LOG: 'Logs'
};
