(async ()=>{
  const base = 'http://localhost:3000'
  const out = {}
  try{
    // 1) Register
    const regRes = await fetch(base + '/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: 'Test User', email: `testuser+${Date.now()}@example.com`, password: 'password123' }) })
    out.register = { status: regRes.status, body: await regRes.text() }
    if(regRes.status !== 201){ console.log(JSON.stringify(out, null, 2)); process.exit(0) }
    const regJson = JSON.parse(out.register.body)
    const token = regJson.token
    out.token = token

    // 2) Create community
    const createRes = await fetch(base + '/api/communities', { method: 'POST', headers: {'Content-Type':'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify({ name: 'test-community', description: 'A test community', visibility: 'public' }) })
    out.create = { status: createRes.status, body: await createRes.text() }
    if(createRes.status !== 200 && createRes.status !== 201){ console.log(JSON.stringify(out, null, 2)); process.exit(0) }
    const createJson = JSON.parse(out.create.body)
    const commId = createJson.communityId
    out.communityId = commId

    // 3) Check join status
    const joinStatusRes = await fetch(base + '/api/communities/' + commId + '/join', { method: 'GET', headers: { 'Authorization': 'Bearer ' + token } })
    out.joinStatus = { status: joinStatusRes.status, body: await joinStatusRes.text() }

    // 4) Leave then join again
    const leaveRes = await fetch(base + '/api/communities/' + commId + '/join', { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } })
    out.leave = { status: leaveRes.status, body: await leaveRes.text() }
    const joinRes = await fetch(base + '/api/communities/' + commId + '/join', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } })
    out.join = { status: joinRes.status, body: await joinRes.text() }

    // 5) List posts
    const postsBefore = await fetch(base + '/api/communities/' + commId + '/posts')
    out.postsBefore = { status: postsBefore.status, body: await postsBefore.text() }

    // 6) Create post
    const postRes = await fetch(base + '/api/communities/' + commId + '/posts', { method: 'POST', headers: {'Content-Type':'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify({ content: 'Hello from test script' }) })
    out.createPost = { status: postRes.status, body: await postRes.text() }

    // 7) List posts after
    const postsAfter = await fetch(base + '/api/communities/' + commId + '/posts')
    out.postsAfter = { status: postsAfter.status, body: await postsAfter.text() }

    console.log(JSON.stringify(out, null, 2))
  }catch(e){ console.error('ERROR', e); process.exit(1) }
})()
