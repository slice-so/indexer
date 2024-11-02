import { ponder } from "@/generated"
import { defaultRoyaltyPercentage } from "@/utils/constants"
import { zeroAddress } from "viem"

ponder.on("SliceCore:RoyaltySet", async ({ event, context: { db } }) => {
  const {
    tokenId: slicerId,
    isSlicer,
    isActive,
    royaltyPercentage
  } = event.args

  await db.Slicer.update({
    id: slicerId,
    data: ({ current }) => ({
      royaltyPercentage: isActive
        ? Number(royaltyPercentage)
        : defaultRoyaltyPercentage,
      royaltyReceiverId: isSlicer
        ? current.address
        : current.controllerId !== zeroAddress
        ? current.controllerId
        : current.creatorId
    })
  })
})
