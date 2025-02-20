import { IEvent, MachineRefillEvent, MachineSaleEvent } from "./events";
import { Machine } from "./machines";
import { EventType } from "./enums";
import { PublishSubscribeService } from "./services";
import {
  MachineRefillSubscriber,
  MachineSaleSubscriber,
  StockWarningSubscriber,
} from "./subscribers";

// helpers
const randomMachine = (): string => {
  const random = Math.random() * 3;
  if (random < 1) {
    return "001";
  } else if (random < 2) {
    return "002";
  }
  return "003";
};

const eventGenerator = (): IEvent => {
  const random = Math.random();
  if (random < 0.5) {
    const saleQty = Math.random() < 0.5 ? 1 : 2; // 1 or 2
    return new MachineSaleEvent(saleQty, randomMachine());
  }
  const refillQty = Math.random() < 0.5 ? 3 : 5; // 3 or 5
  return new MachineRefillEvent(refillQty, randomMachine());
};

// program
(async () => {
  // create 3 machines with a quantity of 10 stock
  const machines: Machine[] = [
    new Machine("001", 5),
    new Machine("002", 5),
    new Machine("003", 5),
  ];

  // create the PubSub service
  const pubSubService: PublishSubscribeService = new PublishSubscribeService(); // implement and fix this

  const saleSubscriber = new MachineSaleSubscriber(machines, pubSubService);
  const refillSubscriber = new MachineRefillSubscriber(machines, pubSubService);
  const stockWarningSubscriber = new StockWarningSubscriber(machines);

  pubSubService.subscribe(EventType.Sale, saleSubscriber);
  pubSubService.subscribe(EventType.Refill, refillSubscriber);
  pubSubService.subscribe(EventType.LowStockAlert, stockWarningSubscriber);
  pubSubService.subscribe(EventType.StockOkAlert, stockWarningSubscriber);

  // create 5 random events
  const events = [1, 2, 3, 4, 5].map((i) => eventGenerator());

  // publish the events
  events.map((event) => pubSubService.publish(event));
})();
