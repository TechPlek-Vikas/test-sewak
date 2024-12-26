import { USERTYPE } from 'constant';
import PropTypes from 'prop-types';
import { useSelector } from 'store';

const SKIP_USER_TYPE = [USERTYPE.iscabProviderUser];

const AccessControlWrapper = ({ children, allowedUserTypes }) => {
  const { userType } = useSelector((state) => state.auth);

  const isSkip = SKIP_USER_TYPE.includes(userType);
  // console.log(`🚀 ~ AccessControlWrapper ~ isSkip:`, isSkip);

  if (isSkip) return children;

  const hasAccess = checkUserAccess(userType, allowedUserTypes);

  return hasAccess ? children : null;
};

export const checkUserAccess = (userType, allowedUserTypes) => {
  return allowedUserTypes.includes(userType);
};

AccessControlWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  allowedUserTypes: PropTypes.arrayOf(PropTypes.number).isRequired // Assuming userType is a number
};

export default AccessControlWrapper;
