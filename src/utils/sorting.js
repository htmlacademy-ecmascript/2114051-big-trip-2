import { SortType } from '../const.js';
import { calculateDuration } from './date-utils.js';

const sortingMethods = {
  [SortType.DAY]: (points) =>
    [...points].sort((a, b) =>
      new Date(a.dateFrom) - new Date(b.dateFrom)
    ),

  [SortType.TIME]: (points) =>
    [...points].sort((a, b) => {
      const durationA = calculateDuration(a.dateFrom, a.dateTo);
      const durationB = calculateDuration(b.dateFrom, b.dateTo);
      return durationB - durationA;
    }),

  [SortType.PRICE]: (points) =>
    [...points].sort((a, b) => b.basePrice - a.basePrice)
};

export { sortingMethods };
