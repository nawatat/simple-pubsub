import { ISubscriber } from "./subscriber.interface";
import { MachineRefillEvent, StockLevelOkEvent } from "../events";
import { Machine } from "../machines";
import { PublishSubscribeService } from "../services";
import { MachineStockStatus } from "../enums/machine-stock-status.enum";

export class MachineRefillSubscriber implements ISubscriber {
  public machines: Machine[];
  public pubsubService: PublishSubscribeService;

  constructor(machines: Machine[], pubsubService: PublishSubscribeService) {
    this.machines = machines;
    this.pubsubService = pubsubService;
  }

  handle(event: MachineRefillEvent): void {
    const machineId: string = event.machineId();
    const machine: Machine | undefined = this.machines.find(
      (machine) => machine.id === machineId
    );
    if (machine) {
      machine.stockLevel += event.getRefillQuantity();

      if (
        machine.stockLevel >= 3 &&
        machine.stockStatus === MachineStockStatus.Low
      ) {
        this.pubsubService.publish(new StockLevelOkEvent(machineId));
        machine.stockStatus = MachineStockStatus.Normal;
      }
    }
  }
}
