import type { GameInfo } from '../types/game';
import loadedGamesData from './loadedGames.json';

const FEATURED_GAMES: GameInfo[] = [
  {
    id: 'cs-1',
    title: 'CS 1 Tactical Arena',
    category: 'Shooter',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 4890,
    rating: 4.9,
    description: 'Classic Counter-Strike style 5v5 tactical shooter. Plant or defuse the bomb, buy weapons, and out-aim enemy forces.',
    tags: ['FPS', 'Tactical', 'Multiplayer', 'Shooter', 'CS Style'],
    controls: [
      { key: 'WASD', action: 'Move soldier' },
      { key: 'Mouse', action: 'Aim crosshair' },
      { key: 'Left Click', action: 'Fire primary weapon' },
      { key: 'R', action: 'Reload magazine' }
    ],
    isFeatured: true
  },
  {
    id: 'car-destruction-3d',
    title: 'Car Destruction Simulator 3D',
    category: 'Driving',
    thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 3720,
    rating: 4.8,
    description: 'High-speed demolition derby and soft-body vehicle crash sandbox. Drive off giant ramps and smash cars in 3D arena.',
    tags: ['Driving', 'Crash', 'Demolition', 'Physics', '3D'],
    controls: [
      { key: 'WASD / Arrows', action: 'Accelerate & Steer' },
      { key: 'Space', action: 'Handbrake / Drift' },
      { key: 'Shift', action: 'Nitro Boost' },
      { key: 'R', action: 'Reset Vehicle' }
    ],
    isFeatured: true
  },
  {
    id: 'red-blue-leader-2',
    title: 'Red and Blue Leader 2',
    category: 'Action',
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 3120,
    rating: 4.9,
    description: 'Tactical army battle simulator! Spawn red vs blue ragdoll warriors, archers, mechas, and command your squad to total victory.',
    tags: ['Tactical', 'Simulation', 'Battle Simulator', 'Strategy'],
    controls: [
      { key: 'Mouse Click', action: 'Deploy Units' },
      { key: 'WASD', action: 'Camera Orbit' },
      { key: 'Space', action: 'Start Battle' }
    ],
    isFeatured: true
  },
  {
    id: 'fortzone-battle-royale',
    title: 'Fortzone Battle Royale',
    category: 'Shooter',
    thumbnail: '/fortzone.jpg',
    coverImage: '/fortzone.jpg',
    screenshots: [
      '/fortzone.jpg',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 5120,
    rating: 4.9,
    description: 'Drop into a shrinking storm island with 100 players. Build cover ramps, scavenge legendary shotguns, and be the last squad standing.',
    tags: ['Battle Royale', 'Shooter', 'Multiplayer', 'Survival'],
    controls: [
      { key: 'WASD', action: 'Move Player' },
      { key: 'Mouse', action: 'Aim & Shoot' },
      { key: 'Q / E', action: 'Build Ramp / Wall' }
    ]
  },
  {
    id: 'police-chase-cops',
    title: 'Police Chase: Cops vs Criminals',
    category: 'Driving',
    thumbnail: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 2450,
    rating: 4.7,
    description: 'High-speed siren pursuits! Play as police cruisers intercepting getaway sports cars or outrun police pursuit spikes across town.',
    tags: ['Driving', 'Police', 'Action', 'Chase', 'City'],
    controls: [
      { key: 'WASD / Arrows', action: 'Drive Cruiser' },
      { key: 'Shift', action: 'Siren Nitro Boost' },
      { key: 'Space', action: 'Pit Maneuver' }
    ]
  },
  {
    id: 'sandbox-universe',
    title: 'Sandbox Universe',
    category: 'Simulation',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 1890,
    rating: 4.8,
    description: 'Cosmic space physics sandbox! Spawn stars, black holes, moons, and simulate planetary gravity orbits and supernovae explosions.',
    tags: ['Sandbox', 'Space', 'Physics', 'Simulation'],
    controls: [
      { key: 'Mouse Click', action: 'Spawn Planet / Star' },
      { key: 'Drag', action: 'Set Orbital Velocity Vector' },
      { key: 'Scroll', action: 'Zoom Solar System' }
    ]
  },
  {
    id: 'business-jet-sim',
    title: 'Business Jet Flight Simulator',
    category: 'Simulation',
    thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 1650,
    rating: 4.8,
    description: 'Fly luxury executive business jets across realistic international airports. Control throttle, flaps, landing gear, and autopilot.',
    tags: ['Flight', 'Simulator', 'Aviation', '3D Jet'],
    controls: [
      { key: 'W / S', action: 'Pitch Nose Up/Down' },
      { key: 'A / D', action: 'Roll Wings Left/Right' },
      { key: 'Shift / Ctrl', action: 'Throttle Power +/-' },
      { key: 'G', action: 'Landing Gear Toggle' }
    ]
  },
  {
    id: 'planet-destroyer',
    title: 'Planet Destroyer: Space Stories',
    category: 'Simulation',
    thumbnail: '/planet_destroyer.jpg',
    coverImage: '/planet_destroyer.jpg',
    screenshots: [
      '/planet_destroyer.jpg',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 2980,
    rating: 4.9,
    description: 'Unleash orbital death rays, asteroid rains, and antimatter missiles on alien worlds. Watch planetary crusts break apart in real-time.',
    tags: ['Destruction', 'Space', 'Sci-Fi', 'Sandbox'],
    controls: [
      { key: 'Mouse Click', action: 'Fire Weapon Laser' },
      { key: '1 - 5', action: 'Select Weapon Type' }
    ]
  },
  {
    id: 'city-rush-driving',
    title: 'Driving Simulator in City Rush',
    category: 'Driving',
    thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 2190,
    rating: 4.7,
    description: 'Rush through highway traffic at 200 MPH! Dodge oncoming trucks, weave near misses for multiplier points, and customize supercar neon kits.',
    tags: ['Driving', 'Traffic', 'Speed', 'Racing'],
    controls: [
      { key: 'WASD / Arrows', action: 'Drive & Steer' },
      { key: 'Shift', action: 'NOS Boost' },
      { key: 'C', action: 'Camera View' }
    ]
  },
  {
    id: 'call-of-battle',
    title: 'Call of Battle: Modern Ops',
    category: 'Shooter',
    thumbnail: '/call_of_battle.jpg',
    coverImage: '/call_of_battle.jpg',
    screenshots: [
      '/call_of_battle.jpg',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 4180,
    rating: 4.9,
    description: 'Fast-paced military squad combat with assault rifles, sniper rifles, and air support strike killstreaks.',
    tags: ['Shooter', 'FPS', 'Military', 'Warfare'],
    controls: [
      { key: 'WASD', action: 'Move' },
      { key: 'Mouse Click', action: 'Fire weapon' },
      { key: 'Right Click', action: 'Scope Aim' }
    ]
  },
  {
    id: 'car-crash-sandbox',
    title: 'Car Crash Sandbox 3D',
    category: 'Driving',
    thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 3410,
    rating: 4.8,
    description: 'Extreme vehicle deformation test track with crushers, loops, spike traps, and high-altitude sky jumps.',
    tags: ['Crash', 'Physics', 'Sandbox', 'Driving'],
    controls: [
      { key: 'WASD', action: 'Drive Car' },
      { key: 'R', action: 'Instant Repair' },
      { key: 'Space', action: 'Handbrake' }
    ]
  },
  {
    id: 'bus-simulator-evo',
    title: 'Bus Simulator EVO',
    category: 'Simulation',
    thumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 1720,
    rating: 4.7,
    description: 'Drive city passenger buses on real schedules. Open doors, pickup commuters, follow traffic signals, and expand your bus empire.',
    tags: ['Bus', 'Simulator', 'Driving', 'City'],
    controls: [
      { key: 'WASD', action: 'Steer Bus' },
      { key: 'Space', action: 'Brake' },
      { key: 'Door Button / E', action: 'Open Passenger Doors' }
    ]
  },
  {
    id: 'truck-simulator-euro',
    title: 'Truck Simulator: European Roads',
    category: 'Simulation',
    thumbnail: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 2150,
    rating: 4.8,
    description: 'Haul heavy cargo trailers across European motorways. Manage fuel, rest stops, weather conditions, and custom semi-truck paint jobs.',
    tags: ['Truck', 'Cargo', 'Highway', 'Simulator'],
    controls: [
      { key: 'WASD', action: 'Drive Semi-Truck' },
      { key: 'L', action: 'Headlights' },
      { key: 'Space', action: 'Air Brakes' }
    ]
  },
  {
    id: 'driving-school-sim',
    title: 'Driving School Simulator',
    category: 'Driving',
    thumbnail: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 1430,
    rating: 4.6,
    description: 'Master parallel parking, turn signals, roundabouts, and pass official driving license tests across urban courses.',
    tags: ['Driving', 'School', 'Parking', 'Simulation'],
    controls: [
      { key: 'WASD', action: 'Steer Car' },
      { key: 'Q / E', action: 'Turn Signals' }
    ]
  },
  {
    id: 'gamers-mod',
    title: 'Gamers Mod Sandbox',
    category: 'Action',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 2890,
    rating: 4.8,
    description: 'GMod style physics sandbox toolgun game. Spawn props, explosive barrels, ragdoll monsters, and create custom mini-game contraptions.',
    tags: ['GMod', 'Sandbox', 'Physics', 'Action'],
    controls: [
      { key: 'WASD', action: 'Move' },
      { key: 'Q', action: 'Spawn Menu' },
      { key: 'Mouse Click', action: 'Fire Toolgun Physics Beam' }
    ]
  },
  {
    id: 'prison-pump',
    title: 'Prison Pump Fitness Escape',
    category: 'Arcade',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 1940,
    rating: 4.7,
    description: 'Work out in the yard, pump iron to build muscle mass, challenge guard boss battles, and break through prison concrete walls!',
    tags: ['Fitness', 'Arcade', 'Action', 'Clicker'],
    controls: [
      { key: 'Space / Click', action: 'Pump Reps' },
      { key: 'WASD', action: 'Dodge Guard Patrols' }
    ]
  },
  {
    id: 'neon-strike',
    title: 'Neon Strike 2099',
    category: 'Action',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 1420,
    rating: 4.9,
    description: 'High-speed top-down sci-fi multiplayer shooter. Collect energy power-ups, blast opponents, and dominate the cyber arena.',
    tags: ['Multiplayer', 'Shooter', 'Action', 'Fast-Paced'],
    controls: [
      { key: 'WASD / Arrows', action: 'Move cyber ship' },
      { key: 'Mouse Cursor', action: 'Aim weapon' },
      { key: 'Left Click / Space', action: 'Fire laser cannon' },
      { key: 'Shift', action: 'Dash boost' }
    ]
  },
  {
    id: 'slither-arena',
    title: 'Slither Cyber Arena',
    category: 'Multiplayer',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 2890,
    rating: 4.8,
    description: 'Grow your neon serpent by devouring glowing plasma orbs! Encircle opponents and sprint to top the leaderboard in real-time battle royale.',
    tags: ['Multiplayer', 'Arcade', 'IO', 'Battle Royale'],
    controls: [
      { key: 'Mouse Direction', action: 'Steer snake head' },
      { key: 'Left Click / Space', action: 'Turbo Boost' }
    ]
  },
  {
    id: 'pixel-dash',
    title: 'Pixel Cyber Dash',
    category: 'Arcade',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 940,
    rating: 4.7,
    description: 'Race against live players across neon synthwave rooftops. Leap over cyber barriers, pick up double jumps, and reach the finish line first!',
    tags: ['Runner', 'Arcade', 'Speed', 'Multiplayer'],
    controls: [
      { key: 'Space / Up Arrow', action: 'Jump (Double Jump supported)' },
      { key: 'Down Arrow / S', action: 'Slide / Fast Fall' }
    ]
  },
  {
    id: 'cyber-hockey',
    title: 'Cyber Hockey 3D',
    category: 'Sports',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 630,
    rating: 4.9,
    description: 'Head-to-head 1v1 Air Hockey in a glowing holographic stadium. Master curve shots, bounce angles, and special pulse strikes.',
    tags: ['Sports', '1v1', 'Multiplayer', 'Physics'],
    controls: [
      { key: 'Mouse / Drag / WASD', action: 'Control Paddle' },
      { key: 'Space', action: 'Trigger Pulse Wave' }
    ]
  },
  {
    id: 'block-rush',
    title: 'Block Rush Battle Royale',
    category: 'Puzzle',
    thumbnail: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop'
    ],
    playersOnline: 1150,
    rating: 4.8,
    description: 'Competitive multiplayer block puzzle! Clear double and quadruple lines to send garbage walls to your opponents. Last player standing wins!',
    tags: ['Puzzle', 'Strategy', 'Multiplayer', 'Tetris Style'],
    controls: [
      { key: 'Left / Right Arrow', action: 'Move block horizontal' },
      { key: 'Up Arrow / Z / X', action: 'Rotate block' },
      { key: 'Down Arrow', action: 'Soft drop' },
      { key: 'Space', action: 'Hard drop' }
    ]
  }
];

export const GAMES_LIST: GameInfo[] = [
  ...FEATURED_GAMES,
  ...(loadedGamesData as GameInfo[])
];
