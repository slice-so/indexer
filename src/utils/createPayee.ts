export const createPayee = (
  account: `0x${string}`,
  shares = 0,
  transfersAllowedWhileLocked = false
) => ({
  account,
  shares,
  transfersAllowedWhileLocked
})
