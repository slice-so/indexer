import type { Context } from "ponder:registry"
import { categoryProductHierarchy } from "ponder:schema"
import { and, eq } from "ponder"
import { or } from "ponder"

export function updateCategoryHierarchyPromises(
  db: Context["db"],
  parentCategory: {
    ancestors: { ancestorId: number; depth: number }[]
  },
  category: {
    descendants: { descendantId: number; depth: number }[]
  }
) {
  const updateCategoryHierarchyPromises: Promise<{
    ancestorId: number
    descendantId: number
    depth: number
  }>[] = []

  // For each ancestor-descendant pair, create a new hierarchy entry
  for (const parentAncestor of parentCategory.ancestors) {
    for (const categoryDescendant of category.descendants) {
      const ancestorId = parentAncestor.ancestorId
      const descendantId = categoryDescendant.descendantId
      const depth = parentAncestor.depth + categoryDescendant.depth + 1

      updateCategoryHierarchyPromises.push(
        db
          .insert(categoryProductHierarchy)
          .values({ ancestorId, descendantId, depth })
          .onConflictDoUpdate({ depth })
      )
    }
  }

  return updateCategoryHierarchyPromises
}

export async function clearCategoryHierarchy(
  db: Context["db"],
  parentCategory: { ancestors: { ancestorId: number }[] }, // eg 3
  category: { descendants: { descendantId: number }[] } // eg 4
) {
  // Delete all ancestor-descendant pairs in a single query
  if (parentCategory.ancestors.length > 0 && category.descendants.length > 0) {
    await db.sql.delete(categoryProductHierarchy).where(
      or(
        // 3-3, 2-3, 1-3
        ...parentCategory.ancestors.flatMap((parentAncestor) =>
          // 4-4, 4-5, 4-6
          category.descendants.map((categoryDescendant) =>
            and(
              // 3-4, 3-5, 3-6 --> 2-4, 2-5, 2-6 --> 1-4, 1-5, 1-6
              eq(
                categoryProductHierarchy.ancestorId,
                Number(parentAncestor.ancestorId)
              ),
              eq(
                categoryProductHierarchy.descendantId,
                Number(categoryDescendant.descendantId)
              )
            )
          )
        )
      )
    )
  }
}
