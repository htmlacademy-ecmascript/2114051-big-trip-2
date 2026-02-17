import TripEventsView from '../view/trip-events-view.js';
import SortView from '../view/sort-view.js';
import EditPointView from '../view/edit-point-view.js';
import PointView from '../view/point-view.js';
import TripInfoView from '../view/trip-info-view.js';
import FilterView from '../view/filter-view.js';
import { render, RenderPosition, replace } from '../framework/render.js';
import { createTripInfoData } from '../mock/mock-trip-info-data.js';
import ListEmptyView from '../view/list-empty-view.js';
import FilterModel from '../model/filter-model.js';
import SortModel from '../model/sort-model.js';

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
    const escKeyDownHandler = (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        replaceFormToPoint();
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    };

    const pointComponent = new PointView({
      point,
      onEditClick: () => {
        replacePointToForm();
        document.addEventListener('keydown', escKeyDownHandler);
      }
    });

    const pointEditComponent = new EditPointView({
      point,
      onFormSubmit: () => {
        replaceFormToPoint();
        document.removeEventListener('keydown', escKeyDownHandler);
      },
      onCloseClick: () => {
        replaceFormToPoint();
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    });

    function replacePointToForm() {
      replace(pointEditComponent, pointComponent);
    }

    function replaceFormToPoint() {
      replace(pointComponent, pointEditComponent);
    }

    render(pointComponent, container);
  }

  #renderPoints() {
    const tripEventsElement = this.tripEventsView.element;
    const pointsList = tripEventsElement.querySelector('.trip-events__list');

    this.#boardPointModules.forEach((point) => {
      this.#renderPoint(point, pointsList);
    });
  }

  #renderBoard() {
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
