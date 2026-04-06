

## Problem

Infinite redirect loop between `/dashboard/seeker` and `/dashboard/listener`:
- `ListenerDashboard`: no listener_profiles row found → redirects to `/dashboard/seeker`
- `SeekerDashboard`: no seeker_profiles row found → redirects to `/dashboard/listener`
- Result: endless bounce

Additionally, there's a stale `Dashboard.tsx` (517 lines) that uses `user_metadata.role` and isn't part of the new architecture.

## Root Cause

The dashboards cross-redirect to each other when a profile isn't found, instead of falling back to login or doing a proper role check in one place.

## Plan

### 1. Create a single auth-aware redirect component

Create `src/components/echo/RoleRedirect.tsx` — used at `/dashboard` route:
- Call `supabase.auth.getUser()`; if no user → `/login`
- Query `listener_profiles` for `user_id`; if found → `/dashboard/listener`
- Query `seeker_profiles` for `user_id`; if found → `/dashboard/seeker`
- If neither found → `/login` (with sign-out to clear stale session)
- Show a loading state while checking

### 2. Fix ListenerDashboard redirect logic

Line 56-58: Change `navigate("/dashboard/seeker")` to `navigate("/login")` — if no listener profile exists, don't assume they're a seeker. Send to login, which will properly route them.

### 3. Fix SeekerDashboard redirect logic

Line 52-55: Change `navigate("/dashboard/listener")` to `navigate("/login")` — same principle.

### 4. Update App.tsx routes

- Replace `<Navigate to="/dashboard/seeker" replace />` at `/dashboard` with the new `RoleRedirect` component
- Remove or keep `Dashboard.tsx` as dead code (it won't be routed to)

### 5. Fix EchoLogo navigation

Instead of using `user_metadata.role` (unreliable), route to `/dashboard` which will use the `RoleRedirect` component to figure out the correct destination.

### 6. Fix Login fallback

Lines 67-73: The fallback `user_metadata.role` logic sends users to a dashboard even when no profile exists. Change fallback to navigate to `/dashboard` (which uses RoleRedirect to do the proper check).

### Files Changed

| File | Change |
|------|--------|
| `src/components/echo/RoleRedirect.tsx` | New — auth check + profile query + redirect |
| `src/pages/ListenerDashboard.tsx` | Line 57: redirect to `/login` not `/dashboard/seeker` |
| `src/pages/SeekerDashboard.tsx` | Line 54: redirect to `/login` not `/dashboard/listener` |
| `src/App.tsx` | `/dashboard` route uses `RoleRedirect` |
| `src/components/echo/EchoLogo.tsx` | Navigate to `/dashboard` instead of role-based path |
| `src/pages/Login.tsx` | Fallback navigates to `/dashboard` |

