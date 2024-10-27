import { ponder } from "@/generated";

ponder.on("FundsModule:AdminChanged", async ({ event, context }) => {
  console.log(event.args);
});

ponder.on("FundsModule:BeaconUpgraded", async ({ event, context }) => {
  console.log(event.args);
});

ponder.on("FundsModule:Deposited", async ({ event, context }) => {
  console.log(event.args);
});

ponder.on("FundsModule:OwnershipTransferred", async ({ event, context }) => {
  console.log(event.args);
});
