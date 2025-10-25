

export type Player = {
  id: number;
  name: string;
  age: number;
  position: string;
  avatarUrl: string;
  team: string;
  attendance: number;
  disciplineScore: number;
  rank: number;
  points: number;
  stats: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
  };
  highlights: string[];
  gpsData: {
    maxSpeed: number; // km/h
    distanceCovered: number; // km
    playerLoad: number;
  };
  performanceMetrics: {
    physical: {
      speed: number;
      stamina: number;
      strength: number;
    };
    technical: {
      dribbling: number;
      shooting: number;
      passing: number;
    };
    tactical: {
      positioning: number;
      'game reading': number;
    };
    psychoSocial: {
      leadership: number;
      teamwork: number;
    };
  };
  disciplinaryLog: DisciplinaryInfraction[];
  injuryLog: Injury[];
  certificates: Certificate[];
};

export type Certificate = {
  id: string;
  moduleName: string;
  date: string;
};

export type DisciplinaryInfraction = {
  id: number;
  date: string;
  infraction: string;
  severity: 'Low' | 'Medium' | 'High';
  sanction: string;
};

export type Injury = {
  id: number;
  date: string;
  injury: string;
  severity: 'Low' | 'Medium' | 'High';
  rtpStatus: 'In Treatment' | 'Cleared for Light Training' | 'Cleared to Play';
};

export type Transaction = {
  id: string;
  playerName: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  type: 'Fee Payment' | 'Stipend' | 'Expense' | 'Refund';
  description?: string;
};

export type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Coach' | 'Finance' | 'Scout';
  avatarUrl: string;
  hourlyRate: number;
  hoursWorked: number;
};

export type Equipment = {
  id: string;
  name: string;
  category: string;
  assignedTo?: string; // Player or staff name
  location: string;
  status: 'In Use' | 'In Storage' | 'Maintenance';
  maintenanceDue?: string;
};

export type Consumable = {
  id: string;
  name: string;
  category: 'Drinks' | 'Medical' | 'Snacks';
  currentStock: number;
  unit: string;
  lowStockThreshold: number;
};

export type Message = {
    id: number;
    content: string;
    channel: 'In-App' | 'SMS' | 'WhatsApp';
    recipientGroup: string;
    status: 'Sent' | 'Scheduled' | 'Failed';
    timestamp: string;
};

export type AcademyEvent = {
  id: string;
  title: string;
  date: Date;
  category: 'Training' | 'Match' | 'Trial' | 'Social';
};

export const events: AcademyEvent[] = [
    { id: 'evt-001', title: 'U-17 Training', date: new Date(new Date().getFullYear(), 7, 5, 10, 0, 0), category: 'Training' },
    { id: 'evt-002', title: 'U-19 Friendly Match vs. Gor Mahia Youth', date: new Date(new Date().getFullYear(), 7, 7, 14, 0, 0), category: 'Match' },
    { id: 'evt-003', title: 'U-15 Trials', date: new Date(new Date().getFullYear(), 7, 10, 9, 0, 0), category: 'Trial' },
    { id: 'evt-004', title: 'Team Lunch', date: new Date(new Date().getFullYear(), 7, 10, 12, 0, 0), category: 'Social' },
    { id: 'evt-005', title: 'U-17 Tactical Session', date: new Date(new Date().getFullYear(), 7, 12, 11, 0, 0), category: 'Training' },
    { id: 'evt-006', title: 'U-19 League Match vs. AFC Leopards Youth', date: new Date(new Date().getFullYear(), 7, 14, 15, 0, 0), category: 'Match' },
    { id: 'evt-007', title: 'Open Trials (U-15 & U-17)', date: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), category: 'Trial' }
];

export const messages: Message[] = [
    { id: 1, content: "Reminder: U-17 training tomorrow at 10 AM. Don't be late!", channel: 'SMS', recipientGroup: 'U-17 Players', status: 'Sent', timestamp: '2024-07-28 14:00' },
    { id: 2, content: "Team meeting for all coaches has been moved to 4 PM in the main office.", channel: 'In-App', recipientGroup: 'Coaches', status: 'Sent', timestamp: '2024-07-28 11:30' },
    { id: 3, content: "U-19 Friendly match this Saturday. Please confirm your availability in the app.", channel: 'WhatsApp', recipientGroup: 'U-19 Players', status: 'Scheduled', timestamp: '2024-07-29 09:00' },
    { id: 4, content: "Monthly fee payments are due next week. Please clear any outstanding balances.", channel: 'In-App', recipientGroup: 'All Players', status: 'Sent', timestamp: '2024-07-27 16:00' },
]

export const players: Player[] = [
  {
    id: 1,
    name: 'Leo Wanjala',
    age: 16,
    position: 'Forward',
    avatarUrl: 'https://picsum.photos/seed/p1/100/100',
    team: 'U-17',
    attendance: 95,
    disciplineScore: 94,
    rank: 3,
    points: 22,
    stats: { played: 10, wins: 7, draws: 1, losses: 2 },
    highlights: ['Top Scorer', 'High Speed', 'Leadership'],
    gpsData: { maxSpeed: 32.5, distanceCovered: 9.8, playerLoad: 250 },
    performanceMetrics: {
      physical: { speed: 88, stamina: 92, strength: 75 },
      technical: { dribbling: 85, shooting: 88, passing: 78 },
      tactical: { positioning: 70, 'game reading': 75 },
      psychoSocial: { leadership: 85, teamwork: 90 },
    },
    disciplinaryLog: [
        { id: 1, date: '2024-06-20', infraction: 'Tardiness to practice', severity: 'Low', sanction: 'Warning' },
        { id: 2, date: '2024-07-05', infraction: 'Unsporting behaviour', severity: 'Medium', sanction: 'Benched for one half' },
    ],
    injuryLog: [
        { id: 1, date: '2024-05-15', injury: 'Right Ankle Sprain', severity: 'Medium', rtpStatus: 'Cleared to Play' },
        { id: 2, date: '2024-03-02', injury: 'Mild Hamstring Strain', severity: 'Low', rtpStatus: 'Cleared to Play' },
    ],
    certificates: [
        { id: 'cert-001', moduleName: 'Advanced Dribbling & Ball Control', date: '2024-06-01' },
    ]
  },
  {
    id: 2,
    name: 'Aisha Akinyi',
    age: 15,
    position: 'Midfielder',
    avatarUrl: 'https://picsum.photos/seed/p2/100/100',
    team: 'U-17',
    attendance: 98,
    disciplineScore: 100,
    rank: 1,
    points: 25,
    stats: { played: 10, wins: 8, draws: 1, losses: 1 },
    highlights: ['Top Passing Accuracy', 'Excellent Game Reading', 'High Stamina'],
    gpsData: { maxSpeed: 29.1, distanceCovered: 11.2, playerLoad: 280 },
    performanceMetrics: {
      physical: { speed: 82, stamina: 88, strength: 68 },
      technical: { dribbling: 90, shooting: 75, passing: 91 },
      tactical: { positioning: 85, 'game reading': 88 },
      psychoSocial: { leadership: 80, teamwork: 95 },
    },
    disciplinaryLog: [],
    injuryLog: [],
    certificates: [
        { id: 'cert-002', moduleName: 'Defensive Positioning Masterclass', date: '2024-07-15' },
        { id: 'cert-003', moduleName: 'Tactical Awareness & Game Reading', date: '2024-05-20' },
    ]
  },
  {
    id: 3,
    name: 'Samuel Kiprop',
    age: 17,
    position: 'Defender',
    avatarUrl: 'https://picsum.photos/seed/p3/100/100',
    team: 'U-19',
    attendance: 91,
    disciplineScore: 90,
    rank: 5,
    points: 19,
    stats: { played: 9, wins: 6, draws: 1, losses: 2 },
    highlights: ['Top Defender', 'High Strength', 'Teamwork'],
    gpsData: { maxSpeed: 30.5, distanceCovered: 8.5, playerLoad: 230 },
    performanceMetrics: {
      physical: { speed: 80, stamina: 95, strength: 85 },
      technical: { dribbling: 70, shooting: 60, passing: 75 },
      tactical: { positioning: 90, 'game reading': 82 },
      psychoSocial: { leadership: 75, teamwork: 88 },
    },
    disciplinaryLog: [
        { id: 1, date: '2024-07-10', infraction: 'Missed team curfew', severity: 'High', sanction: '1 game suspension' },
    ],
    injuryLog: [
        { id: 1, date: '2024-06-10', injury: 'Left Knee Contusion', severity: 'Low', rtpStatus: 'Cleared for Light Training' },
    ],
    certificates: []
  },
  {
    id: 4,
    name: 'Fatima Omar',
    age: 18,
    position: 'Goalkeeper',
    avatarUrl: 'https://picsum.photos/seed/p4/100/100',
    team: 'U-19',
    attendance: 99,
    disciplineScore: 100,
    rank: 2,
    points: 21,
    stats: { played: 9, wins: 7, draws: 0, losses: 2 },
    highlights: ['Top Goalkeeper', 'High Attendance', 'Leadership'],
    gpsData: { maxSpeed: 18.2, distanceCovered: 4.1, playerLoad: 150 },
    performanceMetrics: {
      physical: { speed: 70, stamina: 85, strength: 80 },
      technical: { dribbling: 50, shooting: 55, passing: 65 },
      tactical: { positioning: 92, 'game reading': 85 },
      psychoSocial: { leadership: 88, teamwork: 92 },
    },
    disciplinaryLog: [],
    injuryLog: [],
    certificates: []
  },
  {
    id: 5,
    name: 'David Odhiambo',
    age: 14,
    position: 'Midfielder',
    avatarUrl: 'https://picsum.photos/seed/p5/100/100',
    team: 'U-15',
    attendance: 93,
    disciplineScore: 100,
    rank: 4,
    points: 28,
    stats: { played: 12, wins: 9, draws: 1, losses: 2 },
    highlights: ['Excellent Dribbling', 'High Speed', 'Teamwork'],
    gpsData: { maxSpeed: 28.9, distanceCovered: 10.5, playerLoad: 265 },
    performanceMetrics: {
      physical: { speed: 85, stamina: 80, strength: 72 },
      technical: { dribbling: 82, shooting: 78, passing: 82 },
      tactical: { positioning: 75, 'game reading': 78 },
      psychoSocial: { leadership: 70, teamwork: 85 },
    },
    disciplinaryLog: [],
    injuryLog: [],
    certificates: []
  },
  {
    id: 6,
    name: 'Grace Mwende',
    age: 16,
    position: 'Forward',
    avatarUrl: 'https://picsum.photos/seed/p6/100/100',
    team: 'U-17',
    attendance: 96,
    disciplineScore: 100,
    rank: 2,
    points: 24,
    stats: { played: 10, wins: 8, draws: 0, losses: 2 },
    highlights: ['Top Shooting Accuracy', 'High Speed', 'Teamwork'],
    gpsData: { maxSpeed: 33.1, distanceCovered: 9.5, playerLoad: 255 },
    performanceMetrics: {
      physical: { speed: 90, stamina: 86, strength: 78 },
      technical: { dribbling: 88, shooting: 90, passing: 80 },
      tactical: { positioning: 80, 'game reading': 84 },
      psychoSocial: { leadership: 82, teamwork: 88 },
    },
    disciplinaryLog: [],
    injuryLog: [],
    certificates: []
  },
];

export const transactions: Transaction[] = [
  { id: 'TXN72943', playerName: 'Leo Wanjala', date: '2024-07-15', amount: 5000, status: 'Completed', type: 'Fee Payment' },
  { id: 'TXN72944', playerName: 'Aisha Akinyi', date: '2024-07-15', amount: 5000, status: 'Completed', type: 'Fee Payment' },
  { id: 'TXN72945', playerName: 'Admin', date: '2024-07-14', amount: -12000, status: 'Completed', type: 'Expense', description: 'Field Rental' },
  { id: 'TXN72946', playerName: 'Samuel Kiprop', date: '2024-07-14', amount: 2500, status: 'Pending', type: 'Fee Payment' },
  { id: 'TXN72947', playerName: 'Fatima Omar', date: '2024-07-13', amount: 5000, status: 'Completed', type: 'Fee Payment' },
  { id: 'TXN72948', playerName: 'David Odhiambo', date: '2024-07-12', amount: 5000, status: 'Completed', type: 'Fee Payment' },
  { id: 'TXN72949', playerName: 'Grace Mwende', date: '2024-07-11', amount: -500, status: 'Failed', type: 'Refund' },
  { id: 'TXN72950', playerName: 'Leo Wanjala', date: '2024-07-10', amount: 1500, status: 'Completed', type: 'Stipend' },
];

export const teamMembers: TeamMember[] = [
  { id: 1, name: 'Esther Chepkoech', email: 'esther.c@talentatrack.co.ke', role: 'Admin', avatarUrl: 'https://picsum.photos/seed/a1/100/100', hourlyRate: 50, hoursWorked: 160 },
  { id: 2, name: 'John Omondi', email: 'john.o@talentatrack.co.ke', role: 'Coach', avatarUrl: 'https://picsum.photos/seed/c1/100/100', hourlyRate: 30, hoursWorked: 120 },
  { id: 3, name: 'Maria Njeri', email: 'maria.n@talentatrack.co.ke', role: 'Finance', avatarUrl: 'https://picsum.photos/seed/f1/100/100', hourlyRate: 40, hoursWorked: 150 },
  { id: 4, name: 'Peter Kamau', email: 'peter.k@talentatrack.co.ke', role: 'Scout', avatarUrl: 'https://picsum.photos/seed/s1/100/100', hourlyRate: 25, hoursWorked: 80 },
];

export const equipment: Equipment[] = [
  { id: 'EQP-001', name: 'Professional Cones (Set of 50)', category: 'Training Gear', assignedTo: 'John Omondi', location: 'Main Pitch', status: 'In Use' },
  { id: 'EQP-002', name: 'Adidas Match Balls (x10)', category: 'Match Gear', location: 'Storage Room A', status: 'In Storage' },
  { id: 'EQP-003', name: 'First-Aid Kit (Large)', category: 'Medical', assignedTo: 'Team Medic', location: 'Medical Tent', status: 'In Use' },
  { id: 'EQP-004', name: 'Ball Pump Machine', category: 'General', location: 'Storage Room A', status: 'Maintenance', maintenanceDue: '2024-08-01' },
  { id: 'EQP-005', name: 'Agility Ladders (x5)', category: 'Training Gear', assignedTo: 'John Omondi', location: 'Storage Room A', status: 'In Storage' },
  { id: 'EQP-006', name: 'GPS Vests (x20)', category: 'Performance Tracking', location: 'Charging Station', status: 'In Use' },
];

export const consumables: Consumable[] = [
    { id: 'CON-001', name: 'Water Bottles', category: 'Drinks', currentStock: 80, unit: 'bottles', lowStockThreshold: 100 },
    { id: 'CON-002', name: 'Energy Bars', category: 'Snacks', currentStock: 120, unit: 'bars', lowStockThreshold: 50 },
    { id: 'CON-003', name: 'Athletic Tape', category: 'Medical', currentStock: 30, unit: 'rolls', lowStockThreshold: 20 },
    { id: 'CON-004', name: 'Ice Packs (Instant)', category: 'Medical', currentStock: 15, unit: 'packs', lowStockThreshold: 20 },
];
