// import { useMemo } from 'react';

// material-ui
import { Box, IconButton, useMediaQuery } from '@mui/material';

// project-imports
// import Search from './Search';
// import Message from './Message';
import Profile from './Profile';
// import Localization from './Localization';
import Notification from './Notification';
// import MobileSection from './MobileSection';
// import MegaMenuSection from './MegaMenuSection';

import useConfig from 'hooks/useConfig';
import DrawerHeader from 'layout/MainLayout/Drawer/DrawerHeader';
import { MenuOrientation } from 'config';
import { Maximize, Maximize1, MinusCirlce, MinusSquare } from 'iconsax-react';
import { useState } from 'react';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const { menuOrientation } = useConfig();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // const localization = useMemo(() => <Localization />, [i18n]);

  // const megaMenu = useMemo(() => <MegaMenuSection />, []);

  return (
    <>
      {/* ----Previous One---- */}

      {/* {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />} */}
      {/* {!downLG && <Search />} */}
      {/* {!downLG && megaMenu} */}
      {/* {!downLG && localization} */}
      {/* {downLG && <Box sx={{ width: '100%', ml: 1 }} />} */}

      {/* <Notification /> */}
      {/* <Message /> */}
      {/* {!downLG && <Profile />} */}
      {/* {downLG && <MobileSection />} */}

      {/* ----Previous One---- */}

      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}

        {/* Conditionally render Search and keep Profile at the right */}
        {!downLG && (
          <>
            {/* <Search /> */}
            <Box sx={{ ml: 'auto' }}>
              {' '}
              <Notification />
            </Box>
            <Box>
              {' '}
              <IconButton onClick={toggleFullscreen} aria-label="Toggle Fullscreen">
                {isFullscreen ? <MinusSquare size="32" variant="Bulk"/> : <Maximize1 size="32" color="#5B6B79" variant="Bulk" />}
              </IconButton>
            </Box>
            <Box>
              {' '}
              {/* This will push Profile to the right */}
              <Profile />
            </Box>
          </>
        )}

        {/* Adjust layout for small screens */}
        {downLG && <Box sx={{ width: '100%', ml: 1 }} />}

        {/* Uncomment for additional components */}
        {/* {!downLG && megaMenu} */}
        {/* {!downLG && localization} */}
        {/* {!downLG && <Notification />} */}
        {/* {!downLG && <Message />} */}
      </Box>
    </>
  );
};

export default HeaderContent;
