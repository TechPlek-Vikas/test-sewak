/* eslint-disable no-unused-vars */
// project-imports

import { USERTYPE } from 'constant';
import invoice from './cabProvider/invoices';
import management from './cabProvider/management';
import master from './cabProvider/master';
import reports from './cabProvider/reports';
import roster from './cabProvider/roster';
import vendorMenuItems from './vendor';
import cabProviderMenuItems from './cabProvider1';
import cabProviderUserMenuItems from './cabProviderUser';
import vendorUserMenuItems from './vendorUser';
import superAdminMenuItems from './superAdmin';
// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [roster, management, invoice, reports, master]
  // items: [roster]
};

export default menuItems;

const MENU_ITEM = {
  [USERTYPE.iscabProvider]: cabProviderMenuItems,
  [USERTYPE.isVendor]: vendorMenuItems,
  [USERTYPE.iscabProviderUser]: cabProviderUserMenuItems,
  [USERTYPE.isVendorUser]: vendorUserMenuItems,
  [USERTYPE.superAdmin]: superAdminMenuItems,
};

export const getMenuItems = (userType) => {
  // console.log(`🚀 ~ getMenuItems ~ userType:`, userType);
  return (
    MENU_ITEM[userType] || {
      items: []
    }
  );
};
