import { FilterType } from '../const.js';
import { filterFunctions } from '../utils/filter-utils.js';

const generateFiltersData = (points = []) => {

  if (!points || points.length === 0) {
    return [
      {
        type: FilterType.EVERYTHING,
        name: 'Everything',
        count: 0,
        isDisabled: false,
        isChecked: true
      },
      {
        type: FilterType.FUTURE,
        name: 'Future',
        count: 0,
        isDisabled: true,
        isChecked: false
      },
      {
        type: FilterType.PRESENT,
        name: 'Present',
        count: 0,
        isDisabled: true,
        isChecked: false
      },
      {
        type: FilterType.PAST,
        name: 'Past',
        count: 0,
        isDisabled: true,
        isChecked: false
      }
    ];
  }


  const filtersData = [];

  for (const filterType of Object.values(FilterType)) {
    const filterFunction = filterFunctions[filterType];
    const filteredPoints = filterFunction(points);

    filtersData.push({
      type: filterType,
      name: capitalizeFirstLetter(filterType),
      count: filteredPoints.length,
      isDisabled: filteredPoints.length === 0,
      isChecked: filterType === FilterType.EVERYTHING
    });
  }

  return filtersData;
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export { generateFiltersData };
