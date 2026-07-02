import { NextResponse } from 'next/server'
import connectMongo from '../../../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(req: Request, { params }: { params: { id: string } }){
  try{
    const client = await connectMongo()
    const db = client.db()
    const id = params.id
    const oid = ObjectId.isValid(id) ? new ObjectId(id) : id
    const logs = await db.collection('moderation_logs').find({ communityId: id }).sort({ createdAt: -1 }).limit(200).toArray()
    return NextResponse.json({ logs })
  }catch(err){
    return NextResponse.json({ error: String(err) }, { status:500 })
  }
}
