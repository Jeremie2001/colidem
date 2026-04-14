'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import CarteAnnonce from '@/components/CarteAnnonce'
import Link from 'next/link'

export default function Home() {
  const [annonces, setAnnonces] = useState([])
  const [chargement, setChargement] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function chargerDonnees() {
      // Charge l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Charge les annonces
      const { data, error } = await supabase
        .from('annonces')
        .select('*')
        .eq('statut', 'active')
        .order('created_at', { ascending: false })

      if (!error) setAnnonces(data)
      setChargement(false)
    }

    chargerDonnees()
  }, [])

  async function handleDeconnexion() {
    await supabase.auth.signOut()
    setUser(null)
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
                  Sinscrire
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
            className="flex-1 px-3 py-2 text-gray-700 text-sm outline-none"
          />
          <span className="text-gray-300 self-center">→</span>
          <input
            type="text"
            placeholder="Ville d'arrivée"
            className="flex-1 px-3 py-2 text-gray-700 text-sm outline-none"
          />
          <button className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
            Chercher
          </button>
        </div>
      </section>

      {/* Liste des annonces */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <h3 className="text-lg font-semibold text-gray-700 mb-6">
          Annonces récentes
        </h3>
        {chargement ? (
          <div className="text-center text-gray-400 py-20">
            Chargement des annonces...
          </div>
        ) : annonces.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <p className="text-4xl mb-4">📦</p>
            <p>Aucune annonce pour le moment.</p>
            <p className="text-sm mt-2">Sois le premier à publier un trajet !</p>
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