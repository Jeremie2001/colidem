'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Profil() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profil, setProfil] = useState(null)
  const [annonces, setAnnonces] = useState([])
  const [reservations, setReservations] = useState([])
  const [chargement, setChargement] = useState(true)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ nom: '', telephone: '', type_profil: 'expediteur' })
  useEffect(() => {
    async function chargerProfil() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/connexion')
        return
      }
      setUser(session.user)

      const { data: profil } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profil) {
        setProfil(profil)
        setForm({ nom: profil.nom, telephone: profil.telephone || '', type_profil: profil.type_profil || 'expediteur' })

        
      }

      const { data: annonces } = await supabase
        .from('annonces')
        .select('*')
        .eq('voyageur_id', session.user.id)
        .order('created_at', { ascending: false })

      if (annonces) setAnnonces(annonces)

      const { data: resas } = await supabase
        .from('reservations')
        .select('*, annonces(*)')
        .eq('expediteur_id', session.user.id)
        .order('created_at', { ascending: false })

      if (resas) setReservations(resas)

      setChargement(false)
    }

    chargerProfil()
  }, [])

  async function handleSauvegarder() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error } = await supabase
      .from('profiles')
      .update({ nom: form.nom, telephone: form.telephone, type_profil : form.type_profil })
      .eq('id', session.user.id)

    if (error) {
      setMessage('Erreur lors de la sauvegarde.')
    } else {
      setMessage('Profil mis à jour !')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  async function handleSupprimerAnnonce(id) {
    await supabase.from('annonces').delete().eq('id', id)
    setAnnonces(annonces.filter(a => a.id !== id))
  }

  if (chargement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Chargement...</p>
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

      <section className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">

        {/* Avatar + nom */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl">
            {profil?.nom?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{profil?.nom}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <p className="text-sm text-gray-400 mt-1">
              ⭐ {profil?.note_moyenne > 0 ? profil.note_moyenne : 'Nouveau'} · {profil?.nombre_avis} avis
            </p>
          </div>
        </div>

        {/* Modifier profil */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-sm font-medium text-gray-700 mb-4">Modifier mon profil</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Nom complet</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Téléphone WhatsApp</label>
              <input
                type="tel"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                placeholder="+221 77 000 00 00"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 transition-colors"
              />
            </div>


            <div>
  <label className="text-sm text-gray-600 block mb-2">Type de profil</label>
  <div className="grid grid-cols-3 gap-2">
    {[
      { value: 'expediteur', label: '📦 Expéditeur' },
      { value: 'voyageur', label: '✈️ Voyageur' },
      { value: 'gp', label: '🏢 GP Pro' }
    ].map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => setForm({ ...form, type_profil: option.value })}
        className={`py-2.5 rounded-xl text-xs font-medium border-2 transition-colors ${
          form.type_profil === option.value
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-gray-200 text-gray-500'
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
</div>

            {message && (
              <p className={`text-sm font-medium ${message.includes('Erreur') ? 'text-red-500' : 'text-green-600'}`}>
                {message}
              </p>
            )}

            <button
              onClick={handleSauvegarder}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              Sauvegarder
            </button>
          </div>
        </div>

        {/* Mes annonces */}
       {/* Mes annonces */}
<div className="bg-white border border-gray-200 rounded-2xl p-6">
  <div className="flex justify-between items-center mb-4">
    <p className="text-sm font-medium text-gray-700">Mes annonces ({annonces.length})</p>
    <Link href="/publier">
      <button className="text-sm text-green-600 hover:text-green-700 font-medium">
        + Nouvelle annonce
      </button>
    </Link>
  </div>

  {annonces.length === 0 ? (
    <p className="text-sm text-gray-400 text-center py-6">
      Tu n'as pas encore publié d'annonce.
    </p>
  ) : (
    <div className="flex flex-col gap-3">
      {annonces.map((annonce) => (
        <div key={annonce.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-800">
              {annonce.ville_depart} → {annonce.ville_arrivee}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(annonce.date_voyage).toLocaleDateString('fr-FR')} · {annonce.prix_par_kilo}€/kg
            </p>
          </div>
          <button
            onClick={() => handleSupprimerAnnonce(annonce.id)}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Supprimer
          </button>
        </div>
      ))}
    </div>
  )}

  <Link href="/reservations">
    <button className="w-full bg-yellow-50 border border-yellow-200 text-yellow-700 font-medium py-3 rounded-xl text-sm hover:bg-yellow-100 transition-colors mt-4">
      📬 Voir mes réservations reçues
    </button>
  </Link>
</div>

        {/* Mes réservations */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-sm font-medium text-gray-700 mb-4">
            Mes réservations ({reservations.length})
          </p>

          {reservations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Tu n'as pas encore de réservation.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {reservations.map((resa) => (
                <div key={resa.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {resa.annonces?.ville_depart} → {resa.annonces?.ville_arrivee}
                    </p>
                    <p className="text-xs text-gray-400">
                      {resa.kilos_reserves} kg · {resa.montant_total}€
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    resa.statut === 'accepte' ? 'bg-green-100 text-green-600' :
                    resa.statut === 'refuse' ? 'bg-red-100 text-red-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {resa.statut === 'accepte' ? 'Accepté' :
                     resa.statut === 'refuse' ? 'Refusé' : 'En attente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>
    </main>
  )
}