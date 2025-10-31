/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
  const orders = await prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' } })
  const filtered = orders.filter(o => o.customerId)
  console.log('Recent orders:', filtered.map(o => ({ id: o.id, title: o.title, reward: o.reward, totalReward: o.totalReward })))
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
