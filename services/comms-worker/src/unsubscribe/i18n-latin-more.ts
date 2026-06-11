import type { ConfirmationChrome } from './i18n-types'

/** Spanish confirmation chrome (es). */
export const CONF_ES: ConfirmationChrome = {
  title: 'Cancelado — Prometeo Comunista',
  confirmHeading: 'Confirma la cancelación',
  confirmBody:
    'Pulsa el botón de abajo para dejar de recibir el boletín en esta dirección.',
  confirmButton: 'Cancelar suscripción',
  unsubscribedHeading: 'Te has dado de baja',
  unsubscribedBody:
    'Ya no recibirás el boletín de Prometeo Comunista en esta dirección.',
  reSubscribeLabel: 'Volver a suscribirse por correo',
  expiredHeading: 'Este enlace ha caducado',
  expiredBody:
    'El enlace de cancelación ya no es válido. Si todavía deseas cancelarte, contáctanos.',
}

/** Polish confirmation chrome (pl). */
export const CONF_PL: ConfirmationChrome = {
  title: 'Wypisano — Komunistyczny Prometeusz',
  confirmHeading: 'Potwierdź wypisanie',
  confirmBody:
    'Kliknij poniższy przycisk, aby przestać otrzymywać newsletter pod tym adresem.',
  confirmButton: 'Wypisz się',
  unsubscribedHeading: 'Zostałeś wypisany',
  unsubscribedBody:
    'Nie będziesz już otrzymywać newslettera Komunistycznego Prometeusza pod tym adresem.',
  reSubscribeLabel: 'Zapisz się ponownie przez e-mail',
  expiredHeading: 'Ten link wygasł',
  expiredBody:
    'Link do wypisania się jest już nieważny. Jeśli nadal chcesz się wypisać, skontaktuj się z nami.',
}
