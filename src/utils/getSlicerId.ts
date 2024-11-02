import { Context } from "@/generated"

// TODO: Find a better way to get the slicer id
export const getSlicerId = async (
  slicerAddress: `0x${string}`,
  db: Context["db"]
) => {
  const { items: slicers } = await db.Slicer.findMany({
    where: {
      address: slicerAddress
    },
    limit: 1
  })
  return slicers[0]!.id
}
