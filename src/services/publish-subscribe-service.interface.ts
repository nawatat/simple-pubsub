import { IEvent } from "../events";
import { ISubscriber } from "../subscribers/subscriber.interface";

export interface IPublishSubscribeService {
  publish(event: IEvent): void;
  subscribe(type: string, handler: ISubscriber): void;
  unsubscribe(type: string, handler: ISubscriber): void;
}
