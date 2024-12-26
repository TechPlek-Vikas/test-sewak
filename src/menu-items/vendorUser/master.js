// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { AddCircle, Car, Eye, Location, MenuBoard, Profile2User } from 'iconsax-react';
import { MODULE, PERMISSIONS } from 'constant';

// icons
const icons = {
  samplePage: MenuBoard,
  zone: Location,
  role: Profile2User,
  view: Eye,
  add: AddCircle,
  cab: Car
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const master = {
  id: 'group-master',
  title: <FormattedMessage id="master" />,
  type: 'group',
  icon: icons.samplePage,
  children: [
    // Role
    {
      id: 'role',
      title: <FormattedMessage id="role" />,
      type: 'collapse',
      icon: icons.role,
      children: [
        {
          id: 'view',
          title: <FormattedMessage id="view" />,
          type: 'item',
          url: '/master/role'
          // icon: icons.view
        }
      ]
    }
  ]
};

export default master;
