export type SubscriptionPlan = {
  id: string;
  name: 'Starter' | 'Pro' | 'Enterprise';
  price: number; // per month
  playerLimit: number;
};

export type Club = {
  id: string;
  name: string;
  logoUrl: string;
  adminEmail: string;
  playerCount: number;
  subscriptionPlan: SubscriptionPlan;
  status: 'Active' | 'Trialing' | 'Canceled';
  renewalDate: string;
  mrr: number; // Monthly Recurring Revenue
  smsCredits: number;
  aiCredits: number;
};

export const subscriptionPlans: SubscriptionPlan[] = [
  { id: 'plan_starter', name: 'Starter', price: 5000, playerLimit: 50 },
  { id: 'plan_pro', name: 'Pro', price: 15000, playerLimit: 200 },
  { id: 'plan_enterprise', name: 'Enterprise', price: 40000, playerLimit: 1000 },
];

export const clubs: Club[] = [
  {
    id: 'club_001',
    name: 'Future Stars Academy',
    logoUrl: 'https://picsum.photos/seed/club1/100/100',
    adminEmail: 'admin@futurestars.co.ke',
    playerCount: 45,
    subscriptionPlan: subscriptionPlans[0],
    status: 'Active',
    renewalDate: '2024-08-15',
    mrr: 5000,
    smsCredits: 1000,
    aiCredits: 50,
  },
  {
    id: 'club_002',
    name: 'Nairobi United FC',
    logoUrl: 'https://picsum.photos/seed/club2/100/100',
    adminEmail: 'director@nairobiunited.com',
    playerCount: 180,
    subscriptionPlan: subscriptionPlans[1],
    status: 'Active',
    renewalDate: '2024-09-01',
    mrr: 15000,
    smsCredits: 5000,
    aiCredits: 250,
  },
  {
    id: 'club_003',
    name: 'Rift Valley Talent',
    logoUrl: 'https://picsum.photos/seed/club3/100/100',
    adminEmail: 'manager@rvtalent.org',
    playerCount: 32,
    subscriptionPlan: subscriptionPlans[0],
    status: 'Trialing',
    renewalDate: '2024-07-30',
    mrr: 0, // In trial
    smsCredits: 100,
    aiCredits: 10,
  },
  {
    id: 'club_004',
    name: 'Mombasa Heroes',
    logoUrl: 'https://picsum.photos/seed/club4/100/100',
    adminEmail: 'contact@mombasaheroes.co',
    playerCount: 110,
    subscriptionPlan: subscriptionPlans[1],
    status: 'Canceled',
    renewalDate: '2024-06-20',
    mrr: 0, // Canceled
    smsCredits: 0,
    aiCredits: 0,
  },
];
