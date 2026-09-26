/* ===================== EVENTS 3: money, safety, systems ===================== */
EVENTS.push(
{id:'fridge',who:'maureen',title:'The vaccine fridge',tag:'rule',
 info:'Vaccines must be stored between 2°C and 8°C. After a cold-chain breach the stock is quarantined and the manufacturers are asked whether it\'s still usable. Using compromised vaccines can mean recalling patients to be revaccinated.',
 text:`Monday morning. The vaccine fridge data logger shows it reached 11°C for about six hours over the weekend. Inside: £7,000 of vaccines. Maureen is holding the logger like it's a murder weapon.`,
 choices:[
  {t:'Quarantine the stock and ask the manufacturers for stability advice',fx:{you:-3,safety:4,cash:-2.5,team:-1,inbox:20,aim:{safety:1}},later:[{in:1,p:0.35,fx:{cash:-3,patients:-2},note:'The manufacturers came back on the rest of the fridge stock: not usable after all. Another batch binned, and 60 flu appointments rebooked.'}],o:`About two thirds is fine according to the manufacturers' data. The rest is binned. You write it up as a significant event and fit a second alarm. The system works.`},
  {t:'Bin the lot, to be safe',fx:{cash:-7,safety:3},o:`£7,000 into the pharmaceutical waste bin. Safe, expensive and, it turns out, partly unnecessary.`},
  {t:'"They\'re probably fine."',fx:{safety:-4},later:[{in:4,p:0.4,fx:{safety:-14,cash:-7,patients:-5,rep:-6},note:'Because the vaccines from the broken fridge were used: an audit found the breach. 140 patients need recalling for revaccination, and the paper found out.'}],o:`Nobody says anything. You think about it every night at about 3am.`}
 ]},

{id:'sea_referral',who:'bev',title:'A significant event',tag:'real',src:['S40'],
 info:'Professional duty of candour means telling a patient when something has gone wrong with their care, apologising and explaining. Negligence claims are covered by the state scheme; complaints and GMC matters are not.',
 text:`A suspected cancer referral you made three weeks ago was never sent. It was sitting in a drafts folder. The patient, 58, with a breast lump, has rung to ask why she hasn't heard anything.`,
 choices:[
  {t:'Ring her yourself, apologise, fix it, and run a full review',fx:{safety:6,you:-4,patients:1,aim:{safety:1}},o:`You apologise properly. The referral goes today, with a call to the breast unit. The review finds the process gap. You fix it. That's how it's meant to work.`},
  {t:'Send it now and fix it quietly',fx:{safety:-3},later:[{in:2,p:0.4,fx:{safety:-8,patients:-4,you:-6,rep:-4},note:'The patient whose referral sat in the drafts folder has complained. She asks why nobody told her what went wrong. It\'s a fair question.'}],o:`The referral goes. The drafts folder is still there.`}
 ]},

{id:'wrong_letter',who:'bev',title:'Wrong address',tag:'story',
 text:`A hospital letter about Mrs A was scanned into Mrs B's record, then posted to Mrs B. Mrs B rings, kindly, to say she has a letter that isn't hers. The scanning software is 97% accurate. Today was the other 3%.`,
 choices:[
  {t:'Log it as a data breach and apologise to both',fx:{safety:4,you:-2},o:`You assess it against the reporting criteria, record it properly and apologise to both patients. Both are gracious about it, which is more than the scanning software deserves.`},
  {t:'Apologise and move on',fx:{you:1},later:[{in:2,p:0.35,fx:{safety:-8,rep:-3,cash:-5},note:'Mrs A complained to the Information Commissioner about the misfiled letter. The legal advice cost £5,000.'}],o:`It blows over. Probably.`}
 ]},

{id:'methotrexate',who:'raj',title:'Nine months without bloods',tag:'story',
 text:`Raj has found a patient on methotrexate who hasn't had a blood test in nine months. The repeats have gone out every month without anyone noticing. Raj thinks there are more.`,
 choices:[
  {t:'Run a full high-risk drug monitoring audit',need:()=>S.staff.pharm>0,why:'You need a clinical pharmacist',fx:{safety:6,inbox:40,team:-1,you:-2,aim:{safety:2}},o:`Raj finds 31 patients overdue monitoring. Two had significant results. The audit may have saved a life, and now it runs every quarter.`},
  {t:'Block repeats until bloods are done',fx:{safety:3,patients:-3},o:`Thirty-one patients get a text asking them to book a blood test before their next prescription. Twenty-nine do.`},
  {t:'Book this one patient and carry on',fx:{safety:-4},later:[{in:3,p:0.4,fx:{safety:-8,you:-4},note:'Another patient on a high-risk drug with no monitoring was admitted with a low white cell count.'}],o:`He's fine. You don't know about the others yet.`}
 ]},

{id:'defib',who:'maureen',title:'Emergency equipment',tag:'story',
 text:`Maureen has checked the emergency trolley. The defibrillator pads expired in 2022. The oxygen cylinder is a quarter full. There's a mysterious sandwich in the bottom drawer.`,
 choices:[
  {t:'Replace everything and set up weekly checks (£400)',fx:{cash:-0.4,safety:5,team:1,aim:{safety:1}},o:`New pads, new cylinder, new checklist. The sandwich gets a respectful burial.`},
  {t:'Replace the pads only',fx:{cash:-0.1,safety:1},o:`Better than nothing. Just.`}
 ]},

{id:'legionella',who:'bev',title:'Legionella',tag:'story',
 text:`The legionella risk assessment is two years overdue. Bev only knows because it's on the CQC checklist she downloaded "for fun".`,
 choices:[
  {t:'Book the assessment (£650)',fx:{cash:-0.65,safety:3},o:`A man in overalls runs every tap for two minutes and writes a 30-page report. Water: fine. Showerhead in the staff toilet: condemned.`},
  {t:'Run the taps a bit more',fx:{safety:-2},later:[{in:3,p:0.3,fx:{cash:-4,safety:-4},note:'A routine water test found legionella in the staff shower. Remedial works cost £4,000.'}],o:`It'll almost certainly be fine.`}
 ]},

{id:'cyber',who:'hospital',title:'Pathology down',tag:'story',
 text:`The hospital's pathology IT supplier has been hit by a cyberattack. For the next six weeks, only urgent blood tests will be processed. Routine monitoring and QOF bloods are off.`,
 choices:[
  {t:'Triage every request by risk',fx:{you:-3,safety:2},run(){ addMod({id:'cyber',label:'Pathology outage',months:2,hours:2,fx:{qof:-2}}); },o:`Every blood form now needs a GP to decide if it's urgent. You make 300 small decisions a week. Nothing falls through.`},
  {t:'Send everyone to the hospital walk-in',fx:{patients:-4,team:1,icb:-2},run(){ addMod({id:'cyber',label:'Pathology outage',months:2,fx:{qof:-2}}); },o:`The hospital walk-in queue goes out of the door. The hospital writes a stern letter about "inappropriate GP redirection".`}
 ]},

{id:'it_outage',who:'it',title:'System down',rep:1,max:2,w:()=>S.counts.it_outage?0.6:1,tag:'real',src:['S60','S61'],
 info:'In July 2024 a faulty security update took down Windows machines worldwide, and with them the clinical system many GP practices use to book appointments, read notes and send prescriptions. Practices went back to paper records and handwritten prescriptions, without access to test results. With the Electronic Prescription Service down, prescriptions go on paper FP10 forms, and pharmacies can\'t download them. Business continuity plans usually include a printed or offline summary of each day\'s patients.',
 text:()=>`08:04 Monday. The clinical system is down across the area. No appointment book, no past medical history, no allergies, no repeat lists, no results, and no electronic prescriptions. The supplier says "sometime today". ${S.flags.bcp ? 'At least last night\'s offline summary printed: problems, medicines and allergies for everyone booked today.' : 'Nobody printed anything last night, because nobody ever has.'} The waiting room is filling up.`,
 choices:[
  {t:'Paper day: handwritten notes, handwritten FP10s, scan it all in later',
   fx:()=>S.flags.bcp?{team:3,you:-2,inbox:60,safety:-1}:{team:3,you:-3,inbox:90,safety:-4},
   run(){ addMod({id:'paperday',label:'Catching up after the system outage',months:1,capMul:0.9,hours:2}); },
   later:[{in:1,p:0.25,fx:{safety:-3,you:-2},note:'Because the paper day ran without records: a handwritten prescription clashed with a medicine nobody could see on the repeat list. The pharmacist caught it and rang you.'}],
   o:()=>S.flags.bcp?`Everyone works from the printed summary. Every consultation still starts with "and what tablets are you on?", but the allergies are on paper in front of you. Prescriptions go on FP10 pads, signed in ink. Then there's the scanning.`:`Kayleigh rebuilds the morning list from the phone log and memory. Every consultation starts with "and what tablets are you on?" One patient mentions, just in time, that she's allergic to penicillin. Prescriptions go on FP10 pads, and the pharmacy across the road rings about your handwriting. Then there's the scanning.`},
  {t:'Urgent only today. Rebook everyone else.',fx:{patients:-5,you:1,safety:1},run(){ addMod({id:'rebook',label:'Rebooking after the outage',months:1,demand:4}); },o:`It comes back at 1:40pm. You spend the afternoon rebooking the morning, and next month is busier for it.`},
  {t:'Get through today, then buy a proper continuity kit (£1,200)',need:()=>!S.flags.bcp,why:'You already have one',fx:{team:1,you:-2,inbox:70,safety:-2,cash:-1.2,flags:{bcp:1},aim:{safety:1}},o:`Paper today. From tomorrow the system prints an overnight summary of each day's patients, there's a 4G backup router, and the FP10 pads live in a labelled drawer. Next time will still be bad, but not blind.`}
 ]},

{id:'windows_update',who:'it',title:'Working on updates',rep:1,max:2,tag:'real',src:['S62'],
 info:'Under NHS England\'s GP IT operating model, ICBs commission and run most practices\' IT, including patching and operating system updates, which are part of the cyber security rules. When updates land at the wrong time, the first session of the day starts without computers or smartcards.',
 text:`08:00. Every PC in the building says "Working on updates 12%. Don't turn off your computer." The ICB's IT provider pushed Windows updates overnight. Your first patient is booked for 8:10. When the PCs come back, the smartcard readers will want a restart too.`,
 choices:[
  {t:'Start on the phones, with notes on paper, until they\'re back',fx:{patients:-1,team:-2,you:-2,inbox:15},o:`Half an hour of phone consultations written on the back of old letters. At 8:37 the computers come back, then ask for another restart.`},
  {t:'Ring the IT helpdesk',fx:{you:-2,patients:-2},o:`Ticket #448214 is logged at 8:06. It's resolved at 8:41, when the update finishes by itself. Your morning clinic finishes at 1:15.`},
  {t:'Ask the ICB to schedule updates overnight, with notice',fx:{you:-1,icb:1},later:[{in:2,p:0.6,fx:{team:2,you:1},note:'The ICB\'s IT provider moved practice updates to 2am, with a week\'s notice. Mornings start on time again.'}],o:`A polite email, copied to the LMC. The reply says your "feedback has been logged". Two months later, surprisingly, something changes.`}
 ]},

{id:'med_shortage',who:'chemist',title:'Out of stock',rep:1,max:2,tag:'real',src:['S63','S64','S65'],
 info:'When a medicine is in short supply, the Department of Health and Social Care issues a Medicine Supply Notification with advice on alternatives. Every switch then needs a new prescription. For serious shortages it can issue a Serious Shortage Protocol, which lets pharmacists supply a set alternative, a reduced quantity or a different form without going back to the GP. Recent shortages have included HRT, ADHD medicines, some diabetes medicines and antibiotics, mostly because of manufacturing problems.',
 text:()=>{ const opts=[['An HRT patch',0.009],['A common ADHD medicine',0.004],['A widely used diabetes medicine',0.012],['A first-line antibiotic',0.003],['A common epilepsy medicine',0.003]]; if(S.flags.shortDrug==null) S.flags.shortDrug=Math.floor(Math.random()*opts.length); const [d,rate]=opts[S.flags.shortDrug]; return `Ashok rings. "${d} is out of stock everywhere. The wholesalers say eight weeks, maybe twelve." About ${Math.max(12,Math.round(S.list*rate))} of your patients take it. There's a Medicine Supply Notification listing alternatives, but there's no Serious Shortage Protocol, so every switch needs a new prescription from you.`; },
 after(){ delete S.flags.shortDrug; },
 choices:[
  {t:'Raj reviews every patient and switches them one by one',need:()=>S.staff.pharm>0,why:'You need a clinical pharmacist',fx:{inbox:35,safety:3,patients:1,you:-1,qof:-2},o:`Raj works through the list: the right alternative for each patient, their other medicines checked, and a text explaining the change. Nobody goes without, but his QOF medication reviews wait a month.`},
  {t:'Switch everyone to the first listed alternative in one batch',fx:{inbox:15,patients:-1,safety:-1},later:[{in:1,p:0.45,fx:{inbox:30,patients:-2,safety:-2},note:'Because of the batch switch: thirty patients rang about tablets that look different, and two had side effects from the alternative.'}],o:`One search, one batch of prescriptions, one text message. It's done by lunchtime. Mostly.`},
  {t:'Tell patients to try other pharmacies',fx:{patients:-4,rep:-2,inbox:10},later:[{in:1,p:0.5,fx:{safety:-4,you:-2},note:'Because patients were sent pharmacy to pharmacy: one went three weeks without their medicine and ended up in A&E.'}],o:`Reception gives out a list of pharmacies. Patients ring round, then ring you back.`}
 ]},

{id:'phones',who:'kayleigh',title:'The phones have died',cond:()=>!S.flags.telephony,tag:'story',
 text:`08:00:14. The phone system has crashed. It was installed in 2008, and the engineer who understood it has retired to Spain. People are ringing 111 to ask why the surgery isn't answering.`,
 choices:[
  {t:'Commit to a cloud telephony upgrade',fx:{you:-1,flags:{telephony:1}},o:`You sign the contract. Going live is now a project you can choose: queue positions, call-backs and data you can actually use.`},
  {t:'Get it patched up (£900)',fx:{cash:-0.9,patients:-2},later:[{in:3,p:0.6,fx:{patients:-4,rep:-3},note:'The patched-up phone system crashed again at 8am on a Monday.'}],o:`It's working by 10am.`}
 ]},

{id:'roof',who:'bev',title:'Drip',tag:'story',
 text:[`There's water coming through the ceiling of Room 3. It's landing, with some precision, on the examination couch. The flat roof has been "fine for years".`, `The leak in Room 3 is back, in a new place. It's dripping on the computer this time. The roofer who "sorted it" last year has stopped answering his phone.`],
 choices:[
  {t:'Emergency roofer, today',fx:(()=>S.flags.soldBuilding?{team:1}:{cash:-6,team:1}),o:()=>S.flags.soldBuilding?`It's the landlord's problem now. The roofer arrives in three days. You rediscover the upside of renting.`:`£6,000. The roofer sucks air through his teeth for a full minute before quoting.`},
  {t:'Buckets and a cone',fx:{safety:-3},run(){ addMod({id:'roof',label:'Room 3 out of action',months:2,rooms:-1}); },later:[{in:2,p:0.5,fx:{cash:-9},note:'The leak you patched with buckets spread into the ceiling void. The repair now costs £9,000.'}],o:`Room 3 becomes a storage room with a bucket. You lose a room for two months.`}
 ]},

{id:'service_charge',who:'landlord',title:'An invoice',cond:()=>!S.flags.soldBuilding,tag:'story',
 text:`An invoice arrives for "backdated service charges, 2019 to 2025": £38,412.66. It includes cleaning you've always paid for yourselves, and £4,000 for a lift. The building has one storey.`,
 choices:[
  {t:'Dispute it with LMC support',fx:{cash:-1.5,you:-2},later:[{in:3,p:0.3,fx:{cash:-10.5,you:-2},note:'After months of letters you settled the service-charge dispute for £10,500. There is still no lift.'}],o:`Months of correspondence begin. The invoice is "on hold". For a GP practice, that counts as victory.`},
  {t:'Pay in instalments to make it go away',fx:{you:1},run(){ addMod({id:'svc',label:'Service charge instalments',months:6,fx:{cash:-4}}); },o:`£4,000 a month for six months. It goes away. So does a meaningful slice of the partners' profit.`},
  {t:'Ignore it',fx:{you:1},later:[{in:3,p:0.5,fx:{you:-6,cash:-20},note:'The ignored service-charge invoice went to a debt recovery agency. You paid £20,000 in a hurry and disputed the rest.'}],o:`Nothing happens. For now.`}
 ]},

{id:'boiler',who:'bev',title:'Cold',months:[7,8,9,10],tag:'story',
 text:`The boiler has died. It's 11°C in the waiting room. Mrs Higgins is wearing two coats and has brought a flask. The plumber can do Thursday, "maybe".`,
 choices:[
  {t:'New boiler (£6,500)',fx:(()=>S.flags.soldBuilding?{cash:-1}:{cash:-6.5}),o:()=>S.flags.soldBuilding?`The landlord pays for the boiler, grumbling. You pay for the call-out.`:`The new boiler is A-rated. The invoice is not.`},
  {t:'Portable heaters until spring',fx:{team:-4,patients:-2,safety:-2,cash:-0.4},run(){ addMod({id:'cold',label:'Cold building',months:2,aim:{team:-3}}); },o:`Six fan heaters and a tangle of extension leads. The fire risk assessment weeps quietly.`}
 ]},

{id:'photocopier',who:'rep',title:'A print solution',tag:'story',
 text:`A sales rep offers a "managed print solution": a photocopier on a seven-year lease at £610 a month. "It scans directly to the cloud." You currently scan to a PC called RECEPTION-OLD-2.`,
 choices:[
  {t:'Sign',fx:{team:2,inbox:-20},run(){ addMod({id:'printer',label:'Photocopier lease',months:99,fx:{cash:-0.61}}); },o:`It staples. It hole-punches. It will outlive you, contractually.`},
  {t:'Decline and buy a £300 scanner',fx:{cash:-0.3},o:`RECEPTION-OLD-2 gets a friend. It's fine.`}
 ]},

{id:'rep_lunch',who:'rep',title:'Lunch and learn',tag:'story',
 text:[`Chad would love to buy lunch for Wednesday's clinical meeting and "share some exciting data" on a new inhaler. The sandwiches are from the good deli. The data is from the good marketing department.`, `Chad is back. This time it's a "breakfast briefing" on a new weight-loss injection, with croissants from the good bakery. The slides have more graphs than axes.`],
 choices:[
  {t:'Accept, and critique the data afterwards',fx:{team:3,you:1},alt:{p:0.25,fx:{team:2,rep:-3},o:`A photo of your team with Chad's branded lanyards ends up in the company's "partner practices" newsletter. The local paper notices.`},o:`The sandwiches are excellent. Raj takes the trial apart slide by slide. Chad takes notes. Everyone learns something.`},
  {t:'Decline. You follow the local formulary.',fx:{team:-1,safety:1},o:`Principled. Hungry.`}
 ]},

{id:'locum_offer',who:'agency',title:'A locum is available',tag:'real',src:['S28'],
 info:'Typical in-hours GP locum rates are £85 to £105 an hour, and agencies keep 15 to 25% of what you pay. Locums are paid by the session and aren\'t expected to deal with results or letters.',
 text:`The agency has a GP free for two weeks from tomorrow: £110 an hour, sessions only, "no home visits, no results, no letters". The wait for a routine appointment is three weeks.`,
 choices:[
  {t:'Book them (about £4,600)',fx:{cash:-4.6,patients:2},run(){ addMod({id:'locum2',label:'Agency locum in post',months:1,capAdd:60,fx:{inbox:30}}); },o:`An excellent clinician who leaves at 6pm sharp every day, and leaves 30 unactioned results in your inbox.`},
  {t:'No thanks',fx:{you:-1},o:`You look at the three-week wait. It looks back.`}
 ]},

{id:'research',who:'pcn',title:'Research practice?',tag:'story',
 text:`The regional research network would like the practice to recruit patients to national studies. They'll fund a research nurse for a day a week and pay per patient recruited.`,
 choices:[
  {t:'Sign up',fx:{team:3,you:-1,rep:2},run(){ addMod({id:'research',label:'Research network income',months:99,fx:{cash:0.6}}); },o:`Maureen does the training and becomes quietly evangelical. The practice logo appears on a slide at a national conference.`},
  {t:'Not now',fx:{you:1},o:`Maybe once the building stops leaking.`}
 ]},

{id:'icb_plan',who:'icb',title:'An access improvement plan',tag:'story',
 text:[`Jonathan from the ICB needs your "access improvement plan" by Friday. There's a 14-page template. Completing it unlocks a payment. Not completing it "will be noted".`, `Jonathan from the ICB needs your "winter resilience plan" by Friday. There's a 16-page template, and last year's is in a folder called FINAL_v7_actualFINAL. Completing it unlocks a payment. Not completing it "will be noted".`],
 choices:[
  {t:'Write it (Friday night)',fx:{you:-3,cash:4.5,icb:4},o:`You write "we will continue to improve access" in eleven different ways. The payment arrives two months later.`},
  {t:'Bev adapts last year\'s',fx:{team:-2,cash:4.5},alt:{p:0.3,fx:{team:-2,icb:-4},o:`Bev's version still mentions Dr Hartley and a phone system you replaced. The ICB notices.`},o:`It's accepted without comment.`},
  {t:'Don\'t bother',fx:{you:1,icb:-5},o:`It is noted.`}
 ]},

{id:'inhaler_switch',who:'icb',title:'A prescribing incentive',tag:'story',
 text:`The ICB will pay you to switch 400 patients from metered-dose to dry-powder inhalers: greener, cheaper and a lot of letters. "It's a quick win," says Jonathan, who has never done an inhaler review.`,
 choices:[
  {t:'Do it properly, with technique checks',fx:{you:-2,cash:3,qof:2,inbox:30,icb:3},o:`Raj and Maureen check technique for 400 patients. Twelve discover they've never used their inhalers properly.`},
  {t:'Bulk switch by letter',fx:{cash:3,patients:-3,safety:-2},later:[{in:1,p:0.5,fx:{patients:-2,inbox:40},note:'The bulk inhaler switch generated 40 calls from patients who didn\'t know how to use the new device.'}],o:`The letters go out.`},
  {t:'Decline',fx:{icb:-2},o:`The inhalers stay the same. So does the funding.`}
 ]},

{id:'measles',who:'maureen',title:'Measles',months:[3,4,5,6,7,8,9],tag:'story',
 text:`There's measles at the primary school on Mill Lane: four confirmed cases. Your MMR uptake at age five is 81%. Maureen has pulled up the list of unvaccinated children. It's long.`,
 choices:[
  {t:'Catch-up clinics every evening this week',fx:{team:-3,you:-2,safety:3,qof:2,cash:1.5,rep:2},o:`Maureen vaccinates 94 children. Several parents say nobody had ever followed up the missed appointment. Now somebody has.`},
  {t:'Send letters and carry on',fx:{safety:-2,patients:-1},o:`Nine families book in. The outbreak team calls to ask what else you're doing.`}
 ]},

{id:'heatwave',who:'bev',title:'Heatwave',months:[2,3,4],tag:'story',
 text:`It's 33°C. The server cupboard is 41°C and making a noise like a hairdryer. The waiting room fan is moving hot air from one side of the room to the other.`,
 choices:[
  {t:'Buy portable air conditioning (£800)',fx:{cash:-0.8,team:3},o:`The server stops wheezing. So does Maureen.`},
  {t:'Prop the doors and windows open',fx:{safety:-2,team:-1},o:`A pigeon gets into Room 5 during a diabetes review and settles on the sharps bin. It takes two nurses and a towel to persuade it out.`}
 ]},

{id:'pharmacy_close',who:'chemist',title:'The pharmacy on the high street',tag:'story',
 text:`Ashok rings. The chain pharmacy on the high street is closing next month. That's 4,000 prescriptions a month looking for somewhere to go, and a lot of Pharmacy First consultations coming back to you.`,
 choices:[
  {t:'Work with Ashok on a plan',fx:{you:-2,patients:1,demand:1},o:`Ashok takes on extra staff and a delivery van. It's still busier, but it's organised.`},
  {t:'Nothing you can do',fx:{demand:2.5,patients:-2},o:`Demand at the surgery goes up. So do complaints about "the chemist".`}
 ]},

{id:'enhanced_access',who:'pcn',title:'Saturday sessions',tag:'real',src:['S4'],
 info:'PCNs must provide enhanced access: 60 minutes of appointments per 1,000 patients a week, in the evenings and on Saturdays. GPs who staff it are paid by the session.',
 text:`The PCN needs cover for Saturday enhanced-access clinics for three months. It pays well. Saturday mornings used to be for parkrun and being a person.`,
 choices:[
  {t:'Take them',fx:{you:-2},run(){ addMod({id:'ea',label:'Saturday enhanced access',months:3,capAdd:30,hours:4,fx:{cash:1.2}}); },o:`You do Saturdays. The patients are people who can't come in the week, and they're wonderfully grateful.`},
  {t:'Decline',fx:{you:1},o:`Parkrun. Personal best. Worth it.`}
 ]},

{id:'accountant',who:'accountant',title:'Quarterly figures',months:[3,6,9],tag:'real',src:['S23'],
 info:'Drawings are payments on account of expected profit. If they run ahead of profit, partners have to pay money back in at year end. Accountants often advise new partners to put about 40% of drawings aside for tax.',
 text:()=> S.cash<S.overdraft/2 ? `Neville looks over his glasses. "Your drawings are running ahead of profit. At this rate you'll be paying money back in at year end, personally. And put 40% aside for tax. Your first bill will be a big one."` : `Neville looks over his glasses. "It's healthier than most. Your staff costs are rising faster than your income, like everyone's. And put 40% of your drawings aside for tax."`,
 choices:[
  {t:'Cut partners\' drawings to lean for now',fx:{you:-2,okoye:6},run(){ S.plan.draw='low'; },o:`Drawings drop to lean from this month. The overdraft breathes out. Your mortgage breathes in.`},
  {t:'Review every contract and direct debit',fx:{cash:2.5,you:-2},o:`You find £2,500 of savings, including a subscription to a magazine about hospital car parks.`},
  {t:'Thank Neville and change nothing',fx:{you:1},o:`He nods, in a way that means "I'll send you an email you won't read".`}
 ]},

{id:'pension',who:'pcse',title:'The pension record',tag:'story',
 text:`Your pension record says your contributions for last year are "missing". The form they need was withdrawn in 2023. The helpline hold music is Vivaldi's Four Seasons. All four.`,
 choices:[
  {t:'Spend an evening fixing it',fx:{you:-3},o:`Ninety minutes of hold music later, a lovely woman called Janet fixes it. You nearly send Janet flowers.`},
  {t:'Future you can deal with it',fx:{you:1},later:[{in:4,p:1,fx:{you:-5},note:'Your pension record now shows you as retired in 1998. Fixing it took a whole weekend.'}],o:`Future you is going to be so annoyed.`}
 ]},

{id:'hospital_discharge',who:'hospital',title:'The Christmas clear-out',months:[8],tag:'story',
 text:`It's 23rd December. St Swithin's has discharged 38 of your patients in two days to free beds. Every letter ends: "GP to follow up bloods in one week and review medications".`,
 choices:[
  {t:'Bounce the inappropriate requests back',fx:{inbox:40,team:1,safety:-1},later:[{in:1,p:1,fx:{inbox:25},note:'Half the discharge requests you bounced back in December came back to you in January anyway.'}],o:`You send a polite template about the hospital arranging its own tests.`},
  {t:'Just do them all',fx:{inbox:80,you:-4,safety:2,patients:2},o:`Raj and you work through them on Christmas Eve. Every one gets done. You eat a mince pie from the reception tin, standing up.`}
 ]}
,
{id:'hcq_screening',who:'raj',title:'Nobody booked the eye test',tag:'real',src:['S85','S86'],
 info:'Under the national shared care protocol for hydroxychloroquine, the specialist reviews the patient every year and, after five years of treatment (sooner with risk factors such as reduced kidney function or tamoxifen), refers them for annual retinal screening. The GP\'s part is to remind the specialist as the five-year mark approaches. Early retinal toxicity causes no symptoms, and severe damage can keep progressing after the drug is stopped. Whoever signs the prescription is responsible for it, so when the specialist disappears, the gap is the practice\'s.',
 text:`A medication review turns up a woman of 61 who has taken hydroxychloroquine for eight years, under shared care with a private rheumatologist. The agreement is clear: the specialist reviews her every year, and refers her for eye screening every year after five. The rheumatologist moved to Dubai three years ago. Nobody told the practice. The repeat prescription kept going out every 56 days, signed by whoever was on.`,
 choices:[
  {t:'Refer her for retinal screening now, and to NHS rheumatology',fx:{you:-2,safety:2,inbox:10},
   run(){ if(chance(0.7)) plant({in:3,fx:{safety:2},note:'Her retinal scan was normal. NHS rheumatology has taken over her care, with a new shared care agreement.'}); else plant({in:3,fx:{safety:-3,you:-3,rep:-1},note:'Her retinal scan showed early hydroxychloroquine damage. The drug has been stopped and her sight is unaffected so far, but it will be watched for years. You have logged it as a significant event.'}); },
   o:`She had no idea she was meant to be having eye checks. Nobody told her either. The referral goes today, with a letter to NHS rheumatology explaining why a private patient is now theirs.`},
  {t:'Search for everyone on shared care with a private specialist',fx:{you:-3,team:-1,safety:4,inbox:40,aim:{safety:1}},
   run(){ plant({in:3,p:0.8,fx:{safety:2},note:'The shared care search is finished. Every patient with a vanished private specialist now has an NHS referral, and the eye screening is booked.'}); },
   o:`The search finds 14 more patients prescribed under private shared care. Three have specialists who no longer answer. Each gets a referral, a letter explaining why, and a recall on the system that will outlast any of you.`},
  {t:'Stop the hydroxychloroquine until she has seen someone',fx:{safety:1,patients:-2},later:[{in:2,p:0.5,fx:{patients:-2,you:-2},note:'Her joints flared badly off hydroxychloroquine. She is waiting for NHS rheumatology, on a course of steroids from the out-of-hours doctor.'}],
   o:`The protocol says stopping is the specialist's decision. There isn't one. She leaves worried about her eyes and her joints, in that order.`},
  {t:'Keep prescribing. She seems fine.',fx:{},later:[{in:4,p:0.45,fx:{safety:-8,you:-6,rep:-3,patients:-3},note:'She noticed words missing from the middle of lines when reading. Her scan shows established retinal damage, which may keep progressing now the drug has stopped. She has complained, and your defence organisation has opened a file.'}],
   o:`Her eyes feel fine. That's the trouble with this side effect: they do, until they don't.`}
 ]}
);

