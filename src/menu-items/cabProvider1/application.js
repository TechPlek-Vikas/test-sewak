// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Bill, Car, DocumentUpload, Eye, MenuBoard } from 'iconsax-react';

// icons
const icons = {
  samplePage: MenuBoard,
  view: Eye,
  upload: DocumentUpload,
  invoice: Bill,
  trip: Car
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const roster = {
  id: 'group-application',
  title: <FormattedMessage id="application" />,
  type: 'group',
  icon: icons.samplePage,
  children: [
    // Roster
    {
      id: 'roster',
      title: <FormattedMessage id="roster" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/apps/roster'
    },

    // Trips
    {
      id: 'trips',
      title: <FormattedMessage id="trips" />,
      type: 'item',
      url: '/apps/trips/list',
      icon: icons.trip
    },
    // Invoices
    {
      id: 'invoices',
      title: <FormattedMessage id="invoices" />,
      type: 'collapse',
      // url: '/apps/invoices/list',
      icon: icons.invoice,
      children: [
        // Company Invoice
        {
          id: 'company-invoice',
          title: <FormattedMessage id="company1" />,
          type: 'item',
          url: '/apps/invoices/company',
          // icon: icons.view
        },
        // Vendor Invoice
        {
          id: 'vendor-invoice',
          title: <FormattedMessage id="vendor1" />,
          type: 'item',
          url: '/apps/invoices/vendor',
          // icon: icons.view
        },
        // Driver Invoice
        {
          id: 'driver-invoice',
          title: <FormattedMessage id="driver1" />,
          type: 'item',
          url: '/apps/invoices/driver',
          // icon: icons.view
        }
      ]
    }
  ]
};

export default roster;
