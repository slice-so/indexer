import { type Context, ponder } from "ponder:registry"
import {
  productTypeHierarchy,
  productType as productTypeTable
} from "ponder:schema"
import {
  clearProductTypeHierarchy,
  updateProductTypeHierarchyPromises
} from "@/utils"
import { and, eq } from "ponder"

const getProductType = async (
  db: Context["db"],
  slicerId: number,
  productTypeId: number
) => {
  return await db.sql.query.productType.findFirst({
    where: and(
      eq(productTypeTable.slicerId, slicerId),
      eq(productTypeTable.productTypeId, Number(productTypeId))
    ),
    with: {
      parentProductType: {
        with: {
          ancestors: true
        }
      },
      descendants: true
    }
  })
}

ponder.on(
  "ProductsModule:ProductTypeSet",
  async ({ event: { args }, context: { db } }) => {
    const {
      slicerId,
      productTypeId,
      parentProductTypeId: newParentProductTypeId,
      name
    } = args

    const productType = await getProductType(
      db,
      Number(slicerId),
      Number(productTypeId)
    )

    const newParentProductType = newParentProductTypeId
      ? await db.sql.query.productType.findFirst({
          where: and(
            eq(productTypeTable.slicerId, Number(slicerId)),
            eq(productTypeTable.productTypeId, Number(newParentProductTypeId))
          ),
          with: {
            ancestors: true
          }
        })
      : null

    await db
      .insert(productTypeTable)
      .values({
        slicerId: Number(slicerId),
        productTypeId: Number(productTypeId),
        parentProductTypeId: Number(newParentProductTypeId),
        name
      })
      .onConflictDoUpdate({
        parentProductTypeId: Number(newParentProductTypeId),
        name
      })

    const hierarchyPromises = []
    if (!productType) {
      // Create self-reference (depth 0)
      hierarchyPromises.push(
        db.insert(productTypeHierarchy).values({
          slicerId: Number(slicerId),
          ancestorId: Number(productTypeId),
          descendantId: Number(productTypeId),
          depth: 0
        })
      )

      const fetchedProductType = await getProductType(
        db,
        Number(slicerId),
        Number(productTypeId)
      )

      if (fetchedProductType && newParentProductType) {
        // 1. Add direct parent relationship (depth 1)
        // 2. Add new relationships for each ancestor (depth 2+)
        hierarchyPromises.push(
          ...updateProductTypeHierarchyPromises(
            db,
            slicerId,
            newParentProductType,
            fetchedProductType
          )
        )
      }
    } else if (
      Number(newParentProductTypeId) !== productType.parentProductTypeId
    ) {
      // edit productType when parent productType changes

      // 1. Clear hierarchies (skip if without parent, await to avoid race condition)
      //    - productType with ancestors (except self) (depth 1+)
      //    - descendants with ancestors (depth 2+)
      if (
        productType.parentProductType &&
        productType.parentProductTypeId !== 0
      ) {
        await clearProductTypeHierarchy(
          db,
          Number(slicerId),
          productType.parentProductType,
          productType
        )
      }

      if (newParentProductType) {
        // 2. Add new hierarchies
        //    - productType with parent (depth 1)
        //    - productType with ancestors (depth 2+)
        //    - descendants with ancestors (depth 2+)
        hierarchyPromises.push(
          ...updateProductTypeHierarchyPromises(
            db,
            slicerId,
            newParentProductType,
            productType
          )
        )
      }
    }

    await Promise.all(hierarchyPromises)
  }
)
