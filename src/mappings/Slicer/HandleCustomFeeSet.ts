import { ponder } from "ponder:registry"
import { slicer } from "ponder:schema"
import { baseProtocolFee } from "@/utils"
import { getSlicerId } from "@/utils"

ponder.on("Slicer:CustomFeeSet", async ({ event, context: { db } }) => {
  const { customFeeActive, customFee } = event.args
  const slicerId = await getSlicerId(event.log.address, db)

  await db.update(slicer, { id: slicerId }).set({
    protocolFee: customFeeActive ? Number(customFee) : baseProtocolFee
  })
})
