import Link from 'next/link'

export default function CarteAnnonce({ annonce }) {
  return (
    <Link href={`/annonces/${annonce.id}`}>
      <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-green-200 transition-all cursor-pointer h-full flex flex-col">

        {/* Header — trajet + prix */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-3">
            <p className="text-xs text-gray-400 mb-1">Trajet</p>
            <h2 className="text-base font-bold text-gray-800 leading-tight">
              {annonce.ville_depart} → {annonce.ville_arrivee}
            </h2>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-black text-green-600 leading-tight">{annonce.prix_par_kilo}€</p>
            <p className="text-xs text-gray-400">/kilo</p>
            <p className="text-xs text-green-500 font-medium">
              ≈ {(annonce.prix_par_kilo * 655.957).toFixed(0)} FCFA
            </p>
          </div>
        </div>

        {/* Infos — date + kilos */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
            <p className="text-xs text-gray-400 mb-0.5">Date</p>
            <p className="text-xs font-semibold text-gray-700">
              {new Date(annonce.date_voyage).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
            <p className="text-xs text-gray-400 mb-0.5">Restants</p>

            <p className="text-xs font-semibold text-gray-700">
  {annonce.kilos_disponibles - (annonce.kilos_reserves || 0)} kg
</p>
          </div>
        </div>

        {/* Description */}
        {annonce.description && (
          <p className="text-xs text-gray-400 mb-4 line-clamp-2 flex-1">
            {annonce.description}
          </p>
        )}

        {/* Bouton */}
        <div className="w-full bg-green-50 text-green-700 text-sm font-semibold py-2.5 rounded-xl text-center mt-auto">
          Voir les détails →
        </div>

      </div>
    </Link>
  )
}