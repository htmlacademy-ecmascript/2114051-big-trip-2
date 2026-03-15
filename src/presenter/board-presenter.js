import TripEventsView from '../view/trip-events-view.js';
import SortView from '../view/sort-view.js';
import TripInfoView from '../view/trip-info-view.js';
import { render, RenderPosition, remove } from '../framework/render.js';
import ListEmptyView from '../view/list-empty-view.js';
import SortModel from '../model/sort-model.js';
import PointPresenter from './point-presenter.js';
import { SortType, UserAction, UpdateType, FilterType, BLANK_POINT } from '../const.js';
import { sortDayUp, sortTime, sortPrice } from '../utils/sorting.js';
import { filterFunctions } from '../utils/filter-utils.js';
import FailedLoadView from '../view/failed-load-view.js';
import LoadingView from '../view/loading-view.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import { getTripTitle, getTripDates, getTotalCost } from '../utils/trip-info-utils.js';
import EditPointView from '../view/edit-point-view.js';


const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

export default class BoardPresenter {
  #boardContainer = null;
  #tripInfoContainer = null;
  #pointModel = null;
  #currentFilterModel = null;
  #sortModel = null;
  #newEventButton = null;
  #filterPresenter = null;

  #tripInfoComponent = null;
  #sortComponent = null;
  #listEmptyComponent = null;
  #loadingComponent = null;
  #failedLoadComponent = null;
  #newPointEditComponent = null;

  #pointPresenters = new Map();
  tripEventsView = new TripEventsView();

  #currentSortType = SortType.DAY;
  #currentFilterType = FilterType.EVERYTHING;
  #isLoading = true;
  #isFailedLoad = false;

  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  constructor({ boardContainer, tripInfoContainer, pointModel, currentFilterModel, newEventButton, filterPresenter }) {
    this.#boardContainer = boardContainer;
    this.#tripInfoContainer = tripInfoContainer;
    this.#pointModel = pointModel;
    this.#currentFilterModel = currentFilterModel;
    this.#newEventButton = newEventButton;
    this.#filterPresenter = filterPresenter;

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

  createPoint = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());

    if (this.#newPointEditComponent) {
      remove(this.#newPointEditComponent);
      this.#newPointEditComponent = null;
    }

    this.#currentFilterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#currentSortType = SortType.DAY;

    const newPoint = { ...BLANK_POINT, dateFrom: new Date(), dateTo: new Date() };

    this.#newPointEditComponent = new EditPointView({
      point: newPoint,
      destinations: this.#pointModel.destinations,
      offers: this.#pointModel.offers,
      onFormSubmit: this.#handleNewPointSubmit,
      onDeleteClick: this.#handleNewPointDelete,
      onCloseClick: this.#handleNewPointClose
    });

    document.addEventListener('keydown', this.#onEscKeyDown);

    const pointsList = this.tripEventsView.element.querySelector('.trip-events__list');
    if (pointsList) {
      render(this.#newPointEditComponent, pointsList, RenderPosition.AFTERBEGIN);
      this.#newEventButton.disabled = true;
    }
  };

  #onEscKeyDown = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      if (this.#newPointEditComponent) {
        this.#handleNewPointClose();
      }
    }
  };

  #handleNewPointSubmit = async (point) => {
    try {
      await this.#pointModel.addPoint(UpdateType.MINOR, point);
      document.removeEventListener('keydown', this.#onEscKeyDown);
      remove(this.#newPointEditComponent);
      this.#newPointEditComponent = null;
      this.#newEventButton.disabled = false;
    } catch(err) {
      this.#newPointEditComponent.shake();
    }
  };

  #handleNewPointDelete = () => {
    document.removeEventListener('keydown', this.#onEscKeyDown);
    remove(this.#newPointEditComponent);
    this.#newPointEditComponent = null;
    this.#newEventButton.disabled = false;
  };

  #handleNewPointClose = () => {
    document.removeEventListener('keydown', this.#onEscKeyDown);
    remove(this.#newPointEditComponent);
    this.#newPointEditComponent = null;
    this.#newEventButton.disabled = false;
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();

    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointPresenters.get(update.id).setSaving();
        try {
          await this.#pointModel.updatePoint(updateType, update);
        } catch(err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
      case UserAction.DELETE_POINT:
        this.#pointPresenters.get(update.id).setDeleting();
        try {
          await this.#pointModel.deletePoint(updateType, update);
        } catch(err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
    }

    this.#uiBlocker.unblock();
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        if (this.#pointPresenters.has(data.id)) {
          const fullPointInfo = this.#pointModel.getFullPointInfo(data);
          this.#pointPresenters.get(data.id).init(fullPointInfo);
        }
        this.#updateTripInfo();
        break;
      case UpdateType.MINOR:
        this.#clearPointsList();
        this.#renderPoints();
        this.#updateTripInfo();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({ resetSortType: true });
        this.#renderBoard();
        this.#updateTripInfo();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        this.#isFailedLoad = false;
        this.#newEventButton.disabled = false;
        remove(this.#loadingComponent);
        this.#renderBoard();
        this.#updateTripInfo();
        if (this.#filterPresenter) {
          this.#filterPresenter.setFiltersDisabled(false);
        }
        break;
    }
  };

  #updateTripInfo() {
    if (this.#tripInfoComponent) {
      remove(this.#tripInfoComponent);
      this.#tripInfoComponent = null;
    }

    const points = this.#pointModel.points;

    if (!points || points.length === 0 || this.#isLoading || this.#isFailedLoad) {
      return;
    }

    const destinations = this.#pointModel.destinations;
    const offers = this.#pointModel.offers;

    const tripInfoData = {
      title: getTripTitle(points, destinations),
      dates: getTripDates(points),
      totalCost: getTotalCost(points, offers)
    };

    this.#tripInfoComponent = new TripInfoView({ tripInfo: tripInfoData });

    if (this.#tripInfoContainer) {
      render(this.#tripInfoComponent, this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
    }
  }

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;

    this.#clearSort();
    this.#renderSort();
    this.#clearPointsList();
    this.#renderPoints();
  };

  #clearSort() {
    if (this.#sortComponent) {
      remove(this.#sortComponent);
      this.#sortComponent = null;
    }
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

    if (this.#filterPresenter) {
      this.#filterPresenter.setFiltersDisabled(true);
    }
  }

  #renderPoint(point, container) {
    const pointPresenter = new PointPresenter({
      pointContainer: container,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
      destinations: this.#pointModel.destinations,
      offers: this.#pointModel.offers
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
    if (this.#newPointEditComponent) {
      document.removeEventListener('keydown', this.#onEscKeyDown);
      remove(this.#newPointEditComponent);
      this.#newPointEditComponent = null;
    }

    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
    this.#clearSort();

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

    if (this.#tripInfoComponent) {
      remove(this.#tripInfoComponent);
      this.#tripInfoComponent = null;
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

    if (this.#isFailedLoad) {
      this.#renderFailedLoad();
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
    this.#renderBoard();
    if (!this.#isLoading && !this.#isFailedLoad && this.#pointModel.points.length > 0) {
      this.#updateTripInfo();
    }
  }

  init() {
    this.render();
  }

  setLoading() {
    this.#isLoading = true;
    this.#isFailedLoad = false;
    this.#newEventButton.disabled = true;
    this.#clearBoard();
    this.#renderBoard();
  }

  setFailedLoad() {
    this.#isLoading = false;
    this.#isFailedLoad = true;
    this.#newEventButton.disabled = true;
    this.#clearBoard();
    this.#renderBoard();
  }
}
