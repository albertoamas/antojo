import { useRef, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import Logo, { Isotipo } from '../components/Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { supabase } from '../lib/supabase'

const ERRORES = {
  invalid_credentials: 'El correo o la contraseña no son correctos.',
  user_already_exists: 'Ya existe una cuenta con ese correo. Ingresa con tu contraseña.',
  weak_password: 'La contraseña debe tener al menos 6 caracteres.',
  email_not_confirmed: 'Confirma tu correo con el enlace que te enviamos antes de ingresar.',
}

const PERFILES = [
  { id: 'comensal', titulo: 'Quiero buscar platos', texto: 'Encuentra y califica los mejores platos cerca de ti.' },
  { id: 'restaurante', titulo: 'Tengo un restaurante', texto: 'Publica tus platos gratis y mira quién los ve.' },
]

const BENEFICIOS = [
  'Califica los platos que pruebas y ayuda a otros a elegir.',
  'Escanea el QR de la mesa: tu reseña queda verificada.',
  'Si tienes un restaurante, publica tus platos gratis.',
]

// Solo se permite volver a rutas internas de la app
function rutaSegura(ruta) {
  return ruta?.startsWith('/') && !ruta.startsWith('//') ? ruta : '/'
}

export default function Ingresar() {
  const { usuario } = useAuth()
  const mostrarToast = useToast()
  const [params] = useSearchParams()
  const volver = rutaSegura(params.get('volver'))
  const [modo, setModo] = useState(params.get('modo') === 'crear' ? 'crear' : 'ingresar')
  const [perfil, setPerfil] = useState(params.get('perfil') === 'restaurante' ? 'restaurante' : 'comensal')
  const recienCreada = useRef(false)
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  // A dónde ir al entrar: la página pedida o, si no hay, la de su perfil.
  // Un restaurante recién registrado va directo a cargar su local.
  if (usuario) {
    const esRestaurante = usuario.user_metadata?.perfil === 'restaurante'
    const destino = params.get('volver') ? volver : esRestaurante ? (recienCreada.current ? '/panel/nuevo' : '/panel') : '/'
    return <Navigate to={destino} replace />
  }

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    setAviso('')
    recienCreada.current = modo === 'crear'
    const { data, error: err } =
      modo === 'ingresar'
        ? await supabase.auth.signInWithPassword({ email: correo, password: clave })
        : await supabase.auth.signUp({ email: correo, password: clave, options: { data: { nombre: nombre.trim(), perfil } } })
    setEnviando(false)
    if (err) {
      setError(ERRORES[err.code] ?? `No se pudo continuar: ${err.message}`)
      return
    }
    if (modo === 'crear' && !data.session) {
      setAviso('Te enviamos un correo para confirmar tu cuenta. Ábrelo y luego ingresa.')
      setModo('ingresar')
      return
    }
    if (modo === 'crear') {
      mostrarToast(perfil === 'restaurante' ? 'Cuenta creada. Ahora registra tu restaurante.' : 'Cuenta creada. Ya puedes reseñar platos.')
    } else {
      mostrarToast('Ingresaste a Antojo.')
    }
    // La redirección la hace el bloque de arriba en cuanto la sesión queda activa
  }

  const crear = modo === 'crear'

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2 md:py-14">
      <section className="relative hidden overflow-hidden rounded-[2rem] bg-vino p-8 text-white md:flex md:flex-col md:justify-between" aria-hidden="true">
        <div className="fondo-patron absolute inset-0 opacity-15" />
        <Logo variante="negativo" className="relative h-8 self-start" />
        <div className="relative grid place-items-center py-6">
          <div className="animar-flotar">
            <Isotipo className="size-36 drop-shadow-[0_12px_0_rgba(0,0,0,0.2)]" />
          </div>
        </div>
        <ul className="relative flex flex-col gap-3">
          {BENEFICIOS.map((b, i) => (
            <li key={b} className="animar-aparecer flex gap-3 text-vino-suave" style={{ '--retraso': `${200 + i * 90}ms` }}>
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-aji" />
              {b}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-sm md:py-6">
        <h1 className="text-3xl font-extrabold">{crear ? 'Crea tu cuenta' : 'Hola de nuevo'}</h1>
        <p className="mt-2 text-gris">{crear ? 'Toma menos de un minuto.' : 'Ingresa para reseñar platos o administrar tu restaurante.'}</p>

        <div className="relative mt-6 grid grid-cols-2 rounded-xl bg-linea/60 p-1" role="tablist" aria-label="Elige una opción">
          <span
            className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-white shadow-sm transition-transform duration-300 ease-out"
            style={{ transform: crear ? 'translateX(100%)' : 'translateX(0)' }}
            aria-hidden="true"
          />
          {[
            { id: 'ingresar', texto: 'Ingresar' },
            { id: 'crear', texto: 'Crear cuenta' },
          ].map((o) => (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={modo === o.id}
              onClick={() => {
                setModo(o.id)
                setError('')
              }}
              className={`relative rounded-lg py-2 text-sm font-semibold transition-colors ${modo === o.id ? 'text-vino' : 'text-gris hover:text-tinta'}`}
            >
              {o.texto}
            </button>
          ))}
        </div>

        <form onSubmit={enviar} className="mt-6 flex flex-col gap-4">
          {crear ? (
            <fieldset className="animar-aparecer">
              <legend className="etiqueta">¿Para qué usarás Antojo?</legend>
              <div className="grid grid-cols-2 gap-2">
                {PERFILES.map((p) => (
                  <label
                    key={p.id}
                    className={`relative flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-3 transition-[border-color,background-color,transform] duration-200 active:scale-[0.98] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-vino ${
                      perfil === p.id ? 'border-vino bg-vino-suave/60' : 'border-linea bg-white hover:border-vino/40'
                    }`}
                  >
                    <input type="radio" name="perfil" value={p.id} checked={perfil === p.id} onChange={() => setPerfil(p.id)} className="sr-only" />
                    <span className="flex items-center gap-1.5">
                      <span className={`grid size-4 shrink-0 place-items-center rounded-full border-2 ${perfil === p.id ? 'border-vino' : 'border-linea'}`} aria-hidden="true">
                        {perfil === p.id ? <span className="size-2 rounded-full bg-vino" /> : null}
                      </span>
                      <span className="text-sm leading-tight font-bold">{p.titulo}</span>
                    </span>
                    <span className="text-xs leading-snug text-gris">{p.texto}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          {crear ? (
            <div className="animar-aparecer">
              <label htmlFor="nombre" className="etiqueta">
                {perfil === 'restaurante' ? 'Tu nombre (no el del local)' : 'Tu nombre'}
              </label>
              <input id="nombre" required maxLength={60} value={nombre} onChange={(e) => setNombre(e.target.value)} className="campo" autoComplete="name" placeholder="Así aparecerá en tus reseñas" />
            </div>
          ) : null}
          <div>
            <label htmlFor="correo" className="etiqueta">
              Correo
            </label>
            <input id="correo" type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} className="campo" autoComplete="email" placeholder="tu@correo.com" />
          </div>
          <div>
            <label htmlFor="clave" className="etiqueta">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="clave"
                type={verClave ? 'text' : 'password'}
                required
                minLength={6}
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                className="campo pr-20"
                autoComplete={crear ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setVerClave((v) => !v)}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm font-semibold text-vino hover:bg-vino-suave"
                aria-pressed={verClave}
              >
                {verClave ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {crear ? <p className="mt-1 text-sm text-gris">Al menos 6 caracteres.</p> : null}
          </div>
          <Aviso tipo="error">{error}</Aviso>
          <Aviso>{aviso}</Aviso>
          <button type="submit" className="boton py-3" disabled={enviando}>
            {enviando ? <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" /> : null}
            {enviando ? 'Un momento…' : crear ? 'Crear cuenta' : 'Ingresar'}
          </button>
        </form>
      </section>
    </main>
  )
}
