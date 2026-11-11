@AGENTS.md

<!-- telegram-ops:inicio -->
## Telegram OPS (solo si el dueño lo pide)

Este repo puede mandar cosas al Telegram del dueño y pedirle aprobación con botones ✅/❌,
usando el sistema de `~/Code/ops`. **Regla dura: SOLO cuando el dueño lo pida en la
conversación** ("mándamelo por Telegram", "pídeme aprobación por Telegram", "avísame por
Telegram cuando termines"). Si no lo pidió, no se manda nada, ni avisos ni pruebas.

```bash
ops-telegram mensaje "texto corto"                                   # aviso
ops-telegram enviar pieza.pdf captura.png --nota "qué revisar"       # archivos para revisar
ops-telegram aprobar --tema "la decisión en una línea" \
  --detalle "qué pasa si aprueba y qué si rechaza" [--resultado pieza.png] [--esperar]
ops-telegram estado <task_id> [--esperar]                            # releer la respuesta
```

- La marca sale del nombre del repo; se fuerza con `--marca`.
- `aprobar` llega en la siguiente vuelta del gate (~2-3 min). Con `--esperar` el comando
  se queda esperando: sale 0 aprobada, 2 rechazada (el motivo queda como feedback), 3 vencida.
  Rechazado = no se hace; aprobado = sí se hace el trabajo y se actualiza el repo.
- No poner "prueba" ni "test" en el tema: el gate descarta esas tarjetas.
- Solo funciona en esta Mac (lee `~/Code/ops/.env`); en la nube no hay Telegram.
<!-- telegram-ops:fin -->
