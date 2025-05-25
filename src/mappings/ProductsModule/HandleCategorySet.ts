import { type Context, ponder } from "ponder:registry"
import { categoryProduct, categoryProductHierarchy } from "ponder:schema"
import {
  clearCategoryHierarchy,
  updateCategoryHierarchyPromises
} from "@/utils"
import { eq } from "ponder"

const getCategoryProduct = async (db: Context["db"], categoryId: bigint) => {
  return await db.sql.query.categoryProduct.findFirst({
    where: eq(categoryProduct.id, Number(categoryId)),
    with: {
      parentCategory: {
        with: {
          ancestors: true
        }
      },
      descendants: true
    }
  })
}

ponder.on(
  "ProductsModule:CategorySet",
  async ({ event: { args }, context: { db } }) => {
    const { categoryId, parentCategoryId: newParentCategoryId, name } = args

    const [category, newParentCategory] = await Promise.all([
      getCategoryProduct(db, categoryId),
      newParentCategoryId
        ? db.sql.query.categoryProduct.findFirst({
            where: eq(categoryProduct.id, Number(newParentCategoryId)),
            with: {
              ancestors: true
            }
          })
        : null
    ])

    await db
      .insert(categoryProduct)
      .values({
        id: Number(categoryId),
        parentCategoryId: Number(newParentCategoryId),
        name
      })
      .onConflictDoUpdate({
        parentCategoryId: Number(newParentCategoryId),
        name
      })

    const hierarchyPromises = []
    if (!category) {
      // Create self-reference (depth 0)
      hierarchyPromises.push(
        db.insert(categoryProductHierarchy).values({
          ancestorId: Number(categoryId),
          descendantId: Number(categoryId),
          depth: 0
        })
      )

      const fetchedCategory = await getCategoryProduct(db, categoryId)

      if (fetchedCategory && newParentCategory) {
        // 1. Add direct parent relationship (depth 1)
        // 2. Add new relationships for each ancestor (depth 2+)
        hierarchyPromises.push(
          ...updateCategoryHierarchyPromises(
            db,
            newParentCategory,
            fetchedCategory
          )
        )
      }
    } else if (Number(newParentCategoryId) !== category.parentCategoryId) {
      // edit category when parent category changes

      // 1. Clear hierarchies (skip if without parent, await to avoid race condition)
      //    - category with ancestors (except self) (depth 1+)
      //    - descendants with ancestors (depth 2+)
      if (category.parentCategory && category.parentCategoryId !== 0) {
        await clearCategoryHierarchy(db, category.parentCategory, category)
      }

      if (newParentCategory) {
        // 2. Add new hierarchies
        //    - category with parent (depth 1)
        //    - category with ancestors (depth 2+)
        //    - descendants with ancestors (depth 2+)
        hierarchyPromises.push(
          ...updateCategoryHierarchyPromises(db, newParentCategory, category)
        )
      }
    }

    await Promise.all(hierarchyPromises)
  }
)
