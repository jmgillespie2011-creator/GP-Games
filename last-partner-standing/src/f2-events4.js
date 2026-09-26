/* ===================== EVENTS 4: the real calendar, crises and other endings ===================== */
const gppsPct = () => Math.round(clamp(58 + S.st.patients * 0.36 + (S.rep - 55) * 0.1, 40, 96));
const nonGpPayroll = () => ['recep','nurse','hca'].reduce((a, r) => a + ROLES[r].cost * S.staff[r], 0) + S.list * CORE_ADMIN;

EVENTS.push(
/* ---------- the calendar (scheduled) ---------- */
{id:'contract_2026',arc:1,who:'dept',title:'Contract day',tag:'real',src:['S1','S2','S25'],
 info:'The 2026/27 contract is worth £13.9bn, up 3.6% in cash terms. The global sum rose 5.5% to £130.07 per weighted patient, and practices can no longer cap online requests. GPs rejected the changes by 98.9% in a BMA referendum; the dispute began in October 2025 and formal talks were agreed in September 2026.',
 text:`1st April 2026. The new contract has landed. Global sum up 5.5% to £130.07 per weighted patient. Online requests can no longer be capped. Of the GPs who voted in the BMA's referendum, 98.9% rejected it.`,
 choices:[
  {t:'Shrug. It\'s imposed anyway.',fx:{you:-1},o:`You print the summary and file it under "things that happen to us".`},
  {t:'Back the BMA\'s dispute',fx:{team:3,icb:-4,flags:{bma:1}},o:`You sign the practice up to the campaign. The ICB notes it. The team likes that someone is saying something.`}
 ]},

{id:'pay_award',arc:1,who:'bev',title:'The pay awards',tag:'real',src:['S2','S15','S17'],
 info:'In 2026/27 doctors got 3.5% (DDRB) and Agenda for Change staff 3.3%. Salaried GPs on the model contract follow the doctors\' award. Practice staff aren\'t on Agenda for Change, and a third of practice nurses got no rise the year before. Every rise also costs 15% employer NI and, for pension members, 14.38% employer pension.',
 text:()=>`The pay awards are in: 3.5% for doctors and 3.3% for Agenda for Change staff. Your salaried GP's contract follows the doctors' award. The rest of your staff aren't on Agenda for Change, but they've noticed. Matching it costs about £${Math.round((nonGpPayroll()*0.033+ROLES.salaried.cost*S.staff.salaried*0.035)*1000).toLocaleString('en-GB')} a month.`,
 choices:[
  {t:'Match both awards',fx:{team:5,aim:{team:3}},run(){ S.payX+=nonGpPayroll()*0.033+ROLES.salaried.cost*S.staff.salaried*0.035; },o:`Everyone gets their rise in the June payroll, with arrears. People say thank you in the corridor.`},
  {t:'Doctors\' award, 2% for everyone else',fx:{team:-3},run(){ S.payX+=nonGpPayroll()*0.02+ROLES.salaried.cost*S.staff.salaried*0.035; addMod({id:'pay2',label:'Staff feel the 2% rise was a pay cut',months:6,aim:{team:-4}}); },o:`It's received with resignation, which is better than resignations. Just.`},
  {t:'Only what the contracts require',fx:{team:-7},run(){ S.payX+=ROLES.salaried.cost*S.staff.salaried*0.035; addMod({id:'pay0',label:'No pay rise for practice staff',months:9,aim:{team:-7}}); },later:[{in:3,p:0.5,fx:{staff:{nurse:-1},qof:-3},note:'Because staff got no pay rise: a practice nurse left for a Band 6 job at the hospital.'}],o:`Maureen asks to see the partners' drawings. You change the subject. She notices.`}
 ]},

{id:'survey',arc:1,who:'paper',title:'The GP Patient Survey',tag:'real',src:['S34'],
 info:'The national GP Patient Survey is published every July. In 2026, 76.7% of patients nationally described their overall experience of their practice as good, and about 57% found it easy to get through on the phone.',
 text:()=>`The GP Patient Survey is out. ${gppsPct()}% of your patients describe their overall experience as good. The national figure is 76.7%. The ${prac().paper} has made a league table.`,
 choices:[
  {t:()=>gppsPct()>=77?'Buy the team pizza':'Publish an honest action plan',fx:()=>gppsPct()>=77?{team:5,cash:-0.14}:{patients:2,rep:3,you:-2},o:()=>gppsPct()>=77?`You tell the team it's their result. It is.`:`It's specific and has dates on it. Somebody writes "LOL" on the waiting-room copy in biro. Others read it.`},
  {t:()=>gppsPct()>=77?'Put it in the newsletter':'Point out that only 84 people responded',fx:()=>gppsPct()>=77?{rep:4}:{rep:-3,you:1},o:()=>gppsPct()>=77?`Page one of the newsletter, next to the flu clinic dates.`:`Statistically you're right. Nobody cares.`}
 ]},

{id:'headline',arc:1,who:'paper',title:'The headline',tag:'real',src:['S8'],
 info:'NHS England Digital\'s 2024/25 figures: contractor GPs averaged £581,800 gross, £417,600 expenses and £164,200 income before tax. Expenses were 71.8% of the money. The median was £151,200.',
 text:`The Daily Courier: "GP PARTNERS EARN £164,200." It's the 2024/25 average, before tax and pension. The 71.8% of the money that went on staff and bills didn't make the headline.`,
 choices:[
  {t:'Post a rebuttal online',fx:{you:-3},alt:{p:0.5,fx:{you:-3,rep:-3},o:`Your thread goes viral for the wrong reasons. Someone screenshots the bit about your holiday.`},run(){ if(!S._alt) applyFx({rep:3}); },o:`Your thread explaining practice finances gets shared by 400 GPs and one surprisingly supportive journalist.`},
  {t:'Say nothing. Eat lunch.',fx:{you:2},o:`It's a good sandwich.`}
 ]},

{id:'flu_saturday',arc:1,who:'maureen',title:'Flu Saturday',tag:'real',src:['S27'],
 info:'Adult flu vaccines pay £10.06 a dose in 2026/27, the same as since 2023/24. COVID vaccines pay £8.70 a dose during the campaign. Community pharmacies compete for the same patients.',
 text:()=>{ const n=Math.round(S.list*0.058/10)*10; return `Flu season. Each adult jab pays £10.06, the same as in 2023/24. A Saturday clinic could do about ${n} jabs: £${Math.round(n*P.fluFee).toLocaleString('en-GB')} before overtime. Or the pharmacies will do them.`; },
 choices:[
  {t:'Run the Saturday clinic',fx:()=>({cash:r1(Math.round(S.list*0.058/10)*10*P.fluFee/1000-1.4),you:-4,team:-3,patients:2}),run(){ S.fluMod=1.05; },o:`Someone faints (fine). Someone brings a dog (fine). You keep your over-65s, and the flu income through the winter.`},
  {t:'Let the pharmacies have them',fx:{you:2},run(){ S.fluMod=0.75; },o:`Fewer jabs here means less vaccination income this winter.`}
 ]},

{id:'winter_phones',arc:1,who:'kayleigh',title:'December',tag:'rule',src:['S1'],
 info:'Under the 2026/27 contract, urgent needs must be dealt with on the day and non-urgent ones by the end of the next working day. Telling patients to "call back tomorrow" is no longer allowed.',
 text:`December. Flu, norovirus and the Christmas party have taken out three receptionists. The phones light up at 8:00.`,
 choices:[
  {t:'Partners on the phones',fx:{you:-8,patients:4,team:4},o:`You answer 61 calls before 10am. The team sees the partners on the phones. That matters.`},
  {t:'Recorded message: "call back tomorrow"',fx:{patients:-10,icb:-6,safety:-5},o:`That isn't allowed under the 2026/27 contract. The ICB hears about it by lunchtime.`}
 ]},

/* ---------- real rules, random ---------- */
{id:'uncapped',who:'patient',title:'Monday, 8:02am',rep:1,max:2,tag:'rule',src:['S1','S26'],
 info:'Since October 2025 online consultation tools must stay open throughout core hours, and from 2026/27 practices can\'t cap online requests. Urgent same day; non-urgent by the end of the next working day.',
 text:`Monday, 8:02am. Online requests can't be capped any more. There are 212 already. One of them just says "hello?"`,
 choices:[
  {t:'Triage every one today',fx:{you:-6,patients:4,team:-3},o:`You and the duty doctor get through all 212 by 4pm. Tuesday has 190.`},
  {t:'Non-urgent by the end of tomorrow, as the rules allow',fx:{patients:-2,you:1},o:`Urgent ones today, the rest tomorrow. It's within the rules, and it's still a lot.`}
 ]},

{id:'ni_letter',who:'accountant',title:'The NI letter',months:[0,1,2,3],tag:'real',src:['S19','S20'],
 info:'Employer NI rose to 15% on pay above £5,000 in April 2025. HMRC\'s guidance says a GP partnership doing mostly NHS work can\'t claim the Employment Allowance that offsets NI for most small employers.',
 text:`Neville: "Employer NI is 15% on pay above £5,000, and GP practices can't claim the Employment Allowance. That's about £806 a year more for every £25,000 receptionist than before April 2025."`,
 choices:[
  {t:'Freeze a reception vacancy',need:()=>S.staff.recep>3,why:'Reception is already too thin',fx:{team:-4,patients:-2,staff:{recep:-1}},o:`One fewer receptionist: about £2,500 a month saved. The 8am queue gets longer.`},
  {t:'Absorb it',fx:{you:-1},o:`It's already in your staff costs. It just has a name now.`}
 ]},

{id:'nlw_gap',who:'kayleigh',title:'Thirty pence',months:[1,2,3,4,5,6],tag:'real',src:['S18'],
 info:'The National Living Wage rose to £12.71 an hour in April 2026. Many practices pay reception close to it, so long-serving staff can end up earning barely more than new starters.',
 text:`The National Living Wage is now £12.71 an hour. Sandra has worked on reception for 14 years. She now earns 30p an hour more than the new starter she's training.`,
 choices:[
  {t:'Restore the gap for experienced staff (~£6,000 a year)',fx:{team:6,aim:{team:2}},run(){ S.payX+=0.5; },o:`Sandra says nothing, then brings in a lemon drizzle cake. Message received.`},
  {t:'Can\'t afford it',fx:{team:-6},run(){ addMod({id:'nlw',label:'Experience isn\'t paid',months:4,aim:{team:-3}}); },o:`Sandra keeps training the new starter. With slightly less enthusiasm.`}
 ]},

{id:'scheme_pot',who:'ward',title:'The GP who can\'t find a job',months:[1,2,3,4,5,6,7,8],tag:'real',src:['S5','S11'],
 info:'In 2026 about 15% of GPs said they couldn\'t find suitable GP work, while practices struggled to afford them. The 2026/27 practice-level scheme pays £4.57 per patient for extra GP sessions, claimed at up to £78.41 an hour.',
 text:()=>`Dr Sam Ward qualified six months ago and still can't find a GP job. The practice-level GP scheme pays up to £78.41 an hour for extra GP sessions, from a pot of about £${(Math.round(P.plgr*weightedList()/100)*100).toLocaleString('en-GB')} a year that you haven't touched.`,
 choices:[
  {t:'Offer him two sessions a week, paid from the pot',fx:{team:3,you:2},run(){ addMod({id:'scheme',label:'Dr Ward: two scheme-funded sessions',months:99,capAdd:28}); },o:`He starts next week. The scheme covers his sessions, so the practice pays nothing, but he needs a room.`},
  {t:'Sorry, there\'s no room',fx:{you:-1},o:`He takes a job in Dubai. The pot goes unspent.`}
 ]},

{id:'bank_mandate',who:'kevin',title:'The bank mandate',months:[1,2,3,4,5,6],tag:'real',src:['S23','S39'],
 info:'Accountants warn partners never to let one person run the practice finances unchecked. Real practices have lost between £46,000 and £582,000 to fraud by trusted staff.',
 text:`Kevin has run the practice bank account on his own for nine years. The books always balance. He is very good with the payroll. One real practice lost £450,000 to its practice manager.`,
 choices:[
  {t:'Add a second signatory and monthly checks',fx:{team:-2,safety:2,flags:{dualSign:1}},o:`Kevin is a little offended. The partners now see every payment over £1,000.`},
  {t:'Trust him',fx:{},later:[{in:6,p:0.3,fx:{sched:[['fraud',0]]},note:''}],o:`You trust him. He's always been trustworthy.`}
 ]},

{id:'fraud',arc:1,who:'accountant',title:'Locum invoices',tag:'real',src:['S39'],
 text:()=>{ if(!S.flags.fraudAmt) S.flags.fraudAmt=60+Math.round(Math.random()*80); return `Neville has found £${S.flags.fraudAmt},000 of "locum invoices" paid into an account in Kevin's name. The locums don't exist.`; },
 choices:[
  {t:'Police, insurers and a full audit',fx:()=>({cash:-Math.round(S.flags.fraudAmt*0.5),you:-8,team:-4,safety:3,aim:{safety:1}}),o:`Insurance recovers half. The rest is a loss the partners share, and the audit finds nothing else. Two signatories from now on.`},
  {t:'Keep it quiet and recover what you can',fx:()=>({cash:-S.flags.fraudAmt,you:-4,safety:-3}),o:`Kevin "resigns for personal reasons". The money doesn't come back.`}
 ]},

{id:'list_cleansing',who:'icb',title:'List cleansing',months:[2,3,4,5,6,7,8,9,10],tag:'real',src:['S12','S3'],
 info:'Registers include "ghost" patients who have moved away. National list-validation work removed 118,255 patients in a single month in 2026. Each one takes their share of the global sum with them.',
 text:()=>{ const n=Math.round(S.list*0.0175); return `A list-validation sweep removes ${n} patients who moved away years ago. Your global sum falls by about £${(Math.round(n*prac().weight*P.gs*(1-P.ooh)/100)*100).toLocaleString('en-GB')} a year. Forty of them, you're fairly sure, are real.`; },
 choices:[
  {t:'Appeal the 40 you know are real',fx:{you:-3},run(){ S.list-=Math.max(0,Math.round(S.list*0.0175)-40); },o:`Three evenings of checking addresses. The 40 stay.`},
  {t:'Accept it',fx:{},run(){ S.list-=Math.round(S.list*0.0175); },o:`Your list gets smaller. Your workload doesn't notice.`}
 ]},

{id:'advice_guidance',who:'hospital',title:'Advice and guidance',rep:1,max:2,tag:'real',src:['S1','S5'],
 info:'Advice and guidance lets GPs ask a specialist before referring. In 2026/27 its funding was moved into the global sum, and the BMA has argued it shifts hospital work to practices.',
 text:`A consultant's advice-and-guidance reply: "Please arrange an MRI, bloods, and a review in three months." Advice and guidance is now part of your core contract.`,
 choices:[
  {t:'Just do it',fx:{you:-3,inbox:15},o:`MRI requested, bloods booked, recall set. Your to-do list grows by three.`},
  {t:'Send it back: their test, their request',fx:{icb:-2,you:1},o:`A polite template, citing the hospital's contract. Some come back. Some don't.`}
 ]},

{id:'merger_offer',who:'rowe',title:'Merger talks',months:[5,6,7,8,9],w:()=>activeOthers()<=1?2.5:0.7,tag:'real',src:['S8'],
 info:'Bigger practices tend to earn more per partner: in 2024/25 partners in practices of 20,000+ patients averaged £177,200, against £144,900 in practices under 5,000. Mergers bring lawyers, staff transfers and a year of meetings.',
 text:`Dr Helen Rowe from Parkside Surgery wants to merge. In 2024/25, partners in practices of 20,000+ patients averaged £177,200; under 5,000 patients, £144,900. "Economies of scale," she says. "And someone else does the rota."`,
 choices:[
  {t:'Start talks (£6,000 legal fees)',fx:{cash:-6},run(){ schedule('merger_vote',3); },o:`The lawyers are engaged. So, apparently, are you.`},
  {t:'Stay independent',fx:{team:2},o:`The team is relieved. Nobody wanted to learn a new phone system.`}
 ]},

{id:'merger_vote',arc:1,who:'rowe',title:'The merger vote',tag:'story',
 text:`Three months of lawyers, staff transfers and spreadsheets later, the partners vote on the merger.`,
 choices:[
  {t:'Vote yes',run(){ S.exit='merged'; return {o:`The vote passes. {surgery} becomes one site of a much bigger partnership.`}; }},
  {t:'Walk away',fx:{cash:-4,you:-3,team:-2},o:`Four months of fees for nothing. Dr Rowe is gracious about it, in writing.`}
 ]},

{id:'homeless',who:'jay',title:'No fixed abode',tag:'rule',
 info:'Practices can\'t refuse to register someone because they have no proof of address, identity or immigration status. People who are homeless can register using the practice address.',
 text:`Jay has been sleeping rough and asks to register. He has no proof of address and no ID. He has a cough that's lasted a month.`,
 choices:[
  {t:'Register him using the practice address',fx:{rep:3,team:2,list:1},o:`Kayleigh does it in four minutes and books him in for his cough. He comes back to say thank you.`},
  {t:'Ask for ID first',fx:{rep:-4,icb:-3,safety:-3},o:`That isn't a requirement for registration. The local homeless charity knows it, and now so does the ICB.`}
 ]},

{id:'thank_you',who:'higgins',title:'A card',rep:1,max:2,w:()=>S.st.you<45?2:0.7,tag:'story',
 text:`A card arrives from a patient you'd almost forgotten: "You noticed what everyone else missed. Thank you for my extra years."`,
 choices:[
  {t:'Pin it in the staff room',fx:{team:7},o:`Reception reads it at least once a day. It helps more than it should.`},
  {t:'Keep it in your drawer',fx:{you:9},o:`You read it on the bad days. There are a lot of bad days. It's a good card.`}
 ]},

{id:'your_bp',who:'maureen',title:'Physician, heal thyself',cond:()=>S.st.you<60,tag:'story',
 text:`Maureen checks your blood pressure at the end of her clinic: 152/96. She checks it again: 149/98. "Physician," she says, "heal thyself."`,
 choices:[
  {t:'Book a week off (locum cover about £3,800)',fx:{cash:-3.8,you:12},o:`A week of walking and sleeping. Your blood pressure is 134/84 when Maureen checks again, and she's insufferable about it.`},
  {t:'Recheck it next year',fx:{you:-3},later:[{in:3,p:0.35,fx:{you:-6},note:'You had a headache that wouldn\'t go and a nosebleed in clinic. Your own GP has started you on amlodipine and given you a stern talking-to.'}],o:`It's probably white-coat hypertension. You're the one in the white coat.`}
 ]},

{id:'weekend_admin',who:'you',title:'Saturday',rep:1,max:3,cond:()=>S.inbox>300,w:()=>S.inbox>500?2.5:1,tag:'story',
 text:`Saturday morning. {inbox} results and letters are waiting. The house is quiet. The laptop is right there.`,
 choices:[
  {t:'Do them now',fx:{you:-6,inbox:-150,safety:2},o:`By lunchtime you've cleared 150. You find one abnormal result that needed acting on. Glad you looked.`},
  {t:'Monday\'s problem',fx:{you:2,safety:-2},o:`You go to the park. The inbox waits, patiently, like a cat that wants feeding.`}
 ]},

{id:'private_reports',who:'bev',title:'Insurance reports',rep:1,max:2,tag:'real',src:['S29'],
 info:'Practices can charge for non-NHS work such as insurance reports, which typically earn £120 to £200 each. Fees vary by practice.',
 text:`Twelve insurance reports are waiting. At about £120 each that's £1,440. Each one is twelve pages.`,
 choices:[
  {t:'Do them at the weekend',fx:{cash:1.44,you:-6},o:`Twelve reports, one Sunday. The insurers are delighted. You are tired.`},
  {t:'Tell them six weeks',fx:{rep:-1,you:1},o:`The insurers chase weekly. The patients chase too.`}
 ]},

{id:'inquest',who:'coroner',title:'An inquest',months:[4,5,6,7,8,9,10,11],tag:'real',src:['S40'],
 info:'The state-backed indemnity scheme covers NHS clinical negligence, but not inquests, GMC cases or complaints. GPs still pay a medical defence organisation for those.',
 text:`The coroner asks you to give evidence at an inquest into the death of a patient you saw twice last year. The state indemnity scheme doesn't cover inquests. Your defence organisation does.`,
 choices:[
  {t:'Call your defence organisation',fx:{you:-4},o:`They help you write your statement and sit beside you on the day. The coroner finds nothing you could have done differently. It still takes weeks to shake off.`},
  {t:'Go on your own',fx:{you:-10},o:`You get through it. You'll call them next time.`}
 ]},

{id:'energy',who:'bev',title:'The energy bill',months:[6,7,8,9,10],tag:'story',
 text:`The energy bill for the quarter has doubled.`,
 choices:[
  {t:'Pay it',fx:{cash:-6},o:`Six thousand pounds for the privilege of not freezing.`},
  {t:'Heating down to 18°C',fx:{team:-5,cash:-1.5},o:`Maureen brings in a hot water bottle and a look.`}
 ]},

{id:'salaried_offer',who:'jobs',title:'A job alert',months:[4,5,6,7,8,9,10,11],cond:()=>S.st.you<40,w:3,tag:'real',src:['S8'],
 info:'Salaried GPs averaged £74,800 in 2024/25, against £164,200 for partners. Salaried GPs don\'t carry premises, staff or business liabilities.',
 text:`A job alert: salaried GP, six sessions, no premises, no payroll, no HMRC in January. Salaried GPs averaged £74,800 in 2024/25.`,
 choices:[
  {t:'Apply',run(){ S.exit='salaried'; return {o:`You get the job. You hand in your notice to your own partnership, which is a strange letter to write.`}; }},
  {t:'Delete it',fx:{you:-2},o:`You delete it. Then you check the deleted folder.`}
 ]},

{id:'emigrate',who:'jobs',title:'Sunshine',months:[6,7,8,9,10,11],cond:()=>S.st.you<28,w:3,tag:'story',
 text:`An email: "Sunshine, a clinic that shuts at 5pm, and nobody here has ever heard of QOF."`,
 choices:[
  {t:'Book the flights',run(){ S.exit='emigrated'; return {o:`You book the flights at 1am. You feel lighter than you have in years.`}; }},
  {t:'Delete it',fx:{you:-1},o:`You delete it. The sun, presumably, carries on without you.`}
 ]},

/* ---------- crises: one last chance before the game ends ---------- */
{id:'last_partner',arc:1,who:'deed',title:'Last partner standing',tag:'real',src:['S23','S43'],
 info:'Partners have unlimited, joint and several liability. When everyone else has gone, the last partner holds every lease, loan and staff contract alone. Some practices convert to a limited liability partnership to reduce this risk.',
 text:`You're the last partner standing. Every lease, loan and redundancy is now yours alone, with unlimited liability. The brass plate has one name on it.`,
 choices:[
  {t:'Hand back the contract',run(){ S.exit='handback'; return {o:`You write to the ICB. It takes one page to hand back what took a practice fifty years to build.`}; }},
  {t:'Carry on alone',fx:{you:-10,flags:{solo:1}},o:`You carry on. Bev makes you a coffee without being asked and puts it down very gently.`}
 ]},

{id:'lifeline',arc:1,who:'bank',title:'Payroll day',tag:'real',src:['S23'],
 text:()=>`Payroll is due and you're past the £${Math.abs(S.overdraft)}k overdraft limit. The bank will extend it by £60,000 if every partner signs a personal guarantee.`,
 choices:[
  {t:'Sign the personal guarantee',fx:{you:-8},alt:{p:0.15,fx:{you:-10},run(){ S.overdraft-=30; },o:`The bank's credit committee only agrees £30,000, against your house. Payroll goes out. Next month's won't unless something changes.`},run(){ if(!S._alt) S.overdraft-=60; },o:`Your signature now secures the practice overdraft against your house. Payroll goes out on time. Staff will never know.`},
  {t:'Refuse. Hand back the contract.',run(){ S.exit='handback'; return {o:`You refuse. The partnership can't pay its staff, so it hands back its contract.`}; }}
 ]},

{id:'crisis_you',arc:1,who:'home',title:'The car park',tag:'real',src:['S36'],
 info:'In the 2024 GP Worklife Survey, 37% of GPs reported a considerable or high intention to leave direct patient care within five years, rising to 55% of those over 50.',
 text:`You sat in the car park for twenty minutes before morning surgery, unable to go in. At home they've booked you an appointment with a GP. Not one at your practice.`,
 choices:[
  {t:'Take a month off (locum cover about £14,000)',fx:{cash:-14,you:30},alt:{p:0.15,fx:{cash:-14,you:14,team:-3},o:`The locum agency cancels after a week. You come back early, half-recovered, to a practice that has been running on fumes.`},o:`Your GP signs you off. You sleep for most of the first week. When you come back, the practice is still there, and so are you.`},
  {t:'Keep going',fx:{you:-3},o:`You go in. You see 34 patients. You don't remember driving home.`}
 ]},

{id:'crisis_team',arc:1,who:'bev',title:'Half the team',tag:'story',
 text:`Bev: "Half the team has been in to talk about leaving. We need to do something this week."`,
 choices:[
  {t:'Emergency 5% pay rise',fx:{team:18,aim:{team:3}},alt:{p:0.2,fx:{team:10,aim:{team:3},staff:{recep:-1}},run(){ S.payX+=nonGpPayroll()*0.05; },o:`It helps, but it's too late for one receptionist, who had already accepted a job at the council.`},run(){ if(!S._alt) S.payX+=nonGpPayroll()*0.05; },o:`It costs a lot. It also says something nobody has said out loud for a while.`},
  {t:'Away-day and a thank-you bonus (£6,000)',fx:{cash:-6,team:12},o:`A day at a hotel with bad coffee and good conversation. People stay, for now.`},
  {t:'"We\'re all in this together"',fx:{team:-6},o:`Nobody believes it, least of all you.`}
 ]},

{id:'crisis_patients',arc:1,who:'icb',title:'A remedial notice',tag:'rule',src:['S1'],
 info:'If the ICB believes a practice is breaching its contract, for example on access in core hours, it can issue a remedial notice with a deadline, then a breach notice. Repeated breaches can end the contract.',
 text:`The ICB sends a remedial notice: patients "unable to access services in core hours". You have 28 days to put it right. After that, the ICB will keep watching access month by month.`,
 after(){ S.flags.remedialAt = S.month; },
 choices:[
  {t:'Hire locums now (about £12,000 over two months)',fx:{patients:8,cash:-6,icb:4},alt:{p:()=>prac().locumMax?0.35:0.15,fx:{patients:3,cash:-6},run(){ addMod({id:'remedial',label:'Remedial locum cover (half-filled)',months:2,capAdd:42,fx:{cash:-1.5}}); },o:`The agency can only fill half the sessions. Access improves a little, and the ICB notices that it's only a little.`},run(){ if(!S._alt) addMod({id:'remedial',label:'Remedial locum cover',months:2,capAdd:84,fx:{cash:-3}}); },o:`Six extra locum sessions a week for two months. The ICB notes the improvement, and keeps monitoring.`},
  {t:'Contest the notice',fx:{icb:-10,you:-6},o:`The LMC helps you write a firm reply. The ICB is unmoved and schedules a review.`}
 ]},

{id:'breach_notice',arc:1,who:'icb',title:'A breach notice',tag:'rule',src:['S1'],
 info:'If a remedial notice doesn\'t fix the problem, the commissioner can issue a breach notice. Further breaches can lead to the contract being terminated, and the patients being moved to other practices or a caretaker provider.',
 text:`A month on, the ICB says access hasn't improved enough. This is a formal breach notice. If patients still can't get through for three months running, the ICB can end the contract.`,
 after(){ S.flags.breachAt = S.month; },
 choices:[
  {t:'Emergency access plan: locums, extended hours, partners on the phones (£10,000)',fx:{patients:4,cash:-10,you:-8,team:-3},run(){ addMod({id:'breach',label:'Emergency access plan',months:2,capAdd:40,hours:4}); },o:`Every spare session goes into same-day access. It's exhausting. It might be enough.`},
  {t:'Ask the LMC to negotiate more time',fx:{you:-3,icb:-2},alt:{p:0.5,fx:{you:-3,icb:-4},o:`The ICB won't move. The clock is still running.`},run(){ if(!S._alt) S.flags.lowAccess = 0; },o:`The LMC gets the clock reset: a fresh three months to show improvement.`},
  {t:'Start talks with neighbouring practices about handing over the list',run(){ S.exit='handback'; return {o:`You start the conversation nobody wants to have. By the spring, your patients are spread across three other practices.`}; }}
 ]},

{id:'crisis_safety',arc:1,who:'cqc',title:'Tomorrow',tag:'story',
 text:`CQC has received several concerns about the practice. An inspector is coming tomorrow.`,
 choices:[
  {t:'Cancel non-urgent clinics and prepare',fx:{safety:8,you:-6,patients:-3},run(){ schedule('cqc_urgent',0); },o:`A long night of logs, policies and checklists.`},
  {t:'Let them see it as it is',fx:{},run(){ schedule('cqc_urgent',0); },o:`You go home at a normal time, which in itself feels like a statement.`}
 ]},

{id:'cqc_urgent',arc:1,who:'cqc',title:'Unannounced',tag:'rule',src:['S33'],
 text:`Patricia Sharpe arrives at 8:29 with a clipboard. This time it isn't planned, and she knows exactly which files she wants to see.`,
 choices:[{t:'Show her what she asks for',run(){ return runCQC(); }}]}
);
