import React from 'react'
export const dynamic = 'force-dynamic'
import JoinCommunityButton from '../../components/JoinCommunityButton'
import CreateCommunityForm from '../../components/CreateCommunityForm'
import connectMongo from '../../lib/mongodb'

export default async function CommunitiesPage(){
  const client = await connectMongo()
  const db = client.db()
  const communities = await db.collection('communities').find({}).limit(50).toArray()
  return (
    <div>
      <h1>Communities</h1>
      <div style={{marginBottom:16}}>
        <CreateCommunityForm />
      </div>
      <div>
        {communities.map((c:any)=> (
          <div key={String(c._id)} style={{border:'1px solid #ddd',padding:12,margin:8}}>
            <h3>{c.name}</h3>
            <p>{c.description}</p>
            <small>{c.memberCount || 0} members</small>
            <div style={{marginTop:8}}>
              <JoinCommunityButton communityId={String(c._id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
