// project-imports
import Routes from 'routes';
import ThemeCustomization from 'themes';

import Locales from 'components/Locales';
import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';

// auth-provider
import { JWTProvider as AuthProvider } from 'contexts/JWTContext';
import { DrawerProvider } from 'contexts/DrawerContext';
import UpdateTitle from 'pages/UpdateTitle';
import ScrollToTop from 'react-scroll-to-top';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const App = () => {
  return (
    <ThemeCustomization>
      <RTLLayout>
        <Locales>
          <ScrollTop>
            <AuthProvider>
              <>
                <Notistack>
                  <DrawerProvider>
                    {/* <UpdateTitle /> */}
                    <Routes />
                    <ScrollToTop
                      smooth
                      color="#fff"
                      style={{ backgroundColor: 'rgb(67,125,255)', borderRadius: '50%' }}
                      height="20"
                      width="20"
                    />
                  </DrawerProvider>
                  <Snackbar />
                </Notistack>
              </>
            </AuthProvider>
          </ScrollTop>
        </Locales>
      </RTLLayout>
    </ThemeCustomization>
  );
};

export default App;
