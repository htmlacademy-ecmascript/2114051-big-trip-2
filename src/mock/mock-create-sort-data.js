import { sortingMethods } from '../utils/sorting';


const createSortData = (points) =>
  Object.entries(sortingMethods).map(
    ([sortType, sortFunction]) => {
      const sortedPoints = sortFunction ? sortFunction(points) : null;

      return {
        type: sortType,
        points: sortedPoints
      };
    }
  );


export { createSortData };
