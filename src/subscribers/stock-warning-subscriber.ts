import { ISubscriber } from "./subscriber.interface";
import { LowStockWarningEvent, StockLevelOkEvent } from "../events";
import { Machine } from "../machines";
import { EventType } from "../enums/event-type.enum";

export class StockWarningSubscriber implements ISubscriber {
  public machines: Machine[];

  constructor(machines: Machine[]) {
    this.machines = machines;
  }

  handle(event: LowStockWarningEvent | StockLevelOkEvent): void {
    const machineId: string = event.machineId();
    const machine: Machine | undefined = this.machines.find(
      (machine) => machine.id === machineId
    );

    if (machine) {
      if (event.type() === EventType.LowStockAlert) {
        console.log(
          `Machine ${machineId} remaining stock is ${machine?.stockLevel}. Please refill !.`
        );
      } else if (event.type() === EventType.StockOkAlert) {
        console.log(
          `Machine ${machineId} remaining stock is ${machine?.stockLevel}. OK !.`
        );
      }
    }
  }
}
