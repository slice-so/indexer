import type { Context } from "ponder:registry"
import { productTypeHierarchy } from "ponder:schema"
import { and, eq } from "ponder"
import { or } from "ponder"

export function updateProductTypeHierarchyPromises(
  db: Context["db"],
  slicerId: bigint,
  parentProductType: {
    ancestors: { ancestorId: number; depth: number }[]
  },
  productType: {
    descendants: { descendantId: number; depth: number }[]
  }
) {
  const updateProductTypeHierarchyPromises: Promise<{
    slicerId: number
    ancestorId: number
    descendantId: number
    depth: number
  }>[] = []

  // For each ancestor-descendant pair, create a new hierarchy entry
  for (const parentAncestor of parentProductType.ancestors) {
    for (const productTypeDescendant of productType.descendants) {
      const ancestorId = parentAncestor.ancestorId
      const descendantId = productTypeDescendant.descendantId
      const depth = parentAncestor.depth + productTypeDescendant.depth + 1

      updateProductTypeHierarchyPromises.push(
        db
          .insert(productTypeHierarchy)
          .values({
            slicerId: Number(slicerId),
            ancestorId,
            descendantId,
            depth
          })
          .onConflictDoUpdate({ depth })
      )
    }
  }

  return updateProductTypeHierarchyPromises
}

export async function clearProductTypeHierarchy(
  db: Context["db"],
  slicerId: number,
  parentProductType: { ancestors: { ancestorId: number }[] }, // eg 3
  productType: { descendants: { descendantId: number }[] } // eg 4
) {
  // Delete all ancestor-descendant pairs in a single query
  if (
    parentProductType.ancestors.length > 0 &&
    productType.descendants.length > 0
  ) {
    await db.sql.delete(productTypeHierarchy).where(
      or(
        // 3-3, 2-3, 1-3
        ...parentProductType.ancestors.flatMap((parentAncestor) =>
          // 4-4, 4-5, 4-6
          productType.descendants.map((productTypeDescendant) =>
            and(
              // 3-4, 3-5, 3-6 --> 2-4, 2-5, 2-6 --> 1-4, 1-5, 1-6
              eq(productTypeHierarchy.slicerId, slicerId),
              eq(
                productTypeHierarchy.ancestorId,
                Number(parentAncestor.ancestorId)
              ),
              eq(
                productTypeHierarchy.descendantId,
                Number(productTypeDescendant.descendantId)
              )
            )
          )
        )
      )
    )
  }
}
