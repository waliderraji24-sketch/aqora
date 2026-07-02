'use client'
import React, { useState } from 'react'

export default function CreateCommunityPostForm({ communityId }: { communityId: string }){
  const [content,setContent] = useState('')
  const [loading,setLoading] = useState(false)

  async function handleSubmit(e:any){
    e.preventDefault()
    if(!content.trim()) return
    setLoading(true)
    try{
      const token = typeof window !== 'undefined' ? localStorage.getItem('aqora_token') : null
      const headers:any = { 'Content-Type': 'application/json' }
      if(token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/communities/${communityId}/posts`, { method: 'POST', headers, body: JSON.stringify({ content }) })
      if(res.ok) {
        setContent('')
        // simple reload to fetch new posts
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Could not post')
      }
    }catch(e){
      console.error(e)
      alert('Network error')
    }finally{setLoading(false)}
  }

  return (
    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:8}}>
      <textarea required value={content} onChange={e=>setContent(e.target.value)} placeholder="Share something with this community" rows={3} />
      <div>
        <button type="submit" disabled={loading}>{loading? 'Posting…' : 'Post to community'}</button>
      </div>
    </form>
  )
}
