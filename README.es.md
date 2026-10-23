<p align="center">
  <img src="icon.png" alt="Outbreak Web" width="120" height="120">
</p>

<h1 align="center">RE Outbreak Desktop</h1>

<p align="center">
  Cliente de escritorio para <a href="https://outbreakweb.com/">Outbreak·Web</a> (Resident Evil Outbreak File #1 y File #2).<br>
  <a href="README.md">English</a> · <b>Español</b>
</p>

<p align="center">
  <a href="https://github.com/DJTOMATO/reoutbreakdesktop/releases"><b>Descargar Instalador (Releases)</b></a> ·
  <a href="https://outbreakweb.com/">Sitio Web</a> ·
  <a href="https://github.com/DJTOMATO/reoutbreakdesktop/issues">Reportar un Problema</a>
</p>

---

## ¿Por qué usar un cliente de escritorio?

[Outbreak·Web](https://outbreakweb.com/) corre Resident Evil Outbreak (File #1 y File #2) directamente en el navegador usando un recompilador estático de PS2 a WebAssembly (`ps2-web-recomp`) y WebGPU. Aunque funciona bien en navegadores normales, jugar desde una pestaña común tiene un par de problemas molestos cuando estás en una partida online:

- **El navegador frena el juego al hacer Alt+Tab:** Los navegadores limitan el uso de CPU/timers de las pestañas en segundo plano. Si salís un segundo a mirar Discord o una guía, el emulador se frena y podés perder la sincronización o caerte de la sala en `NETWORK PLAY`.
- **Placa integrada en vez de dedicada:** En muchas notebooks el navegador arranca usando los gráficos integrados en lugar de la placa dedicada NVIDIA o AMD.
- **Suspensión de pantalla jugando con mando:** Al jugar con joystick sin tocar el teclado ni el mouse, Windows puede apagar la pantalla en medio de una partida.
- **Atajos del navegador:** Algunas combinaciones de teclas del navegador interfieren con los controles del juego.

Este cliente empaqueta `outbreakweb.com` sobre una base limpia de Electron 45 con todos los flags de Chromium/V8 ya ajustados para exprimir la placa de video y mantener estable el modo online.

## Descarga e instalación

Podés bajar el último instalador `Outbreak Web Setup.exe` directamente desde la [**página de Releases**](https://github.com/DJTOMATO/reoutbreakdesktop/releases).

## Qué trae configurado por dentro

- **Uso forzado de GPU dedicada:** Activa `force_high_performance_gpu`, `ignore-gpu-blocklist`, `enable-unsafe-webgpu`, `enable-gpu-rasterization`, `enable-zero-copy` y `enable-oop-rasterization` para que Dawn/WebGPU use tu placa de video principal con presentación zero-copy.
- **Sin límite en segundo plano:** Desactiva el throttling en segundo plano (`disable-renderer-backgrounding`, `disable-background-timer-throttling`, `disable-backgrounding-occluded-windows`, `backgroundThrottling: false`). Podés hacer Alt+Tab tranquilo sin que se corte la partida online.
- **Soporte completo de WebAssembly:** Incluye Chromium 146 / V8 con soporte nativo para WebAssembly JSPI (`WebAssembly.Suspending`), manejo de excepciones (`try_table`), tail calls, SIMD y aislamiento COOP/COEP.
- **Caché local de 1 GB en disco:** Guarda en disco el motor (~28 MB) y los bloques de 64 MB del disco que se van descargando para no tener que bajarlos de nuevo cada vez que abrís el cliente.
- **Memory Cards persistentes:** Tus memory cards virtuales de 8 MB (IndexedDB), tu nombre de jugador, credencial online y configuración de controles quedan guardados en tu perfil local. Igual podés exportar e importar archivos `.ps2` desde el panel lateral cuando quieras.
- **Soporte de mando y vibración:** Funciona directo con mandos XInput y DualShock/DualSense, incluyendo vibración de doble motor (dual-rumble) y bloqueo de suspensión de pantalla mientras el juego está abierto.

## Requisitos del sistema / Especificaciones

| Componente | Mínimo | Recomendado (Escala interna 2x / 3x) |
| :--- | :--- | :--- |
| **Sistema Operativo** | Windows 10 (64 bits, 1909+) | Windows 10 / 11 (64 bits) |
| **Procesador (CPU)** | 4 núcleos x86_64 | 6+ núcleos modernos (Ryzen 5 / Core i5 o superior) |
| **Placa de video (GPU)** | Compatible con DirectX 12 / Vulkan y WebGPU | Placa dedicada NVIDIA (GTX 1060 / serie RTX) o AMD (RX 580 / RX 6000+) |
| **Memoria RAM** | 4 GB | 8 GB o más |
| **Almacenamiento** | ~300 MB para el cliente + hasta 1 GB de caché | SSD con 1.5 GB libres |
| **Conexión** | Banda ancha (descarga partes del disco bajo demanda) | Conexión estable para salas online en `NETWORK PLAY` |

## Atajos de teclado

| Tecla | Acción |
| :--- | :--- |
| `F` | Pantalla completa dentro del juego |
| `F11` / `Alt + Enter` | Pantalla completa nativa de la ventana |
| `F1` | Ver ayuda de controles |
| `F5` / `Ctrl + R` | Recargar página |
| `F12` / `Ctrl + Shift + I` | Abrir/cerrar herramientas de desarrollo (DevTools) |
| `Esc` | Salir de pantalla completa / cerrar ventanas |

## Compilar desde el código fuente

Necesitás tener instalado [Node.js](https://nodejs.org/) (recomendado v20 o superior) y npm.

```bash
git clone https://github.com/DJTOMATO/reoutbreakdesktop.git
cd reoutbreakdesktop
npm install
```

Para abrir el cliente en modo desarrollo:

```bash
npm start
```

Para generar el instalador NSIS de Windows (se guarda en `dist/`):

```bash
npm run build
```

## Aviso legal

Este proyecto es un cliente de escritorio no oficial hecho por la comunidad para [outbreakweb.com](https://outbreakweb.com/). No tiene ninguna relación con Capcom ni cuenta con su respaldo. *Resident Evil* y *Resident Evil Outbreak* son marcas registradas de Capcom Co., Ltd. Este repositorio no incluye ROMs, archivos BIOS ni material con derechos de autor.
