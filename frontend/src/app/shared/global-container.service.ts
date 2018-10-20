import { Injectable } from '@angular/core';
import { Container } from '@tinystate/core';
export interface GlobalState {
  loading: boolean;
}

@Injectable()
export class GlobalContainerService extends Container<GlobalState> {
  getInitialState(): GlobalState {
    return {
      loading: false
    };
  }

  changeState(newState) {
    this.setState(state => (newState));
  }
}