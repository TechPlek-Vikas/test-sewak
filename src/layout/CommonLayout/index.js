import PropTypes from 'prop-types';
import { lazy, Suspense, useEffect } from 'react';

import { Outlet, useLocation, useNavigate } from 'react-router-dom';

// material-ui
import { Container, Toolbar } from '@mui/material';

// project-imports
import ComponentLayout from './ComponentLayout';
import { dispatch, useSelector } from 'store';
import { openComponentDrawer } from 'store/reducers/menu';

// material-ui
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

const Header = lazy(() => import('./Header'));
const FooterBlock = lazy(() => import('./FooterBlock'));

// ==============================|| LOADER - WRAPPER ||============================== //

const LoaderWrapper = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 2001,
  width: '100%',
  '& > * + *': {
    marginTop: theme.spacing(2)
  }
}));

const Loader = () => (
  <LoaderWrapper>
    <LinearProgress color="primary" />
  </LoaderWrapper>
);

// ==============================|| MINIMAL LAYOUT ||============================== //

const CommonLayout = ({ layout = 'blank' }) => {
  const { componentDrawerOpen } = useSelector((state) => state.menu);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  console.log(`🚀 ~ CommonLayout ~ isLoggedIn:`, isLoggedIn);

  const navigate = useNavigate();

  const location = useLocation();
  console.log(`🚀 ~ CommonLayout ~ location:`, location);

  useEffect(() => {
    // DESC : redirect to login page if user is not logged In Page otherwise redirect to home page
    if (location.pathname === '/') {
      if (!isLoggedIn) {
        navigate('/auth', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [isLoggedIn, navigate, location.pathname]);

  const handleDrawerOpen = () => {
    dispatch(openComponentDrawer({ componentDrawerOpen: !componentDrawerOpen }));
  };

  return (
    <>
      {(layout === 'landing' || layout === 'simple') && (
        <Suspense fallback={<Loader />}>
          <Header layout={layout} />
          <Outlet />
          <FooterBlock isFull={layout === 'landing'} />
        </Suspense>
      )}
      {layout === 'component' && (
        <Suspense fallback={<Loader />}>
          <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2 } }}>
            <Header handleDrawerOpen={handleDrawerOpen} layout="component" />
            <Toolbar sx={{ mt: 2 }} />
            <ComponentLayout handleDrawerOpen={handleDrawerOpen} componentDrawerOpen={componentDrawerOpen} />
          </Container>
        </Suspense>
      )}
      {layout === 'blank' && <Outlet />}
    </>
  );
};

CommonLayout.propTypes = {
  layout: PropTypes.string
};

export default CommonLayout;
