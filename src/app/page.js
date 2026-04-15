'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import CarteAnnonce from '@/components/CarteAnnonce'
import Link from 'next/link'

export default function Home() {
  const [annonces, setAnnonces] = useState([])
  const [toutesAnnonces, setToutesAnnonces] = useState([])
  const [chargement, setChargement] = useState(true)
  const [user, setUser] = useState(null)
  const [recherche, setRecherche] = useState({ depart: '', arrivee: '' })

  useEffect(() => {
    async function chargerDonnees() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data, error } = await supabase
        .from('annonces')
        .select('*')
        .eq('statut', 'active')
        .order('created_at', { ascending: false })

      if (!error) {
        setAnnonces(data)
        setToutesAnnonces(data)
      }
      setChargement(false)
    }

    chargerDonnees()
  }, [])

  async function handleDeconnexion() {
    await supabase.auth.signOut()
    setUser(null)
  }

  function handleRecherche() {
    if (!recherche.depart && !recherche.arrivee) {
      setAnnonces(toutesAnnonces)
      return
    }
    const filtrees = toutesAnnonces.filter(a => {
      const matchDepart = a.ville_depart.toLowerCase().includes(recherche.depart.toLowerCase())
      const matchArrivee = a.ville_arrivee.toLowerCase().includes(recherche.arrivee.toLowerCase())
      return matchDepart && matchArrivee
    })
    setAnnonces(filtrees)
  }

  function handleReset() {
    setRecherche({ depart: '', arrivee: '' })
    setAnnonces(toutesAnnonces)
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-600">Colidem</h1>
        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <Link href="/publier">
                <button className="bg-green-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-green-700 transition-colors">
                  Publier une annonce
                </button>
              </Link>

               <Link href="/profil">
                <button className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  Mon profil
                </button>
              </Link>
              <button
                onClick={handleDeconnexion}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/connexion">
                <button className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  Se connecter
                </button>
              </Link>
              <Link href="/inscription">
                <button className="bg-green-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-green-700 transition-colors">
                  S'inscrire
                </button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="bg-green-600 text-white px-6 py-12 text-center">
        <h2 className="text-3xl font-bold mb-3">
          Envoyez vos colis facilement
        </h2>
        <p className="text-green-100 text-lg mb-8">
          Trouvez un voyageur qui part vers votre destination
        </p>
        <div className="bg-white rounded-2xl p-3 max-w-xl mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Ville de départ"
            value={recherche.depart}
            onChange={(e) => setRecherche({ ...recherche, depart: e.target.value })}
            className="flex-1 px-3 py-2 text-gray-700 text-sm outline-none"
          />
          <span className="text-gray-300 self-center">→</span>
          <input
            type="text"
            placeholder="Ville d'arrivée"
            value={recherche.arrivee}
            onChange={(e) => setRecherche({ ...recherche, arrivee: e.target.value })}
            className="flex-1 px-3 py-2 text-gray-700 text-sm outline-none"
          />
          <button
            onClick={handleRecherche}
            className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Chercher
          </button>
        </div>
      </section>

      {/* Liste des annonces */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-700">
            Annonces récentes
          </h3>
          {(recherche.depart || recherche.arrivee) && (
            <button
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Réinitialiser ✕
            </button>
          )}
        </div>

        {chargement ? (
          <div className="text-center text-gray-400 py-20">
            Chargement des annonces...
          </div>
        ) : annonces.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <p className="text-4xl mb-4">📦</p>
            <p>Aucune annonce trouvée.</p>
            <p className="text-sm mt-2">Essaie avec d'autres villes !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {annonces.map((annonce) => (
              <CarteAnnonce key={annonce.id} annonce={annonce} />
            ))}
          </div>
        )}
      </section>

    </main>
  )
}