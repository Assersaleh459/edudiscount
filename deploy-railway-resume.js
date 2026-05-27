const https = require('https')

const TOKEN = '1e9cf2cb-1c31-47ca-8e39-78cd32eb86cd'
const API = 'https://backboard.railway.app/graphql/v2'

// IDs from the already-created project
const projectId = '67f2acb3-44bf-4116-89fb-fc781ce480c0'
const envId = '2b89258b-d286-47f6-a13f-7c44ecae801f'
const backendServiceId = 'dfc14194-ac7d-457f-9536-309097395ee8'
const frontendServiceId = '7e24bd07-51bd-4914-9b4b-71037d17a1b0'

async function gql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables })
    const req = https.request(API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Length': Buffer.byteLength(body),
      }
    }, res => {
      let data = ''
      res.on('data', d => data += d)
      res.on('end', () => {
        const parsed = JSON.parse(data)
        if (parsed.errors) {
          console.error('GraphQL errors:', JSON.stringify(parsed.errors, null, 2))
          reject(new Error(parsed.errors[0].message))
        } else {
          resolve(parsed.data)
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function main() {
  console.log('🔗 Generating public URLs...')
  const backendDomain = await gql(`
    mutation($input: ServiceDomainCreateInput!) {
      serviceDomainCreate(input: $input) { domain }
    }
  `, { input: { serviceId: backendServiceId, environmentId: envId } })
  const backendUrl = `https://${backendDomain.serviceDomainCreate.domain}`
  console.log(`   Backend URL: ${backendUrl}`)

  const frontendDomain = await gql(`
    mutation($input: ServiceDomainCreateInput!) {
      serviceDomainCreate(input: $input) { domain }
    }
  `, { input: { serviceId: frontendServiceId, environmentId: envId } })
  const frontendUrl = `https://${frontendDomain.serviceDomainCreate.domain}`
  console.log(`   Frontend URL: ${frontendUrl}`)

  // Set backend environment variables
  console.log('\n🔧 Setting backend environment variables...')
  const backendVars = {
    PORT: '3001',
    DATABASE_URL: '${{postgres.DATABASE_URL}}',
    REDIS_URL: '${{redis.REDIS_URL}}',
    JWT_SECRET: 'edudiscount-jwt-secret-mustaqbal-watan-2024',
    ADMIN_SEED_EMAIL: 'admin@edudiscount.com',
    ADMIN_SEED_PASSWORD: 'Admin@123',
    PARTNER_API_URL: `${backendUrl}/api/mock-partner/receive`,
    FRONTEND_URL: frontendUrl,
    NODE_ENV: 'production',
  }

  for (const [name, value] of Object.entries(backendVars)) {
    await gql(`
      mutation($input: VariableUpsertInput!) {
        variableUpsert(input: $input)
      }
    `, { input: { projectId, environmentId: envId, serviceId: backendServiceId, name, value } })
    process.stdout.write(`.`)
  }
  console.log(' Done')

  // Set frontend environment variables
  console.log('\n🔧 Setting frontend environment variables...')
  await gql(`
    mutation($input: VariableUpsertInput!) {
      variableUpsert(input: $input)
    }
  `, { input: { projectId, environmentId: envId, serviceId: frontendServiceId, name: 'VITE_API_URL', value: `${backendUrl}/api` } })
  console.log('   Done')

  // Trigger deployments
  console.log('\n🚢 Triggering deployments...')
  await gql(`
    mutation($serviceId: String!, $environmentId: String!) {
      serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId)
    }
  `, { serviceId: backendServiceId, environmentId: envId })
  console.log('   Backend deploying...')

  await gql(`
    mutation($serviceId: String!, $environmentId: String!) {
      serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId)
    }
  `, { serviceId: frontendServiceId, environmentId: envId })
  console.log('   Frontend deploying...')

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║            EduDiscount Deployment Started!                   ║
╠══════════════════════════════════════════════════════════════╣
║  🌐 Portal:   ${frontendUrl.padEnd(46)}║
║  🔧 API:      ${backendUrl.padEnd(46)}║
║  📊 Dashboard: https://railway.app/project/${projectId}  ║
╠══════════════════════════════════════════════════════════════╣
║  Admin login: admin@edudiscount.com / Admin@123              ║
╚══════════════════════════════════════════════════════════════╝

Build takes ~3-5 minutes. Watch progress at the Railway dashboard.
`)
}

main().catch(err => {
  console.error('\n❌ Failed:', err.message)
  process.exit(1)
})
