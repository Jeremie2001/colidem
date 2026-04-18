'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Reservations() {
  const router = useRouter()
  const [reservations, setReservations] = useState([])
  const [chargement, setChargement] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function chargerReservations() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/connexion')
        return
      }
      setUser(session.user)

      const { data } = await supabase
        .from('reservations')
        .select(`
          *,
          annonces(*),
          profiles!reservations_expediteur_id_fkey(nom, telephone)
        `)
        .eq('annonces.voyageur_id', session.user.id)
        .order('created_at', { ascending: false })

      if (data) setReservations(data.filter(r => r.annonces))
      setChargement(false)
    }

    chargerReservations()
  }, [])

  async function handleAccepter(resa) {
  await supabase
    .from('reservations')
    .update({ statut: 'accepte' })
    .eq('id', resa.id)

  setReservations(reservations.map(r =>
    r.id === resa.id ? { ...r, statut: 'accepte' } : r
  ))

  // Email à l'expéditeur
  const { data: expediteurAvecEmail } = await supabase
    .from('profiles_with_email')
    .select('email, nom')
    .eq('id', resa.expediteur_id)
    .single()

  if (expediteurAvecEmail?.email) {
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'reservation_acceptee',
        destinataire: expediteurAvecEmail.email,
        data: {
          expediteur_nom: expediteurAvecEmail.nom,
          voyageur_nom: resa.profiles?.nom,
          ville_depart: resa.annonces?.ville_depart,
          ville_arrivee: resa.annonces?.ville_arrivee,
          kilos: resa.kilos_reserves,
          montant: resa.montant_total
        }
      })
    })
  }
}

async function handleRefuser(resa) {
  await supabase
    .from('reservations')
    .update({ statut: 'refuse' })
    .eq('id', resa.id)

  await supabase
    .from('annonces')
    .update({
      kilos_reserves: Math.max(0, (resa.annonces.kilos_reserves || 0) - resa.kilos_reserves)
    })
    .eq('id', resa.annonce_id)

  setReservations(reservations.map(r =>
    r.id === resa.id ? { ...r, statut: 'refuse' } : r
  ))

  // Email à l'expéditeur
  const { data: expediteurAvecEmail } = await supabase
    .from('profiles_with_email')
    .select('email, nom')
    .eq('id', resa.expediteur_id)
    .single()

  if (expediteurAvecEmail?.email) {
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'reservation_refusee',
        destinataire: expediteurAvecEmail.email,
        data: {
          expediteur_nom: expediteurAvecEmail.nom,
          ville_depart: resa.annonces?.ville_depart,
          ville_arrivee: resa.annonces?.ville_arrivee,
          kilos: resa.kilos_reserves
        }
      })
    })
  }
}

  function getLienWhatsapp(resa) {
    if (!resa.profiles?.telephone) return '#'
    const tel = resa.profiles.telephone.replace(/\s/g, '').replace('+', '')
    const msg = 'Bonjour ' + resa.profiles.nom + ', j ai accepte votre reservation de ' + resa.kilos_reserves + ' kg sur Colidem pour le trajet ' + resa.annonces?.ville_depart + ' vers ' + resa.annonces?.ville_arrivee + '. Contactez-moi pour les details.'
    return 'https://wa.me/' + tel + '?text=' + encodeURIComponent(msg)
  }

  if (chargement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Chargement...</p>
      </div>
    )
  }

  const enAttente = reservations.filter(r => r.statut === 'en_attente')
  const traitees = reservations.filter(r => r.statut !== 'en_attente')

  return (
    <main className="min-h-screen bg-gray-50">

      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4 sticky top-0 z-50">
        <button
          onClick={() => router.push('/profil')}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Retour
        </button>
        <h1 className="text-xl font-black text-green-600">Colidem</h1>
      </header>

      <section className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Réservations reçues</h2>
          <p className="text-sm text-gray-400">Gérez les demandes de vos expéditeurs</p>
        </div>

        {/* En attente */}
        {enAttente.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm font-semibold text-gray-700">En attente</p>
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {enAttente.length}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {enAttente.map((resa) => (
                <div key={resa.id} className="bg-white border border-yellow-200 rounded-2xl p-5">

                  {/* Trajet */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Trajet</p>
                      <p className="font-bold text-gray-800">
                        {resa.annonces?.ville_depart} → {resa.annonces?.ville_arrivee}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(resa.annonces?.date_voyage).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full">
                      En attente
                    </span>
                  </div>

                  {/* Expéditeur */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                        {resa.profiles?.nom?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{resa.profiles?.nom}</p>
                        <p className="text-xs text-gray-400">{resa.profiles?.telephone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Détails réservation */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Kilos</p>
                      <p className="text-sm font-bold text-gray-800">{resa.kilos_reserves} kg</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Montant</p>
                      <p className="text-sm font-bold text-green-600">{resa.montant_total}€</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">En FCFA</p>
                      <p className="text-sm font-bold text-gray-800">
                        {(resa.montant_total * 655.957).toFixed(0)}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  {resa.message && (
                    <div className="bg-blue-50 rounded-xl p-3 mb-3">
                      <p className="text-xs text-blue-400 mb-1">Message de l'expéditeur</p>
                      <p className="text-sm text-blue-700">{resa.message}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccepter(resa)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
                    >
                      ✅ Accepter
                    </button>
                    <button
                      onClick={() => handleRefuser(resa)}
                      className="flex-1 border border-red-200 text-red-400 hover:text-red-600 font-medium py-2.5 rounded-xl transition-colors text-sm"
                    >
                      ❌ Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Traitées */}
        {traitees.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Traitées</p>
            <div className="flex flex-col gap-3">
              {traitees.map((resa) => (
                <div key={resa.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {resa.annonces?.ville_depart} → {resa.annonces?.ville_arrivee}
                      </p>
                      <p className="text-xs text-gray-400">
                        {resa.profiles?.nom} · {resa.kilos_reserves} kg · {resa.montant_total}€
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      resa.statut === 'accepte'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {resa.statut === 'accepte' ? 'Accepté' : 'Refusé'}
                    </span>
                  </div>

                  {resa.statut === 'accepte' && (
                    <a
                      href={getLienWhatsapp(resa)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-green-50 text-green-600 text-sm font-medium py-2 rounded-xl text-center hover:bg-green-100 transition-colors"
                    >
                      📱 Contacter via WhatsApp
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {reservations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-gray-500 font-medium">Aucune réservation reçue</p>
            <p className="text-sm text-gray-400 mt-1">
              Les demandes de tes expéditeurs apparaîtront ici
            </p>
          </div>
        )}

      </section>
    </main>
  )
}