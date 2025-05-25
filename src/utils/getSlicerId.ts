import type { Context } from "ponder:registry"
import { slicer as slicerTable } from "ponder:schema"
import { eq } from "drizzle-orm"

export const getSlicerId = async (
  slicerAddress: `0x${string}`,
  db: Context["db"]
) => {
  const slicers = await db.sql
    .select()
    .from(slicerTable)
    .where(eq(slicerTable.address, slicerAddress))
    .limit(1)

  if (!slicers[0]) {
    throw new Error("Slicer not found")
  }

  return slicers[0].id
}
