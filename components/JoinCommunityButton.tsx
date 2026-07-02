'use client'
import React, { useEffect, useState } from 'react'

export default function JoinCommunityButton({ communityId }: { communityId: string }){
  const [joined, setJoined] = useState<boolean|null>(null)
  const [count, setCount] = useState<number|null>(null)

  useEffect(()=>{
    async function load(){
      try{
        const token = typeof window !== 'undefined' ? localStorage.getItem('aqora_token') : null
        const headers: any = {}
        if(token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch(`/api/communities/${communityId}/join`, { headers })
        const data = await res.json()
        setJoined(Boolean(data.joined))
        setCount(Number(data.memberCount||0))
      }catch(e){
        setJoined(false)
      }
    }
    load()
  },[communityId])

  async function handleClick(){
    try{
      const token = typeof window !== 'undefined' ? localStorage.getItem('aqora_token') : null
      const headers: any = { 'Content-Type': 'application/json' }
      if(token) headers['Authorization'] = `Bearer ${token}`
      if(joined){
        await fetch(`/api/communities/${communityId}/join`, { method: 'DELETE', headers })
        setJoined(false)
        setCount(prev=> prev? prev-1 : 0)
      } else {
        await fetch(`/api/communities/${communityId}/join`, { method: 'POST', headers })
        setJoined(true)
        setCount(prev=> prev? prev+1 : 1)
      }
    }catch(e){
      console.error('join error',e)
    }
  }

  if(joined===null) return <button disabled>Loading…</button>
  return (
    <div style={{display:'inline-flex',gap:8,alignItems:'center'}}>
      <button onClick={handleClick}>{joined ? 'Leave' : 'Join'}</button>
      <small>{count ?? '-'}</small>
    </div>
  )
}
