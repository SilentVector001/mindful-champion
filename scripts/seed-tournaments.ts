import { PrismaClient, TournamentStatus, TournamentFormat, SkillLevel } from '@prisma/client';

const prisma = new PrismaClient();

const tournamentData = [
  // California
  {
    name: "California Open Championship",
    description: "Premier pickleball tournament featuring top players from across the West Coast",
    organizerName: "California Pickleball Association",
    organizerEmail: "info@caopen.com",
    organizerPhone: "(555) 123-4567",
    status: TournamentStatus.UPCOMING,
    venueName: "San Diego Tennis & Racquet Club",
    address: "4848 Tecolote Rd",
    city: "San Diego",
    state: "CA",
    zipCode: "92110",
    country: "USA",
    latitude: 32.7874,
    longitude: -117.2078,
    startDate: new Date("2025-01-15"),
    endDate: new Date("2025-01-18"),
    registrationStart: new Date("2024-12-01"),
    registrationEnd: new Date("2025-01-10"),
    format: [TournamentFormat.DOUBLES, TournamentFormat.MIXED_DOUBLES],
    skillLevels: [SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED, SkillLevel.PRO],
    maxParticipants: 256,
    currentRegistrations: 187,
    entryFee: 75.00,
    prizePool: 15000.00,
    websiteUrl: "https://calpickleballopen.com",
    registrationUrl: "https://calpickleballopen.com/register"
  },
  
  // Texas
  {
    name: "Texas State Pickleball Championships",
    description: "Annual championship showcasing the best pickleball talent in Texas",
    organizerName: "Texas Pickleball Federation",
    organizerEmail: "events@txpickleball.org",
    organizerPhone: "(555) 234-5678",
    status: TournamentStatus.REGISTRATION_OPEN,
    venueName: "Austin Sports Complex",
    address: "1701 Toomey Rd",
    city: "Austin",
    state: "TX",
    zipCode: "78704",
    country: "USA",
    latitude: 30.2408,
    longitude: -97.7787,
    startDate: new Date("2024-12-05"),
    endDate: new Date("2024-12-08"),
    registrationStart: new Date("2024-10-15"),
    registrationEnd: new Date("2024-11-30"),
    format: [TournamentFormat.SINGLES, TournamentFormat.DOUBLES, TournamentFormat.MIXED_DOUBLES],
    skillLevels: [SkillLevel.BEGINNER, SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED],
    maxParticipants: 320,
    currentRegistrations: 320,
    entryFee: 60.00,
    prizePool: 20000.00,
    websiteUrl: "https://texaspickleball.com/championships",
    registrationUrl: "https://texaspickleball.com/register"
  },
  
  // Florida
  {
    name: "Florida Winter Classic",
    description: "Escape the cold and compete in sunny Florida!",
    organizerName: "Sunshine State Pickleball",
    organizerEmail: "hello@sunstatepickleball.com",
    organizerPhone: "(555) 345-6789",
    status: TournamentStatus.UPCOMING,
    venueName: "Miami Beach Pickleball Center",
    address: "2301 Collins Ave",
    city: "Miami Beach",
    state: "FL",
    zipCode: "33139",
    country: "USA",
    latitude: 25.8026,
    longitude: -80.1269,
    startDate: new Date("2025-01-22"),
    endDate: new Date("2025-01-25"),
    registrationStart: new Date("2024-12-01"),
    registrationEnd: new Date("2025-01-17"),
    format: [TournamentFormat.MIXED_DOUBLES, TournamentFormat.DOUBLES, TournamentFormat.DOUBLES],
    skillLevels: [SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED, SkillLevel.PRO],
    maxParticipants: 200,
    currentRegistrations: 142,
    entryFee: 85.00,
    prizePool: 25000.00,
    websiteUrl: "https://floridawinterclassic.com",
    registrationUrl: "https://floridawinterclassic.com/signup"
  },
  
  // New York
  {
    name: "Empire State Open",
    description: "New York's premier pickleball tournament in the heart of the city",
    organizerName: "NYC Pickleball League",
    organizerEmail: "info@nycpickleball.com",
    organizerPhone: "(555) 456-7890",
    status: TournamentStatus.UPCOMING,
    venueName: "Brooklyn Sports Center",
    address: "3159 Coney Island Ave",
    city: "Brooklyn",
    state: "NY",
    zipCode: "11235",
    country: "USA",
    latitude: 40.5879,
    longitude: -73.9626,
    startDate: new Date("2025-02-05"),
    endDate: new Date("2025-02-08"),
    registrationStart: new Date("2024-12-15"),
    registrationEnd: new Date("2025-01-30"),
    format: [TournamentFormat.SINGLES, TournamentFormat.SINGLES, TournamentFormat.MIXED_DOUBLES],
    skillLevels: [SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED],
    maxParticipants: 180,
    currentRegistrations: 94,
    entryFee: 90.00,
    prizePool: 18000.00,
    websiteUrl: "https://empirestateopen.com",
    registrationUrl: "https://empirestateopen.com/register"
  },
  
  // Arizona
  {
    name: "Desert Sun Invitational",
    description: "Perfect winter weather and competitive pickleball action",
    organizerName: "Arizona Pickleball Association",
    organizerEmail: "contact@azpickleball.org",
    organizerPhone: "(555) 567-8901",
    status: TournamentStatus.UPCOMING,
    venueName: "Phoenix Racquet Club",
    address: "2525 E. Camelback Rd",
    city: "Phoenix",
    state: "AZ",
    zipCode: "85016",
    country: "USA",
    latitude: 33.5099,
    longitude: -112.0348,
    startDate: new Date("2025-01-28"),
    endDate: new Date("2025-01-31"),
    registrationStart: new Date("2024-12-01"),
    registrationEnd: new Date("2025-01-21"),
    format: [TournamentFormat.DOUBLES, TournamentFormat.DOUBLES, TournamentFormat.MIXED_DOUBLES],
    skillLevels: [SkillLevel.ADVANCED, SkillLevel.PRO],
    maxParticipants: 160,
    currentRegistrations: 128,
    entryFee: 80.00,
    prizePool: 22000.00,
    websiteUrl: "https://desertsuninvite.com",
    registrationUrl: "https://desertsuninvite.com/join"
  },
  
  // Washington
  {
    name: "Pacific Northwest Championships",
    description: "The premier pickleball event in the Pacific Northwest region",
    organizerName: "PNW Pickleball Federation",
    organizerEmail: "admin@pnwpickleball.com",
    organizerPhone: "(555) 678-9012",
    status: TournamentStatus.UPCOMING,
    venueName: "Seattle Sports Arena",
    address: "1100 Occidental Ave S",
    city: "Seattle",
    state: "WA",
    zipCode: "98134",
    country: "USA",
    latitude: 47.5926,
    longitude: -122.3331,
    startDate: new Date("2025-02-12"),
    endDate: new Date("2025-02-15"),
    registrationStart: new Date("2024-12-20"),
    registrationEnd: new Date("2025-02-05"),
    format: [TournamentFormat.SINGLES, TournamentFormat.SINGLES, TournamentFormat.DOUBLES, TournamentFormat.DOUBLES],
    skillLevels: [SkillLevel.BEGINNER, SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED],
    maxParticipants: 240,
    currentRegistrations: 156,
    entryFee: 70.00,
    prizePool: 16000.00,
    websiteUrl: "https://pnwchampionships.com",
    registrationUrl: "https://pnwchampionships.com/register"
  },
  
  // Colorado
  {
    name: "Rocky Mountain Open",
    description: "High altitude, high level pickleball competition",
    organizerName: "Colorado Pickleball Association",
    organizerEmail: "events@copickleball.com",
    organizerPhone: "(555) 789-0123",
    status: TournamentStatus.UPCOMING,
    venueName: "Denver Athletic Club",
    address: "1325 Glenarm Pl",
    city: "Denver",
    state: "CO",
    zipCode: "80204",
    country: "USA",
    latitude: 39.7436,
    longitude: -104.9867,
    startDate: new Date("2025-02-20"),
    endDate: new Date("2025-02-23"),
    registrationStart: new Date("2025-01-01"),
    registrationEnd: new Date("2025-02-13"),
    format: [TournamentFormat.MIXED_DOUBLES, TournamentFormat.DOUBLES],
    skillLevels: [SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED, SkillLevel.PRO],
    maxParticipants: 200,
    currentRegistrations: 98,
    entryFee: 75.00,
    prizePool: 19000.00,
    websiteUrl: "https://rockymountainopen.com",
    registrationUrl: "https://rockymountainopen.com/signup"
  },
  
  // Illinois
  {
    name: "Midwest Pickleball Classic",
    description: "Chicago's biggest annual pickleball tournament",
    organizerName: "Midwest Pickleball League",
    organizerEmail: "info@midwestpickleball.com",
    organizerPhone: "(555) 890-1234",
    status: TournamentStatus.UPCOMING,
    venueName: "Chicago Athletic Association",
    address: "12 S Michigan Ave",
    city: "Chicago",
    state: "IL",
    zipCode: "60603",
    country: "USA",
    latitude: 41.8819,
    longitude: -87.6245,
    startDate: new Date("2025-03-05"),
    endDate: new Date("2025-03-08"),
    registrationStart: new Date("2025-01-15"),
    registrationEnd: new Date("2025-02-28"),
    format: [TournamentFormat.SINGLES, TournamentFormat.SINGLES, TournamentFormat.MIXED_DOUBLES],
    skillLevels: [SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED],
    maxParticipants: 220,
    currentRegistrations: 87,
    entryFee: 65.00,
    prizePool: 14000.00,
    websiteUrl: "https://midwestclassic.com",
    registrationUrl: "https://midwestclassic.com/register"
  },
  
  // North Carolina
  {
    name: "Carolina Coast Classic",
    description: "Competitive pickleball on the beautiful Carolina coast",
    organizerName: "Carolina Pickleball Association",
    organizerEmail: "contact@carolinapickleball.com",
    organizerPhone: "(555) 901-2345",
    status: TournamentStatus.UPCOMING,
    venueName: "Charlotte Convention Center",
    address: "501 S College St",
    city: "Charlotte",
    state: "NC",
    zipCode: "28202",
    country: "USA",
    latitude: 35.2244,
    longitude: -80.8467,
    startDate: new Date("2025-03-12"),
    endDate: new Date("2025-03-15"),
    registrationStart: new Date("2025-01-20"),
    registrationEnd: new Date("2025-03-05"),
    format: [TournamentFormat.DOUBLES, TournamentFormat.DOUBLES, TournamentFormat.MIXED_DOUBLES],
    skillLevels: [SkillLevel.BEGINNER, SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED],
    maxParticipants: 190,
    currentRegistrations: 115,
    entryFee: 70.00,
    prizePool: 17000.00,
    websiteUrl: "https://carolinacoastclassic.com",
    registrationUrl: "https://carolinacoastclassic.com/join"
  },
  
  // Georgia
  {
    name: "Peach State Open",
    description: "Southern hospitality meets competitive pickleball",
    organizerName: "Georgia Pickleball Federation",
    organizerEmail: "info@gapickleball.com",
    organizerPhone: "(555) 012-3456",
    status: TournamentStatus.UPCOMING,
    venueName: "Atlanta Sports Complex",
    address: "3200 Woodward Way",
    city: "Atlanta",
    state: "GA",
    zipCode: "30305",
    country: "USA",
    latitude: 33.8304,
    longitude: -84.3733,
    startDate: new Date("2025-03-19"),
    endDate: new Date("2025-03-22"),
    registrationStart: new Date("2025-01-25"),
    registrationEnd: new Date("2025-03-12"),
    format: [TournamentFormat.SINGLES, TournamentFormat.SINGLES, TournamentFormat.MIXED_DOUBLES],
    skillLevels: [SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED, SkillLevel.PRO],
    maxParticipants: 210,
    currentRegistrations: 134,
    entryFee: 75.00,
    prizePool: 21000.00,
    websiteUrl: "https://peachstateopen.com",
    registrationUrl: "https://peachstateopen.com/register"
  },
  
  // Nevada
  {
    name: "Las Vegas Open",
    description: "What happens in Vegas... gets recorded on the pickleball court!",
    organizerName: "Nevada Pickleball Association",
    organizerEmail: "events@nvpickleball.com",
    organizerPhone: "(555) 123-7890",
    status: TournamentStatus.UPCOMING,
    venueName: "Las Vegas Sports Center",
    address: "7575 Dean Martin Dr",
    city: "Las Vegas",
    state: "NV",
    zipCode: "89139",
    country: "USA",
    latitude: 36.0949,
    longitude: -115.1733,
    startDate: new Date("2025-04-02"),
    endDate: new Date("2025-04-05"),
    registrationStart: new Date("2025-02-01"),
    registrationEnd: new Date("2025-03-26"),
    format: [TournamentFormat.DOUBLES, TournamentFormat.DOUBLES, TournamentFormat.MIXED_DOUBLES],
    skillLevels: [SkillLevel.ADVANCED, SkillLevel.PRO],
    maxParticipants: 280,
    currentRegistrations: 201,
    entryFee: 100.00,
    prizePool: 30000.00,
    websiteUrl: "https://lasvegaspickleballopen.com",
    registrationUrl: "https://lasvegaspickleballopen.com/register"
  },
  
  // Massachusetts
  {
    name: "New England Championships",
    description: "The premier pickleball event in New England",
    organizerName: "New England Pickleball Association",
    organizerEmail: "contact@nepickleball.org",
    organizerPhone: "(555) 234-8901",
    status: TournamentStatus.UPCOMING,
    venueName: "Boston Convention Center",
    address: "415 Summer St",
    city: "Boston",
    state: "MA",
    zipCode: "02210",
    country: "USA",
    latitude: 42.3454,
    longitude: -71.0449,
    startDate: new Date("2025-04-16"),
    endDate: new Date("2025-04-19"),
    registrationStart: new Date("2025-02-15"),
    registrationEnd: new Date("2025-04-09"),
    format: [TournamentFormat.SINGLES, TournamentFormat.SINGLES, TournamentFormat.DOUBLES, TournamentFormat.DOUBLES],
    skillLevels: [SkillLevel.BEGINNER, SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED],
    maxParticipants: 250,
    currentRegistrations: 162,
    entryFee: 80.00,
    prizePool: 18000.00,
    websiteUrl: "https://newenglandchampionships.com",
    registrationUrl: "https://newenglandchampionships.com/signup"
  },
  
  // Oregon
  {
    name: "Portland Pickleball Fest",
    description: "Three days of pickleball in the Rose City",
    organizerName: "Oregon Pickleball Association",
    organizerEmail: "info@orpickleball.com",
    organizerPhone: "(555) 345-9012",
    status: TournamentStatus.UPCOMING,
    venueName: "Portland Sports Park",
    address: "13400 SE Powell Blvd",
    city: "Portland",
    state: "OR",
    zipCode: "97236",
    country: "USA",
    latitude: 45.4976,
    longitude: -122.5321,
    startDate: new Date("2025-04-23"),
    endDate: new Date("2025-04-26"),
    registrationStart: new Date("2025-02-20"),
    registrationEnd: new Date("2025-04-16"),
    format: [TournamentFormat.MIXED_DOUBLES, TournamentFormat.DOUBLES, TournamentFormat.DOUBLES],
    skillLevels: [SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED],
    maxParticipants: 200,
    currentRegistrations: 118,
    entryFee: 70.00,
    prizePool: 15000.00,
    websiteUrl: "https://portlandpickleballfest.com",
    registrationUrl: "https://portlandpickleballfest.com/register"
  },
  
  // Minnesota
  {
    name: "Twin Cities Open",
    description: "Minnesota's largest pickleball tournament",
    organizerName: "Minnesota Pickleball Association",
    organizerEmail: "admin@mnpickleball.com",
    organizerPhone: "(555) 456-0123",
    status: TournamentStatus.UPCOMING,
    venueName: "Minneapolis Convention Center",
    address: "1301 2nd Ave S",
    city: "Minneapolis",
    state: "MN",
    zipCode: "55403",
    country: "USA",
    latitude: 44.9707,
    longitude: -93.2733,
    startDate: new Date("2025-05-07"),
    endDate: new Date("2025-05-10"),
    registrationStart: new Date("2025-03-01"),
    registrationEnd: new Date("2025-04-30"),
    format: [TournamentFormat.SINGLES, TournamentFormat.SINGLES, TournamentFormat.MIXED_DOUBLES],
    skillLevels: [SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED, SkillLevel.PRO],
    maxParticipants: 230,
    currentRegistrations: 145,
    entryFee: 75.00,
    prizePool: 19000.00,
    websiteUrl: "https://twincitiesopen.com",
    registrationUrl: "https://twincitiesopen.com/join"
  },
  
  // Virginia
  {
    name: "Virginia State Championships",
    description: "Crowning Virginia's best pickleball players",
    organizerName: "Virginia Pickleball Association",
    organizerEmail: "events@vapickleball.com",
    organizerPhone: "(555) 567-1234",
    status: TournamentStatus.UPCOMING,
    venueName: "Richmond Sports Complex",
    address: "3900 Midlothian Turnpike",
    city: "Richmond",
    state: "VA",
    zipCode: "23224",
    country: "USA",
    latitude: 37.5105,
    longitude: -77.4763,
    startDate: new Date("2025-05-14"),
    endDate: new Date("2025-05-17"),
    registrationStart: new Date("2025-03-10"),
    registrationEnd: new Date("2025-05-07"),
    format: [TournamentFormat.DOUBLES, TournamentFormat.DOUBLES, TournamentFormat.MIXED_DOUBLES],
    skillLevels: [SkillLevel.BEGINNER, SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED],
    maxParticipants: 190,
    currentRegistrations: 103,
    entryFee: 65.00,
    prizePool: 14000.00,
    websiteUrl: "https://vastatechampionships.com",
    registrationUrl: "https://vastatechampionships.com/register"
  }
];

async function main() {
  console.log('Starting tournament seeding...');

  // Clear existing tournaments (optional - remove if you want to keep existing data)
  await prisma.tournament.deleteMany({});
  console.log('Cleared existing tournaments');

  // Create tournaments
  let created = 0;
  for (const tournament of tournamentData) {
    try {
      await prisma.tournament.create({
        data: tournament
      });
      created++;
      console.log(`✓ Created: ${tournament.name} (${tournament.city}, ${tournament.state})`);
    } catch (error) {
      console.error(`✗ Failed to create ${tournament.name}:`, error);
    }
  }

  console.log(`\n✅ Successfully seeded ${created} tournaments`);
}

main()
  .catch((e) => {
    console.error('Error seeding tournaments:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
