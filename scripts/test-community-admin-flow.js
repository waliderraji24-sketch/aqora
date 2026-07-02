(async ()=>{
  const base = 'http://localhost:3000'
  const out = {}
  try{
    // Register owner
    const regRes = await fetch(base + '/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: 'Owner User', email: `owner+${Date.now()}@example.com`, password: 'password123' }) })
    out.owner = { status: regRes.status, body: await regRes.text() }
    const ownerJson = JSON.parse(out.owner.body)
    const ownerToken = ownerJson.token

    // Create community
    const createRes = await fetch(base + '/api/communities', { method: 'POST', headers: {'Content-Type':'application/json', 'Authorization': 'Bearer ' + ownerToken }, body: JSON.stringify({ name: 'admin-community-'+Date.now(), description: 'Admin test community', visibility: 'public' }) })
    out.create = { status: createRes.status, body: await createRes.text() }
    const createJson = JSON.parse(out.create.body)
    const commId = createJson.communityId
    out.communityId = commId

    // Create post
    const postRes = await fetch(base + '/api/communities/' + commId + '/posts', { method: 'POST', headers: {'Content-Type':'application/json', 'Authorization': 'Bearer ' + ownerToken }, body: JSON.stringify({ content: 'Admin test post' }) })
    out.post = { status: postRes.status, body: await postRes.text() }
    const postJson = JSON.parse(out.post.body)
    const postId = postJson.postId
    out.postId = postId

    // Pin post
    const pinRes = await fetch(base + '/api/communities/' + commId + '/posts/' + postId, { method: 'PATCH', headers: {'Content-Type':'application/json', 'Authorization': 'Bearer ' + ownerToken }, body: JSON.stringify({ action: 'pin' }) })
    out.pin = { status: pinRes.status, body: await pinRes.text() }

    // Unpin post
    const unpinRes = await fetch(base + '/api/communities/' + commId + '/posts/' + postId, { method: 'PATCH', headers: {'Content-Type':'application/json', 'Authorization': 'Bearer ' + ownerToken }, body: JSON.stringify({ action: 'unpin' }) })
    out.unpin = { status: unpinRes.status, body: await unpinRes.text() }

    // Register another user
    const reg2 = await fetch(base + '/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: 'Member User', email: `member+${Date.now()}@example.com`, password: 'password123' }) })
    out.member = { status: reg2.status, body: await reg2.text() }
    const memberJson = JSON.parse(out.member.body)
    const memberId = memberJson.user.id
    out.memberId = memberId

    // Promote member to admin
    const promoteRes = await fetch(base + '/api/communities/' + commId + '/admins', { method: 'POST', headers: {'Content-Type':'application/json', 'Authorization': 'Bearer ' + ownerToken }, body: JSON.stringify({ userId: memberId }) })
    out.promote = { status: promoteRes.status, body: await promoteRes.text() }

    // List admins
    const adminsRes = await fetch(base + '/api/communities/' + commId + '/admins')
    out.admins = { status: adminsRes.status, body: await adminsRes.text() }

    // Demote admin
    const demoteRes = await fetch(base + '/api/communities/' + commId + '/admins', { method: 'DELETE', headers: {'Content-Type':'application/json', 'Authorization': 'Bearer ' + ownerToken }, body: JSON.stringify({ userId: memberId }) })
    out.demote = { status: demoteRes.status, body: await demoteRes.text() }

    // Delete post
    const delRes = await fetch(base + '/api/communities/' + commId + '/posts/' + postId, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + ownerToken } })
    out.deletePost = { status: delRes.status, body: await delRes.text() }

    // Moderation logs
    const logsRes = await fetch(base + '/api/communities/' + commId + '/moderation')
    out.logs = { status: logsRes.status, body: await logsRes.text() }

    console.log(JSON.stringify(out, null, 2))
  }catch(e){ console.error('ERROR', e); process.exit(1) }
})()
