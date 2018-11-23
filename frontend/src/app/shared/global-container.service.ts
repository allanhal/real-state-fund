import { Injectable } from '@angular/core';
import { Container } from '@tinystate/core';
export interface GlobalState {
  loading: boolean;
  targetPercentual: Number;
}

@Injectable()
export class GlobalContainerService extends Container<GlobalState> {
  getInitialState(): GlobalState {
    return {
      loading: false,
      targetPercentual: 8
    };
  }

  changeState(newState) {
    this.setState(state => (newState));
  }
}