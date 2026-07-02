import { NextResponse } from 'next/server'
import connectMongo from '../../../lib/mongodb'
import { verifyToken } from '../../../lib/jwt'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const client = await connectMongo()
  const db = client.db()
  const coll = db.collection('communities')
  const filter = q ? { $text: { $search: q } } : {}
  const items = await coll.find(filter).limit(50).toArray()
  return NextResponse.json({ communities: items })
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { name, description, visibility='public' } = body
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const client = await connectMongo()
    const db = client.db()
    const coll = db.collection('communities')
    const now = new Date()
    const doc = { name, description, visibility, createdBy: user.id, createdAt: now, members: [user.id], memberCount:1 }
    const res = await coll.insertOne(doc)
    return NextResponse.json({ communityId: res.insertedId })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
