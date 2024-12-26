// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Card, MenuBoard, WalletMoney } from 'iconsax-react';

// icons
const icons = {
  samplePage: MenuBoard,
  advance:Card,
  transaction: WalletMoney
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const expense = {
  id: 'group-expense',
  title: <FormattedMessage id="expense management" />,
  type: 'group',
  icon: icons.samplePage,
  children: [
     // Advance
      {
        id: 'advance',
        title: <FormattedMessage id="advance" />,
        type: 'item',
        icon: icons.advance,
        url: '/apps/invoices/advance',
        // children: [
        //   {
        //     id: 'advance-type',
        //     title: <FormattedMessage id="advance-type" />,
        //     type: 'item',
        //     url: '/apps/invoices/advance-type',
        //     // icon: icons.upload
        //   },
        // ]
      },

        // Transaction
        {
          id: 'transaction',
          title: <FormattedMessage id="transaction" />,
          type: 'item',
          icon: icons.transaction,
          url: '/expense/transaction',
        }
  ]
};

export default expense;
