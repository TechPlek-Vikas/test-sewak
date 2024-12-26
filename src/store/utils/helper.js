export const filterByKey = (array, key, value) => {
  return array.filter((item) => item[key] !== value);
};
