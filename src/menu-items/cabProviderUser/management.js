// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { AddCircle, Buliding, Car, Eye, MenuBoard, Profile, Profile2User, User } from 'iconsax-react';

// icons
const icons = {
  samplePage: MenuBoard,
  user: User,
  company: Buliding,
  driver: Profile,
  vehicle: Car,
  vendor: Profile2User,
  view: Eye,
  add: AddCircle
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const management = {
  id: 'group-management',
  title: <FormattedMessage id="management" />,
  type: 'group',
  icon: icons.samplePage,
  children: [
    // User
    // {
    //   id: 'user',
    //   title: <FormattedMessage id="user" />,
    //   type: 'collapse',
    //   // url: '/management/user/dashboard',
    //   icon: icons.user,
    //   children: [
    //     {
    //       id: 'view',
    //       title: <FormattedMessage id="view" />,
    //       type: 'item',
    //       url: '/management/user/view',
    //       // icon: icons.view
    //     },
    //     {
    //       id: 'create',
    //       title: <FormattedMessage id="create user" />,
    //       type: 'item',
    //       url: '/management/user/add-user',
    //       // icon: icons.add
    //     }
    //   ]
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
      //     // icon: icons.view
      //   },
      //   {
      //     id: 'create-company',
      //     title: <FormattedMessage id="add company" />,
      //     type: 'item',
      //     url: '/management/company/add-company',
      //     // icon: icons.add
      //   },
      //   {
      //     id: 'create-branch-company',
      //     title: <FormattedMessage id="add company branch" />,
      //     type: 'item',
      //     url: '/management/company/add-company-branch',
      //     // icon: icons.add
      //   },
      //   {
      //     id: 'create-company-rate',
      //     title: <FormattedMessage id="add company rate" />,
      //     type: 'item',
      //     url: '/management/company/add-company-rate',
      //     // icon: icons.add
      //   }
      // ]
    },

    // Vendor
    {
      id: 'vendor',
      title: <FormattedMessage id="vendor" />,
      type: 'item',
      url: '/management/vendor/view',
      icon: icons.vendor
      // children: [
      //   {
      //     id: 'view',
      //     title: <FormattedMessage id="view" />,
      //     type: 'item',
      //     url: '/management/vendor/view',
      //     // icon: icons.view
      //   },
      //   {
      //     id: 'create-vendor',
      //     title: <FormattedMessage id="add vendor" />,
      //     type: 'item',
      //     url: '/management/vendor/add-vendor',
      //     // icon: icons.add
      //   },
      //   {
      //     id: 'create-vendor-rate',
      //     title: <FormattedMessage id="add vendor rate" />,
      //     type: 'item',
      //     url: '/management/vendor/add-vendor-rate',
      //     // icon: icons.add
      //   },
      //   {
      //     id: 'view-vendor-rate',
      //     title: <FormattedMessage id="view-vendor-rate" />,
      //     type: 'item',
      //     url: '/management/vendor/view-vendor-rate'
      //   }
      // ]
    },

    // Driver
    {
      id: 'driver',
      title: <FormattedMessage id="driver" />,
      type: 'item',
      url: '/management/driver/view',
      icon: icons.driver
      // children: [
      //   {
      //     id: 'view',
      //     title: <FormattedMessage id="view" />,
      //     type: 'item',
      //     url: '/management/driver/view',
      //     // icon: icons.view
      //   },
      //   {
      //     id: 'create-driver-rate',
      //     title: <FormattedMessage id="add driver rate" />,
      //     type: 'item',
      //     url: '/management/driver/add-driver-rate',
      //     // icon: icons.add
      //   },
      //   {
      //     id: 'view-driver-rate',
      //     title: <FormattedMessage id="view-driver-rate" />,
      //     type: 'item',
      //     url: '/management/driver/view-driver-rate'
      //   }
      // ]
    },

    // Cab
    {
      id: 'cab',
      title: <FormattedMessage id="cab" />,
      type: 'item',
      url: '/management/cab/view',
      icon: icons.vehicle
      // children: [
      //   {
      //     id: 'view',
      //     title: <FormattedMessage id="view" />,
      //     type: 'item',
      //     url: '/management/cab/view',
      //     // icon: icons.view
      //   },
      //   {
      //     id: 'create-cab',
      //     title: <FormattedMessage id="add cab" />,
      //     type: 'item',
      //     url: '/management/cab/add-cab',
      //     // icon: icons.add
      //   }
      // ]
    }
  ]
};

export default management;
