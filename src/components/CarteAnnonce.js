import Link from 'next/link'

export default function CarteAnnonce({ annonce }) {
  return (
    <Link href={`/annonces/${annonce.id}`}>
      <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-green-200 transition-all cursor-pointer">

        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">Trajet</p>
            <h2 className="text-lg font-semibold text-gray-800">
              {annonce.ville_depart} → {annonce.ville_arrivee}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-green-600">
              {annonce.prix_par_kilo}€
            </span>
            <p className="text-xs text-gray-400">/kilo</p>
          </div>
        </div>

        <div className="flex gap-4 text-sm text-gray-500 mb-4">
          <span>📅 {new Date(annonce.date_voyage).toLocaleDateString('fr-FR')}</span>
          <span>⚖️ {annonce.kilos_disponibles} kg disponibles</span>
        </div>

        {annonce.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {annonce.description}
          </p>
        )}

        <div className="w-full bg-green-50 text-green-700 text-sm font-medium py-2.5 rounded-xl text-center">
          Voir les détails →
        </div>

      </div>
    </Link>
  )
}