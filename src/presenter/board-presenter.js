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

  constructor({ boardContainer, tripInfoContainer, filterContainer, pointModel }) {
    this.#boardContainer = boardContainer;
    this.#tripInfoContainer = tripInfoContainer;
    this.#filterContainer = filterContainer;
    this.#pointModel = pointModel;
  }

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
    this.#sortComponent = new SortView({ sortData });
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
      pointContainer: container
    });

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #clearPointPresenters() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #renderPoints() {
    const tripEventsElement = this.tripEventsView.element;
    const pointsList = tripEventsElement.querySelector('.trip-events__list');

    pointsList.innerHTML = '';
    this.#clearPointPresenters();

    this.#boardPointModules.forEach((point) => {
      this.#renderPoint(point, pointsList);
    });
  }

  #renderBoard() {
    this.#boardContainer.innerHTML = '';
    this.#clearPointPresenters();

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

    this.#filterModel = new FilterModel(this.#boardPointModules);
    this.#sortModel = new SortModel(this.#boardPointModules);

    this.render();
  }
}
