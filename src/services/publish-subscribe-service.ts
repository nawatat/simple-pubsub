import { IPublishSubscribeService } from "./publish-subscribe-service.interface";
import { IEvent } from "../events";
import { ISubscriber } from "../subscribers/subscriber.interface";
import { EventType } from "../enums/event-type.enum";

export class PublishSubscribeService implements IPublishSubscribeService {
  constructor(
    private _eventTypeToSubscribers: Record<string, ISubscriber[]> = {},
    private _eventQueues: IEvent[] = [],
    private _isRunningQueue: boolean = false
  ) {}

  publish(event: IEvent): void {
    this._eventQueues.push(event);

    if (this._isRunningQueue) return;

    while (this._eventQueues.length > 0) {
      this._isRunningQueue = true;
      const currentEvent: IEvent = this._eventQueues.shift()!;
      const subscribers: ISubscriber[] =
        this._eventTypeToSubscribers[currentEvent.type()];
      if (subscribers) {
        for (const subscriber of subscribers) {
          subscriber.handle(currentEvent);
        }
      }
    }

    this._isRunningQueue = false;
  }

  subscribe(type: EventType, handler: ISubscriber): void {
    if (type in this._eventTypeToSubscribers) {
      this._eventTypeToSubscribers[type].push(handler);
    } else {
      this._eventTypeToSubscribers[type] = [handler];
    }
  }

  unsubscribe(type: EventType, handler: ISubscriber): void {
    if (type in this._eventTypeToSubscribers) {
      // filter out handler that want to unsub
      const subscribers = this._eventTypeToSubscribers[type].filter(
        (sub) => sub !== handler
      );
      this._eventTypeToSubscribers[type] = subscribers;
    }
  }
}
