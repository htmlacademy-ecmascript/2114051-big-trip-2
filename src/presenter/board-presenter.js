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

  tripEventsView = new TripEventsView();

  constructor({ boardContainer, tripInfoContainer, filterContainer, pointModel }) {
    this.#boardContainer = boardContainer;
    this.#tripInfoContainer = tripInfoContainer;
    this.#filterContainer = filterContainer;
    this.#pointModel = pointModel;
  }

  #openEditForm(point, pointElement) {
    const editForm = new EditPointView({ point });
    const editFormElement = editForm.element;
    const closeButton = editFormElement.querySelector('.event__rollup-btn');

    if (closeButton) {
      closeButton.addEventListener('click', () => {
        editFormElement.replaceWith(pointElement);
      });
    }

    pointElement.replaceWith(editFormElement);
  }

  render() {
    this.#renderBoard();
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

  #renderBoard() {
    const filtersData = this.#filterModel.filters;
    const sortData = this.#sortModel.sortItems;
    const tripInfoData = createTripInfoData(this.#boardPointModules);

    render(new TripInfoView({ tripInfo: tripInfoData }), this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
    render(new FilterView({ filters: filtersData }), this.#filterContainer);
    render(this.tripEventsView, this.#boardContainer);

    const tripEventsElement = this.tripEventsView.element;
    render(new SortView({ sortData }), tripEventsElement, RenderPosition.BEFOREBEGIN);

    if (this.#boardPointModules.length === 0) {
      render(new ListEmptyView(), tripEventsElement);
      return;
    }

    const pointsList = tripEventsElement.querySelector('.trip-events__list');
    this.#boardPointModules.forEach((point) => {
      this.#renderPoint(point, pointsList);
    });
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
