import PropTypes from 'prop-types';
import samplelogo from 'assets/images/logo.png';
import useAuth from 'hooks/useAuth';

// ==============================|| LOGO SVG ||============================== //

const LogoMain = () => {
  const { accountSetting } = useAuth();

  const { logo = samplelogo, name = 'logo' } = accountSetting || {};
  // console.log("logo",logo);
  // console.log("accountSetting",accountSetting);
  // console.log("samplelogo",samplelogo);
  

  return <img src={logo || samplelogo} alt={name} width="100" />;
};

LogoMain.propTypes = {
  reverse: PropTypes.bool
};

export default LogoMain;
