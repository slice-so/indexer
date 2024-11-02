import { ponder } from "@/generated"
import { baseProtocolFee } from "@/utils/constants"
import { getSlicerId } from "@/utils/getSlicerId"

ponder.on("Slicer:CustomFeeSet", async ({ event, context: { db } }) => {
  const { customFeeActive, customFee } = event.args
  const slicerId = await getSlicerId(event.log.address, db)

  await db.Slicer.update({
    id: slicerId,
    data: { protocolFee: customFeeActive ? Number(customFee) : baseProtocolFee }
  })
})
