/* eslint-disable no-unused-vars */
import { useEffect, useLayoutEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Typography, useMediaQuery } from '@mui/material';

// project-imports
import NavGroup from './NavGroup';

import { useSelector } from 'store';
import useConfig from 'hooks/useConfig';
import { HORIZONTAL_MAX_ITEM } from 'config';
import { MenuOrientation } from 'config';
import { getMenuItems } from 'menu-items';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

const Navigation = () => {
  const theme = useTheme();

  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const { menuOrientation } = useConfig();
  const { drawerOpen } = useSelector((state) => state.menu);
  const { userSpecificData, userPermissions, user } = useSelector((state) => state.auth);
  const { userType } = useSelector((state) => state.auth);

  const [selectedItems, setSelectedItems] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [menuItems, setMenuItems] = useState({ items: [] });

  useLayoutEffect(() => {
    // console.log('userType', userType);
    const menuItem = getMenuItems(userType);
    // console.log(`🚀 ~ useLayoutEffect ~ menuItem:`, menuItem);
    setMenuItems(menuItem);
    // eslint-disable-next-line
  }, []);

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  const lastItem = isHorizontal ? HORIZONTAL_MAX_ITEM : null;
  let lastItemIndex = menuItems.items.length - 1;
  let remItems = [];
  let lastItemId;

  if (lastItem && lastItem < menuItems.items.length) {
    lastItemId = menuItems.items[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = menuItems.items.slice(lastItem - 1, menuItems.items.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon
    }));
  }

  const navGroups = menuItems.items.slice(0, lastItemIndex + 1).map((item) => {
    switch (item.type) {
      case 'group':
        return (
          <NavGroup
            key={item.id}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedItems={selectedItems}
            lastItem={lastItem}
            remItems={remItems}
            lastItemId={lastItemId}
            item={item}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });
  return (
    <Box
      sx={{
        pt: drawerOpen ? (isHorizontal ? 0 : 2) : 0,
        '& > ul:first-of-type': { mt: 0 },
        display: isHorizontal ? { xs: 'block', lg: 'flex' } : 'block'
      }}
    >
      {navGroups}
    </Box>
  );
};

export default Navigation;

/**
 * Checks if any of the specified keys have the given permission type in the permissions object.
 *
 * @param {Object} permissions - An object where keys are resource names and values are arrays of permission types.
 * @param {Array<string>} keys - An array of resource names to check against the permissions object.
 * @param {string} permissionType - The type of permission to check for (e.g., "Read", "Create"). The comparison is case-insensitive.
 * @returns {boolean} - Returns true if any of the specified keys have the given permission type; otherwise, returns false.
 *
 * @example
 * const hasReadAccess = hasPermissionForGroup(permissions, ["roster", "company"], "Read");
 * console.log(hasReadAccess); // true or false based on the permissions object
 */
function hasPermissionForGroup(permissions, keys, permissionType) {
  // Normalize the permission type for case-insensitive comparison
  const normalizedPermissionType = permissionType.toLowerCase();

  return keys.some((key) => {
    // Normalize the key to capitalize the first letter
    const normalizedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();

    // Check against all keys in permissions, normalizing them as well
    return Object.keys(permissions).some((permissionKey) => {
      return (
        permissionKey.toLowerCase() === normalizedKey.toLowerCase() &&
        permissions[permissionKey].map((p) => p.toLowerCase()).includes(normalizedPermissionType)
      );
    });
  });
}

/**
 * Checks if a specific permission exists within the given permissions object.
 *
 * @param {Object} permissionsObject - The object containing permissions for various entities.
 * @param {string} permissionKey - The key representing the entity (e.g., "InvoiceSettings") to check for permissions.
 * @param {string} action - The action (e.g., "Read", "Update") to verify against the permissions for the specified entity.
 * @returns {boolean} - Returns true if the specified action exists for the given entity, false otherwise.
 *
 * The function performs a case-insensitive comparison by normalizing both the permissionKey
 * and action to lower case. It iterates over the keys of the permissions object to find a match
 * for the permissionKey. If a matching key is found, it checks whether the specified action exists
 * in the corresponding array of permissions. If either the key or action does not exist, it returns false.
 */
function hasPermissionForItem(permissionsObject, permissionKey, action) {
  // Normalize the permissionKey and action to lower case
  const normalizedKey = permissionKey.toLowerCase();
  const normalizedAction = action.toLowerCase();

  // Check if the permissions object has the normalized key
  for (const key in permissionsObject) {
    if (key.toLowerCase() === normalizedKey) {
      // Check if the action exists in the corresponding permission array
      return permissionsObject[key].some((permission) => permission.toLowerCase() === normalizedAction);
    }
  }

  return false; // Return false if the key or action does not exist
}

/**
 * Checks if the user has at least one required permission from a given set of permission pairs.
 *
 * @param {Object} permissionsObject - The object representing the user's permissions.
 *        The keys are permission categories (e.g., "Company", "Role") and the values
 *        are arrays of actions (e.g., "Read", "Create") allowed for each category.
 * @param {Object} permissionPairs - An object where each key represents a permission category
 *        and the corresponding value is either a single action (string) or an array of actions (string[]).
 *        The method will check if any action within the array matches the user's permissions.
 * @returns {boolean} - Returns true if the user has at least one of the required actions for any category;
 *        otherwise, returns false.
 *
 * @example
 * const permissions = {
 *   "Company": ["Read", "Create"],
 *   "Role": ["Read", "Update", "Delete"]
 * };
 * const requiredPermissions = {
 *   "Company": "Create",
 *   "Role": ["Delete", "Update"]
 * };
 *
 * isPermissionGranted(permissions, requiredPermissions); // true
 */
export function isPermissionGranted(permissionsObject, permissionPairs) {
  // Iterate over each key-action pair in the permissionPairs object
  for (const [key, actions] of Object.entries(permissionPairs)) {
    // Normalize the permission key to lowercase for case-insensitive comparison
    const normalizedKey = key.toLowerCase();

    // Check if the permissions object contains the normalized key
    for (const permissionKey in permissionsObject) {
      if (permissionKey.toLowerCase() === normalizedKey) {
        // Normalize actions to an array, even if a single action is provided
        const actionsArray = Array.isArray(actions) ? actions : [actions];

        // Check if any of the actions in actionsArray match the user's permissions for the given key
        for (const action of actionsArray) {
          const normalizedAction = action.toLowerCase();
          if (permissionsObject[permissionKey].some((permission) => permission.toLowerCase() === normalizedAction)) {
            return true; // Return true if a match is found
          }
        }
      }
    }
  }

  // Return false if none of the permission pairs match the user's permissions
  return false;
}

/**
 * Merges and de-duplicates permissions from an array of objects.
 * Ensures permissions are consistent as arrays and handles merging multiple permission sources.
 *
 * @param {Array} data - The input array containing objects with permissions.
 * @returns {Object} A merged object where each key (permission type) holds a de-duplicated array of permissions.
 */
const mergePermissionsForGroup = (data) => {
  return data.reduce((acc, { permissions }) => {
    // Iterate through each permission key-value pair in the object
    Object.entries(permissions).forEach(([key, value]) => {
      // Ensure the value is treated as an array for consistency
      const valuesArray = Array.isArray(value) ? value : [value];

      // If the permission key is not present in the accumulator, initialize it as an empty array
      if (!acc[key]) {
        acc[key] = [];
      }

      // Merge the current permissions with the existing ones, ensuring no duplicates using Set
      acc[key] = [...new Set([...acc[key], ...valuesArray])];
    });

    // Return the accumulator for the next iteration
    return acc;
  }, {}); // Initialize the accumulator as an empty object
};
