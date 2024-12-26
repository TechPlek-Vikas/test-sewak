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
  id: 'reports-application',
  title: <FormattedMessage id="reports" />,
  type: 'group',
  icon: icons.samplePage,
  children: [
    {
      id: 'vendor-reports',
      title: <FormattedMessage id="reports" />,
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
