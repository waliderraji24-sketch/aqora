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
    const id = params.id
    const oid = ObjectId.isValid(id) ? new ObjectId(id) : id
    const comm = await db.collection('communities').findOne({ _id: oid } as any)
    if(!comm) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const isAdmin = user ? (String(user.id) === String(comm.createdBy) || (comm.admins||[]).includes(user.id)) : false
    return NextResponse.json({ isAdmin })
  }catch(err){
    return NextResponse.json({ error: String(err) }, { status:500 })
  }
}
