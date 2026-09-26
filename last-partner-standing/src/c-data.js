/* ===================== DATA: world, roles, cast ===================== */
const MONTHS = ['April','May','June','July','August','September','October','November','December','January','February','March'];
const MON3 = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
// demand multiplier through the QOF year (winter bites from November)
const SEASON = [0.95,0.95,0.93,0.9,0.86,0.99,1.04,1.1,1.16,1.19,1.1,1.03];
const FLU_INCOME = [0,0,0,0,0,3,6,4,2,0,0,0];
const WEEKS = 4.33;
const OVERDRAFT = -40; // £k: below this the bank pulls the plug
const RESERVE = 25; // £k working capital kept back at year end

const PRACTICES = {
  suburb:{
    key:'suburb',label:'Leafy suburb',diff:'Gentle',surgery:'Oakfield Surgery',place:'Little Oakfield',paper:'The Oakfield Courier',
    blurb:'Healthy, wealthy and extremely well-informed. They have read the NICE guidance. All of it.',
    list:7200,cash:70,st:{patients:58,team:64,you:74,safety:62},demandRate:0.089,inboxRate:0.05,gsRate:0.0101,qofValue:112,qofEase:1.08,
    hire:1.1,rooms:10,premises:11,other:4,overhead:0,
    staff:{recep:5,nurse:2,hca:1,salaried:1,pharm:0,physio:0,para:0,mhp:0,cc:0,sp:0,gpa:0}
  },
  town:{
    key:'town',label:'Market town',diff:'Standard',surgery:'Riverside Surgery',place:'Bramleigh',paper:'The Bramleigh Bugle',
    blurb:'A proper mix: farms, a new estate, a care home and one very active local Facebook group.',
    list:8200,cash:45,st:{patients:52,team:56,you:68,safety:55},demandRate:0.093,inboxRate:0.048,gsRate:0.0102,qofValue:125,qofEase:1.0,
    hire:1.0,rooms:10,premises:16,other:2,overhead:0,
    staff:{recep:6,nurse:2,hca:1,salaried:1,pharm:1,physio:0,para:0,mhp:0,cc:0,sp:0,gpa:0}
  },
  city:{
    key:'city',label:'Inner city',diff:'Brutal',surgery:'Canal Street Medical Centre',place:'Hollowbrook',paper:'The Hollowbrook Herald',
    blurb:'High need, high turnover, twenty-six languages, one interpreter line with a 40-minute hold.',
    list:10400,cash:25,st:{patients:44,team:50,you:64,safety:50},demandRate:0.1,inboxRate:0.046,gsRate:0.0103,qofValue:150,qofEase:0.88,
    hire:0.9,rooms:11,premises:19,other:1,overhead:6,
    staff:{recep:7,nurse:2,hca:2,salaried:2,pharm:1,physio:0,para:1,mhp:0,cc:0,sp:0,gpa:0}
  }
};

// cost in £k per month. cap = appointments per week. clear = inbox items cleared per week.
const ROLES = {
  recep:{name:'Receptionist',cost:2.1,hire:0.8,desc:'Takes the 8am calls. Absorbs the abuse. Knows everyone\'s nan.'},
  nurse:{name:'Practice nurse',cost:4.2,cap:104,qof:1.2,room:1,hire:0.4,desc:'Chronic disease reviews, smears, imms. Your QOF engine.'},
  hca:{name:'Healthcare assistant',cost:2.6,cap:120,qof:0.8,room:1,hire:0.6,desc:'Bloods, BPs, ECGs, health checks.'},
  salaried:{name:'Salaried GP',cost:8.6,cap:84,clear:50,room:1,hire:0.4,desc:'Six sessions a week. Does not have to care about the overdraft.'},
  pharm:{name:'Clinical pharmacist',arrs:1,sup:1,cost:0.35,cap:60,clear:40,qof:0.8,room:1,hire:0.65,desc:'Med reviews, scripts, and queries about the queries.'},
  physio:{name:'First contact physio',arrs:1,sup:1,cost:0.35,cap:80,room:1,hire:0.6,desc:'Backs, knees and shoulders, straight to the right person.'},
  para:{name:'Paramedic',arrs:1,sup:1,cost:0.35,cap:55,room:1,hire:0.5,desc:'Home visits and same-day minor illness.'},
  mhp:{name:'Mental health practitioner',arrs:1,sup:1,cost:0.35,cap:40,room:1,hire:0.45,desc:'Longer appointments for the patients who need them most.'},
  cc:{name:'Care coordinator',arrs:1,cost:0.35,qof:2,hire:0.75,desc:'Recalls, care plans, chasing. QOF loves them.'},
  sp:{name:'Social prescriber',arrs:1,cost:0.35,demand:-2,hire:0.75,desc:'Loneliness, debt, housing. Fewer frequent attenders.'},
  gpa:{name:'GP assistant',arrs:1,cost:0.35,clear:80,hire:0.7,desc:'Codes letters, preps results, tames the inbox.'}
};
const ROLE_ORDER = ['salaried','nurse','hca','recep','pharm','physio','para','mhp','cc','sp','gpa'];
const ARRS_CAP = 6;

const PARTNERS0 = {
  hartley:{name:'Dr Alan Hartley',short:'Alan',clin:6,capital:35},
  okoye:{name:'Dr Nadia Okoye',short:'Nadia',clin:5,capital:25},
  tom:{name:'Dr Tom Reeves',short:'Tom',clin:6,capital:10},
  priya:{name:'Dr Priya Nair',short:'Priya',clin:6,capital:12}
};
const DRAW = {low:7.5,std:9,high:11};

const PROJECTS = [
  {id:'none',name:'Keep the lights on',desc:'No project this month. Breathe.',fx:{you:2}},
  {id:'qof',name:'QOF recall blitz',desc:'Texts, letters, a Saturday clinic. QOF up, overtime costs.',fx:{qof:5,team:-2,cash:-1.2}},
  {id:'cqc',name:'Mock CQC inspection',desc:'Policies updated, fridge logs found, fire marshals named.',fx:{safety:8,team:-2}},
  {id:'wellbeing',name:'Team afternoon off',desc:'Close for a protected learning afternoon. Pizza is involved.',fx:{team:8,patients:-2,cash:-0.6}},
  {id:'inbox',name:'Workflow overhaul',desc:'Train the admin team to code letters. The backlog shrinks.',fx:{inbox:-170,cash:-1.5,team:-1}},
  {id:'ppg',name:'Patient participation group',desc:'Tea, biscuits, and feedback. So much feedback.',fx:{patients:5,you:-1}},
  {id:'claims',name:'Chase unclaimed income',desc:'Audit the enhanced service claims. Money is hiding in there.',fx:{cash:6}},
  {id:'recruit',name:'Recruitment drive',desc:'Adverts, socials, a stall at the training scheme. Better odds for every vacancy.',fx:{cash:-1},hireBoost:0.3},
  {id:'digital',once:1,name:'Tidy the online front door',desc:'Better request forms, fewer "cough (3 years)". Demand eases a little for good.',fx:{demand:-1.5,team:-1,cash:-0.8}},
  {id:'telephony',once:1,name:'Cloud telephony go-live',desc:'Queue position, call-backs, no more engaged tone.',fx:{patients:6,team:3,cash:-4,demand:-1},need:'telephony'}
];

// people who turn up on cards
const CAST = {
  bev:{name:'Bev Marsh',role:'Practice Manager, 31 years and counting',m:'BM',c:'#A65E1F'},
  hartley:{name:'Dr Alan Hartley',role:'Senior Partner',m:'AH',c:'#46688A'},
  okoye:{name:'Dr Nadia Okoye',role:'Partner',m:'NO',c:'#76468F'},
  tom:{name:'Dr Tom Reeves',role:'Salaried GP',m:'TR',c:'#2B7A72'},
  maureen:{name:'Maureen Kelly',role:'Lead Practice Nurse',m:'MK',c:'#9E3A46'},
  kayleigh:{name:'Kayleigh Dunn',role:'Receptionist',m:'KD',c:'#C9731F'},
  raj:{name:'Raj Mistry',role:'Clinical Pharmacist',m:'RM',c:'#3A7535'},
  pratt:{name:'Mr Derek Pratt',role:'Patient. Prolific correspondent.',m:'DP',c:'#666B70'},
  higgins:{name:'Mrs Edna Higgins',role:'Patient, 84',m:'EH',c:'#B55C80'},
  icb:{name:'Jonathan Price',role:'ICB Primary Care Commissioning',m:'JP',c:'#314559'},
  pcn:{name:'Dr Clare Fenwick',role:'PCN Clinical Director',m:'CF',c:'#1C8068'},
  cqc:{name:'Patricia Sharpe',role:'CQC Inspector',m:'PS',c:'#232C3B'},
  paper:{name:'',role:'Local newspaper',m:'NEWS',c:'#7E6334'},
  landlord:{name:'Property Services',role:'Your landlord, allegedly',m:'PS',c:'#57493A'},
  lmc:{name:'Dr Steve Morgan',role:'LMC Secretary',m:'SM',c:'#5E54B8'},
  accountant:{name:'Neville Crump',role:'Specialist Medical Accountant',m:'NC',c:'#4F6530'},
  home:{name:'Home',role:'The people who live with you',m:'♥',c:'#C98F12'},
  you:{name:'You',role:'Inner monologue',m:'ME',c:'#1D6A4D'},
  apex:{name:'Apex Primary Care Ltd',role:'"Delivering scalable care solutions"',m:'APX',c:'#0E7490'},
  reg:{name:'Dr Ellie Chen',role:'GP Registrar (ST3)',m:'EC',c:'#914A8B'},
  patient:{name:'Online consultation',role:'Submitted 07:59',m:'OC',c:'#5A7684'},
  cat:{name:'QOF',role:'Car park cat. Unregistered.',m:'Q',c:'#B87433'},
  dept:{name:'The Department',role:'Announced on the radio first',m:'DoH',c:'#383D56'},
  hospital:{name:'St Swithin\'s Hospital',role:'Acute Trust',m:'SSH',c:'#684838'},
  chemist:{name:'Ashok Patel',role:'Community Pharmacist',m:'AP',c:'#2A8054'},
  rep:{name:'Chad',role:'Pharmaceutical representative',m:'CH',c:'#B5382B'},
  agency:{name:'Locum agency',role:'"Solutions for every rota gap"',m:'LA',c:'#72807F'},
  mp:{name:'Sir Geoffrey Pomfrey MP',role:'Your local MP',m:'GP',c:'#4A1D78'},
  bank:{name:'The bank',role:'Business Banking Team',m:'£',c:'#2A3B4D'},
  med:{name:'Oliver',role:'Third-year medical student',m:'OL',c:'#3E7CA8'},
  it:{name:'IT Helpdesk',role:'Ticket #448213',m:'IT',c:'#4B5563'}
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

/* ---------------- Docman Dash items ---------------- */
// a = accepted bins. file / action / urgent / bounce
const DOCS = [
  {k:'Blood result',f:'Pathology',b:'Potassium 6.8 mmol/L, sample not haemolysed. Mr D, 71, on ramipril and spironolactone.',a:['urgent'],w:'Hyperkalaemia on an ACE inhibitor and spironolactone: same-day action.'},
  {k:'Blood result',f:'Pathology',b:'Haemoglobin 68 g/L. Six months ago: 128 g/L.',a:['urgent'],w:'A 60 g/L drop needs same-day contact.'},
  {k:'Blood result',f:'Pathology',b:'Sodium 119 mmol/L. Carer reports she is "a bit muddled".',a:['urgent'],w:'Severe symptomatic hyponatraemia: same day.'},
  {k:'Anticoagulation',f:'Pathology',b:'INR 8.2 on warfarin. Target 2.5. No bleeding reported.',a:['urgent'],w:'INR above 8: withhold warfarin and consider vitamin K today.'},
  {k:'Blood result',f:'Pathology',b:'Adjusted calcium 3.2 mmol/L. Thirsty and constipated.',a:['urgent'],w:'Symptomatic hypercalcaemia: same-day assessment.'},
  {k:'Blood result',f:'Pathology',b:'Platelets 18 x10^9/L. New bruising on legs.',a:['urgent'],w:'Severe thrombocytopenia with bruising: same day.'},
  {k:'Blood result',f:'Pathology',b:'eGFR 24. Two weeks ago: 61. Started naproxen last week, already on ramipril.',a:['urgent'],w:'Acute kidney injury on an NSAID and ACE inhibitor.'},
  {k:'111 report',f:'NHS 111',b:'Disposition: "Contact GP practice within 1 hour." Call time: Friday 23:52.',a:['urgent','action'],w:'It is Monday. Ring them now.'},
  {k:'Blood result',f:'Pathology',b:'Full blood count: all parameters within normal range.',a:['file'],w:'Normal. File it.'},
  {k:'Blood result',f:'Pathology',b:'TSH 1.9 mU/L on levothyroxine 100 micrograms. Stable.',a:['file'],w:'On target. File it.'},
  {k:'Clinic letter',f:'Dermatology',b:'Seborrhoeic keratosis. Reassured. Discharged.',a:['file'],w:'Benign and discharged. File it.'},
  {k:'Screening',f:'Cervical screening',b:'HPV negative. Routine recall.',a:['file'],w:'Nothing to do. File it.'},
  {k:'Discharge',f:'MSK Physiotherapy',b:'Goals met. Discharged with home exercise programme.',a:['file'],w:'File it.'},
  {k:'OOH report',f:'Out of hours',b:'Sore throat, FeverPAIN 1. Advised fluids and paracetamol.',a:['file'],w:'Handled well. File it.'},
  {k:'Pharmacy First',f:'Community pharmacy',b:'Uncomplicated UTI, woman aged 34. Nitrofurantoin supplied.',a:['file'],w:'Handled in the community. File it.'},
  {k:'Screening',f:'Breast screening',b:'No evidence of cancer. Routine recall in 3 years.',a:['file'],w:'File it.'},
  {k:'Blood result',f:'Pathology',b:'CRP 3 mg/L. LFTs normal.',a:['file'],w:'Normal. File it.'},
  {k:'Clinic letter',f:'Cardiology',b:'We have referred her directly to the heart failure nurses. No action for the GP.',a:['file'],w:'A hospital doing its own onward referral. Frame it.'},
  {k:'Discharge summary',f:'St Swithin\'s',b:'New AF. Apixaban 5 mg BD started. Please add to repeats and check U&E in one week.',a:['action'],w:'New medication and monitoring: action.'},
  {k:'Blood result',f:'Pathology',b:'Ferritin 6 micrograms/L. Man, 58. Hb 104.',a:['action','urgent'],w:'Iron deficiency anaemia in a man: suspected cancer pathway.'},
  {k:'Blood result',f:'Pathology',b:'PSA 11.2. Eighteen months ago: 2.9. Aged 66.',a:['action','urgent'],w:'Rising PSA: suspected cancer referral.'},
  {k:'FIT result',f:'Bowel pathway',b:'Faecal immunochemical test: 180 micrograms Hb/g faeces.',a:['action','urgent'],w:'FIT of 10 or more: urgent suspected lower GI cancer referral.'},
  {k:'Microbiology',f:'Pathology',b:'Urine: E. coli, resistant to trimethoprim. Trimethoprim prescribed yesterday.',a:['action'],w:'Wrong antibiotic: switch it.'},
  {k:'Clinic letter',f:'Psychiatry',b:'Started sertraline 50 mg OD. Please continue on repeat.',a:['action'],w:'Add to repeats: action.'},
  {k:'Request',f:'DVLA',b:'Medical questionnaire, Group 2 licence. Reply within 21 days.',a:['action'],w:'Paperwork, but yours: action.'},
  {k:'Request',f:'Coroner\'s Office',b:'Request for a statement regarding the late Mr F.',a:['action'],w:'Statutory. Action.'},
  {k:'Blood result',f:'Pathology',b:'HbA1c 97 mmol/mol. New. Aged 45. No symptoms documented.',a:['action','urgent'],w:'New diabetes: needs prompt review.'},
  {k:'Clinic letter',f:'Orthopaedics',b:'Please could the GP arrange an MRI lumbar spine and re-refer if abnormal.',a:['bounce'],w:'Their test, their job. Bounce it.'},
  {k:'Clinic letter',f:'Rheumatology',b:'Please refer to orthopaedics regarding her knee.',a:['bounce'],w:'Consultant-to-consultant referral is the hospital\'s job.'},
  {k:'Clinic letter',f:'General Surgery',b:'Please could the GP chase the CT result we requested.',a:['bounce'],w:'They ordered it. They chase it.'},
  {k:'Letter',f:'St Mary\'s Primary School',b:'Please provide a letter confirming Jayden had a cold on Tuesday.',a:['bounce'],w:'Schools should not need GP evidence for a cold.'},
  {k:'Letter',f:'PowerHouse Gym',b:'Please confirm Mr B is medically fit for spin classes.',a:['bounce'],w:'Not NHS work. Bounce it, or charge for it.'},
  {k:'Request',f:'Private ADHD clinic',b:'Please take over prescribing of lisdexamfetamine. No shared care agreement enclosed.',a:['bounce'],w:'No agreement, no shared care. Bounce it.'},
  {k:'Clinic letter',f:'Gastroenterology',b:'Did not attend for the third time. Discharged back to GP.',a:['file','action'],w:'File it, or a gentle nudge.'}
];

/* ---------------- 8am Rush triage items ---------------- */
// 999 / gp (same day) / routine / pharm (Pharmacy First, self-care) / physio
const TRIAGE = [
  {b:'Crushing chest pain for 20 minutes, going into my left arm. Sweaty and feel sick.',a:['999'],w:'Possible heart attack: 999.'},
  {b:'Dad\'s face has dropped on one side and his words are slurred. Started half an hour ago.',a:['999'],w:'FAST positive: 999.'},
  {b:'My lips are swelling and I\'m struggling to breathe after a satay.',a:['999'],w:'Anaphylaxis: 999.'},
  {b:'My 2-year-old has a fever, is floppy, and has a rash that doesn\'t fade under a glass.',a:['999'],w:'Non-blanching rash in a febrile child: 999.'},
  {b:'Sudden headache, worst of my life, like being hit with a bat.',a:['999'],w:'Thunderclap headache: 999.'},
  {b:'Vomiting blood, quite a lot, and I feel faint when I stand up.',a:['999'],w:'Upper GI bleed with symptoms: 999.'},
  {b:'My 18-month-old has had a temperature of 39 for two days and isn\'t drinking much.',a:['gp'],w:'Febrile toddler, poor intake: see today.'},
  {b:'Left calf is swollen and sore. Flew back from Sydney three days ago.',a:['gp'],w:'Possible DVT: same-day assessment.'},
  {b:'I\'ve been feeling hopeless and I\'ve started planning how I would end my life.',a:['gp','999'],w:'Active suicidal plans: urgent same-day contact.'},
  {b:'Burning when I wee, fever and pain in my back. I\'m a 45-year-old man.',a:['gp'],w:'Male UTI with fever: not a Pharmacy First case.'},
  {b:'Asthma worse over two days. Blue inhaler not lasting four hours.',a:['gp'],w:'Worsening asthma: same-day review.'},
  {b:'Can I book my asthma review? Last one was 2022.',a:['routine'],w:'Routine review.'},
  {b:'Blood pressure was 152/96 at the pharmacy. I feel fine.',a:['routine'],w:'Routine: home readings and review.'},
  {b:'I\'d like to talk about starting HRT.',a:['routine'],w:'Routine appointment.'},
  {b:'Cough for five weeks. I\'m 64 and smoked for forty years.',a:['routine','gp'],w:'Needs a prompt appointment and chest X-ray.'},
  {b:'My friend got Mounjaro. I want it too.',a:['routine'],w:'Routine, and a conversation about eligibility.'},
  {b:'The mole on my back has changed shape and got darker.',a:['routine','gp'],w:'Needs a prompt look: possible urgent referral.'},
  {b:'Sore throat for three days. No other problems.',a:['pharm'],w:'Pharmacy First.'},
  {b:'Burning when I wee. I\'m 29, not pregnant, no fever.',a:['pharm'],w:'Pharmacy First: uncomplicated UTI.'},
  {b:'My 4-year-old has had earache since yesterday. Otherwise well.',a:['pharm'],w:'Pharmacy First covers acute otitis media, ages 1 to 17.'},
  {b:'Hay fever is ruining my life.',a:['pharm'],w:'Pharmacy, self-care.'},
  {b:'I need the morning-after pill today.',a:['pharm','gp'],w:'Community pharmacy is quickest.'},
  {b:'Painful, blistery rash in a band on one side of my chest. I\'m 60.',a:['pharm','gp'],w:'Shingles is on the Pharmacy First list for adults.'},
  {b:'Head lice. Again.',a:['pharm'],w:'Pharmacy.'},
  {b:'Blocked nose and pain in my face for twelve days.',a:['pharm'],w:'Pharmacy First: acute sinusitis.'},
  {b:'Diarrhoea since last night\'s kebab. Keeping fluids down fine.',a:['pharm'],w:'Self-care and pharmacy advice.'},
  {b:'Lower back pain after gardening. No numbness, weeing normally.',a:['physio'],w:'No red flags: first contact physio.'},
  {b:'Knee pain for six weeks after five-a-side.',a:['physio'],w:'First contact physio.'},
  {b:'Shoulder has been stiff and sore for two months.',a:['physio'],w:'First contact physio.'},
  {b:'Tennis elbow from my new padel obsession.',a:['physio'],w:'First contact physio.'}
];
