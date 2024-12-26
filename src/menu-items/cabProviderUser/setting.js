// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Bill, MenuBoard, Setting2 } from 'iconsax-react';
import { SiGooglesheets } from 'react-icons/si';
import { CiSettings } from 'react-icons/ci';
import { MdManageAccounts } from 'react-icons/md';


// icons
const icons = {
  samplePage: MenuBoard,
  setting: Setting2,
  invoice: Bill,
  rosterSetting: CiSettings,
  rosterTemplate: SiGooglesheets,
  account: MdManageAccounts
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const setting = {
  id: 'group-setting',
  title: <FormattedMessage id="setting" />,
  type: 'group',
  icon: icons.samplePage,
  children: [
    // Account Setting
    {
      id: 'account-setting',
      title: <FormattedMessage id="account setting" />,
      type: 'item',
      icon: icons.account,
      url: '/settings/account'
    },

    // User Setting
    {
      id: 'user-setting',
      title: <FormattedMessage id="user-setting" />,
      type: 'collapse',
      icon: icons.setting,
      children: [
        // User Setting
        {
          id: 'user',
          title: <FormattedMessage id="user" />,
          type: 'item',
          url: '/management/user/view',
          icon: icons.user
        },

        // Role Setting
        {
          id: 'role',
          title: <FormattedMessage id="role" />,
          type: 'item',
          url: '/master/role',
          icon: icons.role
        }
      ]
    },

    // Invoice Setting
    {
      id: 'invoice-setting',
      title: <FormattedMessage id="invoice setting" />,
      type: 'item',
      icon: icons.invoice,
      url: '/settings/invoice'
    },

    // Roster Setting
    {
      id: 'roster-setting',
      title: <FormattedMessage id="roster setting" />,
      type: 'collapse',
      icon: icons.rosterSetting,
      children: [
        {
          id: 'create-template',
          title: <FormattedMessage id="create template" />,
          type: 'item',
          url: '/settings/roster/create-template',
          icon: icons.rosterTemplate
        }
      ]
    }
  ]
};

export default setting;
