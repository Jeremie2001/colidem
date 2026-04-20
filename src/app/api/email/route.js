import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  const { type, destinataire, data } = await request.json()

  let sujet = ''
  let contenu = ''

  if (type === 'nouvelle_reservation') {
    sujet = '📦 Nouvelle réservation sur Colidem !'
    contenu = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #16a34a; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Colidem</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827;">Bonjour ${data.voyageur_nom} !</h2>
          <p style="color: #6b7280;">Tu as reçu une nouvelle réservation sur ton annonce.</p>
          
          <div style="background: white; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px; color: #111827;"><strong>Trajet :</strong> ${data.ville_depart} → ${data.ville_arrivee}</p>
            <p style="margin: 0 0 8px; color: #111827;"><strong>Expéditeur :</strong> ${data.expediteur_nom}</p>
            <p style="margin: 0 0 8px; color: #111827;"><strong>Kilos réservés :</strong> ${data.kilos} kg</p>
            <p style="margin: 0; color: #16a34a;"><strong>Montant :</strong> ${data.montant}€ (≈ ${Math.round(data.montant * 655.957)} FCFA)</p>
          </div>

          ${data.message ? `
          <div style="background: #eff6ff; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; color: #1d4ed8;"><strong>Message :</strong> ${data.message}</p>
          </div>
          ` : ''}

          <a href="https://colidem.vercel.app/reservations" 
             style="display: block; background: #16a34a; color: white; text-align: center; padding: 14px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Voir la réservation →
          </a>

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
            Colidem — La marketplace du bagage partagé
          </p>
        </div>
      </div>
    `
  }

  if (type === 'reservation_acceptee') {
    sujet = '✅ Ta réservation a été acceptée !'
    contenu = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #16a34a; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Colidem</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827;">Bonjour ${data.expediteur_nom} !</h2>
          <p style="color: #6b7280;">Bonne nouvelle — ta réservation a été acceptée !</p>
          
          <div style="background: white; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px; color: #111827;"><strong>Trajet :</strong> ${data.ville_depart} → ${data.ville_arrivee}</p>
            <p style="margin: 0 0 8px; color: #111827;"><strong>Voyageur :</strong> ${data.voyageur_nom}</p>
            <p style="margin: 0 0 8px; color: #111827;"><strong>Kilos :</strong> ${data.kilos} kg</p>
            <p style="margin: 0; color: #16a34a;"><strong>Montant :</strong> ${data.montant}€ (≈ ${Math.round(data.montant * 655.957)} FCFA)</p>
          </div>

          <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #bbf7d0;">
            <p style="margin: 0; color: #16a34a;">
              📱 Contacte maintenant le voyageur via WhatsApp pour organiser le dépôt de ton colis.
            </p>
          </div>

          <a href="https://colidem.vercel.app/profil" 
             style="display: block; background: #16a34a; color: white; text-align: center; padding: 14px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Voir mes réservations →
          </a>

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
            Colidem — La marketplace du bagage partagé
          </p>
        </div>
      </div>
    `
  }

  if (type === 'reservation_refusee') {
    sujet = '❌ Ta réservation a été refusée'
    contenu = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #16a34a; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Colidem</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827;">Bonjour ${data.expediteur_nom} !</h2>
          <p style="color: #6b7280;">Malheureusement ta réservation a été refusée.</p>
          
          <div style="background: white; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px; color: #111827;"><strong>Trajet :</strong> ${data.ville_depart} → ${data.ville_arrivee}</p>
            <p style="margin: 0; color: #111827;"><strong>Kilos :</strong> ${data.kilos} kg</p>
          </div>

          <div style="background: #fff7ed; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #fed7aa;">
            <p style="margin: 0; color: #ea580c;">
              Ne t'inquiète pas — d'autres voyageurs sont disponibles sur Colidem !
            </p>
          </div>

          <a href="https://colidem.vercel.app" 
             style="display: block; background: #16a34a; color: white; text-align: center; padding: 14px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Chercher un autre voyageur →
          </a>

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
            Colidem — La marketplace du bagage partagé
          </p>
        </div>
      </div>
    `
  }



  if (type === 'reservation_annulee') {
  sujet = '❌ Une réservation a été annulée'
  contenu = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #16a34a; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Colidem</h1>
      </div>
      <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #111827;">Bonjour ${data.voyageur_nom} !</h2>
        <p style="color: #6b7280;">Un expéditeur a annulé sa réservation sur ton annonce.</p>
        
        <div style="background: white; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 8px; color: #111827;"><strong>Trajet :</strong> ${data.ville_depart} → ${data.ville_arrivee}</p>
          <p style="margin: 0 0 8px; color: #111827;"><strong>Expéditeur :</strong> ${data.expediteur_nom}</p>
          <p style="margin: 0; color: #16a34a;"><strong>Kilos libérés :</strong> ${data.kilos} kg</p>
        </div>

        <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #bbf7d0;">
          <p style="margin: 0; color: #16a34a;">
            ✅ Ces kilos sont maintenant à nouveau disponibles sur ton annonce.
          </p>
        </div>

        <a href="https://colidem.vercel.app/reservations" 
           style="display: block; background: #16a34a; color: white; text-align: center; padding: 14px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          Voir mes réservations →
        </a>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
          Colidem — La marketplace du bagage partagé
        </p>
      </div>
    </div>
  `
}

  try {
    // await resend.emails.send({
    //   from: 'Colidem <onboarding@resend.dev>',
    //   to: destinataire,
    //   subject: sujet,
    //   html: contenu
    // })

    await resend.emails.send({
    from: 'Colidem <onboarding@resend.dev>',
    to: 'ndjolijeremie@gmail.com', // forcer ton email pour les tests
    subject: sujet,
    html: contenu
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}