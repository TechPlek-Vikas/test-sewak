import PropTypes from 'prop-types';
import { Navigate } from 'react-router';
import { STRATEGY, StrategyFactory } from '../PermissionStrategies';
import { useSelector } from 'store';

export const ProtectedRoute1 = ({ children, allowedPermission, strategy = STRATEGY.ANY, redirect = '/home' }) => {
  console.log(`🚀 ~ ProtectedRoute1 ~ allowedPermission:`, allowedPermission);
  //   console.log(`🚀 ~ ProtectedRoute1 ~ strategy:`, strategy);
  //   console.log(`🚀 ~ ProtectedRoute1 ~ redirect:`, redirect);
  const { userPermissions } = useSelector((state) => state.auth);
  console.log(`🚀 ~ ProtectedRoute1 ~ userPermissions:`, userPermissions);

  let strategyInstance;

  try {
    // Instantiate the appropriate permission strategy
    strategyInstance = StrategyFactory.getStrategy(strategy);
  } catch (error) {
    console.error(`[ProtectedRoute]: Invalid strategy "${strategy}". Valid strategies are: ${Object.values(STRATEGY).join(', ')}`);

    // Redirect to unauthorized page if strategy is invalid
    return <Navigate to={redirect} replace />;
  }

  // Evaluate if the user has the necessary permissions
  const hasPermission = strategyInstance.match(userPermissions, allowedPermission);
  console.log(`🚀 ~ ProtectedRoute1 ~ hasPermission:`, hasPermission);

  // If user lacks permission, redirect to the specified URL
  if (!hasPermission) {
    return <Navigate to={redirect} replace />;
  }

  // Render children if permissions are satisfied
  return <>{children}</>;
};

ProtectedRoute1.propTypes = {
  children: PropTypes.node.isRequired,
  allowedPermission: PropTypes.object.isRequired,
  strategy: PropTypes.oneOf(Object.values(STRATEGY)),
  redirect: PropTypes.string
};
