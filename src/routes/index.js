import { Navigate, useRoutes } from 'react-router-dom';

// project-imports
import LoginRoutes from './LoginRoutes';
// import CabProvidorRoutes from './CabProvidorRoutes';
import CabProvidorRoutes from './CabProviderRoutes1';
import CabProvidorUserRoutes from './CabProviderUserRoutes';
import VendorUserRoutes from './VendorUserRoutes';

import Loadable from 'components/Loadable';
import { USERTYPE } from 'constant';
import useAuth from 'hooks/useAuth';
import CommonLayout from 'layout/CommonLayout';
import StepperSubscribe from 'pages/subscription/StepperSubscribe';
import { lazy, useEffect } from 'react';
import { useSelector } from 'react-redux';
import SuperAdminRoutes from './SuperAdminRoutes';
import VendorRoutes from './VendorRoutes';

const PagesLanding = Loadable(lazy(() => import('pages/Landing')));
const PageNotFound = Loadable(lazy(() => import('pages/maintenance/error/404')));
// ==============================|| ROUTES RENDER ||============================== //

const ROUTES = {
  [USERTYPE.iscabProvider]: CabProvidorRoutes,
  [USERTYPE.isVendor]: VendorRoutes,
  [USERTYPE.iscabProviderUser]: CabProvidorUserRoutes,
  [USERTYPE.isVendorUser]: VendorUserRoutes,
  [USERTYPE.superAdmin]: SuperAdminRoutes
};

export default function ThemeRoutes() {
  const userType = useSelector((state) => state.auth.userType);
  // console.log(`🚀 ~ ThemeRoutes ~ userType:`, userType);

  const { accountSetting } = useAuth();

  const { favIcon = 'favicon.png', title = 'Trip Biller' } = accountSetting || {};

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = favIcon; // Dynamically set the favicon URL
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = favIcon;
      document.head.appendChild(newLink);
    }

    document.title = `Trip Biller - ${title}`;
  }, [favIcon, title]);

  return useRoutes([
    {
      path: '/',
      element: <CommonLayout layout="landing" />,
      children: [
        {
          path: '/',
          element: <PagesLanding />
        },

        {
          path: 'subscription',
          element: <StepperSubscribe />
        }
      ]
    },
    LoginRoutes,
    // CabProvidorRoutes
    ROUTES[userType] ?? {
      path: '*',
      element: <PageNotFound />
    }
  ]);
}
