import { EMAIL_REGEX_PATTERN, MOBILE_NUMBER_REGEX_PATTERN, PIN_CODE_REGEX_PATTERN } from 'constant';
import moment from 'moment';

// Modified validation functions to include detailed error messages
export const isRequiredString = (value) => {
  if (typeof value === 'string' && value.trim() !== '') return true;
  throw new Error('Expected a non-empty string');
};

export const isValidEmail = (value) => {
  if (typeof value === 'string' && EMAIL_REGEX_PATTERN.test(value)) return true;
  throw new Error('Expected a valid email format');
};

export const isMobileNumber = (value) => {
  if ((typeof value === 'number' || typeof value === 'string') && MOBILE_NUMBER_REGEX_PATTERN.test(value.toString())) return true;
  throw new Error('Expected a 10-digit mobile number');
};

export const isString = (value) => {
  if (typeof value === 'string' || typeof value === 'undefined') return true;
  throw new Error('Expected a string or undefined');
};

export const isNumber = (value) => {
  if (typeof value === 'number' || typeof value === 'undefined') return true;
  throw new Error('Expected a number or undefined');
};

// Validation function for date
// Validation function for date
export const isValidDate = (value) => {
  // If the value is undefined, consider it valid
  if (value === undefined) return true;

  // Check if the value is a valid string date in the DD/MM/YYYY format
  if (typeof value === 'string' && moment(value, 'DD/MM/YYYY', true).isValid()) {
    return true;
  }

  throw new Error('Expected a valid date in DD/MM/YYYY format');
};

// Validation function to check if the date is in the future
export const isDateInFuture = (value) => {
  // If the value is undefined, consider it valid (optional based on your requirements)
  if (value === undefined) return true;

  // Check if the value is a string and a valid date
  if (typeof value === 'string') {
    const date = moment(value, 'DD/MM/YYYY', true);

    if (!date.isValid()) {
      throw new Error('Expected a valid date in DD/MM/YYYY format');
    }

    // Check if the date is in the future
    if (date.isBefore(moment(), 'day')) {
      throw new Error('Date must be later than or equal to the current date');
    }

    return true;
  }

  throw new Error('Expected a valid date in DD/MM/YYYY format');
};

// Validation function to check if the value is in the expected values array (guard clause style)
export const isValueInExpectedValues = (value, expectedValues) => {
  // Allow undefined values (guard clause)
  if (typeof value === 'undefined') {
    return true;
  }

  // Guard clause: If the value is not in the expectedValues, throw an error
  if (!expectedValues.includes(value)) {
    throw new Error(`Value must be one of the following: ${expectedValues.join(', ')}`);
  }

  // If value is valid, return true
  return true;
};

// Validation function for array items
export const validateArrayItem = (item, rules, fieldMapping) => {
  const errors = {};
  Object.entries(rules).forEach(([index, validationFn]) => {
    const fieldName = fieldMapping[index];
    try {
      validationFn(item[Number(index)]);
    } catch (error) {
      errors[fieldName] = error.message;
      //   errors['message'] = error.message;
    }
  });
  return Object.keys(errors).length === 0 ? null : errors;
};

// Function to separate valid and invalid items
export const separateValidAndInvalidItems = (data, rules, fieldMapping) => {
  const validItems = [];
  const invalidItems = [];

  data.forEach((item) => {
    const errors = validateArrayItem(item, rules, fieldMapping);
    if (!errors) {
      validItems.push(item);
    } else {
      invalidItems.push({ item, errors });
    }
  });

  return { validItems, invalidItems };
};
