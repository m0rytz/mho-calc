# MHO Stat Calculator/Planner

Stat calculator and planner for in Marvel Heroes Omega. Build with detailed stat calculations, damage analysis, and customizable displays.

- Game Version: 1.52.0.1700 (2.16a)
- MHServer Version: v0.8.0

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
- **DPS Analysis**

### Supported Stats

#### Core Stats
- **Health** (Level Scaling)
- **Spirit/Resource and Cost Reduction** (Level Scaling if applicable)
- **Base Stats from Archetype and Traits** (Except hero-sepcific keyword Base DMG)
- **Only Level 60 Attributes** (Can be adjusted in the Item Section)

#### Damage Stats
- **Base Damage** (Primary Attributes and Applicable Traits)
- **Damage Types**
- **Critical Hit/Damage**
- **Damage Type Critical Hit**
- **Brutal Strike/Damage**
- **Damage Type Brutal Strike** (WIP)

#### Defense Stats
- **Damage Reduction**
- **Defense**
- **Deflect**
- **Dodge**
- **Health Regeneration**
- **Health On Hit**
- **Health On Kill**
- **Reduced DMG from (Type)**

## How to Use

1. **Select Your Hero**
2. **Add Items and Stats**
3. **Allocate Infinity**
4. **Activate Synergies**
5. **Calculate Damage**
- Note: The "Base Damage" you enter in the damage calculator should be the damage value before any items, buff, infinity, and synergy.

## Technical Features

- **State Persistence**: Saves your builds locally
- **Real-time Updates**: Instant calculations as you modify stats

## TODO

- **[Damage Type] Brutal Strike**: Damage type-specific brutal strike
- **Average Effective Health**
- **DPS**: To include skill duration and cooldown
- **Build Sharing**: Export/import build configurations

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