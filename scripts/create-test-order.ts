import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    // Ensure there's a test customer user or create one
    let customer = await prisma.user.findFirst({ where: { phone: '0000000000' } })
    if (!customer) {
      customer = await prisma.user.create({
        data: {
          phone: '0000000000',
          name: 'Test Customer',
          passwordHash: 'test',
          country: 'RU',
          region: 'Moscow',
          role: 'CUSTOMER',
        },
      })
    }

    const order = await prisma.order.create({
      data: {
        title: 'Test order from script',
        description: 'Order created by Copilot test script',
        targetAudience: '18-30',
        pricePerStory: 1200,
        platformCommission: 120,
        executorEarnings: 1080,
        platformEarnings: 120,
        budget: 1200, // Старое поле для совместимости
        reward: 1200, // Старое поле для совместимости
        customerId: customer.id,
        region: 'Moscow',
        socialNetwork: 'INSTAGRAM',
        qrCode: `test-qr-${Date.now()}`,
        qrCodeExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24),
        processedImageUrl: 'https://example.com/img.jpg',
        qrCodeUrl: 'https://example.com/qr.png',
        quantity: 1,
        deadline: new Date('2025-12-31'),
      },
    })

    console.log('Created order:', { id: order.id, title: order.title, totalReward: order.totalReward })
  } catch (e) {
    console.error(e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
