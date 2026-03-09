import TripEventsView from '../view/trip-events-view.js';
import SortView from '../view/sort-view.js';
import TripInfoView from '../view/trip-info-view.js';
import { render, RenderPosition, remove } from '../framework/render.js';
import { createTripInfoData } from '../mock/mock-trip-info-data.js';
import ListEmptyView from '../view/list-empty-view.js';
import SortModel from '../model/sort-model.js';
import PointPresenter from './point-presenter.js';
import { SortType, UserAction, UpdateType, FilterType } from '../const.js';
import { sortDayUp, sortTime, sortPrice } from '../utils/sorting.js';
import { filterFunctions } from '../utils/filter-utils.js';
import FailedLoadView from '../view/failed-load-view.js';
import LoadingView from '../view/loading-view.js';


export default class BoardPresenter {
  #boardContainer = null;
  #tripInfoContainer = null;
  #filterContainer = null;
  #pointModel = null;
  #currentFilterModel = null;
  #sortModel = null;

  #tripInfoComponent = null;
  #sortComponent = null;
  #listEmptyComponent = null;
  #loadingComponent = null;
  #failedLoadComponent = null;

  #pointPresenters = new Map();
  tripEventsView = new TripEventsView();

  #currentSortType = SortType.DAY;
  #currentFilterType = FilterType.EVERYTHING;
  #isLoading = true;

  constructor({ boardContainer, tripInfoContainer, filterContainer, pointModel, currentFilterModel }) {
    this.#boardContainer = boardContainer;
    this.#tripInfoContainer = tripInfoContainer;
    this.#filterContainer = filterContainer;
    this.#pointModel = pointModel;
    this.#currentFilterModel = currentFilterModel;

    this.#pointModel.addObserver(this.#handleModelEvent);
    this.#currentFilterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    this.#currentFilterType = this.#currentFilterModel.filter;
    const allPoints = [...this.#pointModel.points];
    const filteredPoints = filterFunctions[this.#currentFilterType](allPoints);

    switch (this.#currentSortType) {
      case SortType.DAY:
        return filteredPoints.sort(sortDayUp);
      case SortType.TIME:
        return filteredPoints.sort(sortTime);
      case SortType.PRICE:
        return filteredPoints.sort(sortPrice);
      default:
        return filteredPoints;
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
        break;
      case UpdateType.MAJOR:
        this.#clearBoard();
        this.#renderBoard();
        this.#updateTripInfo();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#renderBoard();
        this.#updateTripInfo();
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

  #handleFilterTypeChange = (filterType) => {
    if (this.#currentFilterModel.filter === filterType) {
      return;
    }
    this.#currentFilterModel.setFilter(UpdateType.MAJOR, filterType);
  };

  #renderTripInfo() {
    const tripInfoData = createTripInfoData(this.points);
    this.#tripInfoComponent = new TripInfoView({ tripInfo: tripInfoData });
    render(this.#tripInfoComponent, this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
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
    this.#listEmptyComponent = new ListEmptyView({ filterType: this.#currentFilterType });
    const tripEventsElement = this.tripEventsView.element;
    render(this.#listEmptyComponent, tripEventsElement);
  }

  #renderLoading() {
    this.#loadingComponent = new LoadingView();
    render(this.#loadingComponent, this.tripEventsView.element);
  }

  #renderFailedLoad() {
    this.#failedLoadComponent = new FailedLoadView();
    render(this.#failedLoadComponent, this.tripEventsView.element);
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

    this.points.forEach((point) => {
      this.#renderPoint(point, pointsList);
    });
  }

  #clearBoard({ resetSortType = false } = {}) {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    if (this.#sortComponent) {
      remove(this.#sortComponent);
      this.#sortComponent = null;
    }

    if (this.#listEmptyComponent) {
      remove(this.#listEmptyComponent);
      this.#listEmptyComponent = null;
    }

    if (this.#loadingComponent) {
      remove(this.#loadingComponent);
      this.#loadingComponent = null;
    }

    if (this.#failedLoadComponent) {
      remove(this.#failedLoadComponent);
      this.#failedLoadComponent = null;
    }

    this.#boardContainer.innerHTML = '';

    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }

  #renderBoard() {
    render(this.tripEventsView, this.#boardContainer);

    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

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
    this.#renderBoard();
  }

  init() {
    this.render();
  }

  setLoading() {
    this.#isLoading = true;
    this.#clearBoard();
    this.#renderBoard();
  }

  setFailedLoad() {
    this.#isLoading = false;
    this.#clearBoard();
    this.#renderFailedLoad();
  }
}
