import { NextResponse } from 'next/server'
import connectMongo from '../../../../../lib/mongodb'
import { verifyToken } from '../../../../../lib/jwt'
import { ObjectId } from 'mongodb'

export async function GET(req: Request, { params }: { params: { id: string } }){
  try{
    const client = await connectMongo()
    const db = client.db()
    const id = params.id
    const oid = ObjectId.isValid(id) ? new ObjectId(id) : id
    const comm = await db.collection('communities').findOne({ _id: oid } as any)
    if(!comm) return NextResponse.json({ admins: [] })
    const adminIds = new Set([String(comm.createdBy), ...(comm.admins||[])])
    const users = await db.collection('users').find({ _id: { $in: Array.from(adminIds).map((x:any)=> ObjectId.isValid(x)? new ObjectId(x): x) } as any }).project({ name:1 }).toArray()
    return NextResponse.json({ admins: users })
  }catch(err){
    return NextResponse.json({ error: String(err) }, { status:500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }){
  try{
    const auth = req.headers.get('authorization')
    if(!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = auth.replace('Bearer ', '')
    const user = verifyToken(token)
    if(!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { userId } = body
    if(!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    const client = await connectMongo()
    const db = client.db()
    const id = params.id
    const oid = ObjectId.isValid(id) ? new ObjectId(id) : id
    const comm = await db.collection('communities').findOne({ _id: oid } as any)
    if(!comm) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    // only creator or existing admin can add
    const isAdmin = String(user.id) === String(comm.createdBy) || (comm.admins||[]).includes(user.id)
    if(!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await db.collection('communities').updateOne({ _id: comm._id } as any, { $addToSet: { admins: userId } } as any)
    await db.collection('moderation_logs').insertOne({ action: 'promote_admin', communityId: id, targetUserId: userId, performedBy: user.id, createdAt: new Date() })
    return NextResponse.json({ ok: true })
  }catch(err){
    return NextResponse.json({ error: String(err) }, { status:500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }){
  try{
    const auth = req.headers.get('authorization')
    if(!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = auth.replace('Bearer ', '')
    const user = verifyToken(token)
    if(!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { userId } = body
    if(!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    const client = await connectMongo()
    const db = client.db()
    const id = params.id
    const oid = ObjectId.isValid(id) ? new ObjectId(id) : id
    const comm = await db.collection('communities').findOne({ _id: oid } as any)
    if(!comm) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const isAdmin = String(user.id) === String(comm.createdBy) || (comm.admins||[]).includes(user.id)
    if(!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await db.collection('communities').updateOne({ _id: comm._id } as any, { $pull: { admins: userId } } as any)
    await db.collection('moderation_logs').insertOne({ action: 'demote_admin', communityId: id, targetUserId: userId, performedBy: user.id, createdAt: new Date() })
    return NextResponse.json({ ok: true })
  }catch(err){
    return NextResponse.json({ error: String(err) }, { status:500 })
  }
}
