// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Receipt1 } from 'iconsax-react';

// icons
const icons = {
    subscription:Receipt1,
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const subscription = {
  id: 'subscription-setting',
  title: <FormattedMessage id="subscription" />,
  type: 'group',
  icon: icons.subscription,
  children: [
    {
      id: 'subscription',
      title: <FormattedMessage id="subscription" />,
      type: 'item',
      icon: icons.subscription,
      url: '/subscription/subscription-list'
    }
  ]
};

export default subscription;
