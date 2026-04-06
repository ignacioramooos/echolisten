
Diagnóstico

Sí, ya sé cuál es el problema real. No es una sola falla, son tres que se combinan:

1. El registro de Seeker está roto:
   - `src/pages/SeekerSignup.tsx` usa hCaptcha con `size="invisible"`, pero no llama `execute()`.
   - Resultado: nunca se genera `captchaToken`, `canSubmit` queda falso y el botón parece no hacer nada.
   - Por eso no se crean cuentas nuevas y la base queda vacía.

2. La creación de perfiles depende de `/auth/callback`:
   - `src/pages/AuthCallback.tsx` recién inserta en `listener_profiles` o `seeker_profiles` después de confirmar email y completar el callback.
   - Si una cuenta quedó creada en auth pero nunca pasó bien por el callback, el usuario existe pero no tiene fila de perfil.
   - Eso explica cuentas “rotas” y tablas vacías o incompletas.

3. La app todavía mezcla varias fuentes de verdad para el rol:
   - unas pantallas usan tablas de perfil,
   - otras usan `user_metadata.role`,
   - otras hacen redirects parciales.
   - Eso deja cuentas en estado ambiguo y puede disparar redirecciones incorrectas.

Plan de implementación

1. Reparar el signup de Seeker para que vuelva a funcionar
   - Cambiar el captcha de Seeker a widget visible normal.
   - Elegir tema `light`, porque encaja mejor con el look blanco/negro del sitio y es más confiable que el badge flotante/invisible.
   - Mantener el submit bloqueado hasta tener token válido.
   - Verificar el token en backend antes de crear la cuenta, usando el secreto ya configurado.
   - Mostrar error visible si captcha falla o expira.

2. Unificar la resolución de rol en un solo helper
   - Crear una utilidad compartida que consulte:
     - `listener_profiles`
     - `seeker_profiles`
   - Esa utilidad debe devolver solo 4 estados:
     - `listener`
     - `seeker`
     - `none`
     - `both`
   - Desde ese momento, la app dejará de usar `user_metadata.role` para navegación, guards y settings.

3. Hacer que login y callback se “autorreparen”
   - En `AuthCallback.tsx`:
     - si no existe perfil, crear el correcto según el signup original;
     - si es listener, crear también `formation_progress` si falta.
   - En `Login.tsx`:
     - después de autenticar, resolver rol desde tablas;
     - si no hay perfil, intentar reconstruirlo desde metadata/email;
     - si hay ambos perfiles, bloquear acceso y forzar reparación segura;
     - si no hay ninguno y no se puede reconstruir, cerrar sesión y mostrar error claro.

4. Eliminar cualquier redirect cruzado restante
   - Revisar y corregir guards en:
     - `RoleRedirect.tsx`
     - `ListenerDashboard.tsx`
     - `SeekerDashboard.tsx`
     - `ListenQueue.tsx`
     - `Settings.tsx`
     - `ChatRoom.tsx`
     - `Formation.tsx`
   - Ninguna pantalla debe “adivinar” que el usuario es del otro rol.
   - Si el rol no coincide, siempre debe redirigir al resolvedor central o a login, nunca al dashboard opuesto.

5. Enforzar la regla de negocio: exactamente un perfil por usuario
   - Agregar validación en base de datos para impedir que el mismo `user_id` exista en ambas tablas.
   - Corregir defaults inconsistentes, por ejemplo `listener_profiles.role` no debería tener default `seeker`.
   - Mantener la arquitectura separada: listener y seeker son mutuamente excluyentes.

6. Reparar datos existentes
   - Ejecutar una reparación única para cuentas ya creadas:
     - si el usuario tiene auth pero no perfil, crear el perfil correcto;
     - si tiene ambos perfiles, conservar solo uno siguiendo una regla determinística:
       - priorizar el rol explícito del signup;
       - si falta, priorizar listener solo si tiene progreso/formación;
       - si no, dejar seeker.
   - Después de esta reparación, ningún usuario debe quedar en estado `both` o `none`.

7. QA de extremo a extremo
   - Probar estos flujos completos:
     - signup seeker → confirmación → callback → dashboard seeker
     - signup listener → confirmación → callback → dashboard listener
     - login de cuentas viejas sin perfil → autorreparación
     - acceso a `/dashboard` con cada rol
     - acceso indebido a rutas protegidas (`/listen`, `/formation`, `/settings`, `/chat/:id`)
   - Verificar también que las tablas del backend ya no queden vacías tras registros válidos.

Detalles técnicos

Archivos principales a tocar:
- `src/pages/SeekerSignup.tsx`
- `src/pages/Login.tsx`
- `src/pages/AuthCallback.tsx`
- `src/components/echo/RoleRedirect.tsx`
- `src/pages/ListenerDashboard.tsx`
- `src/pages/SeekerDashboard.tsx`
- `src/pages/ListenQueue.tsx`
- `src/pages/Settings.tsx`
- `src/pages/ChatRoom.tsx`
- `src/pages/Formation.tsx`

Cambios de backend:
- migración para reforzar integridad entre `listener_profiles` y `seeker_profiles`
- ajuste de defaults/policies necesarios
- reparación única de datos existentes para cuentas huérfanas o duplicadas

Resultado esperado

Después de esto:
- el botón de crear cuenta vuelve a funcionar,
- las filas de perfil sí se crean,
- cada usuario tendrá exactamente un rol válido,
- desaparecen las redirecciones infinitas entre dashboards.
