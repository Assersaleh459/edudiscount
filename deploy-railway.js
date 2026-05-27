const https = require('https')

const TOKEN = '1e9cf2cb-1c31-47ca-8e39-78cd32eb86cd'
const API = 'https://backboard.railway.app/graphql/v2'

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

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  console.log('🚀 Starting EduDiscount Railway deployment...\n')

  // 1. Get team ID
  console.log('1️⃣  Getting account info...')
  const me = await gql(`{ me { id name email workspaces { id name } } }`)
  console.log(`   Logged in as: ${me.me.email}`)
  const workspaceId = me.me.workspaces[0].id
  console.log(`   Workspace: ${me.me.workspaces[0].name} (${workspaceId})`)

  // 2. Create project
  console.log('\n2️⃣  Creating project "edudiscount"...')
  const proj = await gql(`
    mutation($input: ProjectCreateInput!) {
      projectCreate(input: $input) { id name }
    }
  `, { input: { name: 'edudiscount', workspaceId } })
  const projectId = proj.projectCreate.id
  console.log(`   Project ID: ${projectId}`)

  // 3. Get default environment ID
  console.log('\n3️⃣  Getting environment...')
  const envData = await gql(`
    query($id: String!) {
      project(id: $id) {
        environments { edges { node { id name } } }
      }
    }
  `, { id: projectId })
  const envId = envData.project.environments.edges[0].node.id
  console.log(`   Environment ID: ${envId}`)

  // 4. Create Postgres service
  console.log('\n4️⃣  Adding PostgreSQL...')
  const pg = await gql(`
    mutation($input: ServiceCreateInput!) {
      serviceCreate(input: $input) { id name }
    }
  `, { input: { projectId, name: 'postgres', source: { image: 'ghcr.io/railwayapp-templates/postgres-ssl:edge' } } })
  const pgServiceId = pg.serviceCreate.id
  console.log(`   Postgres service ID: ${pgServiceId}`)

  // 5. Create Redis service
  console.log('\n5️⃣  Adding Redis...')
  const redis = await gql(`
    mutation($input: ServiceCreateInput!) {
      serviceCreate(input: $input) { id name }
    }
  `, { input: { projectId, name: 'redis', source: { image: 'redis:7-alpine' } } })
  const redisServiceId = redis.serviceCreate.id
  console.log(`   Redis service ID: ${redisServiceId}`)

  // 6. Create backend service from GitHub
  console.log('\n6️⃣  Creating backend service from GitHub...')
  const backend = await gql(`
    mutation($input: ServiceCreateInput!) {
      serviceCreate(input: $input) { id name }
    }
  `, { input: {
    projectId,
    name: 'backend',
    source: { repo: 'Assersaleh459/edudiscount' }
  }})
  const backendServiceId = backend.serviceCreate.id
  console.log(`   Backend service ID: ${backendServiceId}`)

  // 7. Set backend root directory
  console.log('\n7️⃣  Configuring backend (root dir: backend/)...')
  await gql(`
    mutation($serviceId: String!, $environmentId: String!, $input: ServiceInstanceUpdateInput!) {
      serviceInstanceUpdate(serviceId: $serviceId, environmentId: $environmentId, input: $input)
    }
  `, {
    serviceId: backendServiceId,
    environmentId: envId,
    input: { rootDirectory: 'backend', startCommand: 'npx prisma migrate deploy && node prisma/seed.js && node src/index.js' }
  })
  console.log('   Done')

  // 8. Create frontend service from GitHub
  console.log('\n8️⃣  Creating frontend service from GitHub...')
  const frontend = await gql(`
    mutation($input: ServiceCreateInput!) {
      serviceCreate(input: $input) { id name }
    }
  `, { input: {
    projectId,
    name: 'frontend',
    source: { repo: 'Assersaleh459/edudiscount' }
  }})
  const frontendServiceId = frontend.serviceCreate.id
  console.log(`   Frontend service ID: ${frontendServiceId}`)

  // 9. Set frontend root directory
  console.log('\n9️⃣  Configuring frontend (root dir: frontend/)...')
  await gql(`
    mutation($serviceId: String!, $environmentId: String!, $input: ServiceInstanceUpdateInput!) {
      serviceInstanceUpdate(serviceId: $serviceId, environmentId: $environmentId, input: $input)
    }
  `, {
    serviceId: frontendServiceId,
    environmentId: envId,
    input: { rootDirectory: 'frontend' }
  })
  console.log('   Done')

  // 10. Generate domains
  console.log('\n🔗 Generating public URLs...')
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

  // 11. Set backend environment variables
  console.log('\n🔧 Setting backend environment variables...')
  const backendVars = {
    PORT: '3001',
    DATABASE_URL: `postgresql://railway:railway@postgres.railway.internal:5432/railway`,
    REDIS_URL: `redis://redis.railway.internal:6379`,
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

  // 12. Set frontend environment variables
  console.log('\n🔧 Setting frontend environment variables...')
  await gql(`
    mutation($input: VariableUpsertInput!) {
      variableUpsert(input: $input)
    }
  `, { input: { projectId, environmentId: envId, serviceId: frontendServiceId, name: 'VITE_API_URL', value: `${backendUrl}/api` } })
  console.log('   Done')

  // 13. Trigger deployments
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
╔══════════════════════════════════════════════════════╗
║           EduDiscount Deployment Started!            ║
╠══════════════════════════════════════════════════════╣
║  🌐 Portal:  ${frontendUrl.padEnd(38)}║
║  🔧 API:     ${backendUrl.padEnd(38)}║
║  📊 Dashboard: https://railway.app/project/${projectId.substring(0,8)}...  ║
╠══════════════════════════════════════════════════════╣
║  Admin: admin@edudiscount.com / Admin@123            ║
╚══════════════════════════════════════════════════════╝

Build takes ~3-5 minutes. Check Railway dashboard for progress.
`)
}

main().catch(err => {
  console.error('\n❌ Deployment failed:', err.message)
  process.exit(1)
})
