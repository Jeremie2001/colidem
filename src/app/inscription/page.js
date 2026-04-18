'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Inscription() {
  const router = useRouter()
  const [chargement, setChargement] = useState(false)
  const [message, setMessage] = useState('')
  const [etape, setEtape] = useState(1)
  const [form, setForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    password: '',
    type_profil: ''
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleChoixProfil(type) {
    setForm({ ...form, type_profil: type })
    setEtape(2)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setChargement(true)
    setMessage('')

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setMessage('Erreur : ' + error.message)
      setChargement(false)
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: data.user.id,
        nom: form.nom,
        telephone: form.telephone,
        type_profil: form.type_profil
      }])

    if (profileError) {
      setMessage('Erreur lors de la création du profil.')
      setChargement(false)
      return
    }

    setMessage('Compte créé avec succès !')
    setTimeout(() => router.push('/'), 1500)
    setChargement(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-green-600 mb-1">Colidem</h1>
          <p className="text-gray-500 text-sm">Crée ton compte gratuitement</p>
        </div>

        {/* Etape 1 — Choix du profil */}
        {etape === 1 && (
          <div>
            <p className="text-center text-gray-700 font-semibold mb-6">
              Tu es plutôt...
            </p>
            <div className="flex flex-col gap-4">

              <button
                onClick={() => handleChoixProfil('expediteur')}
                className="bg-white border-2 border-gray-200 hover:border-green-400 rounded-2xl p-5 text-left transition-all"
              >
                <p className="text-2xl mb-2">📦</p>
                <p className="font-bold text-gray-800 mb-1">Expéditeur</p>
                <p className="text-sm text-gray-500">
                  Je veux envoyer des colis à ma famille ou mes proches
                </p>
              </button>

              <button
                onClick={() => handleChoixProfil('voyageur')}
                className="bg-white border-2 border-gray-200 hover:border-green-400 rounded-2xl p-5 text-left transition-all"
              >
                <p className="text-2xl mb-2">✈️</p>
                <p className="font-bold text-gray-800 mb-1">Voyageur</p>
                <p className="text-sm text-gray-500">
                  Je pars en voyage et j'ai des kilos disponibles dans mes bagages
                </p>
              </button>

              <button
                onClick={() => handleChoixProfil('gp')}
                className="bg-white border-2 border-gray-200 hover:border-green-400 rounded-2xl p-5 text-left transition-all"
              >
                <p className="text-2xl mb-2">🏢</p>
                <p className="font-bold text-gray-800 mb-1">GP Professionnel</p>
                <p className="text-sm text-gray-500">
                  L'envoi de colis est mon activité principale
                </p>
              </button>

            </div>
            <p className="text-center text-sm text-gray-500 mt-6">
              Déjà un compte ?{' '}
              <Link href="/connexion" className="text-green-600 font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        )}

        {/* Etape 2 — Informations */}
        {etape === 2 && (
          <div>
            <button
              onClick={() => setEtape(1)}
              className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
            >
              ← Changer de profil
            </button>

            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
              <span className="text-xl">
                {form.type_profil === 'expediteur' ? '📦' : form.type_profil === 'voyageur' ? '✈️' : '🏢'}
              </span>
              <div>
                <p className="text-sm font-semibold text-green-700">
                  {form.type_profil === 'expediteur' ? 'Expéditeur' : form.type_profil === 'voyageur' ? 'Voyageur' : 'GP Professionnel'}
                </p>
                <p className="text-xs text-green-500">Profil sélectionné</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Nom complet</label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  placeholder="Ex: Moussa Diallo"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 transition-colors"
                />
              </div>

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
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Téléphone WhatsApp
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  placeholder="+221 77 000 00 00"
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
                  placeholder="Minimum 6 caractères"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 transition-colors"
                />
              </div>

              {message && (
                <p className={`text-sm text-center font-medium ${message.includes('Erreur') ? 'text-red-500' : 'text-green-600'}`}>
                  {message}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={chargement}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-3 rounded-xl transition-colors mt-2"
              >
                {chargement ? 'Création...' : 'Créer mon compte'}
              </button>

              <p className="text-center text-sm text-gray-500">
                Déjà un compte ?{' '}
                <Link href="/connexion" className="text-green-600 font-medium hover:underline">
                  Se connecter
                </Link>
              </p>

            </div>
          </div>
        )}

      </div>
    </main>
  )
}