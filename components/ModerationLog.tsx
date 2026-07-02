'use client'
import React, { useEffect, useState } from 'react'

export default function ModerationLog({ communityId }: { communityId: string }){
  const [logs, setLogs] = useState<any[]>([])

  useEffect(()=>{
    async function load(){
      try{
        const res = await fetch(`/api/communities/${communityId}/moderation`)
        const d = await res.json()
        setLogs(d.logs || [])
      }catch(e){ console.error(e) }
    }
    load()
  },[communityId])

  return (
    <div style={{border:'1px solid #eee',padding:12,marginTop:16}}>
      <h3>Moderation Log</h3>
      <ul>
        {logs.map((l:any)=>(
          <li key={l._id}>
            <strong>{l.action}</strong> — by {l.performedBy} <small>at {new Date(l.createdAt).toLocaleString()}</small>
            <div style={{fontSize:12,color:'#555'}}>{l.details || ''}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
