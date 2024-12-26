// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Buliding, Car, MenuBoard, Profile, User } from 'iconsax-react';
import { MODULE, PERMISSIONS } from 'constant';

// icons
const icons = {
  samplePage: MenuBoard,
  user:User,
  company:Buliding,
  driver:Profile,
  cab:Car,
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const management = {
  id: 'group-management',
  title: <FormattedMessage id="management" />,
  type: 'group',
  icon: icons.samplePage,
  children: [
    // // User
    // {
    //   id: 'user',
    //   title: <FormattedMessage id="user" />,
    //   type: 'item',
    //   url: '/management/user/view',
    //   icon: icons.user,
    //   // children: [
    //   //   {
    //   //     id: 'view',
    //   //     title: <FormattedMessage id="view" />,
    //   //     type: 'item',
    //   //     url: '/management/user/view',
    //   //     // icon: icons.samplePage
    //   //   },
    //   //   {
    //   //     id: 'create',
    //   //     title: <FormattedMessage id="create user" />,
    //   //     type: 'item',
    //   //     url: '/management/user/add-user',
    //   //     // icon: icons.samplePage
    //   //   }
    //   // ]
    // },

    // Company
    {
      id: 'company',
      title: <FormattedMessage id="company" />,
      type: 'item',
      url: '/management/company/view',
      icon: icons.company,
      // children: [
      //   {
      //     id: 'view',
      //     title: <FormattedMessage id="view" />,
      //     type: 'item',
      //     url: '/management/company/view',
      //     // icon: icons.samplePage
      //   }
      // ]
    },

    // Driver
    {
      id: 'driver',
      title: <FormattedMessage id="driver" />,
      type: 'item',
      url: '/management/driver/view',
      icon: icons.driver,
      // children: [
      //   {
      //     id: 'view',
      //     title: <FormattedMessage id="view" />,
      //     type: 'item',
      //     url: '/management/driver/view',
      //     // icon: icons.samplePage
      //   }
      // ]
    },

    // Cab
    {
      id: 'cab',
      title: <FormattedMessage id="cab" />,
      type: 'item',
      url: '/management/cab/view',
      icon: icons.cab,
      // children: [
      //   {
      //     id: 'view',
      //     title: <FormattedMessage id="view" />,
      //     type: 'item',
      //     url: '/management/cab/view',
      //     // icon: icons.samplePage
      //   },
      //   {
      //     id: 'create-cab',
      //     title: <FormattedMessage id="add cab" />,
      //     type: 'item',
      //     url: '/management/cab/add-cab',
      //     // icon: icons.samplePage
      //   }
      // ]
    }
  ]
};

export default management;
