import PropTypes from 'prop-types';
import { USERTYPE } from 'constant';
import { useSelector } from 'store';
import { STRATEGY, StrategyFactory } from '../PermissionStrategies';

const SKIP_USER_TYPE = [USERTYPE.iscabProvider, USERTYPE.isVendor];

export const Wrapper = ({
  children,
  allowedPermission,
  strategy = STRATEGY.ANY,
  fallback = null // Optional fallback UI when an error occurs
}) => {
  const { userType, userPermissions } = useSelector((state) => state.auth);

  // Display button for cab provider or vendor
  const isSkip = SKIP_USER_TYPE.includes(userType);

  if (isSkip) return children;

  let strategyInstance;

  try {
    // Attempt to get the appropriate strategy instance
    strategyInstance = StrategyFactory.getStrategy(strategy);
  } catch (error) {
    // Log error to the console
    console.error(`[Wrapper Component]: Invalid strategy "${strategy}". Valid strategies are: ${Object.values(STRATEGY).join(', ')}`);

    // Optional: Render fallback UI
    return fallback || <div style={{ color: 'red' }}>An error occurred: Invalid permission strategy selected.</div>;
  }

  // Evaluate permissions
  const hasPermission = strategyInstance.match(userPermissions, allowedPermission);

  // Render children only if permissions are satisfied
  if (!hasPermission) return null;

  return <>{children}</>;
};

Wrapper.propTypes = {
  children: PropTypes.node.isRequired,
  allowedPermission: PropTypes.object.isRequired,
  strategy: PropTypes.oneOf(Object.values(STRATEGY)),
  fallback: PropTypes.node // Optional fallback UI when an error occurs
};
