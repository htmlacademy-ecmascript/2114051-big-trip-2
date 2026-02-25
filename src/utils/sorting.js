import dayjs from 'dayjs';
import { SortType } from '../const.js';
import { calculateDuration } from './date-utils.js';


const getWeightForNullDate = (dateA, dateB) => {
  if (dateA === null && dateB === null) {
    return 0;
  }

  if (dateA === null) {
    return 1;
  }

  if (dateB === null) {
    return -1;
  }

  return null;
};

const sortDayUp = (pointA, pointB) => {
  const weight = getWeightForNullDate(pointA.dateFrom, pointB.dateFrom);
  return weight ?? dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom));
};

const sortDayDown = (pointA, pointB) => {
  const weight = getWeightForNullDate(pointA.dateFrom, pointB.dateFrom);
  return weight ?? dayjs(pointB.dateFrom).diff(dayjs(pointA.dateFrom));
};

const sortTime = (pointA, pointB) => {
  const durationA = calculateDuration(pointA.dateFrom, pointA.dateTo);
  const durationB = calculateDuration(pointB.dateFrom, pointB.dateTo);
  return durationB - durationA;
};

const sortPrice = (pointA, pointB) => pointB.basePrice - pointA.basePrice;

const sortingMethods = {
  [SortType.DAY]: (points) => [...points].sort(sortDayUp),
  [SortType.TIME]: (points) => [...points].sort(sortTime),
  [SortType.PRICE]: (points) => [...points].sort(sortPrice)
};

export {
  sortingMethods,
  sortDayUp,
  sortDayDown,
  sortTime,
  sortPrice,
  getWeightForNullDate
};
