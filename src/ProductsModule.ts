import { ponder } from "@/generated"

ponder.on("ProductsModule:AdminChanged", async ({ event, context }) => {
  console.log(event.args)
})

ponder.on("ProductsModule:BeaconUpgraded", async ({ event, context }) => {
  console.log(event.args)
})

ponder.on(
  "ProductsModule:ERC1155ListingChanged",
  async ({ event, context }) => {
    console.log(event.args)
  }
)

ponder.on("ProductsModule:ERC721ListingChanged", async ({ event, context }) => {
  console.log(event.args)
})
