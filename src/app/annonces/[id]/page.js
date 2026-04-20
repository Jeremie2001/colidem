'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function DetailAnnonce() {
  const router = useRouter()
  const { id } = useParams()
  const [annonce, setAnnonce] = useState(null)
  const [voyageur, setVoyageur] = useState(null)
  const [user, setUser] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [kilos, setKilos] = useState(1)
  const [message, setMessage] = useState('')
  const [reservation, setReservation] = useState(null)
  const [envoi, setEnvoi] = useState(false)
  const [succes, setSucces] = useState('')

  useEffect(() => {
    async function chargerAnnonce() {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)

      const { data: annonce, error } = await supabase
        .from('annonces')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !annonce) {
        router.push('/')
        return
      }

      setAnnonce(annonce)

      const { data: profil } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', annonce.voyageur_id)
        .single()

      setVoyageur(profil)

      if (session?.user) {
        const { data: resa } = await supabase
          .from('reservations')
          .select('*')
          .eq('annonce_id', id)
          .eq('expediteur_id', session.user.id)
          .single()

        if (resa) setReservation(resa)
      }

      setChargement(false)
    }

    chargerAnnonce()
  }, [id])

  async function handleReserver() {
  if (!user) {
    router.push('/connexion')
    return
  }

  setEnvoi(true)
  setSucces('')

  const kilosRestants = annonce.kilos_disponibles - (annonce.kilos_reserves || 0)

  if (kilos > kilosRestants) {
    setSucces('Plus assez de kilos disponibles !')
    setEnvoi(false)
    return
  }

  const montant = kilos * annonce.prix_par_kilo

  const { data, error } = await supabase
    .from('reservations')
    .insert([{
      annonce_id: id,
      expediteur_id: user.id,
      kilos_reserves: kilos,
      montant_total: montant,
      statut: 'en_attente',
      message: message
    }])
    .select()
    .single()

  if (error) {
    setSucces('Une erreur est survenue. Réessaie.')
    setEnvoi(false)
    return
  }

  await supabase
    .from('annonces')
    .update({ kilos_reserves: (annonce.kilos_reserves || 0) + kilos })
    .eq('id', id)

  setReservation(data)
  setAnnonce({ ...annonce, kilos_reserves: (annonce.kilos_reserves || 0) + kilos })
  setSucces('Réservation envoyée ! Le voyageur va vous contacter.')
  setEnvoi(false)

  // Récupérer email du voyageur via fonction RPC
  const { data: emailData, error: emailError } = await supabase
    .rpc('get_user_email', { user_id: annonce.voyageur_id })

  console.log('Email voyageur:', emailData)
  console.log('Erreur email:', emailError)

  if (emailData) {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'nouvelle_reservation',
        destinataire: emailData,
        data: {
          voyageur_nom: voyageur.nom,
          expediteur_nom: user.email,
          ville_depart: annonce.ville_depart,
          ville_arrivee: annonce.ville_arrivee,
          kilos: kilos,
          montant: montant,
          message: message
        }
      })
    })
    const result = await response.json()
    console.log('Résultat envoi email:', result)
  }
}



// async function handleAnnuler() {
//   if (!reservation) return

//   await supabase
//     .from('annonces')
//     .update({ kilos_reserves: Math.max(0, (annonce.kilos_reserves || 0) - reservation.kilos_reserves) })
//     .eq('id', id)

//   await supabase
//     .from('reservations')
//     .delete()
//     .eq('id', reservation.id)

//   setReservation(null)
//   setAnnonce({ ...annonce, kilos_reserves: Math.max(0, (annonce.kilos_reserves || 0) - reservation.kilos_reserves) })
//   setSucces('Réservation annulée.')
// }


async function handleAnnuler() {
  if (!reservation) return

  const kilosALiberer = reservation.kilos_reserves
  const kilosReservesActuels = annonce.kilos_reserves || 0
  const nouveauxKilosReserves = Math.max(0, kilosReservesActuels - kilosALiberer)

  const { error: errorAnnonce } = await supabase
    .from('annonces')
    .update({ kilos_reserves: nouveauxKilosReserves })
    .eq('id', id)

  if (errorAnnonce) {
    setSucces('Erreur lors de l annulation.')
    return
  }

  const { error: errorResa } = await supabase
    .from('reservations')
    .delete()
    .eq('id', reservation.id)

  if (errorResa) {
    setSucces('Erreur lors de l annulation.')
    return
  }

  setReservation(null)
  setAnnonce({
    ...annonce,
    kilos_reserves: nouveauxKilosReserves
  })
  setSucces('Réservation annulée. Les kilos ont été libérés.')

  // Notifier le voyageur
  const { data: emailData } = await supabase
    .rpc('get_user_email', { user_id: annonce.voyageur_id })

  if (emailData) {
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'reservation_annulee',
        destinataire: emailData,
        data: {
          voyageur_nom: voyageur.nom,
          expediteur_nom: user.email,
          ville_depart: annonce.ville_depart,
          ville_arrivee: annonce.ville_arrivee,
          kilos: kilosALiberer
        }
      })
    })
  }
}


    function getLienWhatsapp() {
        if (!voyageur) return '#'
        const tel = voyageur.telephone ? voyageur.telephone.replace(/\s/g, '').replace('+', '') : ''
        const lienAnnonce = `https://colidem.vercel.app/annonces/${id}`
        const msg = 'Bonjour ' + voyageur.nom + ', j ai vu ton annonce sur Colidem. Je voudrais envoyer ' + kilos + ' kg pour ' + montantTotal + ' euros (' + (montantTotal * 655.957).toFixed(0) + ' FCFA). Voici le lien de ton annonce : ' + lienAnnonce + '. Est-ce possible ?'
        return 'https://wa.me/' + tel + '?text=' + encodeURIComponent(msg)
    }
  if (chargement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Chargement...</p>
      </div>
    )
  }

  const kilosRestants = annonce.kilos_disponibles - (annonce.kilos_reserves || 0)
  const montantTotal = (kilos * annonce.prix_par_kilo).toFixed(2)
  const complet = kilosRestants <= 0

  return (
    <main className="min-h-screen bg-gray-50">

      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Retour
        </button>
        <h1 className="text-xl font-black text-green-600">Colidem</h1>
      </header>

      <section className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">

        {/* Carte trajet */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Trajet</p>
              <h2 className="text-2xl font-black text-gray-800">
                {annonce.ville_depart} → {annonce.ville_arrivee}
              </h2>
            </div>
            {complet && (
              <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
                Complet
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Date</p>
              <p className="text-sm font-medium text-gray-700">
                {new Date(annonce.date_voyage).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Kilos restants</p>
              <p className="text-sm font-medium text-gray-700">{kilosRestants} kg</p>
              <p className="text-xs text-gray-400">sur {annonce.kilos_disponibles} kg</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-green-600 mb-1">Prix / kilo</p>
              <p className="text-lg font-bold text-green-600">{annonce.prix_par_kilo}€</p>
              <p className="text-xs text-green-500">≈ {(annonce.prix_par_kilo * 655.957).toFixed(0)} FCFA</p>
            </div>
          </div>

          {/* Barre de progression des kilos */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Kilos réservés</span>
              <span>{annonce.kilos_reserves || 0} / {annonce.kilos_disponibles} kg</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-2 bg-green-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, ((annonce.kilos_reserves || 0) / annonce.kilos_disponibles) * 100)}%` }}
              ></div>
            </div>
          </div>

          {annonce.description && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-600">{annonce.description}</p>
            </div>
          )}
        </div>

        {/* Profil voyageur */}
        {voyageur && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-xs text-gray-400 mb-4">Le voyageur</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                {voyageur.nom.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{voyageur.nom}</p>
                <p className="text-sm text-gray-400">
                  ⭐ {voyageur.note_moyenne > 0 ? voyageur.note_moyenne : 'Nouveau'} · {voyageur.nombre_avis} avis
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Réservation */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-xs text-gray-400 mb-4">Réserver des kilos</p>

          {reservation ? (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-green-700 mb-1">
                  ✅ Réservation en attente
                </p>
                <p className="text-sm text-green-600">
                  {reservation.kilos_reserves} kg · {reservation.montant_total}€ (≈ {(reservation.montant_total * 655.957).toFixed(0)} FCFA)
                </p>
              </div>

              <a
                href={getLienWhatsapp()}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors text-center mb-3"
              >
                📱 Contacter le voyageur via WhatsApp
              </a>

              <button
                onClick={handleAnnuler}
                className="w-full border border-red-200 text-red-400 hover:text-red-600 font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                Annuler ma réservation
              </button>
            </div>
          ) : complet ? (
            <div className="text-center py-6">
              <p className="text-4xl mb-3">😔</p>
              <p className="text-gray-500 font-medium">Cette annonce est complète</p>
              <p className="text-sm text-gray-400 mt-1">Tous les kilos sont réservés</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm text-gray-600 whitespace-nowrap">Kilos à envoyer</label>
                <input
                  type="range"
                  min="1"
                  max={kilosRestants}
                  value={kilos}
                  onChange={(e) => setKilos(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-700 min-w-[40px]">{kilos} kg</span>
              </div>

              <div className="bg-green-50 rounded-xl p-4 flex justify-between items-center mb-4">
                <span className="text-sm text-green-700">Total estimé</span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{montantTotal}€</p>
                  <p className="text-xs text-green-500">≈ {(montantTotal * 655.957).toFixed(0)} FCFA</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm text-gray-600 block mb-1">
                  Message pour le voyageur <span className="text-gray-400">(optionnel)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ex: Colis fragile, médicaments pour ma famille..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 transition-colors resize-none"
                />
              </div>

              {succes && (
                <p className={`text-sm text-center font-medium mb-3 ${succes.includes('erreur') || succes.includes('assez') ? 'text-red-500' : 'text-green-600'}`}>
                  {succes}
                </p>
              )}

              {user ? (
                <button
                  onClick={handleReserver}
                  disabled={envoi}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  {envoi ? 'Réservation en cours...' : `Réserver ${kilos} kg — ${montantTotal}€`}
                </button>
              ) : (
                <button
                  onClick={() => router.push('/connexion')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  Se connecter pour réserver
                </button>
              )}
            </div>
          )}
        </div>

      </section>
    </main>
  )
}