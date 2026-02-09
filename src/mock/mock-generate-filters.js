import { filterFunctions } from '../utils/filter-utils.js';


const createFilterData = (tripPoints) => {
  const points = tripPoints || [];
  const filterData = [];

  for (const [filterType, filterFunction] of Object.entries(filterFunctions)) {
    const filteredPoints = filterFunction(points);

    filterData.push({
      type: filterType,
      count: filteredPoints.length
    });
  }

  return filterData;
};

export { createFilterData };
