import dayjs from 'dayjs';

function isDatesEqual(dateA, dateB) {
  if (dateA === null && dateB === null) {
    return true;
  }
  if (dateA === null || dateB === null) {
    return false;
  }
  return dayjs(dateA).isSame(dateB, 'minute');
}

function isPointTypeEqual(typeA, typeB) {
  return typeA === typeB;
}

function isPriceEqual(priceA, priceB) {
  return priceA === priceB;
}

export {
  isDatesEqual,
  isPointTypeEqual,
  isPriceEqual
};
