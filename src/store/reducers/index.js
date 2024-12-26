// third-party
import { combineReducers } from 'redux';

// project-imports
import menu from './menu';
import snackbar from './snackbar';
import authReducer from './auth';
import { companyReducer } from 'store/slice/cabProvidor/companySlice';
import { vendorReducer } from 'store/slice/cabProvidor/vendorSlice';
import { driverReducer } from 'store/slice/cabProvidor/driverSlice';
import { userReducer } from 'store/slice/cabProvidor/userSlice';
import { zoneNameReducer } from 'store/slice/cabProvidor/ZoneNameSlice';
import { cabReducer } from 'store/slice/cabProvidor/cabSlice';
import { vehicleTypeReducer } from 'store/slice/cabProvidor/vehicleTypeSlice';
import { roleReducer } from 'store/slice/cabProvidor/roleSlice';
import { zoneTypeReducer } from 'store/slice/cabProvidor/zoneTypeSlice';
import { cabRateReducer } from 'store/slice/cabProvidor/cabRateSlice';
import { advanceReducer } from 'store/slice/cabProvidor/advanceSlice';
import { advanceTypeReducer } from 'store/slice/cabProvidor/advanceTypeSlice';
import { chatReducer } from './chat';
import { invoiceReducer } from './invoice';
import { rosterFileReducer } from 'store/slice/cabProvidor/rosterFileSlice';
import { rosterDataReducer } from 'store/slice/cabProvidor/rosterDataSlice';
import { dashboardReducer } from 'store/slice/cabProvidor/dashboardSlice';
import { invoicesReducer } from 'store/slice/cabProvidor/invoiceSlice';
import { accountSettingsReducer } from 'store/slice/cabProvidor/accountSettingSlice';
import { tripReducer } from 'store/slice/cabProvidor/tripSlice';
import { reportReducer } from 'store/slice/cabProvidor/reportSlice';
import { subscriptionReducer } from 'store/slice/cabProvidor/subscriptionSlice';
import { zoneCacheReducer } from 'store/cacheSlice/zoneCacheSlice';
import { companyRatesReducer } from 'store/cacheSlice/companyRatesSlice';
import { vehicleTypeReducer1 } from 'store/cacheSlice/vehicleTypes';

// ==============================|| COMBINE REDUCERS ||============================== //

const reducers = combineReducers({
  menu: menu,
  snackbar: snackbar,
  auth: authReducer,
  companies: companyReducer,
  vendors: vendorReducer,
  drivers: driverReducer,
  users: userReducer,
  zoneName: zoneNameReducer,
  zoneType: zoneTypeReducer,
  cabs: cabReducer,
  vehicleTypes: vehicleTypeReducer,
  roles: roleReducer,
  cabRate: cabRateReducer,
  advances: advanceReducer,
  advanceType: advanceTypeReducer,
  chat: chatReducer,
  invoice: invoiceReducer,
  rosterFile: rosterFileReducer,
  rosterData: rosterDataReducer,
  dashboard: dashboardReducer,
  invoices: invoicesReducer,
  accountSettings: accountSettingsReducer,
  trip: tripReducer,
  report: reportReducer,
  subscription: subscriptionReducer,
  zoneCache: zoneCacheReducer,
  companyRates: companyRatesReducer,
  vehicleType: vehicleTypeReducer1
});

export default reducers;
