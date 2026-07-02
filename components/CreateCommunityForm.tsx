'use client'
import React, { useState } from 'react'

export default function CreateCommunityForm(){
  const [name,setName] = useState('')
  const [description,setDescription] = useState('')
  const [visibility,setVisibility] = useState('public')
  const [loading,setLoading] = useState(false)

  async function handleSubmit(e: any){
    e.preventDefault()
    setLoading(true)
    try{
      const token = typeof window !== 'undefined' ? localStorage.getItem('aqora_token') : null
      const headers: any = { 'Content-Type': 'application/json' }
      if(token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/communities', { method: 'POST', headers, body: JSON.stringify({ name, description, visibility }) })
      const data = await res.json()
      if(res.ok) window.location.reload()
      else alert(data.error || 'Could not create')
    }catch(e){
      console.error(e)
      alert('Error creating community')
    }finally{setLoading(false)}
  }

  return (
    <form onSubmit={handleSubmit} style={{display:'flex',gap:8,alignItems:'center'}}>
      <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Community name" />
      <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Short description" />
      <select value={visibility} onChange={e=>setVisibility(e.target.value)}>
        <option value="public">Public</option>
        <option value="private">Private</option>
      </select>
      <button type="submit" disabled={loading}>{loading? 'Creating…' : 'Create'}</button>
    </form>
  )
}
