# Pegasus — Uptime Monitor

Frontend de [Pegasus](https://app.rito.best), un sistema de monitoreo de uptime. Muestra el estado de tus servicios en tiempo real, historial de incidentes, analytics y una página de estado pública.

**Demo en vivo:** [app.rito.best](https://app.rito.best)

---

## Stack

- **React 19** + **Vite 8**
- **React Router 7** — navegación con Outlet pattern
- **Axios** — cliente HTTP con interceptores de auth
- **Recharts** — gráficos en la página de Analytics
- **Inline styles** — sin Tailwind, valores de diseño exactos y consistentes

## Páginas

| Ruta | Descripción |
|---|---|
| `/` | Dashboard — estado general, sparklines, auto-refresh 30s |
| `/monitors` | CRUD completo de monitores |
| `/incidents` | Historial de incidentes con duración |
| `/analytics` | Gráfico de uptime % por monitor (Recharts) |
| `/notifications` | Configuración de alertas por email |
| `/settings` | Configuración de cuenta |
| `/status/:username` | Página pública de estado — sin login |

## Características

- Autenticación completa con tokens Sanctum (registro, login, logout)
- Auto-refresh cada 30 segundos en Dashboard, Monitors e Incidents
- Modales con animaciones CSS (`cubic-bezier` spring)
- Status page pública que no expone las URLs monitoreadas
- Diseño dark mode con sistema de colores consistente

## Correr localmente

```bash
git clone https://github.com/SeiyaRito/uptime-monitor-web.git
cd uptime-monitor-web
npm install
cp .env.example .env
npm run dev
```

Requiere el backend corriendo en `http://localhost:8000`. Ver [uptime-monitor-api](https://github.com/SeiyaRito/uptime-monitor-api).

## Variables de entorno

```env
VITE_API_URL=https://uptime-monitor-api-production.up.railway.app
```

---

**Backend:** [github.com/SeiyaRito/uptime-monitor-api](https://github.com/SeiyaRito/uptime-monitor-api)
