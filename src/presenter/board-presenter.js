import TripEventsView from '../view/trip-events-view.js';
import SortView from '../view/sort-view.js';
import EditPointView from '../view/edit-point-view.js';
import PointView from '../view/point-view.js';
import TripInfoView from '../view/trip-info-view.js';
import FilterView from '../view/filter-view.js';
import { render, RenderPosition, remove, replace } from '../framework/render.js';
import { POINT_COUNT_PER_STEP } from '../const.js';
import LoadMoreButtonView from '../view/load-more-button-view.js';

export default class BoardPresenter {
  #boardContainer = null;
  #tripInfoContainer = null;
  #filterContainer = null;
  #pointModel = null;
  #boardPointModules = [];
  #renderedPointCount = POINT_COUNT_PER_STEP;
  #loadMoreButtonComponent = null;

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
    render(new TripInfoView(), this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
    render(new FilterView(), this.#filterContainer);
    render(this.tripEventsView, this.#boardContainer);

    const tripEventsElement = this.tripEventsView.element;

    render(new SortView(), tripEventsElement, RenderPosition.BEFOREBEGIN);

    const pointsList = tripEventsElement.querySelector('.trip-events__list');

    for (let i = 0; i < Math.min(this.#boardPointModules.length, POINT_COUNT_PER_STEP); i++) {
      this.#renderPoint(this.#boardPointModules[i], pointsList);
    }

    if (this.#boardPointModules.length > POINT_COUNT_PER_STEP) {
      this.#loadMoreButtonComponent = new LoadMoreButtonView({
        onClick: this.#handleLoadMoreButtonClick
      });
      render(this.#loadMoreButtonComponent, tripEventsElement);
    }
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

  #handleLoadMoreButtonClick = () => {
    const nextPoints = this.#boardPointModules.slice(
      this.#renderedPointCount,
      this.#renderedPointCount + POINT_COUNT_PER_STEP
    );

    const pointsList = this.tripEventsView.element.querySelector('.trip-events__list');
    nextPoints.forEach((point) => this.#renderPoint(point, pointsList));

    this.#renderedPointCount += POINT_COUNT_PER_STEP;

    if (this.#renderedPointCount >= this.#boardPointModules.length) {
      remove(this.#loadMoreButtonComponent);
      this.#loadMoreButtonComponent = null;
    }
  };

  init() {
    const rawPoints = this.#pointModel.points;
    this.boardPointModules = [];

    for (const rawPoint of rawPoints) {
      const fullPointInfo = this.#pointModel.getFullPointInfo(rawPoint);

      if (fullPointInfo) {
        this.#boardPointModules.push(fullPointInfo);
      }
    }

    this.render();
  }
}
