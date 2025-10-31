# MHO Stat Calculator/Planner

Stat calculator and planner for Marvel Heroes Omega.

- Game Version: 1.52.0.1700 (2.16a)
- MHServer Version: v0.8.0

**Note:** The calculator’s results may have slight inaccuracies.

## How to Use

1. **Select Your Hero**
2. **Add Items and Stats** Item stats shown in-game are rounded to one decimal place, so they might not be exact. For better accuracy, calculate the exact stat percentages from the detailed item view (hold Alt), then enter those values into the app.
3. **Allocate Infinity**
4. **Activate Synergies**
5. **Calculate Damage** The Base Damage entered in the damage calculator should be the damage value with talents and without any items, buff, infinity, and synergy.

## Features

### Stat Calculator
- **Item/Buff Management**
- **Infinity System**
- **Hero Synergy**

### Stat Display
- **Customizable Categories**
- **Select Stats to Display/Hide**
- **Expandable Sections**

### Damage Calculator
- **Normal, Crit, Brutal Damage**
- **DMG vs (Condition)**
- **Keyword System**
- **Average Damage**

### Other
- Saves/Load builds in browser
- Export/Import builds as .json file

### Supported Stats

#### Core Stats
- **Health** (Level Scaling)
- **Spirit/Resource and Cost Reduction**
- **Base Stats from Archetype and Traits**
- **Attack Speed**
- **Move Speed**
- **Attributes** (ONLY LVL 60 Base Attributes)

#### Damage Stats
- **Base Damage** (Primary Attributes and Traits if applicable)
- **Damage Types**
- **Critical Hit/Damage**
- **Damage Type Critical Hit**
- **Brutal Strike/Damage**
- **Damage Type Brutal Strike** (WIP)

#### Defense Stats
- **Average Effective Health** (WIP)
- **Damage Reduction**
- **Defense**
- **Deflect**
- **Dodge**
- **Health Regeneration**
- **Health On Hit**
- **Health On Kill**
- **Reduced DMG from Melee, Ranged, Area**

## TODO

- **[Damage Type] Brutal Strike**: Damage type-specific brutal strike
- **Average Effective Health**

## Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
git clone https://github.com/m0rytz/mho-calc.git
cd mho-calc
npm install
npm run dev
```

### Build
```bash
npm run build
```

## Credits

- [Alex Bond's Database Browser](https://github.com/AlexBond2/MHServerEmu)
- [Crypto137's MHDataParser](https://github.com/Crypto137/MHDataParser)
- [Lace / Wilfrid Wong](https://www.youtube.com/@WilfridWong)
- Prinn's Spreadsheet

## Disclaimer

All Marvel-related visuals and characters belong to Marvel Entertainment, LLC and Gazillion. This is a fan-made project and is not affiliated with Marvel or Gazillion.

---

*Built with ❤️ for the MHO community*