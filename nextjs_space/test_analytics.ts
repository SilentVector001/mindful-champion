import { prisma } from './lib/db'

async function testAnalytics() {
  try {
    console.log('Testing analytics queries...')
    
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = new Date()
    
    console.log('\n1. Testing basic user count...')
    const totalUsers = await prisma.user.count()
    console.log(`✓ Total users: ${totalUsers}`)
    
    console.log('\n2. Testing active users...')
    const activeUsers = await prisma.user.count({
      where: {
        lastActiveDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })
    console.log(`✓ Active users: ${activeUsers}`)
    
    console.log('\n3. Testing UserSession count...')
    const sessions = await prisma.userSession.count()
    console.log(`✓ Total sessions: ${sessions}`)
    
    console.log('\n4. Testing Payment aggregate...')
    const revenue = await prisma.payment.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'succeeded'
      },
      _sum: {
        amount: true
      }
    })
    console.log(`✓ Revenue: ${revenue._sum.amount || 0}`)
    
    console.log('\n5. Testing Payment groupBy...')
    const revenueByTier = await prisma.payment.groupBy({
      by: ['subscriptionTier'],
      where: {
        status: 'succeeded'
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })
    console.log(`✓ Revenue by tier: ${revenueByTier.length} tiers`)
    
    console.log('\n6. Testing raw SQL query...')
    const userGrowth = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM "User"
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
      LIMIT 10
    `
    console.log(`✓ User growth data points: ${Array.isArray(userGrowth) ? userGrowth.length : 0}`)
    
    console.log('\n✅ All queries passed!')
    
  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAnalytics()
