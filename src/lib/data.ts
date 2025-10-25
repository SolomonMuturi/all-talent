export type Player = {
  id: number;
  name: string;
  age: number;
  position: string;
  avatarUrl: string;
  team: string;
  attendance: number;
  performanceMetrics: {
    speed: number;
    stamina: number;
    shooting: number;
    passing: number;
  };
  disciplinaryLog: DisciplinaryInfraction[];
};

export type DisciplinaryInfraction = {
  id: number;
  date: string;
  infraction: string;
  severity: 'Low' | 'Medium' | 'High';
  sanction: string;
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

export const players: Player[] = [
  {
    id: 1,
    name: 'Leo Wanjala',
    age: 16,
    position: 'Forward',
    avatarUrl: 'https://picsum.photos/seed/p1/100/100',
    team: 'U-17',
    attendance: 95,
    performanceMetrics: { speed: 88, stamina: 92, shooting: 85, passing: 78 },
    disciplinaryLog: [
        { id: 1, date: '2024-06-20', infraction: 'Tardiness to practice', severity: 'Low', sanction: 'Warning' },
        { id: 2, date: '2024-07-05', infraction: 'Unsporting behaviour', severity: 'Medium', sanction: 'Benched for one half' },
    ],
  },
  {
    id: 2,
    name: 'Aisha Akinyi',
    age: 15,
    position: 'Midfielder',
    avatarUrl: 'https://picsum.photos/seed/p2/100/100',
    team: 'U-17',
    attendance: 98,
    performanceMetrics: { speed: 82, stamina: 88, shooting: 75, passing: 91 },
    disciplinaryLog: [],
  },
  {
    id: 3,
    name: 'Samuel Kiprop',
    age: 17,
    position: 'Defender',
    avatarUrl: 'https://picsum.photos/seed/p3/100/100',
    team: 'U-19',
    attendance: 91,
    performanceMetrics: { speed: 80, stamina: 95, shooting: 60, passing: 75 },
    disciplinaryLog: [
        { id: 1, date: '2024-07-10', infraction: 'Missed team curfew', severity: 'High', sanction: '1 game suspension' },
    ],
  },
  {
    id: 4,
    name: 'Fatima Omar',
    age: 18,
    position: 'Goalkeeper',
    avatarUrl: 'https://picsum.photos/seed/p4/100/100',
    team: 'U-19',
    attendance: 99,
    performanceMetrics: { speed: 70, stamina: 85, shooting: 50, passing: 65 },
    disciplinaryLog: [],
  },
  {
    id: 5,
    name: 'David Odhiambo',
    age: 14,
    position: 'Midfielder',
    avatarUrl: 'https://picsum.photos/seed/p5/100/100',
    team: 'U-15',
    attendance: 93,
    performanceMetrics: { speed: 85, stamina: 80, shooting: 78, passing: 82 },
    disciplinaryLog: [],
  },
  {
    id: 6,
    name: 'Grace Mwende',
    age: 16,
    position: 'Forward',
    avatarUrl: 'https://picsum.photos/seed/p6/100/100',
    team: 'U-17',
    attendance: 96,
    performanceMetrics: { speed: 90, stamina: 86, shooting: 88, passing: 80 },
    disciplinaryLog: [],
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
