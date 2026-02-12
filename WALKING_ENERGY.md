# Walking Energy Regeneration Feature 🚶⚡

## New Feature:
Energy now restores passively while walking! Every hex you visit gives +1 energy bonus.

## Updated Energy System:

| Scenario | Energy Change | Breakdown |
|----------|--------------|-----------|
| 🏠 **Home Base** | **+10** | Home restoration |
| ✅ **Own Territory** | **+4** | Territory bonus (+3) + Walking (+1) |
| 🆕 **Neutral Hex** | **+3** | Exploration (+2) + Walking (+1) |
| ⚔️ **Enemy Capture (Def 3)** | **-29** | Cost (-30) + Walking (+1) |
| ❌ **Failed Capture** | **+3** | No cost + Exploration (+2) + Walking (+1) |

## Key Benefits:

1. **Passive Regeneration:** Energy restores naturally while exploring
2. **Encourages Movement:** Walking is rewarded with energy
3. **Balanced Combat:** Enemy captures still cost energy, but walking helps offset
4. **Exploration Bonus:** Discovering new areas restores energy

## Example Gameplay:

### Long Walk Home After Battle:
```
After battle: 30 energy remaining
Walk through 10 neutral hexes: +30 energy (3 per hex)
Arrive home: 60 energy
Rest at home 4 times: +40 energy
Full energy: 100
```

### Efficient Territory Expansion:
```
Start: 100 energy
Capture enemy hex (def 2): -19 energy (81 remaining)
Walk through 5 neutral hexes: +15 energy (96 remaining)
Capture another enemy hex (def 1): -9 energy (87 remaining)
Walk home through 3 hexes: +9 energy (96 remaining)
```

## Game Balance:

- **Walking Bonus:** +1 energy per hex (stacks with other bonuses)
- **Max Energy:** 100 (prevents infinite stacking)
- **Encourages Exploration:** Rewards players for covering distance
- **Strategic Depth:** Plan routes to maximize energy restoration

## Code Implementation:

```javascript
const baseEnergyGain = 1; // +1 energy per hex visited

if (isNearHome) {
  userEnergy = Math.min(userEnergy + 10, 100);
} else if (existing.length > 0 && existing[0].owner_id === userId) {
  userEnergy = Math.min(userEnergy + 3 + baseEnergyGain, 100); // +4 total
} else if (conquered && existing.length > 0) {
  userEnergy = Math.min(userEnergy + baseEnergyGain, 100); // +1 walking
} else {
  userEnergy = Math.min(userEnergy + 2 + baseEnergyGain, 100); // +3 total
}
```

## Player Strategy:

1. **Aggressive Players:** Attack enemies, walk through neutral territory to restore
2. **Explorers:** Walk through new areas for steady energy gain
3. **Defenders:** Patrol own territory for +4 energy per hex
4. **Balanced:** Mix combat with exploration for optimal energy management

## Commit:
- **Hash:** `4f884ee`
- **Message:** "feat: Add passive energy regeneration while walking (+1 per hex)"
- **Files:** `src/routes.js`, `ENERGY_FIX.md`

## Result:
✅ Energy restores while walking
✅ Encourages active gameplay
✅ Balanced with combat costs
✅ Rewards exploration and movement
