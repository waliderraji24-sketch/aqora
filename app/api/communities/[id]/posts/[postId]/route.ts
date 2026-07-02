import { NextResponse } from 'next/server'
import connectMongo from '../../../../../../lib/mongodb'
import { verifyToken } from '../../../../../../lib/jwt'
import { ObjectId } from 'mongodb'

async function isCommunityAdmin(db:any, communityId:any, userId:any){
  const oid = ObjectId.isValid(communityId) ? new ObjectId(communityId) : communityId
  const comm = await db.collection('communities').findOne({ _id: oid } as any)
  if(!comm) return false
  return String(comm.createdBy) === String(userId) || (comm.admins||[]).includes(userId)
}

export async function DELETE(req: Request, { params }: { params: { id: string, postId: string } }){
  try{
    const auth = req.headers.get('authorization')
    if(!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = auth.replace('Bearer ', '')
    const user = verifyToken(token)
    if(!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const client = await connectMongo()
    const db = client.db()
    const { id, postId } = params
    const ok = await isCommunityAdmin(db, id, user.id)
    if(!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const pid = ObjectId.isValid(postId) ? new ObjectId(postId) : postId
    await db.collection('posts').deleteOne({ _id: pid } as any)
    await db.collection('moderation_logs').insertOne({ action: 'delete_post', communityId: id, postId: pid, performedBy: user.id, createdAt: new Date() })
    return NextResponse.json({ ok: true })
  }catch(err){
    return NextResponse.json({ error: String(err) }, { status:500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string, postId: string } }){
  try{
    const auth = req.headers.get('authorization')
    if(!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = auth.replace('Bearer ', '')
    const user = verifyToken(token)
    if(!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { action } = body
    const client = await connectMongo()
    const db = client.db()
    const { id, postId } = params
    const ok = await isCommunityAdmin(db, id, user.id)
    if(!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const pid = ObjectId.isValid(postId) ? new ObjectId(postId) : postId
    if(action === 'pin'){
      await db.collection('posts').updateOne({ _id: pid } as any, { $set: { pinned: true } })
      await db.collection('moderation_logs').insertOne({ action: 'pin_post', communityId: id, postId: pid, performedBy: user.id, createdAt: new Date() })
      return NextResponse.json({ ok: true })
    } else if(action === 'unpin'){
      await db.collection('posts').updateOne({ _id: pid } as any, { $set: { pinned: false } })
      await db.collection('moderation_logs').insertOne({ action: 'unpin_post', communityId: id, postId: pid, performedBy: user.id, createdAt: new Date() })
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }catch(err){
    return NextResponse.json({ error: String(err) }, { status:500 })
  }
}
