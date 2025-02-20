import { IEvent } from "../events";

export interface ISubscriber {
  handle(event: IEvent): void;
}
