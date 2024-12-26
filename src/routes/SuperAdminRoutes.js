/ eslint-disable no-unused-vars /;
import { lazy } from 'react';

// project-imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';
import UnderConstruction from 'components/maintenance/UnderConstruction';

//subscription
const SubscriptionAdmin = Loadable(lazy(() => import('pages/subscription/subscription/SubscriptionAdmin')));

// ==============================|| MAIN ROUTES ||============================== //

const SuperAdminRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [

         // Home
         {
            path: 'home',
            element:<UnderConstruction title="Home" />
          },

        // Subscription
        {
          path: 'subscription',
          children: [
            {
              path: 'subscription-list',
              element: <SubscriptionAdmin />
            }
          ]
        }
      ]
    }
  ]
};

export default SuperAdminRoutes;
