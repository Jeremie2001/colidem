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

  useEffect(() => {
    async function chargerAnnonce() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

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
      setChargement(false)
    }

    chargerAnnonce()
  }, [id])

  if (chargement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Chargement...</p>
      </div>
    )
  }

  const montantTotal = (kilos * annonce.prix_par_kilo).toFixed(2)

  function getLienWhatsapp() {
    if (!voyageur) return '#'
    const tel = voyageur.telephone ? voyageur.telephone.replace(/\s/g, '').replace('+', '') : ''
    const msg = 'Bonjour ' + voyageur.nom + ', j ai vu ton annonce sur Colidem. Je voudrais envoyer ' + kilos + ' kg pour ' + montantTotal + ' euros. Est-ce possible ?'
    return 'https://wa.me/' + tel + '?text=' + encodeURIComponent(msg)
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          Retour
        </button>
        <h1 className="text-xl font-bold text-green-600">Colidem</h1>
      </header>

      <section className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-xs text-gray-400 mb-2">Trajet</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {annonce.ville_depart} - {annonce.ville_arrivee}
          </h2>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Date</p>
              <p className="text-sm font-medium text-gray-700">
                {new Date(annonce.date_voyage).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Kilos dispo</p>
              <p className="text-sm font-medium text-gray-700">{annonce.kilos_disponibles} kg</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-green-600 mb-1">Prix / kilo</p>
              <p className="text-lg font-bold text-green-600">{annonce.prix_par_kilo}€</p>
            </div>
          </div>

          {annonce.description && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-600">{annonce.description}</p>
            </div>
          )}
        </div>

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
                  {voyageur.note_moyenne > 0 ? voyageur.note_moyenne : 'Nouveau'} - {voyageur.nombre_avis} avis
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-xs text-gray-400 mb-4">Calculer le prix</p>

          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm text-gray-600 whitespace-nowrap">Kilos a envoyer</label>
            <input
              type="range"
              min="1"
              max={annonce.kilos_disponibles}
              value={kilos}
              onChange={(e) => setKilos(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-700 min-w-[40px]">{kilos} kg</span>
          </div>

          <div className="bg-green-50 rounded-xl p-4 flex justify-between items-center mb-6">
            <span className="text-sm text-green-700">Total estime</span>
            <span className="text-2xl font-bold text-green-600">{montantTotal}€</span>
          </div>

          {user ? (
            <a
              href={getLienWhatsapp()}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors text-center"
            >
              Contacter via WhatsApp
            </a>
          ) : (
            <button
              onClick={() => router.push('/connexion')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Se connecter pour contacter
            </button>
          )}
        </div>

      </section>
    </main>
  )
}