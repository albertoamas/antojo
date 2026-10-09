const ESTRELLAS = [1, 2, 3, 4, 5]

function Estrella({ llena, className = 'size-4' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z"
        fill={llena ? '#F4B43C' : 'transparent'}
        style={{ transition: 'fill 0.2s, stroke 0.2s' }}
        stroke={llena ? '#c98d1d' : '#c9c0c4'}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Estrellas({ valor }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${valor} de 5 estrellas`}>
      {ESTRELLAS.map((n) => (
        <Estrella key={n} llena={n <= valor} />
      ))}
    </span>
  )
}

const textos = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente']

export function SelectorEstrellas({ valor, onChange }) {
  return (
    <fieldset>
      <legend className="etiqueta">¿Qué tal estuvo?</legend>
      <div className="flex items-center gap-1">
        {ESTRELLAS.map((n) => (
          <label key={n} className="cursor-pointer rounded-md p-0.5 transition-transform duration-150 hover:scale-[1.15] active:scale-95 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-vino">
            <input type="radio" name="estrellas" value={n} checked={valor === n} onChange={() => onChange(n)} className="sr-only" />
            <span className="sr-only">{`${n} estrellas, ${textos[n]}`}</span>
            <Estrella llena={n <= valor} className={`size-9 transition-transform duration-200 ${n <= valor ? 'scale-105' : ''}`} />
          </label>
        ))}
        <span className="ml-2 text-sm font-semibold text-gris">{textos[valor]}</span>
      </div>
    </fieldset>
  )
}
