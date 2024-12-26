import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { checkPermission } from './WrapperButton';
import { useSelector } from 'react-redux';
import { isPermissionGranted } from 'layout/MainLayout/Drawer/DrawerContent/Navigation';

/**
 * ProtectedRoute component to guard routes based on user permissions.
 *
 * @param {React.Component} component - The component to render if permission is granted.
 * @param {string} moduleName - The module name for which permission is being checked.
 * @param {string} permission - The required permission for the module.
 * @returns {React.Component|Navigate} - Renders the component if permission exists, or redirects otherwise.
 */
const ProtectedRoute = ({ element: Component, moduleName, permission, modulePermissions, redirectURL = '/home' }) => {
  let hasPermission = false;
  const { userPermissions } = useSelector((state) => state.auth);

  if (!userPermissions) {
    return <Navigate to={redirectURL} />;
  }

  if (typeof modulePermissions === 'object') {
    hasPermission = isPermissionGranted(userPermissions, modulePermissions);
  } else {
    if (moduleName && permission) {
      hasPermission = checkPermission(userPermissions, moduleName, permission);
    }
  }

  //   const hasPermission = checkPermission(userPermissions, moduleName, permission);
  //   console.log({ moduleName, permission });
  // console.log(`🚀 ~ ProtectedRoute ~ hasPermission:`, hasPermission);

  return hasPermission ? <Component /> : <Navigate to={redirectURL} />;
};

ProtectedRoute.propTypes = {
  element: PropTypes.elementType.isRequired, // The component to render
  moduleName: PropTypes.string, // The name of the module (e.g., "company")
  permission: PropTypes.string, // The required permission (e.g., "create")
  modulePermissions: PropTypes.object,
  redirectURL: PropTypes.string // The URL to redirect to if permission is not granted
};

export default ProtectedRoute;
