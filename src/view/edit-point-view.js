import { createElement } from '../render';
import { BLANK_POINT } from '../const.js';
import { createEditPointTemplate } from './edit-point-template.js';

export default class EditPointView {
  constructor({point = BLANK_POINT}) {
    this.point = point;
  }

  getTemplate() {
    return createEditPointTemplate(this.point);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }

    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
