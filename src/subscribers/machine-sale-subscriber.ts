import { ISubscriber } from "./subscriber.interface";
import { LowStockWarningEvent, MachineSaleEvent } from "../events";
import { Machine } from "../machines";
import { PublishSubscribeService } from "../services";
import { MachineStockStatus } from "../enums/machine-stock-status.enum";

export class MachineSaleSubscriber implements ISubscriber {
  public machines: Machine[];
  public pubsubService: PublishSubscribeService;

  constructor(machines: Machine[], pubsubService: PublishSubscribeService) {
    this.machines = machines;
    this.pubsubService = pubsubService;
  }

  handle(event: MachineSaleEvent): void {
    const machineId: string = event.machineId();
    const machine: Machine | undefined = this.machines.find(
      (machine) => machine.id === machineId
    );
    if (machine) {
      machine.stockLevel -= event.getSoldQuantity();

      if (
        machine.stockLevel <= 3 &&
        machine.stockStatus === MachineStockStatus.Normal
      ) {
        this.pubsubService.publish(new LowStockWarningEvent(machineId));
        machine.stockStatus = MachineStockStatus.Low;
      }
    }
  }
}
