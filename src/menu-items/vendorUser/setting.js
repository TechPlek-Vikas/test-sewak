// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Bill, MenuBoard, Setting2 } from 'iconsax-react';

// icons
const icons = {
  samplePage: MenuBoard,
  setting: Setting2,
  invoice: Bill
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const setting = {
  id: 'setting',
  title: <FormattedMessage id="setting" />,
  type: 'group',
  icon: icons.samplePage,
  children: [
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
    }
  ]
};

export default setting;
