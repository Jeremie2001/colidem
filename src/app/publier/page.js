'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PublierAnnonce() {
  const router = useRouter()
  const [chargement, setChargement] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const [pret, setPret] = useState(false)
  const [form, setForm] = useState({
    ville_depart: '',
    ville_arrivee: '',
    date_voyage: '',
    kilos_disponibles: '',
    prix_par_kilo: '',
    description: '',
    paiement_type: 'envoi' 
  })

  useEffect(() => {
    async function verifierConnexion() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/connexion')
        return
      }
      setUser(session.user)
      setPret(true)
    }
    verifierConnexion()
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
  e.preventDefault()
  if (!user) return
  setChargement(true)
  setMessage('')

  const { data: { session } } = await supabase.auth.getSession()
  
  const { data: profil } = await supabase
    .from('profiles')
    .select('type_profil')
    .eq('id', session.user.id)
    .single()

  const { error } = await supabase
    .from('annonces')
    .insert([{
      ...form,
      voyageur_id: user.id,
      type_vendeur: profil?.type_profil === 'gp' ? 'gp' : 'voyageur',
      kilos_disponibles: parseFloat(form.kilos_disponibles),
      prix_par_kilo: parseFloat(form.prix_par_kilo)
    }])

  if (error) {
    setMessage('Une erreur est survenue. Réessaie.')
  } else {
    setMessage('Annonce publiée avec succès !')
    setTimeout(() => router.push('/'), 1500)
  }

  setChargement(false)
}

  if (!pret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Vérification en cours...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Retour
        </button>
        <h1 className="text-xl font-bold text-green-600">Colidem</h1>
      </header>

      <section className="max-w-lg mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Publier une annonce
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          Tu pars en voyage ? Propose tes kilos disponibles.
        </p>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-5">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Ville de départ
              </label>
              <input
                type="text"
                name="ville_depart"
                value={form.ville_depart}
                onChange={handleChange}
                placeholder="Ex: Dakar"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Ville d'arrivée
              </label>
              <input
                type="text"
                name="ville_arrivee"
                value={form.ville_arrivee}
                onChange={handleChange}
                placeholder="Ex: Paris"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Date du voyage
            </label>
            <input
              type="date"
              name="date_voyage"
              value={form.date_voyage}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Kilos disponibles
              </label>
              <input
                type="number"
                name="kilos_disponibles"
                value={form.kilos_disponibles}
                onChange={handleChange}
                placeholder="Ex: 10"
                min="1"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Prix par kilo (€)
              </label>
              <input
                type="number"
                name="prix_par_kilo"
                value={form.prix_par_kilo}
                onChange={handleChange}
                placeholder="Ex: 12"
                min="1"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Description <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Ex: Dépôt possible à Ouest-Foire, colis bien emballé exigé..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 transition-colors resize-none"
            />
          </div>

          {message && (
            <p className={`text-sm text-center font-medium ${message.includes('erreur') ? 'text-red-500' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          <div>
  <label className="text-sm font-medium text-gray-700 block mb-2">
    Paiement
  </label>
  <div className="grid grid-cols-2 gap-3">
    <button
      type="button"
      onClick={() => setForm({ ...form, paiement_type: 'envoi' })}
      className={`py-3 rounded-xl text-sm font-medium border-2 transition-colors ${
        form.paiement_type === 'envoi'
          ? 'border-green-500 bg-green-50 text-green-700'
          : 'border-gray-200 text-gray-500'
      }`}
    >
      💸 À lenvoi
    </button>
    <button
      type="button"
      onClick={() => setForm({ ...form, paiement_type: 'arrivee' })}
      className={`py-3 rounded-xl text-sm font-medium border-2 transition-colors ${
        form.paiement_type === 'arrivee'
          ? 'border-green-500 bg-green-50 text-green-700'
          : 'border-gray-200 text-gray-500'
      }`}
    >
      📦 À larrivée
    </button>
  </div>
  <p className="text-xs text-gray-400 mt-2">
    a larrivé signifie que cest le destinataire qui paie
  </p>
</div>

          <button
            type="submit"
            disabled={chargement}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-3 rounded-xl transition-colors"
          >
            {chargement ? 'Publication...' : 'Publier mon annonce'}
          </button>

        </form>
      </section>
    </main>
  )
}