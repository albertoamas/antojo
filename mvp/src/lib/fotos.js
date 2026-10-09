import { supabase } from './supabase'

const LADO_MAXIMO = 1200

// RNF-05: reduce la foto a 1200 px y la convierte a WebP antes de subirla
async function comprimir(archivo) {
  const imagen = await createImageBitmap(archivo)
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height))
  const lienzo = document.createElement('canvas')
  lienzo.width = Math.round(imagen.width * escala)
  lienzo.height = Math.round(imagen.height * escala)
  lienzo.getContext('2d').drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
  imagen.close()
  return new Promise((resolve, reject) => {
    lienzo.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la foto.'))), 'image/webp', 0.82)
  })
}

export async function subirFoto(archivo, usuarioId) {
  if (!archivo.type.startsWith('image/')) throw new Error('El archivo debe ser una imagen.')
  const blob = await comprimir(archivo)
  const ruta = `${usuarioId}/${crypto.randomUUID()}.webp`
  const { error } = await supabase.storage.from('fotos').upload(ruta, blob, { contentType: 'image/webp' })
  if (error) throw new Error(`No se pudo subir la foto: ${error.message}`)
  return supabase.storage.from('fotos').getPublicUrl(ruta).data.publicUrl
}
