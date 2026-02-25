import TripEventsView from '../view/trip-events-view.js';
import SortView from '../view/sort-view.js';
import TripInfoView from '../view/trip-info-view.js';
import FilterView from '../view/filter-view.js';
import { render, RenderPosition } from '../framework/render.js';
import { createTripInfoData } from '../mock/mock-trip-info-data.js';
import ListEmptyView from '../view/list-empty-view.js';
import FilterModel from '../model/filter-model.js';
import SortModel from '../model/sort-model.js';
import PointPresenter from './point-presenter.js';
import { updateItem } from '../utils/utils.js';
import { SortType } from '../const.js';
import { sortDayUp, sortTime, sortPrice } from '../utils/sorting.js';

export default class BoardPresenter {
  #boardContainer = null;
  #tripInfoContainer = null;
  #filterContainer = null;
  #pointModel = null;
  #boardPointModules = [];
  #filterModel = null;
  #sortModel = null;

  #tripInfoComponent = null;
  #filterComponent = null;
  #sortComponent = null;
  #listEmptyComponent = null;

  #pointPresenters = new Map();
  tripEventsView = new TripEventsView();

  #currentSortType = SortType.DAY;
  #sourcedBoardPoints = [];

  constructor({ boardContainer, tripInfoContainer, filterContainer, pointModel }) {
    this.#boardContainer = boardContainer;
    this.#tripInfoContainer = tripInfoContainer;
    this.#filterContainer = filterContainer;
    this.#pointModel = pointModel;
  }

  #handlePointChange = (updatedPoint) => {
    this.#boardPointModules = updateItem(this.#boardPointModules, updatedPoint);
    this.#sourcedBoardPoints = updateItem(this.#sourcedBoardPoints, updatedPoint);
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #sortPoints(sortType) {
    switch (sortType) {
      case SortType.DAY:
        this.#boardPointModules.sort(sortDayUp);
        break;
      case SortType.TIME:
        this.#boardPointModules.sort(sortTime);
        break;
      case SortType.PRICE:
        this.#boardPointModules.sort(sortPrice);
        break;
      default:
        this.#boardPointModules = [...this.#sourcedBoardPoints];
    }

    this.#currentSortType = sortType;
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#sortPoints(sortType);
    this.#clearPointsList();
    this.#renderPoints();
  };

  #renderTripInfo() {
    const tripInfoData = createTripInfoData(this.#boardPointModules);
    this.#tripInfoComponent = new TripInfoView({ tripInfo: tripInfoData });
    render(this.#tripInfoComponent, this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
  }

  #renderFilters() {
    const filtersData = this.#filterModel.filters;
    this.#filterComponent = new FilterView({ filters: filtersData });
    render(this.#filterComponent, this.#filterContainer);
  }

  #renderSort() {
    const sortData = this.#sortModel.sortItems;
    this.#sortComponent = new SortView({
      sortData,
      onSortTypeChange: this.#handleSortTypeChange
    });
    const tripEventsElement = this.tripEventsView.element;
    render(this.#sortComponent, tripEventsElement, RenderPosition.BEFOREBEGIN);
  }

  #renderNoPoints() {
    this.#listEmptyComponent = new ListEmptyView();
    const tripEventsElement = this.tripEventsView.element;
    render(this.#listEmptyComponent, tripEventsElement);
  }

  #renderPoint(point, container) {
    const pointPresenter = new PointPresenter({
      pointContainer: container,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#handleModeChange
    });

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #clearPointsList() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #renderPoints() {
    const tripEventsElement = this.tripEventsView.element;
    const pointsList = tripEventsElement.querySelector('.trip-events__list');

    this.#clearPointsList();
    pointsList.innerHTML = '';

    this.#boardPointModules.forEach((point) => {
      this.#renderPoint(point, pointsList);
    });
  }

  #renderBoard() {
    this.#boardContainer.innerHTML = '';
    this.#clearPointsList();

    render(this.tripEventsView, this.#boardContainer);
    this.#renderTripInfo();
    this.#renderFilters();

    if (this.#boardPointModules.length === 0) {
      this.#renderNoPoints();
      return;
    }

    this.#renderSort();
    this.#renderPoints();
  }

  render() {
    this.#renderBoard();
  }

  init() {
    const rawPoints = this.#pointModel.points;
    this.#boardPointModules = [];

    for (const rawPoint of rawPoints) {
      const fullPointInfo = this.#pointModel.getFullPointInfo(rawPoint);
      if (fullPointInfo) {
        this.#boardPointModules.push(fullPointInfo);
      }
    }

    this.#sourcedBoardPoints = [...this.#boardPointModules];

    this.#filterModel = new FilterModel(this.#boardPointModules);
    this.#sortModel = new SortModel(this.#boardPointModules);

    this.render();
  }
}
