/* ===================== DATA: world, money, people ===================== */
const MONTHS = ['April','May','June','July','August','September','October','November','December','January','February','March'];
const MON3 = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
const CAL_YEAR = [2026,2026,2026,2026,2026,2026,2026,2026,2026,2027,2027,2027];
// demand multiplier through the financial year (winter bites from November)
const SEASON = [0.95,0.95,0.93,0.9,0.86,0.99,1.04,1.1,1.16,1.19,1.1,1.03];
const FLU_MONTHS = [5,6,7,8,9]; // September to January
const WINTER = [8,9,10];        // December to February
const WEEKS = 4.33;
const RESERVE = 25; // £k working capital kept back at year end [S44]

/* Real 2026/27 England GMS figures. Source IDs point at SOURCES below. */
const P = {
  arrs: 27.668,        // ARRS sum per weighted patient a year, paid to the PCN [S4,S84]
  gs: 130.07,          // global sum per weighted patient a year [S2,S3]
  ooh: 0.047,          // out-of-hours opt-out deduction [S3]
  qofPts: 582,         // QOF points available [S3]
  qofVal: 227.95,      // £ per point for an average practice [S3]
  qofAsp: 0.8,         // aspiration payment: 80% of last year's value, paid monthly [S3]
  cpiAvg: 10295,       // national average list size used to scale QOF [S3]
  npp: 1.761,          // network participation payment per weighted patient [S4]
  plgr: 4.57,          // practice-level GP scheme pot per patient [S5]
  plgrHour: 78.41,     // most the scheme pays per GP hour [S5]
  niRate: 0.15, niT: 5000, // employer NI above £5,000; no Employment Allowance [S19,S20]
  erPen: 0.1438,       // employer pension paid by the practice [S22]
  newReg: 1.46,        // new registrants count 1.46x for a year [S3]
  careHome: 1.43,      // care home residents count 1.43x [S3]
  fluFee: 10.06,       // adult flu jab, unchanged since 2023/24 [S27]
  locumHour: 100,      // typical in-hours locum, £85-£105 an hour [S28]
  sessionHours: 4.17,  // a nominal session is 4h10m
  realHours: 5.8,      // hours a partner actually works per session, with the admin that spills over [S36]
  nlw: 12.71,          // National Living Wage from April 2026 [S18]
  salaried: 95390,     // mid-range salaried GP, 9 sessions [S17]
  partnerAvg: 164200,  // average partner income before tax, 2024/25 [S8]
  gpps: 76.7,          // national "good" overall experience, GP Patient Survey 2026 [S34]
  tiers: [[13259,.052],[28854,.065],[35155,.083],[52778,.098],[67668,.107],[Infinity,.125]], // member pension tiers [S22]
  tax: { pa: 12570, basicTop: 50270, addl: 125140, taper: 100000 }, // income tax 2026/27 [S21]
  c4: { lpl: 12570, upl: 50270, main: 0.06, upper: 0.02 }            // Class 4 NI [S21]
};
// an evening or Saturday clinic run by your own staff on overtime: a salaried GP or nurse session at sessional rates,
// with employer NI and pension, plus a receptionist. Outside core hours, so it needs no core room session.
const OT_SESSION = 0.32, OT_APPTS = 12, OT_MAX = 4;
const LOCUM_SESSION = (P.locumHour * P.sessionHours * (1 + P.erPen)) / 1000; // £k, including employer pension on NHS locum work
const empCostK = (pay, penShare) => (pay + P.niRate * Math.max(0, pay - P.niT) + pay * P.erPen * penShare) / 12 / 1000;

const PRACTICES = {
  suburb:{
    key:'suburb',label:'Leafy suburb',diff:'Gentle',surgery:'Oakfield Surgery',place:'Little Oakfield',paper:'The Oakfield Courier',
    blurb:'Healthy, wealthy and well-informed. The easiest list in the county, on paper. The building is older than the NHS.',
    list:7200,weight:1.02,prev:0.95,lastQof:96,cash:50,overdraft:-65,st:{patients:54,team:60,you:68,safety:58},
    demandRate:0.097,inboxRate:0.05,qofEase:1.08,hire:1.0,turnover:0.04,youDrag:4,youDragWhy:'Patients who read the guidelines before you do',rooms:7,premNet:1.5,overhead:0,priv:4.1,
    staff:{recep:5,nurse:2,hca:1,salaried:1,pharm:0,physio:0,para:0,mhp:0,cc:0,sp:0,gpa:0}
  },
  town:{
    key:'town',label:'Market town',diff:'Standard',surgery:'Riverside Surgery',place:'Bramleigh',paper:'The Bramleigh Bugle',
    blurb:'A proper mix: farms, a new estate, a care home and one very active local Facebook group.',
    list:8200,weight:1.0,prev:1.0,lastQof:94,cash:30,overdraft:-75,st:{patients:48,team:52,you:64,safety:52},
    demandRate:0.102,inboxRate:0.048,qofEase:1.0,hire:0.9,turnover:0.07,youDrag:6,youDragWhy:'The care home, the new estate and the Facebook group',rooms:7,premNet:2.5,overhead:0,priv:2.9,
    staff:{recep:5,nurse:2,hca:1,salaried:1,pharm:1,physio:0,para:0,mhp:0,cc:0,sp:0,gpa:0}
  },
  city:{
    key:'city',label:'Inner city',diff:'Brutal',surgery:'Canal Street Medical Centre',place:'Hollowbrook',paper:'The Hollowbrook Herald',
    blurb:'High need, high turnover, twenty-six languages, one interpreter line with a 40-minute hold. One GP per 3,000 patients, and nobody is applying.',
    list:10400,weight:0.96,prev:0.9,lastQof:88,cash:25,overdraft:-95,st:{patients:42,team:48,you:62,safety:48},
    demandRate:0.104,inboxRate:0.046,qofEase:0.88,hire:0.7,turnover:0.14,rooms:8,premNet:3.5,overhead:1.5,priv:1.8,gpCap:3000,locumMax:4,accessLine:16,
    staff:{recep:7,nurse:2,hca:2,salaried:2,pharm:1,physio:0,para:1,mhp:0,cc:1,sp:1,gpa:0}
  }
};
// income per registered patient a year, £ (scaled from the 2026/27 reference practice) [S8,S9]
const PER_PATIENT = { vacc: 4.85, es: 3.88, pcn: 1.94 };
const CORE_ADMIN = 0.0017;  // £k per patient a month: practice manager, secretaries, summarisers, coders
const RUNNING = 0.00154;    // £k per patient a month: office, clinical supplies, insurance, IT, CQC fee

// cost in £k a month including employer NI and pension. cap = appointments a week. clear = inbox items cleared a week.
const ROLES = {
  recep:{name:'Receptionist',cost:empCostK(24690,0.7),hire:0.8,desc:'Takes the 8am calls and the abuse. Knows everyone\'s nan.'},
  nurse:{name:'Practice nurse',cost:empCostK(35884,0.85),cap:104,qof:1.2,room:8,hire:0.4,desc:'Chronic disease reviews, smears, imms. Your QOF engine.'},
  hca:{name:'Healthcare assistant',cost:empCostK(24500,0.7),cap:120,qof:0.8,room:9,hire:0.6,desc:'Bloods, blood pressures, ECGs, health checks.'},
  salaried:{name:'Salaried GP',cost:empCostK(P.salaried*6/9,1),cap:84,clear:50,room:6,hire:0.4,desc:'Six sessions a week. Doesn\'t have to think about the overdraft.'},
  pharm:{name:'Clinical pharmacist',arrs:1,claim:78,band:'Band 7 to 8a',sup:1,cost:0.35,cap:60,clear:40,qof:0.8,room:4,hire:0.65,desc:'Med reviews, scripts, and queries about the queries.'},
  physio:{name:'First contact physio',arrs:1,claim:78,band:'Band 7 to 8a',sup:1,cost:0.35,cap:80,room:9,hire:0.6,desc:'Backs, knees and shoulders, straight to the right person.'},
  para:{name:'Paramedic',arrs:1,claim:78,band:'Band 7 to 8a',sup:1,cost:0.35,cap:55,room:4,hire:0.5,desc:'Home visits and same-day minor illness.'},
  mhp:{name:'Mental health practitioner',arrs:1,claim:72,band:'Band 7',sup:1,cost:0.35,cap:40,room:8,hire:0.45,desc:'Longer appointments for the patients who need them most.'},
  cc:{name:'Care coordinator',arrs:1,claim:40,band:'Band 4',cost:0.35,qof:2,hire:0.75,desc:'Recalls, care plans, chasing. QOF loves them.'},
  sp:{name:'Social prescriber',arrs:1,claim:50,band:'Band 5',cost:0.35,demand:-2,hire:0.75,desc:'Loneliness, debt, housing: the things a prescription can\'t fix.'},
  gpa:{name:'GP assistant',arrs:1,claim:40,band:'Band 4',cost:0.35,clear:80,hire:0.7,desc:'Codes letters, preps results, tames the inbox.'}
};
const ROLE_ORDER = ['salaried','nurse','hca','recep','pharm','physio','para','mhp','cc','sp','gpa'];
// ARRS roles are claimed from the PCN's additional-roles budget (P.arrs per weighted patient; the practice's share is modelled).
// `claim` is our estimate of each role's maximum reimbursement, £k a year: the top of its Agenda for Change band plus employer NI and pension.
// A consulting room gives about 9 bookable half-day sessions a week (10, less clashes, cleaning and meetings).
const ROOM_SESSIONS = 9;
const GP_FTE_SESSIONS = 9; // a full-time GP is about nine sessions a week
// England, 31 August 2026, per 10,000 registered patients (63.0m) [S58,S59]
const BENCH = { gp: 29057, nurse: 16644, dpc: 18082, admin: 77287, patients: 63.0e6 };
const OFFICE_COST = empCostK(26500, 0.6); // a typical practice office post, all in

const PARTNERS0 = {
  hartley:{name:'Dr Alan Hartley',short:'Alan',clin:6,capital:25},
  okoye:{name:'Dr Nadia Okoye',short:'Nadia',clin:5,capital:25},
  tom:{name:'Dr Tom Reeves',short:'Tom',clin:6,capital:25},
  priya:{name:'Dr Priya Nair',short:'Priya',clin:6,capital:25}
};
// cash drawings per partner per month, £k. Pension contributions are paid on top from the practice account.
const DRAW = {low:8.5,std:10,high:11.5};

const PROJECTS = [
  {id:'none',name:'Keep the lights on',desc:'No project this month. Breathe.',fx:{you:2}},
  {id:'qof',name:'QOF recall blitz',desc:'Texts, letters, a Saturday clinic. QOF up, overtime costs.',fx:{qof:5,team:-2,cash:-1.2}},
  {id:'cqc',name:'Mock CQC inspection',desc:'Policies updated, fridge logs found, fire marshals named. Safety improves for good.',fx:{safety:6,team:-2,aim:{safety:1}}},
  {id:'wellbeing',name:'Team afternoon off',desc:'Close for a protected learning afternoon. Pizza is involved.',fx:{team:8,patients:-2,cash:-0.6}},
  {id:'inbox',name:'Workflow overhaul',desc:'Train the admin team to code letters. The backlog shrinks.',fx:{inbox:-170,cash:-1.5,team:-1}},
  {id:'ppg',name:'Patient participation group',desc:'Tea, biscuits and feedback. Reputation improves.',fx:{patients:3,you:-1,rep:4}},
  {id:'claims',name:'Chase unclaimed income',desc:'Audit the enhanced service claims. Money is hiding in there, less each time you look.',fx:{cash:6}},
  {id:'recruit',name:'Recruitment drive',desc:'Adverts, socials, a stall at the training scheme. Better odds for every vacancy.',fx:{cash:-1},hireBoost:0.3},
  {id:'meetingroom',once:1,name:'Turn the meeting room into a clinic room',desc:'A sink, a couch, wipe-clean flooring and a blind (£4,000). One more clinic room for good. Meetings move to the staff room.',fx:{rooms:1,cash:-4,team:-2}},
  {id:'digital',once:1,name:'Tidy the online front door',desc:'Better request forms, fewer "cough (3 years)". Demand eases a little for good.',fx:{demand:-1.5,team:-1,cash:-0.8}},
  {id:'telephony',once:1,name:'Cloud telephony go-live',desc:'Queue position, call-backs, no more engaged tone. Patients stay happier for good.',fx:{patients:4,team:3,cash:-9,demand:-1,aim:{patients:4}},need:'telephony'}
];

// people who turn up on cards
const CAST = {
  bev:{name:'Bev Marsh',role:'Practice Manager, 31 years and counting',m:'BM',c:'#A65E1F'},
  hartley:{name:'Dr Alan Hartley',role:'Senior Partner, 62',m:'AH',c:'#46688A'},
  okoye:{name:'Dr Nadia Okoye',role:'Partner',m:'NO',c:'#76468F'},
  tom:{name:'Dr Tom Reeves',role:'Salaried GP',m:'TR',c:'#2B7A72'},
  maureen:{name:'Maureen Kelly',role:'Lead Practice Nurse',m:'MK',c:'#9E3A46'},
  kayleigh:{name:'Kayleigh Dunn',role:'Receptionist',m:'KD',c:'#C9731F'},
  raj:{name:'Raj Mistry',role:'Clinical Pharmacist',m:'RM',c:'#3A7535'},
  kevin:{name:'Kevin Doyle',role:'Finance administrator',m:'KV',c:'#5B6B2E'},
  pratt:{name:'Mr Derek Pritchard',role:'Patient, 71',m:'DP',c:'#666B70'},
  higgins:{name:'Mrs Edna Higgins',role:'Patient, 84',m:'EH',c:'#B55C80'},
  jay:{name:'Jay',role:'Wants to register',m:'J',c:'#6B5B95'},
  icb:{name:'Jonathan Price',role:'ICB Primary Care Commissioning',m:'JP',c:'#314559'},
  pcn:{name:'Dr Clare Fenwick',role:'PCN Clinical Director',m:'CF',c:'#1C8068'},
  cqc:{name:'Patricia Sharpe',role:'CQC Inspector',m:'PS',c:'#232C3B'},
  paper:{name:'',role:'Local newspaper',m:'NEWS',c:'#7E6334'},
  landlord:{name:'Property Services',role:'Your landlord, allegedly',m:'PS',c:'#57493A'},
  lmc:{name:'Dr Steve Morgan',role:'LMC Secretary',m:'SM',c:'#5E54B8'},
  accountant:{name:'Neville Crump',role:'Specialist medical accountant',m:'NC',c:'#4F6530'},
  bank:{name:'The bank',role:'Business Banking Team',m:'£',c:'#2A3B4D'},
  deed:{name:'The partnership deed',role:'Clause 31: last partner standing',m:'§',c:'#3B3B3B'},
  home:{name:'Home',role:'The people who live with you',m:'♥',c:'#C98F12'},
  you:{name:'You',role:'Inner monologue',m:'ME',c:'#1D6A4D'},
  apex:{name:'Apex Primary Care Ltd',role:'"Delivering scalable care solutions"',m:'APX',c:'#0E7490'},
  rowe:{name:'Dr Helen Rowe',role:'Senior Partner, Parkside Surgery',m:'HR',c:'#8A4B2E'},
  reg:{name:'Dr Ellie Chen',role:'GP Registrar (ST3)',m:'EC',c:'#914A8B'},
  ward:{name:'Dr Sam Ward',role:'Newly qualified GP, no job',m:'SW',c:'#2F6F9F'},
  patient:{name:'Online request',role:'Submitted 07:59',m:'OR',c:'#5A7684'},
  cat:{name:'QOF',role:'Car park cat. Unregistered.',m:'Q',c:'#B87433'},
  dept:{name:'The Department',role:'Announced on the radio first',m:'DoH',c:'#383D56'},
  hospital:{name:'St Swithin\'s Hospital',role:'Acute Trust',m:'SSH',c:'#684838'},
  chemist:{name:'Ashok Patel',role:'Community Pharmacist',m:'AP',c:'#2A8054'},
  rep:{name:'Chad',role:'Pharmaceutical representative',m:'CH',c:'#B5382B'},
  agency:{name:'Locum agency',role:'"Solutions for every rota gap"',m:'LA',c:'#72807F'},
  mp:{name:'Sir Geoffrey Pomfrey MP',role:'Your local MP',m:'GP',c:'#4A1D78'},
  med:{name:'Oliver',role:'Third-year medical student',m:'OL',c:'#3E7CA8'},
  it:{name:'IT Helpdesk',role:'Ticket #448213',m:'IT',c:'#4B5563'},
  coroner:{name:'Coroner\'s officer',role:'HM Coroner',m:'HMC',c:'#303845'},
  pcse:{name:'Pension administration',role:'Primary care support services',m:'PEN',c:'#6D6A75'},
  insurer:{name:'SunSafe Travel Insurance',role:'Claims department',m:'INS',c:'#2E6E8E'},
  jobs:{name:'Job alert',role:'GP vacancies near you',m:'JOB',c:'#3F7D6C'},
  gavin:{name:'Gavin Lusk',role:'CQC compliance consultant, £750 a day',m:'GL',c:'#8C3B5E'},
  gerald:{name:'Gerald',role:'Waiting-room goldfish. Unregistered.',m:'G',c:'#D9822B'}
};

// line icons for the meters (stroke uses currentColor)
const ICON = {
  patients:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.6 3-5.6 6-5.6s5.4 2 6 5.6"/><circle cx="17" cy="9" r="2.4"/><path d="M16.5 14.2c2.3.2 4 1.9 4.5 4.8"/></svg>',
  team:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l4-4 4 3 3-2 7 5"/><path d="M7 7l-4 8 5 5 3-2"/><path d="M21 13l-5 5-2-1"/><path d="M10 15l2 2M12 13l2.5 2.5"/></svg>',
  you:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M8.5 11.5h2l1-2 1.5 4 1-2h1.5"/></svg>',
  safety:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  cash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.5 6.5A3.5 3.5 0 0 0 9 8.5V13c0 2.5-1 4.5-3 6h12"/><path d="M6.5 12.5h7"/></svg>'
};
const STAT_LABEL = {patients:'Patients',team:'Team',you:'You',safety:'Safety',cash:'Bank'};
const STAT_KEYS = ['patients','team','you','safety'];

/* ---------------- newspaper headlines ---------------- */
const HEADLINES = {
  bad:[
    '"I rang 94 times": readers vent over {surgery} phone queue',
    'Patients queue round the block at {surgery} before 8am',
    'Petition over GP waits hits 2,000 signatures',
    'Councillor demands "answers" over {surgery} appointments',
    '{place} Facebook group "absolutely furious", sources confirm'
  ],
  ok:[
    '{surgery} "doing its best", says man in Co-op queue',
    'GP waits "about the same", shrugs {place}',
    'Local surgery neither praised nor condemned in shock development'
  ],
  good:[
    'Same-day appointments stun {place} residents',
    '{surgery} praised as waits fall',
    '"They rang me back!": pensioner hails surgery call-back system'
  ],
  filler:[
    'Marrow at {place} show "the size of a labrador", say judges',
    'Pothole on Mill Lane now has its own postcode',
    'Seagull "with attitude" banned from chip shop',
    'Village fete raises £412 for new defibrillator',
    'Car park charges at St Swithin\'s branded "daylight robbery"',
    'Roundabout gnome missing for third week; police "following leads"',
    'Council to review bin collections, again',
    'Local dog elected honorary mayor in landslide'
  ]
};

/* ---------------- sources (from the 2026/27 scoping work) ---------------- */
const SOURCES = {
  S1:['NHS England: Changes to the GP Contract in 2026/27','https://www.england.nhs.uk/long-read/changes-to-the-gp-contract-in-2026-27/','A'],
  S2:['BMA: DDRB uplift 2026/27 FAQs','https://www.bma.org.uk/pay-and-contracts/pay/gp-pay/ddrb-uplift-202627-faqs','A'],
  S3:['DHSC: GMS Statement of Financial Entitlements Directions 2026','https://assets.publishing.service.gov.uk/media/69cbe5032d120d9d5ec0f352/general-medical-services-statement-of-financial-entitlements-directions-2026.pdf','A'],
  S4:['NHS England: Network Contract DES specification 2026/27','https://www.england.nhs.uk/wp-content/uploads/2026/03/network-contract-des-contract-specification-2026-27.pdf','A'],
  S5:['NHS England: Supplementary information, 2026/27 GP contract','https://www.england.nhs.uk/long-read/supplementary-information-to-support-changes-to-the-2026-27-gp-contract/','A'],
  S8:['NHS England Digital: GP Earnings and Expenses Estimates 2024/25','https://digital.nhs.uk/data-and-information/publications/statistical/gp-earnings-and-expenses-estimates/2024-25','A'],
  S9:['NHS England Digital: NHS Payments to General Practice 2024/25','https://digital.nhs.uk/data-and-information/publications/statistical/nhs-payments-to-general-practice/england-2024-25','A'],
  S11:['BMA: Pressures in general practice data analysis','https://www.bma.org.uk/advice-and-support/nhs-delivery-and-workforce/pressures/pressures-in-general-practice','B'],
  S12:['NHS England Digital: Patients Registered at a GP Practice, September 2026','https://digital.nhs.uk/data-and-information/publications/statistical/patients-registered-at-a-gp-practice/september-2026','A'],
  S13:['NHS England: QOF guidance 2026/27','https://www.england.nhs.uk/wp-content/uploads/2026/03/prn02356-quality-outcomes-framework-guidance-2026-27-july-update.pdf','A'],
  S15:['Nursing in Practice: GPN pay survey 2026','https://www.nursinginpractice.com/analysis/practice-nurse-pay/general-practice-nurse-pay-a-salary-survey-of-the-profession-2026/','B'],
  S17:['NHS Employers: Doctors\' and dentists\' pay award 2026','https://www.nhsemployers.org/news/doctors-and-dentists-pay-award-announcement-2026','A'],
  S18:['NHS Employers: National Living Wage 2026/27','https://www.nhsemployers.org/news/national-living-wage-202627-update','A'],
  S19:['BMA: Impact of employer NICs on GPs','https://www.bma.org.uk/media/jddkjznc/impact-of-nics-changes-member-briefing.pdf','B'],
  S20:['HMRC: Employment Allowance eligibility guidance','https://www.gov.uk/government/publications/employment-allowance-more-detailed-guidance/eligibility-for-employment-allowance-further-employer-guidance','A'],
  S21:['GOV.UK: Income Tax rates','https://www.gov.uk/income-tax-rates','A'],
  S22:['NHSBSA: employer contribution rates 2026/27','https://www.nhsbsa.nhs.uk/nhs-pension-scheme-employer-contribution-rates-202627','A'],
  S23:['AISMA: Guide to Becoming a GP Partner','https://www.xeinadin.com/wp-content/uploads/sites/4/2025/10/AISMA-GUIDE-BECOME-A-GP-PARTNER_2024_vFINAL.pdf','B'],
  S25:['BMA: GP referendum outcome','https://www.bma.org.uk/news-and-opinion/gp-ballot-outcome','B'],
  S26:['BMA: online consultation FAQs, 1 October 2025','https://www.bma.org.uk/media/xhoihr5f/bma-faqs-for-1-october-2025-online-consultations-v2.pdf','B'],
  S27:['NHS England: 2026/27 COVID-19 and adult flu service specification','https://www.england.nhs.uk/long-read/2026-27-covid-adult-influenza-vaccination-service-specification-general-practice/','A'],
  S28:['Sessional: locum GP rates 2026','https://sessional.co.uk/rates/gps','C'],
  S29:['BMA: what services GP practices can and cannot charge for','https://www.bma.org.uk/advice-and-support/gp-practices/gp-service-provision/what-services-gp-practices-can-and-cannot-charge-for','C'],
  S30:['DHSC: Premises Costs Directions 2024','https://assets.publishing.service.gov.uk/media/663cd8d2bd01f5ed32793867/nhs_general-medical-services-premises-costs_directions-2024.pdf','A'],
  S31:['BMA: GP premises survey','https://www.bma.org.uk/bma-media-centre/bma-survey-exposes-severe-gp-premises-crisis-as-most-surgeries-are-unfit-for-the-future','B'],
  S33:['GPonline: CQC ratings map','https://www.gponline.com/map-cqc-ratings-every-gp-practice-england/article/1452465','B'],
  S34:['Ipsos: GP Patient Survey 2026','https://www.ipsos.com/en-uk/2026-gp-patient-survey-results-released','A'],
  S36:['12th National GP Worklife Survey','https://pru.hssc.ac.uk/assets/uploads/files/gpwls-2024-final.pdf','A'],
  S37:['BJGP Open: violence and abuse towards general practice staff','https://bjgpopen.org/content/early/2026/09/06/BJGPO.2025.0124','A'],
  S38:['BMA: safe working, daily contacts','https://www.bma.org.uk/advice-and-support/gp-practices/managing-workload/safe-working-in-general-practice/daily-working-contacts','B'],
  S39:['GPonline: practice manager fraud case, £450k','https://www.gponline.com/practice-manager-handed-three-year-jail-term-450000-fraud/article/1954151','B'],
  S40:['BMA: state-backed GP indemnity (CNSGP)','https://www.bma.org.uk/advice-and-support/medical-indemnity/medical-indemnity/state-backed-gp-indemnity-scheme','B'],
  S43:['BMA Law: avoid being the last partner standing','https://bmalaw.co.uk/resources/avoid-being-the-last-partner-standing/','B'],
  S58:['NHS England Digital: General Practice Workforce, 31 August 2026','https://digital.nhs.uk/data-and-information/publications/statistical/general-and-personal-medical-services/31-august-2026','A'],
  S59:['BMA: Pressures in general practice, data analysis','https://www.bma.org.uk/advice-and-support/nhs-delivery-and-workforce/pressures/pressures-in-general-practice-data-analysis','B'],
  S60:['Digital Health: global IT outage disrupting NHS GP systems, July 2024','https://www.digitalhealth.net/2024/07/global-it-outage-disrupting-nhs-caused-by-antivirus-software/','B'],
  S61:['Community Pharmacy England: EPS technical issues and contingency arrangements','https://cpe.org.uk/digital-and-technology/contingency-it/eps-contingencies/','B'],
  S62:['NHS England: GP digital services operating model','https://www.england.nhs.uk/digitaltechnology/digital-primary-care/gp-digital-services-operating-model/','A'],
  S63:['NHSBSA: Serious Shortage Protocols','https://www.nhsbsa.nhs.uk/pharmacies-gp-practices-and-appliance-contractors/serious-shortage-protocols-ssps','A'],
  S64:['Community Pharmacy England: medicine shortages','https://cpe.org.uk/dispensing-and-supply/supply-chain/medicine-shortages/','B'],
  S65:['House of Commons Library: medicines shortages','https://commonslibrary.parliament.uk/research-briefings/cbp-9997/','A'],
  S66:['Healthcare Leader: no ICB meets the "gold standard" GP-to-patient ratio','https://healthcareleadernews.com/news/no-icb-meeting-gold-standard-gp-to-patient-ratio/','B'],
  S67:['KentOnline: Kent and Medway have the highest patient-to-GP ratio','https://www.kentonline.co.uk/medway/news/reasons-why-kent-has-uks-worst-gp-numbers-272523/','C'],
  S68:['ITV News: NHS to review prostate cancer guidance after Sir Chris Hoy appeal','https://www.itv.com/news/2024-11-05/nhs-to-review-prostate-cancer-guidance-after-sir-chris-hoy-appeal','B'],
  S69:['BikeRadar: how Sir Chris Hoy\'s diagnosis sparked a conversation about screening','https://www.bikeradar.com/advice/health/sir-chris-hoys-devastating-prostate-cancer-diagnosis','C'],
  S70:['The Pharmaceutical Journal: testosterone in menopause, evidence and prescribing','https://pharmaceutical-journal.com/article/research/testosterone-in-menopause-a-review-of-the-evidence-and-prescribing-practice','A'],
  S71:['BBC Science Focus: the Davina McCall effect and testosterone','https://www.sciencefocus.com/news/ignore-davina-mccall-effect-testosterone-menopause','B'],
  S72:['NHS Surrey and Sussex ICB: suspension of community dermatology services in East Sussex','https://www.surreysussex.icb.nhs.uk/news-centre/suspension-of-community-dermatology-locally-commissioned-services-in-east-sussex-4213','A'],
  S73:['Parliament written question: dermatology waiting lists','https://www.parallelparliament.co.uk/question/113907/dermatology-waiting-lists','B'],
  S74:['BMA: NHS backlog data analysis','https://www.bma.org.uk/advice-and-support/nhs-delivery-and-workforce/pressures/nhs-backlog-data-analysis','B'],
  S75:['The King\'s Fund: waiting times for elective treatment','https://www.kingsfund.org.uk/insight-and-analysis/data-and-charts/waiting-times-non-urgent-treatment','B'],
  S76:['NHS England: interim commissioning guidance, tirzepatide (NICE TA1026)','https://www.england.nhs.uk/long-read/interim-commissioning-guidance-nice-ta1026-tirzepatide/','A'],
  S77:['NHS Somerset ICB: weight management and tirzepatide for clinicians','https://nhssomerset.nhs.uk/for-clinicians/weight-management-mounjaro/','B'],
  S78:['NHS England: women\'s health hubs','https://www.england.nhs.uk/long-read/womens-health-hubs/','A'],
  S79:['GOV.UK: £25 million for women\'s health hub expansion','https://gov.uk/government/news/25-million-for-womens-health-hub-expansion','A'],
  S80:['Indeed: general practitioner salary in Perth WA','https://au.indeed.com/career/general-practitioner/salaries/Perth-WA','C'],
  S81:['SEEK: General Practitioner salary in Perth','https://au.seek.com/career-advice/role/general-practitioner/salary/in-perth','C'],
  S82:['Alecto Australia: GP salary in Australia (a recruiter)','https://www.alectoaustralia.com/gp-jobs-australia/gp-salary-australia/','C'],
  S83:['Institute for Government: Performance Tracker 2025, general practice','https://www.instituteforgovernment.org.uk/publication/performance-tracker-2025/nhs/general-practice','B'],
  S84:['THC Primary Care: What has changed in the PCN DES 2026/27?','https://www.thcprimarycare.co.uk/post/whats-changed-in-the-pcn-des-2026-27','B'],
  S85:['NHS England: National shared care protocols (including hydroxychloroquine for adults, 2022)','https://www.england.nhs.uk/medicines-2/regional-medicines-optimisation-committees-advice/shared-care-protocols/','A'],
  S86:['Royal College of Ophthalmologists: Hydroxychloroquine and chloroquine retinopathy, recommendations on monitoring','https://www.rcophth.ac.uk/news-views/hydroxychloroquine-and-chloroquine-retinopathy/','A'],
  S87:['ICO: a guide to subject access','https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/subject-access-requests/a-guide-to-subject-access/','A'],
  S88:['DVLA: Assessing fitness to drive, a guide for medical professionals','https://www.gov.uk/government/publications/assessing-fitness-to-drive-a-guide-for-medical-professionals','A'],
  S89:['GMC: Confidentiality, patients\' fitness to drive and reporting concerns to the DVLA or DVA','https://www.gmc-uk.org/professional-standards/the-professional-standards/confidentiality---patients-fitness-to-drive-and-reporting-concerns-to-the-dvla-or-dva','A'],
  S90:['Home Office: Firearms licensing, statutory guidance for police','https://www.gov.uk/government/publications/statutory-guidance-for-police-on-firearms-licensing','A'],
  S91:['CQC: GP mythbuster 32, duty of candour and general practice','https://www.cqc.org.uk/guidance-providers/gps/gp-mythbusters/gp-mythbuster-32-duty-candour-general-practice-regulation-20','A'],
  S92:['GOV.UK: Awaab\'s Law, guidance for social landlords','https://www.gov.uk/government/publications/awaabs-law-guidance-for-social-landlords/awaabs-law-guidance-for-social-landlords-timeframes-for-repairs-in-the-social-rented-sector','A'],
  S93:['NHS England: Freedom to Speak Up policy and access to a guardian for primary care workers','https://www.england.nhs.uk/long-read/adoption-of-the-national-freedom-to-speak-up-policy-and-access-to-a-guardian-for-primary-care-workers/','A'],
  S95:['National Audit Office: Investigation, clinical correspondence handling at NHS Shared Business Services','https://www.nao.org.uk/reports/investigation-clinical-correspondence-handling-at-nhs-shared-business-services/','A'],
  S96:['Pulse: How undelivered hospital letters have caused chaos for GPs','https://www.pulsetoday.co.uk/analysis/special-investigations/youve-not-got-mail/how-undelivered-hospital-letters-have-caused-chaos-for-gps/','B'],
  S97:['Pulse: Hospital trust fails to send over 50,000 patient letters to GPs due to IT fault','https://www.pulsetoday.co.uk/news/breaking-news/hospital-trust-fails-to-send-over-50000-patient-letters-to-gps-due-to-it-fault/','B'],
  S94:['NHS England Digital: Appointments in General Practice','https://digital.nhs.uk/data-and-information/publications/statistical/appointments-in-general-practice','A'],
  S44:['Medics Money: cost of buying into a partnership','https://medicsmoney.co.uk/how-much-does-it-cost-to-buy-into-a-gp-partnership/','C'],
  S45:['CQC: GP mythbusters','https://www.cqc.org.uk/guidance-regulation/gps/gp-mythbusters','A'],
  S46:['CQC: GP mythbuster 1, emergency care in general practice','https://www.cqc.org.uk/guidance-providers/gps/gp-mythbusters/gp-mythbuster-1-emergency-care-general-practice','A'],
  S47:['CQC: GP mythbuster 6, privacy curtains','https://www.cqc.org.uk/guidance-providers/gps/gp-mythbuster-6-guidance-about-privacy-curtains','A'],
  S48:['CQC: Nigel\'s surgery 5, carpets in GP practices','https://www.cqc.org.uk/guidance-providers/gps/nigels-surgery-5-carpets-gp-practices','A'],
  S49:['CQC: GP mythbuster 17, vaccine storage and fridges','https://www.cqc.org.uk/guidance-providers/gps/gp-mythbusters/gp-mythbuster-17-vaccine-storage-fridges-gp-practices','A'],
  S50:['CQC: GP mythbuster 27, legionella','https://www.cqc.org.uk/guidance-providers/gps/gp-mythbusters/gp-mythbuster-27-legionella','A'],
  S51:['CQC: GP mythbuster 2, DBS checks','https://www.cqc.org.uk/guidance-regulation/gps/gp-mythbusters/gp-mythbuster-2-who-should-have-disclosure-barring-service-dbs-check','A'],
  S52:['GPonline: GPs demand end to "culture of fear" around CQC inspections','https://www.gponline.com/gps-demand-end-culture-fear-around-cqc-inspections/article/1709862','B'],
  S53:['Pulse: practice overturns CQC rating','https://www.pulsetoday.co.uk/news/regulation/practice-overturns-cqc-rating-despite-its-concerns-being-dismissed-by-chief-inspector/','B'],
  S54:['CQC: GP mythbuster 99, infection prevention and control','https://www.cqc.org.uk/guidance-regulation/gps/gp-mythbusters/gp-mythbuster-99-infection-prevention-control-general-practice','A'],
  S55:['CQC: GP mythbuster 15, chaperones','https://www.cqc.org.uk/guidance-providers/gps/gp-mythbusters/gp-mythbuster-15-chaperones','A'],
  S56:['Mycobacterium marinum in fish and people: a review','https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6831007/','A'],
  S57:['Child Accident Prevention Trust: blind cords','https://capt.org.uk/blind-cords/','B']
};

/* ---------------- glossary ---------------- */
const GLOSSARY = [
  ['Global sum','The core payment for essential services: £130.07 per weighted patient a year in 2026/27, paid monthly. Practices that opt out of out-of-hours care lose 4.7%.',['S2','S3']],
  ['Weighted list (Carr-Hill)','Your list adjusted for need: age, sex, care-home residence (1.43x), new registration (1.46x for a year), rurality and staff costs. The global sum is paid on this, not on headcount.',['S3']],
  ['QOF','The Quality and Outcomes Framework. 582 points in 2026/27, each worth £227.95 for an average-sized practice, scaled for list size and disease prevalence.',['S3']],
  ['Aspiration payment','80% of last year\'s QOF value, paid monthly during the year. The balance for what you actually achieved is due by the end of the following June. Under-achieve and you pay some back.',['S3']],
  ['ARRS','The Additional Roles Reimbursement Scheme. Each PCN gets a budget of £27.668 per weighted patient a year (2026/27) and claims back the pay of pharmacists, physios, paramedics, care coordinators and others, up to a maximum for each role. From 2026/27 GPs can be claimed too, up to £152,900 a year with on-costs. Staff beyond the budget are paid for by the practices. The practice still has to find the room and the supervision.',['S4','S84']],
  ['PCN','Primary Care Network: a group of neighbouring practices working together under the Network Contract DES. Practices get £1.761 per weighted patient for taking part.',['S4']],
  ['ICB','Integrated Care Board: the NHS body that commissions and pays practices in your area, and issues remedial and breach notices.',[]],
  ['CQC','The Care Quality Commission, which inspects and rates practices on five questions: safe, effective, caring, responsive and well-led. About 5% of practices are rated Requires Improvement or Inadequate.',['S33']],
  ['LMC','Local Medical Committee: the local body that represents GPs and practices.',[]],
  ['Drawings','Money partners take each month on account of profit. Drawings aren\'t profits: at year end the accountant works out each share and settles the difference.',['S23']],
  ['Unlimited liability','Partners are jointly and severally liable for the practice\'s debts, including leases, loans and redundancy costs. Your house is on the line, in theory.',['S23','S43']],
  ['Last partner standing','If everyone else leaves, the remaining partner holds every lease, contract and debt alone. Deeds try to prevent it, for example with six months between leaving dates.',['S23','S43']],
  ['Partner pension','Partners pay their own member contribution (up to 12.5%) and the 14.38% employer share on NHS pensionable profit. It buys a defined-benefit pension.',['S22','S23']],
  ['Self Assessment','Partners pay income tax and Class 4 NI on 31 January and 31 July, with 50% payments on account. A new partner\'s first bill can land about 22 months after joining, all at once.',['S21','S23']],
  ['Employer NI','15% on each employee\'s pay above £5,000. Most employers get an Employment Allowance to offset it; practices doing mostly NHS work can\'t claim it.',['S19','S20']],
  ['Practice-level GP scheme','2026/27 money for extra GP sessions: £4.57 per patient, claimed at up to £78.41 an hour.',['S5']],
  ['Locum','A self-employed GP booked by the session. Typical in-hours rates are £85 to £105 an hour, and the practice adds 14.38% employer pension on NHS work.',['S28','S22']],
  ['Enhanced access','PCN evening and Saturday appointments: 60 minutes per 1,000 patients a week.',['S4']],
  ['Pharmacy First','Community pharmacies treat seven common conditions without a GP: sinusitis, sore throat, earache, infected insect bites, impetigo, shingles and uncomplicated UTIs in women.',[]],
  ['Online access rules','From 2026/27, practices can\'t cap online requests. Urgent needs are handled the same day and non-urgent ones by the end of the next working day. No "call back tomorrow".',['S1']],
  ['Safe working','BMA guidance puts a safe number of patient contacts at 25 per GP per day.',['S38']],
  ['Notional rent','For partner-owned buildings the NHS reimburses a rent set by a valuer, reviewed every three years.',['S30']],
  ['State-backed indemnity (CNSGP)','Covers NHS clinical negligence claims. It doesn\'t cover GMC cases, inquests or complaints, so GPs still pay a defence organisation.',['S40']],
  ['Significant event analysis','A structured, blame-free review of something that went wrong or nearly did, and what changes as a result.',[]],
  ['GP mythbusters','CQC\'s own series of over a hundred short guides saying what inspectors do and don\'t expect, written because practices kept doing expensive things nobody required.',['S45']],
  ['Risk assessment','A written record of a hazard, who it could harm and what you do about it. CQC often accepts a reasoned risk assessment where a practice has chosen not to do something, such as stocking a particular emergency drug.',['S45','S46']],
  ['Factual accuracy check','Before a CQC report is published the practice gets a draft and can challenge factual errors, with evidence.',['S53']],
  ['EPS and FP10','The Electronic Prescription Service sends prescriptions straight to the patient\'s chosen pharmacy. When it or the clinical system is down, prescriptions go on paper FP10 forms, signed in ink.',['S61']],
  ['Medicine shortages','The Department of Health issues Medicine Supply Notifications with advice on alternatives, and for serious shortages a Serious Shortage Protocol, which lets pharmacists supply a set alternative without a new prescription.',['S63','S64']],
  ['LCS','A locally commissioned service: extra work an ICB pays practices to do, such as community dermatology or weight management. Where there isn\'t one, the work often arrives anyway, unfunded.',[]],
  ['Suspected cancer referral','An urgent referral when cancer is a possibility. It used to be called the two-week wait.',[]]
];
