'use client'
import React, { useEffect, useState } from 'react'

export default function ManageAdmins({ communityId }: { communityId: string }){
  const [admins, setAdmins] = useState<any[]>([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)

  async function load(){
    try{
      const res = await fetch(`/api/communities/${communityId}/admins`)
      const data = await res.json()
      setAdmins(data.admins || [])
    }catch(e){
      console.error(e)
    }
  }

  useEffect(()=>{ load() }, [communityId])

  async function addAdmin(){
    if(!userId.trim()) return
    setLoading(true)
    try{
      const token = typeof window !== 'undefined' ? localStorage.getItem('aqora_token') : null
      const headers:any = { 'Content-Type': 'application/json' }
      if(token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/communities/${communityId}/admins`, { method: 'POST', headers, body: JSON.stringify({ userId }) })
      const d = await res.json()
      if(res.ok) { setUserId(''); load() }
      else alert(d.error || 'Failed')
    }catch(e){ console.error(e); alert('Network error') }
    finally{ setLoading(false) }
  }

  async function removeAdmin(id:string){
    if(!confirm('Remove admin?')) return
    setLoading(true)
    try{
      const token = typeof window !== 'undefined' ? localStorage.getItem('aqora_token') : null
      const headers:any = { 'Content-Type': 'application/json' }
      if(token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/communities/${communityId}/admins`, { method: 'DELETE', headers, body: JSON.stringify({ userId: id }) })
      const d = await res.json()
      if(res.ok) load()
      else alert(d.error || 'Failed')
    }catch(e){ console.error(e); alert('Network error') }
    finally{ setLoading(false) }
  }

  return (
    <div style={{border:'1px solid #ddd',padding:12,marginTop:16}}>
      <h3>Manage Admins</h3>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <input placeholder="User ID to promote" value={userId} onChange={e=>setUserId(e.target.value)} />
        <button onClick={addAdmin} disabled={loading}>{loading? 'Adding…' : 'Promote'}</button>
      </div>
      <ul>
        {admins.map(a=> (
          <li key={a._id}>{a.name || String(a._id)} <button onClick={()=>removeAdmin(String(a._id))}>Remove</button></li>
        ))}
      </ul>
    </div>
  )
}
