import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// material-ui
import { ButtonBase } from '@mui/material';

// project-imports
import Logo from './LogoMain';
import LogoIcon from './LogoIcon';
import { APP_DEFAULT_PATH } from 'config';
import { dispatch } from 'store';
import { activeItem } from 'store/reducers/menu';

// ==============================|| MAIN LOGO ||============================== //


const LogoSection = ({ reverse, isIcon, sx, to }) => {
  // console.log(`🚀 ~ LogoSection ~ to:`, to);
  return (
    <ButtonBase
      disableRipple
      component={Link}
      to={!to ? APP_DEFAULT_PATH : to}
      sx={sx}
      onClick={() => {
        // console.log('Additional task executed!');
        dispatch(activeItem({ openItem: ['home'] }));
      }}
    >
      {isIcon ? <LogoIcon /> : <Logo reverse={reverse} />}
    </ButtonBase>
  );
};

LogoSection.propTypes = {
  reverse: PropTypes.bool,
  isIcon: PropTypes.bool,
  sx: PropTypes.object,
  to: PropTypes.string
};

export default LogoSection;
