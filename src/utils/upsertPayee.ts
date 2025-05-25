import type { Context } from "ponder:registry"
import { payee } from "ponder:schema"
import type { Address } from "viem"

export const upsertPayee = async (db: Context["db"], payeeAddress: Address) => {
  await db.insert(payee).values({ id: payeeAddress }).onConflictDoNothing()
}

export const upsertPayees = async (
  db: Context["db"],
  payeeAddresses: Address[]
) => {
  await db
    .insert(payee)
    .values(payeeAddresses.map((address) => ({ id: address })))
    .onConflictDoNothing()
}
