import { NextResponse } from 'next/server'
import connectMongo from '../../../../../lib/mongodb'
import { verifyToken } from '../../../../../lib/jwt'
import { ObjectId } from 'mongodb'

export async function GET(req: Request, { params }: { params: { id: string } }){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? verifyToken(token) : null
    const client = await connectMongo()
    const db = client.db()
    const coll = db.collection('communities')
    const id = params.id
    const oid = ObjectId.isValid(id) ? new ObjectId(id) : id
    const comm = await coll.findOne({ _id: oid } as any)
    if(!comm) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const joined = user ? (comm.members||[]).includes(user.id) : false
    return NextResponse.json({ joined, memberCount: comm.memberCount || 0 })
  }catch(err){
    return NextResponse.json({ error: String(err) }, { status:500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? verifyToken(token) : null
    if(!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const client = await connectMongo()
    const db = client.db()
    const coll = db.collection('communities')
    const id = params.id
    const oid = ObjectId.isValid(id) ? new ObjectId(id) : id
    const comm = await coll.findOne({ _id: oid } as any)
    if(!comm) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    // add member if not present
    await coll.updateOne({ _id: comm._id }, { $addToSet: { members: user.id }, $inc: { memberCount: 1 } })
    return NextResponse.json({ ok: true })
  }catch(err){
    return NextResponse.json({ error: String(err) }, { status:500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? verifyToken(token) : null
    if(!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const client = await connectMongo()
    const db = client.db()
    const coll = db.collection('communities')
    const id = params.id
    const oid = ObjectId.isValid(id) ? new ObjectId(id) : id
    const comm = await coll.findOne({ _id: oid } as any)
    if(!comm) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await coll.updateOne({ _id: comm._id }, { $pull: { members: user.id }, $inc: { memberCount: -1 } } as any)
    return NextResponse.json({ ok: true })
  }catch(err){
    return NextResponse.json({ error: String(err) }, { status:500 })
  }
}
