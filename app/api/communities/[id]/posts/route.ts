import { NextResponse } from 'next/server'
import connectMongo from '../../../../../lib/mongodb'
import { verifyToken } from '../../../../../lib/jwt'
import { ObjectId } from 'mongodb'

export async function GET(req: Request, { params }: { params: { id: string } }){
  try{
    const client = await connectMongo()
    const db = client.db()
    const id = params.id
    const commId = ObjectId.isValid(id) ? id : id
    const posts = await db.collection('posts').find({ communityId: id }).sort({ createdAt: -1 }).limit(100).toArray()
    return NextResponse.json({ posts })
  }catch(err){
    return NextResponse.json({ error: String(err) }, { status: 500 })
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
    const { content } = body
    if(!content || typeof content !== 'string') return NextResponse.json({ error: 'Content required' }, { status: 400 })
    const client = await connectMongo()
    const db = client.db()
    const id = params.id
    const now = new Date()
    const doc = { communityId: id, authorId: user.id, content: content.trim(), createdAt: now }
    const res = await db.collection('posts').insertOne(doc)
    return NextResponse.json({ postId: res.insertedId })
  }catch(err){
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
