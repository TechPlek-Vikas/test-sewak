// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Bill, Card, MenuBoard } from 'iconsax-react';

// icons
const icons = {
  samplePage: MenuBoard,
  advance:Card,
  invoice: Bill,
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const invoices = {
  id: 'group-invoices',
  title: <FormattedMessage id="expense management" />,
  type: 'group',
  icon: icons.samplePage,
  children: [
    // // Invoices
    // {
    //   id: 'invoice',
    //   title: <FormattedMessage id="invoice" />,
    //   type: 'item',
    //   url: '/apps/invoices/list',
    //   icon: icons.invoice
    //   // children: [
    //   //   {
    //   //     id: 'list',
    //   //     title: <FormattedMessage id="list" />,
    //   //     type: 'item',
    //   //     url: '/apps/invoices/list',
    //   //     // icon: icons.view
    //   //   },
    //   //   {
    //   //     id: 'create',
    //   //     title: <FormattedMessage id="create" />,
    //   //     type: 'item',
    //   //     url: '/apps/invoices/create',
    //   //     // icon: icons.upload
    //   //   }
    //   // ]
    // },
     // Advance
      {
        id: 'advance',
        title: <FormattedMessage id="advance" />,
        type: 'collapse',
        icon: icons.advance,
        url: '/apps/invoices/advance',
        children: [
          {
            id: 'advance-type',
            title: <FormattedMessage id="advance-type" />,
            type: 'item',
            url: '/apps/invoices/advance-type',
            // icon: icons.upload
          },
        ]
      }
  ]
};

export default invoices;
