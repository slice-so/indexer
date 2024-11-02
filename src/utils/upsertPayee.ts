import { Context } from "@/generated"
import { Address } from "viem"

export const upsertPayee = async (db: Context["db"], payee: Address) => {
  await db.Payee.upsert({
    id: payee
  })
}
