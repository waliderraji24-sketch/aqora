import React from 'react'
import connectMongo from '../../../lib/mongodb'
import CreateCommunityPostForm from '../../../components/CreateCommunityPostForm'
import AdminPostControls from '../../../components/AdminPostControls'
import ManageAdmins from '../../../components/ManageAdmins'
import ModerationLog from '../../../components/ModerationLog'

type Props = { params: { id: string } }

export default async function CommunityDetail({ params }: Props){
  const client = await connectMongo()
  const db = client.db()
  const id = params.id
  const comm = await db.collection('communities').findOne({ _id: id as any })
  const posts = await db.collection('posts').find({ communityId: id }).sort({ createdAt: -1 }).toArray()
  if(!comm) return <div>Community not found</div>
  return (
    <div>
      <h1>{comm.name}</h1>
      <p>{comm.description}</p>
      <div>
        <ManageAdmins communityId={id} />
      </div>
      <div style={{marginTop:16}}>
        <CreateCommunityPostForm communityId={id} />
      </div>
      <div>
        <ModerationLog communityId={id} />
      </div>
      <div style={{marginTop:24}}>
        {posts.map((p:any)=> (
          <div key={String(p._id)} style={{border:'1px solid #eee',padding:12,marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <p style={{margin:0}}>{p.content}</p>
              <div>
                {/* Admin controls rendered client-side */}
                <script dangerouslySetInnerHTML={{__html:``}} />
              </div>
            </div>
            <div style={{marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <small>{new Date(p.createdAt).toLocaleString()}</small>
              <div>
                <AdminPostControls communityId={id} postId={String(p._id)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
