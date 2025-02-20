import { IEvent } from "./event.interface";
import { EventType } from "../enums/event-type.enum";

export class LowStockWarningEvent implements IEvent {
  constructor(private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  type(): EventType {
    return EventType.LowStockAlert;
  }
}
