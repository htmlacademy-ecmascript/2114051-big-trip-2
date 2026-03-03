import TripEventsView from '../view/trip-events-view.js';
import SortView from '../view/sort-view.js';
import TripInfoView from '../view/trip-info-view.js';
import FilterView from '../view/filter-view.js';
import { render, RenderPosition, remove } from '../framework/render.js';
import { createTripInfoData } from '../mock/mock-trip-info-data.js';
import ListEmptyView from '../view/list-empty-view.js';
import FilterModel from '../model/filter-model.js';
import SortModel from '../model/sort-model.js';
import PointPresenter from './point-presenter.js';
import { SortType, UserAction, UpdateType } from '../const.js';
import { sortDayUp, sortTime, sortPrice } from '../utils/sorting.js';


export default class BoardPresenter {
  #boardContainer = null;
  #tripInfoContainer = null;
  #filterContainer = null;
  #pointModel = null;
  #filterModel = null;
  #sortModel = null;

  #tripInfoComponent = null;
  #filterComponent = null;
  #sortComponent = null;
  #listEmptyComponent = null;

  #pointPresenters = new Map();
  tripEventsView = new TripEventsView();

  #currentSortType = SortType.DAY;

  constructor({ boardContainer, tripInfoContainer, filterContainer, pointModel }) {
    this.#boardContainer = boardContainer;
    this.#tripInfoContainer = tripInfoContainer;
    this.#filterContainer = filterContainer;
    this.#pointModel = pointModel;

    this.#pointModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    const points = [...this.#pointModel.points];

    switch (this.#currentSortType) {
      case SortType.DAY:
        return points.sort(sortDayUp);
      case SortType.TIME:
        return points.sort(sortTime);
      case SortType.PRICE:
        return points.sort(sortPrice);
      default:
        return points;
    }
  }

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this.#pointModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this.#pointModel.deletePoint(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        if (this.#pointPresenters.has(data.id)) {
          this.#pointPresenters.get(data.id).init(data);
        }
        break;
      case UpdateType.MINOR:
        this.#clearPointsList();
        this.#renderPoints();
        this.#updateTripInfo();
        this.#updateFilters();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard();
        this.#renderBoard();
        this.#updateTripInfo();
        this.#updateFilters();
        break;
    }
  };

  #updateTripInfo() {
    if (this.#tripInfoComponent) {
      remove(this.#tripInfoComponent);
    }
    const tripInfoData = createTripInfoData(this.points);
    this.#tripInfoComponent = new TripInfoView({ tripInfo: tripInfoData });
    render(this.#tripInfoComponent, this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
  }

  #updateFilters() {
    if (this.#filterComponent) {
      remove(this.#filterComponent);
    }
    this.#filterModel = new FilterModel(this.#pointModel.points);
    const filtersData = this.#filterModel.filters;
    this.#filterComponent = new FilterView({ filters: filtersData });
    render(this.#filterComponent, this.#filterContainer);
  }

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearPointsList();
    this.#renderPoints();
  };

  #renderTripInfo() {
    const tripInfoData = createTripInfoData(this.points);
    this.#tripInfoComponent = new TripInfoView({ tripInfo: tripInfoData });
    render(this.#tripInfoComponent, this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
  }

  #renderFilters() {
    this.#filterModel = new FilterModel(this.#pointModel.points);
    const filtersData = this.#filterModel.filters;
    this.#filterComponent = new FilterView({ filters: filtersData });
    render(this.#filterComponent, this.#filterContainer);
  }

  #renderSort() {
    this.#sortModel = new SortModel(this.#pointModel.points);
    const sortData = this.#sortModel.sortItems;
    this.#sortComponent = new SortView({
      sortData,
      currentSortType: this.#currentSortType,
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
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange
    });

    const fullPointInfo = this.#pointModel.getFullPointInfo(point);
    pointPresenter.init(fullPointInfo);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #clearPointsList() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #renderPoints() {
    const tripEventsElement = this.tripEventsView.element;
    const pointsList = tripEventsElement.querySelector('.trip-events__list');

    pointsList.innerHTML = '';
    this.#clearPointsList();
    this.points.forEach((point) => this.#renderPoint(point, pointsList));
  }

  #clearBoard() {
    this.#clearPointsList();

    if (this.#sortComponent) {
      remove(this.#sortComponent);
      this.#sortComponent = null;
    }

    if (this.#listEmptyComponent) {
      remove(this.#listEmptyComponent);
      this.#listEmptyComponent = null;
    }

    this.#boardContainer.innerHTML = '';
  }

  #renderBoard() {
    render(this.tripEventsView, this.#boardContainer);

    const points = this.points;
    const pointCount = points.length;

    if (pointCount === 0) {
      this.#renderNoPoints();
      return;
    }

    this.#renderSort();
    this.#renderPoints();
  }

  render() {
    this.#renderTripInfo();
    this.#renderFilters();
    this.#renderBoard();
  }

  init() {
    this.render();
  }
}
