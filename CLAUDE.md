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
- `ops-telegram` solo existe en la Mac del dueño (lee `~/Code/ops/.env`).
- **En la nube** (sesión web, el comando no existe): no buscar el repo `ops` ni pedir el
  token por el chat. Si el entorno trae `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`, mandar
  directo (archivos de hasta 50 MB):

  ```bash
  curl -sS "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" --data-urlencode text="📬 <repo>: texto corto"
  curl -sS "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendDocument" \
    -F chat_id="$TELEGRAM_CHAT_ID" -F document=@pieza.mp4 -F caption="📬 <repo>: qué revisar"
  ```

  En la nube no hay `aprobar` (los botones dependen del gate de la Mac): mandar la pieza y
  pedir la decisión en la conversación. Si faltan las variables, decirlo en una línea y
  dejar la pieza subida en la rama; no insistir.
<!-- telegram-ops:fin -->
