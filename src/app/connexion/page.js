'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Connexion() {
  const router = useRouter()
  const [chargement, setChargement] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setChargement(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setMessage('Email ou mot de passe incorrect.')
      setChargement(false)
      return
    }

    router.push('/')
    setChargement(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-600 mb-1">Colidem</h1>
          <p className="text-gray-500 text-sm">Connecte-toi à ton compte</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ton@email.com"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Ton mot de passe"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 transition-colors"
            />
          </div>

          {message && (
            <p className="text-sm text-center font-medium text-red-500">
              {message}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={chargement}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-3 rounded-xl transition-colors mt-2"
          >
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link href="/inscription" className="text-green-600 font-medium hover:underline">
              Sinscrire
            </Link>
          </p>

        </div>
      </div>
    </main>
  )
}