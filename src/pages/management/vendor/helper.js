import { EMAIL_REGEX_PATTERN, MOBILE_NUMBER_REGEX_PATTERN, PIN_CODE_REGEX_PATTERN } from 'constant';

export const isRequiredString = (value) => typeof value === 'string' && value.trim() !== '';

export const isPositiveNumber = (value) => typeof value === 'number' && value > 0;

export const isValidEmail = (value) => typeof value === 'string' && EMAIL_REGEX_PATTERN.test(value);

export const isString = (value) => typeof value === 'string' || typeof value === 'undefined';

export const isPinCode = (value) => typeof value === 'number' && PIN_CODE_REGEX_PATTERN.test(value.toString());

export const isMobileNumber = (value) => typeof value === 'number' && MOBILE_NUMBER_REGEX_PATTERN.test(value.toString()); // Validates exactly 10-digit mobile number

export const isNumber = (value) => typeof value === 'number' || typeof value === 'undefined';

// Function to validate an array item using rules
export const validateArrayItem = (item, rules) => {
  return Object.entries(rules).every(([index, validationFn]) => validationFn(item[Number(index)]));
};

// Separate valid and invalid items
export const separateValidAndInvalidItems = (data, rules) => {
  const validItems = [];
  const invalidItems = [];

  data.forEach((item) => {
    if (validateArrayItem(item, rules)) {
      validItems.push(item);
    } else {
      invalidItems.push(item);
    }
  });

  return { validItems, invalidItems };
};
