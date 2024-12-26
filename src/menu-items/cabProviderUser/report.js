// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { MenuBoard } from 'iconsax-react';

// icons
const icons = {
  samplePage: MenuBoard
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const report = {
  id: 'group-application',
  title: <FormattedMessage id="reports" />,
  type: 'group',
  icon: icons.samplePage,
  children: [
    // Report for cab provider
    {
      id: 'reports',
      title: <FormattedMessage id="reports" />,
      type: 'collapse',
      icon: icons.samplePage,
      children: [
        // Company
        {
          id: 'company1',
          title: <FormattedMessage id="company1" />,
          // type: 'collapse',
          type: 'item',
          url: '/reports/cabProvider/company-report'
          // icon: icons.samplePage
          // children: [
          //   {
          //     id: 'company report',
          //     title: <FormattedMessage id="company report" />,
          //     type: 'item',
          //     url: '/reports'
          //   }
          // ]
        },

        {
          id: 'cab-report1',
          title: <FormattedMessage id="cab" />,
          // type: 'collapse',
          type: 'item',
          url: '/reports/cabProvider/cab-report'
          // icon: icons.samplePage
        },

        // Advance
        {
          id: 'advance1',
          title: <FormattedMessage id="advance" />,
          // type: 'collapse',
          type: 'item',
          url: '/reports/cabProvider/advance-report'
          // icon: icons.samplePage
        }
        // {
        //   id: 'trip',
        //   title: <FormattedMessage id="trip" />,
        //   // type: 'collapse',
        //   type: 'item',
        //   url: '/reports/trip-report',
        //   icon: icons.samplePage
        // }

        // // Vendor
        // {
        //   id: 'vendor',
        //   title: <FormattedMessage id="vendor1" />,
        //   type: 'collapse',
        //   icon: icons.samplePage,
        //   children: [
        //     {
        //       id: 'cabreports',
        //       title: <FormattedMessage id="cabreports" />,
        //       type: 'item',
        //       url: '/reports'
        //     },
        //     {
        //       id: 'invoicereports',
        //       title: <FormattedMessage id="invoicereports" />,
        //       type: 'item',
        //       url: '/reports'
        //     },
        //     {
        //       id: 'mcdreports',
        //       title: <FormattedMessage id="mcdreports" />,
        //       type: 'item',
        //       url: '/reports'
        //     }
        //   ]
        // },
        // // Driver
        // {
        //   id: 'driver',
        //   title: <FormattedMessage id="driver1" />,
        //   type: 'collapse',
        //   icon: icons.samplePage,
        //   children: [
        //     {
        //       id: 'cabreports',
        //       title: <FormattedMessage id="cabreports" />,
        //       type: 'item',
        //       url: 'reports-driver'
        //     },
        //     {
        //       id: 'invoicereports',
        //       title: <FormattedMessage id="invoicereports" />,
        //       type: 'item',
        //       url: 'reports-driver'
        //     },
        //     {
        //       id: 'mcdreports',
        //       title: <FormattedMessage id="mcdreports" />,
        //       type: 'item',
        //       url: 'reports-driver'
        //     }
        //   ]
        // }
      ]
    },

    // Report for vendor
    {
      id: 'vendor-reports',
      title: <FormattedMessage id="vendor reports" />,
      type: 'collapse',
      icon: icons.samplePage,
      children: [
        // Company
        {
          id: 'company2',
          title: <FormattedMessage id="company1" />,
          // type: 'collapse',
          type: 'item',
          url: '/reports/vendor/company-report'
          // icon: icons.samplePage
        },

        {
          id: 'cab-report2',
          title: <FormattedMessage id="cab" />,
          // type: 'collapse',
          type: 'item',
          url: '/reports/vendor/cab-report'
          // icon: icons.samplePage
        },

        // Advance
        {
          id: 'advance2',
          title: <FormattedMessage id="advance" />,
          // type: 'collapse',
          type: 'item',
          url: '/reports/vendor/advance-report'
          // icon: icons.samplePage
        }
      ]
    }
  ]
};

export default report;
