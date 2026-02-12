# Energy System Fix ⚡

## Problem:
Energy was dropping too fast, even at home base. The logic was flawed.

## Root Cause:
The old code **always added +5 energy** after every move, regardless of context:

```javascript
// OLD (BROKEN)
if (userEnergy >= energyCost) {
  userEnergy -= energyCost;  // Deduct energy for enemy capture
  conquered = true;
}
userEnergy = Math.min(userEnergy + 5, 100);  // ❌ Always add +5 back!
```

**Result:** 
- Capture enemy hex with defense 3 = -30 energy
- Then immediately +5 energy back
- Net loss: -25 energy per capture
- At home base: Only +5 energy (not enough restoration)

## Solution:
Implemented **context-aware energy system**:

```javascript
// NEW (FIXED)
if (isNearHome) {
  userEnergy = Math.min(userEnergy + 10, 100);  // ✅ +10 at home base
} else if (existing.length > 0 && existing[0].owner_id === userId) {
  userEnergy = Math.min(userEnergy + 3, 100);   // ✅ +3 on own territory
} else if (!conquered) {
  userEnergy = Math.min(userEnergy + 2, 100);   // ✅ +2 on neutral/failed
}
// ✅ No energy gain when capturing enemy territory (cost already deducted)
```

## Energy Rules:

| Scenario | Energy Change | Logic |
|----------|--------------|-------|
| **Home Base** | +10 | Restore energy faster at home |
| **Own Territory** | +3 | Small boost on friendly hexes |
| **Neutral Hex** | +2 | Minimal gain for exploration |
| **Enemy Capture** | -10 to -50 | Cost based on defense level (no refund) |
| **Failed Capture** | +2 | No energy lost if capture fails |

## Defense Level Costs:

```javascript
const baseCost = defenseLevel * 10;

// Defense 1: -10 energy
// Defense 2: -20 energy
// Defense 3: -30 energy
// Defense 4: -40 energy
// Defense 5: -50 energy
```

**Tank Class Bonus:** 20% energy reduction
```javascript
energyCost = Math.floor(baseCost * 0.8);
```

## Home Base Benefits:

1. **+10 Energy per hex** (vs +3 elsewhere)
2. **+50% XP Bonus** (already implemented)
3. **Free Energy Restoration** (no cost to visit)

**Strategy:** Return home frequently to restore energy before attacking enemy territory.

## Example Scenarios:

### Scenario 1: Attacking Enemy Territory
```
Starting Energy: 100
Capture enemy hex (defense 3): -30 energy
No energy refund
Final Energy: 70
```

### Scenario 2: At Home Base
```
Starting Energy: 70
Visit home hex: +10 energy
Visit home hex again: +10 energy
Final Energy: 90
```

### Scenario 3: Reinforcing Own Territory
```
Starting Energy: 90
Reinforce own hex: +3 energy
Reinforce own hex: +3 energy
Final Energy: 96
```

## Game Balance:

- **Energy Cap:** 100 (prevents hoarding)
- **Home Restoration:** 10 visits to fully restore from 0
- **Attack Cost:** 2-5 enemy captures drains full energy
- **Strategy Required:** Must balance attacking and returning home

## Testing:

1. ✅ Capture enemy hex → Energy decreases properly
2. ✅ Visit home base → Energy restores faster (+10)
3. ✅ Visit own territory → Small energy gain (+3)
4. ✅ Energy never exceeds 100
5. ✅ Tank class gets 20% discount

## Commit:
- **Hash:** `93b8aa5`
- **Message:** "fix: Energy logic - restore more at home base, no gain on enemy captures"
- **Files:** `src/routes.js`

## Result:
✅ Energy system now balanced and strategic
✅ Home base provides meaningful restoration
✅ Enemy captures have proper cost
✅ Encourages tactical gameplay
