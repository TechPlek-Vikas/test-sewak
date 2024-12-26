// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Category2 } from 'iconsax-react';

// icons
const icons = {
  dashboard:Category2,
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const dashboard = {
  id: 'group-setting',
  title: <FormattedMessage id="dashboard" />,
  type: 'group',
  icon: icons.dashboard,
  children: [
    {
      id: 'dashboard',
      title: <FormattedMessage id="dashboard" />,
      type: 'item',
      icon: icons.dashboard,
      url: '/dashboard'
    }
  ]
};

export default dashboard;
