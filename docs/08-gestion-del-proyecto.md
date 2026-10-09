# Fase 8. Gestión del proyecto

## 8.1 Hoja de ruta

El proyecto sigue el flujo **propuesta → validación de negocio → ingeniería de requisitos → desarrollo → presentación**.

| Etapa | Fases del documento | Entregables | Estado |
|---|---|---|---|
| 1. Propuesta | [1](01-idea-y-contexto.md), [2](02-mercado-y-clientes.md), [3](03-modelo-de-negocio.md) | Idea, segmentos, competencia, Lean Canvas v1 | ✅ Hecho |
| 2. Validación de negocio | [4](04-validacion-en-tarija.md) | Encuestas a 15 restaurantes y 30 clientes, evaluación de hipótesis, Lean Canvas v2 | ✅ Hecho (H4 pendiente) |
| 3. Ingeniería de requisitos | [5](05-ingenieria-de-requisitos.md) | Requisitos funcionales y no funcionales, reglas de negocio, historias de usuario, modelo de datos | ✅ Hecho |
| 4. Desarrollo | [6](06-desarrollo-mvp.md) | Arquitectura TIC, MVP funcional, pruebas | ⏳ Siguiente |
| 5. Presentación | — | Lean Canvas visual, pitch a un restaurante con demo del MVP | ⏳ Pendiente |

## 8.2 Riesgos y mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Arranque en frío: sin reseñas no hay usuarios, y sin usuarios no hay reseñas | Alto | Una zona y una categoría, carga manual, QR en mesa, embajadores |
| Reseñas falsas pagadas por restaurantes | Alto | Reseña verificada (QR o ticket), reputación del reseñador, detección de patrones |
| Menús y precios desactualizados | Medio | Fecha de actualización visible, recordatorios al restaurante, reportes de usuarios |
| Google Maps agrega reseñas por plato | Medio | Especialización, comunidad local, datos y promociones propios |
| Los restaurantes no quieren pagar | Medio | Mostrar el retorno con datos; probar el pago por clic y la afiliación antes que la suscripción |
| Mercado de Tarija pequeño para sostener el negocio | Alto | Usar Tarija como piloto y expandir pronto con el manual de lanzamiento (la estimación de la [sección 4.6](04-validacion-en-tarija.md#46-conclusiones-y-ajustes-al-modelo) da ≈ Bs 1.200–1.500/mes solo en Tarija) |
| Pocos usuarios escriben reseñas (solo el 20 % sin incentivo) | Alto | Puntos canjeables por descuentos de los restaurantes, QR en mesa, reconocimiento a los mejores reseñadores |
| PedidosYa o Yango agregan calificación por plato | Medio | Incluir a los locales que no están en esas apps, no cobrar comisión y posicionarse como complemento con enlaces "Pedir en…" |

## 8.3 Equipo y responsabilidades

| Integrante | Rol | Responsabilidades |
|---|---|---|
| _[Integrante A]_ | Producto y tecnología | Lean Canvas, maquetas, MVP, arquitectura TIC, métricas |
| _[Integrante B]_ | Mercado y negocio | Segmentos, encuestas, competencia, TAM/SAM/SOM, ventas, finanzas, pitch |

## 8.4 Decisiones pendientes

- [x] **D1. Nombre:** **Antojo** (decidido). No se encontró una app con ese nombre en Bolivia; existe "Antojo Club" en Argentina. Usar @antojo.bo en redes. Falta verificar dominio y registro en SENAPI (clases 9, 35 y 43)
- [ ] **D2. Zona piloto en Tarija:** `[PENDIENTE: definir zona o universidad]`
- [ ] **D3. Categoría inicial:** hamburguesas (alternativas: pollo, pizza, comida típica tarijeña)
- [ ] **D4. Early adopters:** universitarios y foodies + restaurantes independientes
- [ ] **D5. Ingreso principal:** freemium con plan Pro (Bs 69) y Básico+ (Bs 39) + patrocinio marcado
- [x] **D6. Plataforma del MVP:** web con React + Vite + Tailwind + Supabase (decidido)
- [x] **D7. Identidad visual:** dirección "Vino y ají": vino `#7A1F3D`, ají `#F4B43C`, viñedo `#3E6B48`, fondo `#FAFAF7`, texto `#231A20`; tipografías Bricolage Grotesque y Figtree

---

[← Índice](README.md) · [← Fase 7. Escalabilidad](07-escalabilidad.md)
