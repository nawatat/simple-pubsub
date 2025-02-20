import { Machine } from "../machines";
import { PublishSubscribeService } from "../services";
import {
  MachineRefillSubscriber,
  MachineSaleSubscriber,
  StockWarningSubscriber,
} from "../subscribers";
import { EventType, MachineStockStatus } from "../enums";
import { MachineRefillEvent, MachineSaleEvent } from "../events";

describe("PubSub Service", () => {
  let machine1: Machine;
  let machine2: Machine;
  let pubSubService: PublishSubscribeService;
  let saleSubscriber: MachineSaleSubscriber;
  let refillSubscriber: MachineRefillSubscriber;
  let stockWarningSubscriber: StockWarningSubscriber;

  beforeEach(() => {
    machine1 = new Machine("001", 5);
    machine2 = new Machine("002", 5);
    const machines: Machine[] = [machine1, machine2];

    // create the PubSub service
    pubSubService = new PublishSubscribeService(); // implement and fix this

    saleSubscriber = new MachineSaleSubscriber(machines, pubSubService);
    refillSubscriber = new MachineRefillSubscriber(machines, pubSubService);
    stockWarningSubscriber = new StockWarningSubscriber(machines);
  });

  it("should subscribe event more than 1 subscriber", () => {
    const machine3 = new Machine("001", 5);
    const saleSubscriber2 = new MachineSaleSubscriber(
      [machine3],
      pubSubService
    );

    pubSubService.subscribe(EventType.Sale, saleSubscriber);
    pubSubService.subscribe(EventType.Sale, saleSubscriber2);

    const events = [
      new MachineSaleEvent(1, "001"),
      new MachineSaleEvent(1, "002"),
      new MachineSaleEvent(1, "003"),
    ];

    events.map((event) => pubSubService.publish(event));

    expect(machine1.stockLevel).toBe(4);
    expect(machine1.stockStatus).toBe(MachineStockStatus.Normal);
    expect(machine2.stockLevel).toBe(4);
    expect(machine2.stockStatus).toBe(MachineStockStatus.Normal);
    expect(machine2.stockLevel).toBe(4);
    expect(machine2.stockStatus).toBe(MachineStockStatus.Normal);
  });

  it("should handle sale event correctly", () => {
    pubSubService.subscribe(EventType.Sale, saleSubscriber);

    // create event
    const events = [
      new MachineSaleEvent(1, "001"),
      new MachineSaleEvent(3, "002"),
    ];
    events.map((event) => pubSubService.publish(event));

    expect(machine1.stockLevel).toBe(4);
    expect(machine1.stockStatus).toBe(MachineStockStatus.Normal);
    expect(machine2.stockLevel).toBe(2);
    expect(machine2.stockStatus).toBe(MachineStockStatus.Low);
  });

  it("should handle refill event correctly", () => {
    pubSubService.subscribe(EventType.Refill, refillSubscriber);
    // create event
    const events = [
      new MachineRefillEvent(1, "001"),
      new MachineRefillEvent(3, "002"),
      new MachineRefillEvent(1, "001"),
    ];
    events.map((event) => pubSubService.publish(event));

    expect(machine1.stockLevel).toBe(7);
    expect(machine1.stockStatus).toBe(MachineStockStatus.Normal);
    expect(machine2.stockLevel).toBe(8);
    expect(machine2.stockStatus).toBe(MachineStockStatus.Normal);
  });

  it("should not recieve event after unsubscibe", () => {
    pubSubService.subscribe(EventType.Sale, saleSubscriber);
    pubSubService.subscribe(EventType.Refill, refillSubscriber);

    const events = [
      new MachineSaleEvent(2, "001"),
      new MachineSaleEvent(1, "001"),
    ];

    events.map((event) => pubSubService.publish(event));

    pubSubService.unsubscribe(EventType.Sale, saleSubscriber);

    const event2 = [
      new MachineSaleEvent(3, "001"),
      new MachineRefillEvent(2, "001"),
    ];
    event2.map((event) => pubSubService.publish(event));

    expect(machine1.stockLevel).toBe(4);
    expect(machine1.stockStatus).toBe(MachineStockStatus.Normal);
  });

  it("should produce low stock event one time after crossing threshold", () => {
    const consoleSpy = jest.spyOn(console, "log");
    pubSubService.subscribe(EventType.Sale, saleSubscriber);
    pubSubService.subscribe(EventType.LowStockAlert, stockWarningSubscriber);

    const events = [
      new MachineSaleEvent(2, "001"),
      new MachineSaleEvent(1, "001"),
    ];

    events.map((event) => pubSubService.publish(event));

    expect(machine1.stockLevel).toBe(2);
    expect(machine1.stockStatus).toBe(MachineStockStatus.Low);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Machine 001 remaining stock is 3. Please refill !."
    );
    consoleSpy.mockRestore();
  });

  it("should produce stock ok event one time after crossing threshold", () => {
    const consoleSpy = jest.spyOn(console, "log");

    pubSubService.subscribe(EventType.Sale, saleSubscriber);
    pubSubService.subscribe(EventType.Refill, refillSubscriber);
    pubSubService.subscribe(EventType.StockOkAlert, stockWarningSubscriber);

    const events = [
      new MachineSaleEvent(3, "001"),
      new MachineRefillEvent(2, "001"),
      new MachineRefillEvent(2, "001"),
    ];

    events.map((event) => pubSubService.publish(event));

    expect(machine1.stockLevel).toBe(6);
    expect(machine1.stockStatus).toBe(MachineStockStatus.Normal);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Machine 001 remaining stock is 4. OK !."
    );
    consoleSpy.mockRestore();
  });
});
