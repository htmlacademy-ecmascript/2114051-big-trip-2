import { FilterType } from '../const.js';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const isFuturePoint = (dateFrom) => {
  if (!dateFrom) {
    return false;
  }
  return dayjs(dateFrom).isAfter(dayjs(), 'minute');
};

const isPresentPoint = (dateFrom, dateTo) => {
  if (!dateFrom || !dateTo) {
    return false;
  }
  const now = dayjs();
  return now.isAfter(dayjs(dateFrom), 'minute') && now.isBefore(dayjs(dateTo), 'minute');
};

const isPastPoint = (dateTo) => {
  if (!dateTo) {
    return false;
  }
  return dayjs(dateTo).isBefore(dayjs(), 'minute');
};


const filterFunctions = {
  [FilterType.EVERYTHING]: (points) => [...points],

  [FilterType.FUTURE]: (points) => points.filter((point) => isFuturePoint(point.dateFrom)),
  [FilterType.PRESENT]: (points) => points.filter((point) => isPresentPoint(point.dateFrom, point.dateTo)),
  [FilterType.PAST]: (points) => points.filter((point) => isPastPoint(point.dateTo))
};

export { filterFunctions, isFuturePoint, isPresentPoint, isPastPoint };
