import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import moment from 'moment';
dayjs.extend(utc);
dayjs.extend(timezone);

// #################################### CONSTANT #########################################
export const MAX_TEXTFIELD_LENGTH = {
  details: 20,
  comments: 50,
  address: 50
};

// #################################### REGEX PATTERN #########################################
export const DIGITS_ONLY_PATTERN = /^\d+$/;

// #################################### METHOD #########################################

/**
 * Trims string values within an object.
 *
 * @param {Object} obj - The object whose string properties need to be trimmed.
 * @returns {Object} - A new object with all string properties trimmed.
 */
export const trimStringProperties = (obj) => {
  // Function to recursively trim string properties
  const trimObject = (item) => {
    if (typeof item === 'string') {
      return item.trim().replace(/\s+/g, ' ');
    } else if (Array.isArray(item)) {
      return item.map(trimObject);
    } else if (item !== null && typeof item === 'object') {
      return Object.keys(item).reduce((accumulator, key) => {
        accumulator[key] = trimObject(item[key]);
        return accumulator;
      }, {});
    } else {
      return item;
    }
  };

  return trimObject(obj);
};

/**
 * Filters an object to remove empty string values and retains boolean values.
 * @param {object} obj - The input object to filter.
 * @returns {object} - The filtered object.
 */
export function filterObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj; // Return the value if it is not an object or is null
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => (typeof item === 'string' ? item.trim() : filterObject(item))).filter((item) => item !== ''); // Clean and filter non-empty strings in arrays
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      value = value.trim();
      if (value) acc[key] = value; // Add non-empty trimmed strings
    } else if (value === null) {
      acc[key] = value; // Add null values directly
    } else if (typeof value === 'object') {
      const cleanedValue = filterObject(value);
      if (Array.isArray(cleanedValue) ? cleanedValue.length : Object.keys(cleanedValue).length) {
        acc[key] = cleanedValue; // Add non-empty arrays or objects
      }
    } else {
      acc[key] = value; // Add other values directly
    }
    return acc;
  }, {});
}

export function omitKeys(obj, keysToRemove) {
  if (typeof obj !== 'object' || !Array.isArray(keysToRemove)) return obj;

  const newObj = {};

  for (const key in obj) {
    if (!keysToRemove.includes(key)) {
      const value = obj[key];
      newObj[key] =
        typeof value === 'object' && value !== null
          ? Array.isArray(value)
            ? value.map((item) => omitKeys(item, keysToRemove))
            : omitKeys(value, keysToRemove)
          : value;
    }
  }

  keysToRemove.forEach((key) => {
    if (key.includes('.')) {
      const [firstKey, ...restKeys] = key.split('.');
      let tempObj = newObj[firstKey];
      restKeys.reduce((acc, curr, index) => {
        if (acc && typeof acc === 'object') {
          if (index === restKeys.length - 1) delete acc[curr];
          return acc[curr];
        }
      }, tempObj);
    } else {
      delete newObj[key];
    }
  });

  return newObj;
}

export function compareObjects(ob1, ob2) {
  let result = {};

  function compare(obj1, obj2, res) {
    for (let key in obj1) {
      // eslint-disable-next-line no-prototype-builtins
      if (obj1.hasOwnProperty(key)) {
        if (typeof obj1[key] === 'object' && !Array.isArray(obj1[key]) && obj1[key] !== null) {
          res[key] = {};
          compare(obj1[key], obj2[key], res[key]);
          if (Object.keys(res[key]).length === 0) {
            delete res[key];
          }
        } else if (Array.isArray(obj1[key])) {
          if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
            res[key] = obj1[key];
          }
        } else {
          if (obj1[key] !== obj2[key]) {
            res[key] = obj1[key];
          }
        }
      }
    }
  }

  compare(ob1, ob2, result);

  return result;
}

export function formattedDate(date, format, timezone = 'Asia/Kolkata') {
  return dayjs(date).utc().tz(timezone).format(format);
}

// Utility function to handle reset action
export const handleReset = (initialState) => () => {
  return initialState;
};

/**
 * Converts a file size from megabytes (MB) to bytes.
 *
 * @param {number} sizeInMB - The size in megabytes to convert.
 * @returns {number} The equivalent size in bytes.
 */
export const convertMBToBytes = (sizeInMB) => {
  const bytesPerMB = 1_000_000;
  return sizeInMB * bytesPerMB;
};

export const formatDateUsingMoment = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

// Utility function to format dates in UTC
export const formatDateForApi = (date) => {
  return moment(date).format('YYYY-MM-DDTHH:mm:ss');
};

export const convertToDateUsingMoment = (str, format = 'DD/MM/YYYY') => {
  const result = moment(str, format).toDate();
  return result;
};

export const formatDate = (dateString) => {
  return moment(dateString, 'DD/MM/YYYY').format('MMMM DD, YYYY');
};

/**
 * Deeply compares two objects to determine if they are equal.
 *
 * @param {Object} obj1 - The first object to compare.
 * @param {Object} obj2 - The second object to compare.
 * @returns {boolean} - Returns true if the objects are deeply equal, otherwise false.
 */
export function isDeeplyEqual(obj1, obj2) {
  // Check if both references are identical (same object reference).
  if (obj1 === obj2) return true;

  // If either object is null or undefined, they are not equal.
  if (obj1 == null || obj2 == null) return false;

  // If either value is not an object, they cannot be deeply equal.
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

  // Get the keys of both objects.
  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);

  // If the number of keys is different, the objects are not equal.
  if (keys1.length !== keys2.length) return false;

  // Compare keys and values of both objects.
  for (let key of keys1) {
    // Check if the second object contains the same key and if the values for the key are deeply equal.
    if (!keys2.includes(key) || !isDeeplyEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  // All checks passed, the objects are deeply equal.
  return true;
}

/**
 * Creates a regular expression for validating passwords based on the given length constraints.
 *
 * @param {number} minLength - The minimum length of the password.
 * @param {number} maxLength - The maximum length of the password.
 * @returns {RegExp} - A regular expression that enforces the following password rules:
 *   - At least one lowercase letter.
 *   - At least one uppercase letter.
 *   - At least one digit.
 *   - At least one special character (non-word character).
 *   - Password length between minLength and maxLength, inclusive.
 */
export function createPasswordRegex(minLength, maxLength) {
  return new RegExp(`^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W])[A-Za-z\\d\\W]{${minLength},${maxLength}}$`);
}

/**
 * Converts an object into an array of objects, each containing an `id` and `value` property.
 *
 * This function iterates over the key-value pairs of the provided object, where each key
 * represents the `id` and each value represents the `value`. It then returns an array of
 * objects, each with an `id` and `value` property.
 *
 * @param {Object} obj - The input object where keys represent IDs and values represent corresponding values.
 * @returns {Array} - An array of objects, each with `id` and `value` properties.
 *
 * @example
 *
 * const FUEL_TYPE_MAPPING = {
 *   1: 'Petrol',
 *   2: 'Diesel',
 *   3: 'CNG',
 *   4: 'Electric Vehicles'
 * };
 *
 * const result = generateArrayFromObject(FUEL_TYPE_MAPPING);
 * console.log(result);
 *  Output:
 *  [
 *    { id: 1, value: 'Petrol' },
 *    { id: 2, value: 'Diesel' },
 *    { id: 3, value: 'CNG' },
 *    { id: 4, value: 'Electric Vehicles' }
 *  ]
 */
export const generateArrayFromObject = (obj) => {
  return Object.entries(obj).map(([id, value]) => ({
    id,
    value
  }));
};

/**
 * Retrieves the key associated with a given value from an object.
 *
 * @param {Object} obj - The object from which to retrieve the key.
 * @param {*} value - The value for which the corresponding key is sought.
 * @returns {string|null} - The key corresponding to the provided value, or null if no match is found.
 */
export function getKeyByValue(obj, value) {
  return Object.keys(obj).find((key) => obj[key] === value) || null;
}

/**
 * Safely retrieves the value of a nested property from an object based on a dot-separated path string.
 *
 * @param {Object} obj - The object from which to retrieve the property.
 * @param {string} path - A dot-separated string representing the path to the desired property.
 * @param {boolean} [skipError=false] - A flag to skip the TypeError if the path is not a string.
 * @returns {*} - The value of the nested property if it exists, otherwise undefined.
 *
 * @throws {TypeError} - Throws an error if the provided path is not a string and skipError is false.
 *
 * @example
 * const obj = { a: { b: { c: 42 } } };
 * getNestedProperty(obj, 'a.b.c'); // returns 42
 * getNestedProperty(obj, 'a.x.c'); // returns undefined
 */
export function getNestedProperty(obj, path, skipError = false) {
  if (typeof path !== 'string' && !skipError) {
    throw new TypeError('Path must be a string');
  }

  return path?.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return acc[part];
    }
    return undefined;
  }, obj);
}

export const handlePreview = (fileUrl) => {
  window.open(fileUrl, '_blank', 'noopener,noreferrer');
};

export function getNestedComplexProperty(obj, path, skipError = false) {
  if (typeof path !== 'string' && !skipError) {
    throw new TypeError('Path must be a string');
  }

  return path.split('.').reduce((acc, part) => {
    // eslint-disable-next-line no-prototype-builtins
    if (acc && typeof acc === 'object' && acc.hasOwnProperty(part)) {
      return acc[part];
    }
    return undefined;
  }, obj);
}

/**
 * Converts a time string in the format "HH:MM:SS AM/PM" to a Unix timestamp.
 *
 * @param {string} timeString - The time string to convert (e.g., "02:30:45 PM").
 * @returns {number} - The Unix timestamp in seconds.
 */
export function convertTimeToUnixTimestamp(timeString) {
  // Get the current date object
  const currentDate = new Date();

  // Destructure time and period (AM/PM) from the input string
  const [time, period] = timeString.split(' ');
  const [hours, minutes, seconds] = time.split(':'); // Split time into hours, minutes, seconds

  // Convert hours to a number and adjust for 12-hour to 24-hour format
  let formattedHours = parseInt(hours, 10);
  if (period === 'PM' && formattedHours !== 12) {
    formattedHours += 12; // Convert PM hours, except 12 PM, to 24-hour format
  } else if (period === 'AM' && formattedHours === 12) {
    formattedHours = 0; // Convert 12 AM to 00 hours
  }

  // Set the hours, minutes, and seconds in the date object
  currentDate.setHours(formattedHours);
  currentDate.setMinutes(parseInt(minutes, 10));
  currentDate.setSeconds(parseInt(seconds, 10));
  currentDate.setMilliseconds(0); // Reset milliseconds to ensure accuracy

  // Return the Unix timestamp (in seconds, by dividing by 1000)
  return Math.floor(currentDate.getTime() / 1000);
}

export const isNotEmptyObject = (obj) => Object.keys(obj).length > 0;

/**
 * Omit specified keys from an array of objects.
 * Throws an error for invalid input or non-existent keys.
 * @param {Object[]} arr - Array of objects to process.
 * @param {string[]} keysToOmit - Array of keys to omit from each object.
 * @returns {Object[]} A new array of objects with the specified keys omitted.
 * @throws Will throw an error if arr is not a valid array or if keysToOmit contains invalid keys.
 */
export function omitKeysFromArray(arr, keysToOmit) {
  // Validate if arr is a valid non-empty array
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('The first argument should be a non-empty array.');
  }

  // Validate if keysToOmit is a valid array of strings
  if (!Array.isArray(keysToOmit) || !keysToOmit.every((key) => typeof key === 'string')) {
    throw new Error('The second argument should be an array of strings representing keys to omit.');
  }

  return arr.map((item) => {
    // Get the valid keys that exist in the object
    const validKeysToOmit = keysToOmit.filter((key) => key in item);

    // if (validKeysToOmit.length !== keysToOmit.length) {
    //   throw new Error("Some keys in keysToOmit do not exist in the objects.");
    // }

    // Omit the valid keys
    return Object.keys(item).reduce((acc, key) => {
      if (!validKeysToOmit.includes(key)) {
        acc[key] = item[key];
      }
      return acc;
    }, {});
  });
}

/**
 * Filters an array of option objects based on the user's permissions,
 * excluding specified properties from the returned objects.
 *
 * This function checks each option against the user's permissions,
 * ensuring that for each module specified in the option's "check" object,
 * at least one of the required permissions exists in the user's permissions.
 * Both module names and permissions are compared in a case-insensitive manner.
 *
 * @param {Array} options - An array of option objects, each containing a "check" object.
 * @param {Object} userPermissions - An object representing the user's permissions,
 * where keys are module names and values are arrays of permissions.
 * @param {Array<string>} [filterKeys] - An optional array of additional keys to exclude from the returned objects.
 * @returns {Array} - An array of options that meet the permission criteria,
 * excluding the "check" property and any additional specified keys.
 */
export function filteredArrayOfObjectsByUserPermissions(options, userPermissions, filterKeys = []) {
  return options
    .filter((option) => {
      const { check } = option;

      // Check each module and its permissions in the "check" object
      return Object.keys(check).some((moduleKey) => {
        // Find the corresponding module in userPermissions (case-insensitive)
        const userPermissionKey = Object.keys(userPermissions).find((key) => key.toLowerCase() === moduleKey.toLowerCase());

        if (!userPermissionKey) return false; // Skip if no matching module found

        // Normalize both userPermissions and check permissions to lower case
        const userModulePermissions = userPermissions[userPermissionKey].map((perm) => perm.toLowerCase());
        const requiredPermissions = Array.isArray(check[moduleKey])
          ? check[moduleKey].map((perm) => perm.toLowerCase())
          : [check[moduleKey].toLowerCase()]; // Ensure it's always an array

        // Check if at least one required permission exists in userModulePermissions
        return requiredPermissions.some((perm) => userModulePermissions.includes(perm));
      });
    })
    .map((option) => {
      // Exclude the "check" property and specified additional keys from the option object
      return Object.keys(option)
        .filter((key) => key !== 'check' && !filterKeys.includes(key)) // Filter out "check" and any additional keys
        .reduce((acc, key) => {
          acc[key] = option[key]; // Build new object excluding the specified keys
          return acc;
        }, {});
    });
}

// vikas end  22