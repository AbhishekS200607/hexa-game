# MVP Launch Checklist

## 🔴 CRITICAL (Must Fix Before Testing)

- [x] ~~Get Mapbox Token~~ - Using OpenStreetMap (no token needed)
- [x] ~~Complete map-new.html~~ - File is complete (513 lines)
- [ ] **Deploy with HTTPS** - Use ngrok/Railway/Vercel for SSL (GPS requires HTTPS)
- [ ] **Test GPS on Real Device** - Verify location tracking works on mobile
- [x] ~~Add Password Hashing~~ - SHA-256 implemented in auth-routes.js
- [ ] **Session Management** - Currently using localStorage (consider JWT for production)

## 🟡 HIGH PRIORITY (Fix Within Week 1)

- [x] ~~Error Messages~~ - Toast notifications implemented
- [x] ~~Input Validation~~ - Coordinate bounds validation added
- [x] ~~Offline Mode~~ - Queue failed captures for retry
- [x] ~~Battery Warning~~ - Shows on first GPS use
- [ ] **GPS Timeout Handling** - Increase to 30s, show retry button
- [ ] **Rate Limit Adjustment** - Change to 5-7 seconds

## 🟢 MEDIUM PRIORITY (Week 2-3)

- [ ] **WebSocket Reconnection** - Add exponential backoff
- [ ] **Loading States** - Add spinners for all API calls
- [ ] **Tutorial/Onboarding** - First-time user guide
- [ ] **Privacy Policy** - Required for GPS tracking
- [ ] **Terms of Service** - Legal protection
- [ ] **Analytics** - Track user engagement
- [ ] **Error Logging** - Sentry or similar

## 🔵 NICE TO HAVE (Post-MVP)

- [ ] **Push Notifications** - Territory alerts
- [ ] **Social Sharing** - Share achievements
- [ ] **Leaderboard Filters** - By region/faction
- [ ] **Achievement System** - Badges/rewards
- [ ] **Squad Chat** - Team communication

## Testing Protocol

### Local Testing
```bash
# 1. Start server
npm start

# 2. Use ngrok for HTTPS
ngrok http 3000

# 3. Test on mobile browser
# Open ngrok URL on phone
```

### Pre-Launch Tests
- [ ] GPS accuracy test (walk 100m, verify distance)
- [ ] Hex capture test (capture 10 hexes)
- [ ] Speed limit test (drive >30km/h, verify passive mode)
- [ ] Battery drain test (1 hour continuous tracking)
- [ ] Multi-user test (2+ users capturing same hex)
- [ ] WebSocket test (disconnect/reconnect)
- [ ] Rate limit test (spam capture button)

### Launch Criteria
- ✅ All CRITICAL items fixed
- ✅ 80% of HIGH PRIORITY items fixed
- ✅ All pre-launch tests passing
- ✅ 3+ beta testers completed 30min session
- ✅ No critical bugs in last 48 hours

## Current Status: ⚠️ ALMOST READY

**Remaining Critical Items: 2**
1. Deploy with HTTPS (30 mins with ngrok/Railway)
2. Test on real mobile device (1 hour)

**Estimated Time to MVP: 2-3 hours**

## Quick Start for Testing

```bash
# Terminal 1: Start server
npm start

# Terminal 2: Create HTTPS tunnel
ngrok http 3000

# Open ngrok URL on your phone
# Sign up → Go to map → Allow GPS → Start walking
```
