'use client'
import React, { useEffect, useState } from 'react'

export default function AdminPostControls({ communityId, postId }: { communityId: string, postId: string }){
  const [isAdmin,setIsAdmin] = useState(false)
  const [busy,setBusy] = useState(false)

  useEffect(()=>{
    async function load(){
      try{
        const token = typeof window !== 'undefined' ? localStorage.getItem('aqora_token') : null
        const headers:any = {}
        if(token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch(`/api/communities/${communityId}/admin`, { headers })
        const data = await res.json()
        setIsAdmin(Boolean(data.isAdmin))
      }catch(e){
        setIsAdmin(false)
      }
    }
    load()
  },[communityId])

  async function doAction(action:string){
    if(!isAdmin) return alert('Not authorized')
    setBusy(true)
    try{
      const token = typeof window !== 'undefined' ? localStorage.getItem('aqora_token') : null
      const headers:any = { 'Content-Type': 'application/json' }
      if(token) headers['Authorization'] = `Bearer ${token}`
      if(action==='delete'){
        const res = await fetch(`/api/communities/${communityId}/posts/${postId}`, { method: 'DELETE', headers })
        if(res.ok) window.location.reload()
        else { const d=await res.json(); alert(d.error||'Failed') }
      } else if(action==='pin' || action==='unpin'){
        const res = await fetch(`/api/communities/${communityId}/posts/${postId}`, { method: 'PATCH', headers, body: JSON.stringify({ action }) })
        if(res.ok) window.location.reload()
        else { const d=await res.json(); alert(d.error||'Failed') }
      }
    }catch(e){
      console.error(e)
      alert('Network error')
    }finally{setBusy(false)}
  }

  if(!isAdmin) return null
  return (
    <div style={{display:'inline-flex',gap:8}}>
      <button onClick={()=>doAction('pin')} disabled={busy}>Pin</button>
      <button onClick={()=>doAction('unpin')} disabled={busy}>Unpin</button>
      <button onClick={()=>{ if(confirm('Delete post?')) doAction('delete') }} disabled={busy}>Delete</button>
    </div>
  )
}
