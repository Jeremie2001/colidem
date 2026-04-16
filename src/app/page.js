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
        .gte('date_voyage', new Date().toISOString().split('T')[0])
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
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
  <h1 className="text-xl font-black text-green-600">Colidem</h1>
  <div className="flex gap-2 items-center">
    {user ? (
      <>
        <Link href="/publier">
          <button className="bg-green-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium">
            <span className="md:hidden">+ Publier</span>
            <span className="hidden md:inline">Publier une annonce</span>
          </button>
        </Link>
        <Link href="/profil">
          <button className="text-xs md:text-sm text-gray-600 hover:text-gray-800 transition-colors">
            Mon profil
          </button>
        </Link>
        <button
          onClick={handleDeconnexion}
          className="text-xs md:text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Déconnexion
        </button>
      </>
    ) : (
      <>
        <Link href="/connexion">
          <button className="text-xs md:text-sm text-gray-600 font-medium">
            Se connecter
          </button>
        </Link>
        <Link href="/inscription">
          <button className="bg-green-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium">
            S'inscrire
          </button>
        </Link>
      </>
    )}
  </div>
</header>

      {/* Hero avec image de fond */}
      <section className="relative text-white text-center overflow-hidden" style={{ minHeight: '420px' }}>
        <img
          src="/hero.jpg"
          alt="Envoi de colis"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-green-900 opacity-70"></div>
        <div className="relative z-10 px-6 py-16">
          <div className="inline-block bg-green-500 bg-opacity-40 text-green-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            🌍 Dakar ↔ Europe
          </div>
          <h2 className="text-4xl font-black mb-3 leading-tight">
            Envoyez vos colis<br />facilement
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            Trouvez un voyageur qui part vers votre destination — rapide, sécurisé et abordable
          </p>

          {/* Barre de recherche */}
          {/* Mobile — champs empilés */}
<div className="bg-white rounded-2xl p-2 max-w-xl mx-auto shadow-xl md:hidden">
  <input
    type="text"
    placeholder="Ville de départ"
    value={recherche.depart}
    onChange={(e) => setRecherche({ ...recherche, depart: e.target.value })}
    className="w-full px-3 py-2 text-gray-700 text-sm outline-none border-b border-gray-100"
  />
  <input
    type="text"
    placeholder="Ville d'arrivée"
    value={recherche.arrivee}
    onChange={(e) => setRecherche({ ...recherche, arrivee: e.target.value })}
    className="w-full px-3 py-2 text-gray-700 text-sm outline-none mb-2"
  />
  <button
    onClick={handleRecherche}
    className="w-full bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
  >
    Chercher
  </button>
</div>

{/* Desktop — champs sur une ligne */}
<div className="hidden md:flex bg-white rounded-2xl p-3 max-w-xl mx-auto gap-2 shadow-xl">
  <input
    type="text"
    placeholder="Ville de départ"
    value={recherche.depart}
    onChange={(e) => setRecherche({ ...recherche, depart: e.target.value })}
    className="flex-1 px-3 py-2 text-gray-700 text-sm outline-none"
  />
  <span className="text-gray-300 self-center text-lg">→</span>
  <input
    type="text"
    placeholder="Ville d'arrivée"
    value={recherche.arrivee}
    onChange={(e) => setRecherche({ ...recherche, arrivee: e.target.value })}
    className="flex-1 px-3 py-2 text-gray-700 text-sm outline-none"
  />
  <button
    onClick={handleRecherche}
    className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
  >
    Chercher
  </button>
</div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <p className="text-2xl font-black">{toutesAnnonces.length}+</p>
              <p className="text-green-200 text-xs mt-1">Annonces actives</p>
            </div>
            <div className="w-px bg-green-600"></div>
            <div className="text-center">
              <p className="text-2xl font-black">12€</p>
              <p className="text-green-200 text-xs mt-1">Prix moyen/kg</p>
            </div>
            <div className="w-px bg-green-600"></div>
            <div className="text-center">
              <p className="text-2xl font-black">100%</p>
              <p className="text-green-200 text-xs mt-1">Gratuit</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="bg-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-center text-lg font-bold text-gray-800 mb-8">
            Comment ça marche ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
                🔍
              </div>
              <p className="font-semibold text-gray-800 mb-1">Cherche un trajet</p>
              <p className="text-sm text-gray-500">Trouve un voyageur qui part vers ta destination</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
                💬
              </div>
              <p className="font-semibold text-gray-800 mb-1">Contacte via WhatsApp</p>
              <p className="text-sm text-gray-500">Discute directement avec le voyageur</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
                📦
              </div>
              <p className="font-semibold text-gray-800 mb-1">Envoie ton colis</p>
              <p className="text-sm text-gray-500">Dépose et récupère ton colis en toute sécurité</p>
            </div>
          </div>
        </div>
      </section>

      {/* Liste des annonces */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Annonces récentes</h3>
            <p className="text-sm text-gray-400">Voyageurs disponibles</p>
          </div>
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 px-6 py-8 text-center">
        <h2 className="text-xl font-black text-green-600 mb-2">Colidem</h2>
        <p className="text-sm text-gray-400">La marketplace du bagage partagé entre l'Afrique et l'Europe</p>
        <p className="text-xs text-gray-300 mt-4">© 2026 Colidem — Tous droits réservés</p>
      </footer>

    </main>
  )
}