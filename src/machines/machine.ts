import { MachineStockStatus } from "../enums/machine-stock-status.enum";

export class Machine {
  public stockLevel: number;
  public id: string;
  public stockStatus: MachineStockStatus = MachineStockStatus.Normal;

  constructor(id: string, stockLevel: number) {
    this.id = id;
    this.stockLevel = stockLevel;
  }
}
