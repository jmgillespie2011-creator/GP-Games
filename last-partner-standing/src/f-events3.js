/* ===================== EVENTS 3: money, safety, systems ===================== */
EVENTS.push(
{id:'fridge',who:'maureen',title:'The vaccine fridge',
 text:`Monday morning. The vaccine fridge data logger shows it reached 11°C for about six hours over the weekend. Inside: £7,000 of vaccines. Maureen is holding the logger like it's a murder weapon.`,
 choices:[
  {t:'Quarantine the stock and ring the manufacturers for stability advice',fx:{you:-2,safety:4,cash:-2.5},o:`About two thirds is fine according to the manufacturers' data. The rest goes in the bin. You write it up as a significant event. The system works.`},
  {t:'Bin the lot, to be safe',fx:{cash:-7,safety:3},o:`£7,000 into the pharmaceutical waste bin. Safe, expensive and, it turns out, partly unnecessary.`},
  {t:'"They\'re probably fine."',fx:{safety:-4},alt:{p:0.4,fx:{safety:-16,cash:-7,patients:-5},o:`It comes out at a routine audit. 140 patients need recalling for revaccination. The local paper finds out.`},o:`Nobody ever finds out. You find out every night at about 3am, in your head.`}
 ]},

{id:'sea_referral',who:'bev',title:'A significant event',
 text:`A suspected cancer referral you made three weeks ago was never sent. It was sitting in a drafts folder. The patient rang to ask why she hasn't heard anything. She is 58 with a breast lump.`,
 choices:[
  {t:'Ring her yourself, apologise, fix it, run a full SEA',fx:{safety:6,you:-4,patients:1},o:`You apologise properly. The referral goes today, with a call to the breast unit. The SEA finds the process gap. You fix it. That's how it's meant to work.`},
  {t:'Send it now and fix it quietly',fx:{safety:-3},alt:{p:0.35,fx:{safety:-8,patients:-6,you:-6},o:`She complains. The complaint asks why nobody told her what went wrong. It's a fair question.`},o:`The referral goes. Nothing else changes. The drafts folder is still there.`}
 ]},

{id:'wrong_letter',who:'bev',title:'Wrong address',
 text:`A hospital letter about Mrs A was scanned into Mrs B's record, then posted to Mrs B. Mrs B has rung to say she has "learned a lot about Mrs A's bowels".`,
 choices:[
  {t:'Log it as a data breach and apologise to both',fx:{safety:4,you:-2},o:`You assess it against the reporting criteria, record it properly and apologise to both patients. Mrs A is gracious. Mrs B is enjoying herself.`},
  {t:'Apologise and move on',fx:{you:1},alt:{p:0.35,fx:{safety:-8,patients:-3},o:`Mrs A complains to the ICO herself. The ICO asks why you didn't.`},o:`It blows over. Probably.`}
 ]},

{id:'methotrexate',who:'raj',title:'Nine months without bloods',
 text:`Raj has found a patient on methotrexate who hasn't had a blood test in nine months. He's been issued his repeats every month without anyone noticing. Raj thinks there are more.`,
 choices:[
  {t:'Run a full high-risk drug monitoring audit',need:()=>S.staff.pharm>0,why:'You need a clinical pharmacist',fx:{safety:6,inbox:40,team:-1},o:`Raj finds 31 patients overdue monitoring. It takes him a month. Two had significant results. The audit might have saved a life.`},
  {t:'Block repeats until bloods are done',fx:{safety:3,patients:-3},o:`Thirty-one patients get a text saying "please book a blood test before your next prescription". Twenty-nine do. Two ring reception to shout.`},
  {t:'Book this one patient and carry on',fx:{safety:-4},o:`He's fine. There are 30 others. You don't know that yet.`}
 ]},

{id:'defib',who:'maureen',title:'Emergency equipment',
 text:`Maureen has checked the emergency trolley. The defibrillator pads expired in 2022. The oxygen cylinder is a quarter full. There is a mysterious sandwich in the bottom drawer.`,
 choices:[
  {t:'Replace everything, set up weekly checks (£400)',fx:{cash:-0.4,safety:5,team:1},o:`New pads, new cylinder, new checklist. The sandwich is given a respectful burial.`},
  {t:'Replace the pads only',fx:{cash:-0.1,safety:1},o:`Better than nothing. Just.`}
 ]},

{id:'legionella',who:'bev',title:'Legionella',
 text:`The legionella risk assessment is two years overdue. Bev only knows because it's on the CQC pre-inspection checklist she downloaded "for fun".`,
 choices:[
  {t:'Book the assessment (£650)',fx:{cash:-0.65,safety:3},o:`A man in overalls runs every tap for two minutes and writes a 30-page report. Water: fine. Showerhead in the staff toilet: condemned.`},
  {t:'Run the taps a bit more, it\'ll be fine',fx:{safety:-3},o:`You run the taps a bit more. It will almost certainly be fine.`}
 ]},

{id:'cyber',who:'hospital',title:'Pathology down',
 text:`The hospital's pathology IT supplier has been hit by a cyberattack. For the next six weeks, only urgent blood tests will be processed. Routine monitoring, QOF bloods and "just checking" tests are off.`,
 choices:[
  {t:'Triage every request by risk',fx:{you:-3,safety:2},run(){ addMod({id:'cyber',label:'Pathology outage',months:2,fx:{qof:-2}}); },o:`Every blood form now needs a GP to decide if it's urgent. You make 300 small decisions a week. Nothing falls through.`},
  {t:'Send everyone to the hospital phlebotomy walk-in',fx:{patients:-4,team:1},run(){ addMod({id:'cyber',label:'Pathology outage',months:2,fx:{qof:-2}}); },o:`The hospital walk-in queue goes out of the door. The hospital writes a stern letter about "inappropriate GP redirection".`}
 ]},

{id:'it_outage',who:'it',title:'System down',
 text:`08:04 Monday. The clinical system is down. No records, no prescribing, no appointments. The helpdesk estimates "sometime today". The waiting room is filling up.`,
 choices:[
  {t:'Paper day: handwritten notes, scan later',fx:{safety:-2,you:-2,team:3,inbox:60},o:`Maureen finds the paper prescription pads. Alan knows how to do this from 1989. There's a Blitz spirit. Then there's the scanning.`},
  {t:'Urgent-only service until it\'s back',fx:{patients:-4,you:1},o:`It's back at 1:40pm. You spend the afternoon rebooking the morning.`}
 ]},

{id:'phones',who:'kayleigh',title:'The phones have died',cond:()=>!S.flags.telephony,
 text:`08:00:14. The phone system has crashed. It's an analogue system installed in 2008, and the engineer who understood it has retired to Spain. People are ringing 111 to ask why the surgery isn't answering.`,
 choices:[
  {t:'Commit to a cloud telephony upgrade',fx:{you:-1,flags:{telephony:1}},o:`You sign the contract. The go-live is now a project you can choose: queue positions, call-backs and data you can actually use.`},
  {t:'Get it patched up (£900)',fx:{cash:-0.9,patients:-2},o:`It's working by 10am. It will crash again. Everyone knows it will crash again.`}
 ]},

{id:'roof',who:'bev',title:'Drip',
 text:`There's water coming through the ceiling of Room 3. It's landing, with some precision, on the examination couch. The flat roof has been "fine for years".`,
 choices:[
  {t:'Emergency roofer, today',fx:(()=>S.flags.soldBuilding?{team:1}:{cash:-6,team:1}),o:()=>S.flags.soldBuilding?`It's the landlord's problem now. The roofer arrives in three days. You rediscover the upside of renting.`:`£6,000. The roofer sucks air through his teeth for a full minute before quoting.`},
  {t:'Buckets and a cone',fx:{safety:-3},run(){ addMod({id:'roof',label:'Room 3 out of action',months:2,rooms:-1}); },o:`Room 3 becomes a storage room with a bucket. You lose a room for two months.`}
 ]},

{id:'service_charge',who:'landlord',title:'An invoice',cond:()=>!S.flags.soldBuilding,
 text:`An invoice arrives for "backdated service charges, 2019-2025": £38,412.66. It includes cleaning you've always paid for yourselves, and a £4,000 charge for a lift. The building has one storey.`,
 choices:[
  {t:'Dispute it with LMC support',fx:{cash:-1.5,you:-2},alt:{p:0.3,fx:{cash:-12,you:-4},o:`After months of letters you settle for £10,500. The lift charge stays. There is still no lift.`},o:`Eighteen months of correspondence begins. The invoice is "on hold". For a GP practice, that counts as victory.`},
  {t:'Pay in instalments to make it go away',run(){ addMod({id:'svc',label:'Service charge instalments',months:6,fx:{cash:-4}}); },fx:{you:1},o:`£4k a month for six months. It goes away. So does a meaningful slice of the partners' profit.`},
  {t:'Ignore it',fx:{you:1},alt:{p:0.5,fx:{you:-6,cash:-20},o:`It goes to a debt recovery agency. The phrase "legal proceedings" appears. You pay part of it and dispute the rest, in a hurry.`},o:`Nothing happens. The invoice is re-sent every quarter, forever, like a ghost.`}
 ]},

{id:'boiler',who:'bev',title:'Cold',months:[7,8,9,10],
 text:`The boiler has died. It's 11°C in the waiting room. Mrs Higgins is wearing two coats and has brought a flask. The plumber can do Thursday "maybe".`,
 choices:[
  {t:'New boiler (£6,500)',fx:(()=>S.flags.soldBuilding?{cash:-1}:{cash:-6.5}),o:()=>S.flags.soldBuilding?`The landlord pays for the boiler, grumbling. You pay for the plumber's call-out.`:`The new boiler is "A-rated". The invoice is not.`},
  {t:'Portable heaters until spring',fx:{team:-5,patients:-2,safety:-2,cash:-0.4},o:`Six fan heaters and a tangle of extension leads. The fire risk assessment weeps quietly.`}
 ]},

{id:'photocopier',who:'rep',title:'A print solution',
 text:`A sales rep offers a "managed print solution": a photocopier on a seven-year lease at £610 a month. "It scans directly to the cloud." You currently scan to a PC called RECEPTION-OLD-2.`,
 choices:[
  {t:'Sign',fx:{team:2,inbox:-20},run(){ addMod({id:'printer',label:'Photocopier lease',months:99,fx:{cash:-0.61}}); },o:`It staples. It hole-punches. It will outlive you, contractually.`},
  {t:'Decline and buy a £300 scanner',fx:{cash:-0.3},o:`RECEPTION-OLD-2 gets a friend. It's fine.`}
 ]},

{id:'rep_lunch',who:'rep',title:'Lunch and learn',
 text:`Chad would love to buy the team lunch at the Wednesday clinical meeting and "share some exciting data" on a new inhaler. The sandwiches are from the good deli. The data is from the good marketing department.`,
 choices:[
  {t:'Accept, and critique the data afterwards',fx:{team:3,you:1},o:`The sandwiches are excellent. Raj takes the trial apart slide by slide. Chad takes notes. Everyone learns something.`},
  {t:'Decline. You follow the local formulary.',fx:{team:-1,safety:1},o:`Principled. Hungry.`}
 ]},

{id:'locum_offer',who:'agency',title:'A locum is available',
 text:`The agency has a GP available for two weeks starting tomorrow: £110 an hour, sessions only, "no home visits, no results, no letters". The waiting list for routine appointments is 3 weeks.`,
 choices:[
  {t:'Book them (about £4,400)',fx:{cash:-4.4,patients:2},run(){ addMod({id:'locum2',label:'Agency locum in post',months:1,capAdd:60,fx:{inbox:30}}); },o:`Excellent clinician. Leaves every day at 6pm sharp. Also leaves 30 unactioned results in your inbox.`},
  {t:'No thanks',fx:{you:-1},o:`You look at the three-week wait. It looks back.`}
 ]},

{id:'research',who:'pcn',title:'Research practice?',
 text:`The regional research network would like the practice to recruit patients to national studies. They'll fund a research nurse for a day a week, and pay per patient recruited.`,
 choices:[
  {t:'Sign up',fx:{team:3,you:-1},run(){ addMod({id:'research',label:'Research network income',months:99,fx:{cash:0.6}}); },o:`Maureen does the training and becomes quietly evangelical. The practice logo appears on a slide at a national conference.`},
  {t:'Not now',fx:{you:1},o:`Maybe once the building stops leaking.`}
 ]},

{id:'icb_plan',who:'icb',title:'An access improvement plan',
 text:`Jonathan from the ICB needs your "access improvement plan" by Friday. There's a template. It is 14 pages. Completion unlocks a payment. Not completing it "will be noted".`,
 choices:[
  {t:'Write it (Friday night)',fx:{you:-3,cash:4.5},o:`You write "we will continue to improve access" in eleven different ways. The payment arrives two months later.`},
  {t:'Bev writes it from last year\'s',fx:{team:-2,cash:4.5},alt:{p:0.3,fx:{team:-2,safety:-2},o:`Bev's version still mentions Dr Hartley and a phone system you replaced. The ICB notices.`},o:`It's accepted without comment. Nobody at the ICB reads it either.`},
  {t:'Don\'t bother',fx:{you:1},o:`It is noted.`}
 ]},

{id:'inhaler_switch',who:'icb',title:'A prescribing incentive',
 text:`The ICB will pay you to switch 400 patients from metered-dose to dry-powder inhalers: greener, cheaper, and a lot of letters. "It's a quick win," says Jonathan, who has never done an inhaler review.`,
 choices:[
  {t:'Do it properly, with reviews',fx:{you:-2,cash:3,qof:2,inbox:30},o:`Raj and Maureen check technique for 400 patients. Twelve discover they've never used their inhalers properly. The planet thanks you, quietly.`},
  {t:'Bulk switch by letter',fx:{cash:3,patients:-3,safety:-2},o:`"I DON'T KNOW HOW TO USE THIS NEW ONE" is the most common phrase on the phones for a month.`},
  {t:'Decline',fx:{},o:`The inhalers stay the same. So does the funding.`}
 ]},

{id:'measles',who:'maureen',title:'Measles',months:[3,4,5,6,7,8,9],
 text:`There's measles at the primary school on Mill Lane. Four confirmed cases. Your MMR uptake at age five is 81%. Maureen has pulled up the list of unvaccinated children. It's long.`,
 choices:[
  {t:'Catch-up clinics every evening this week',fx:{team:-3,you:-2,safety:3,qof:2,cash:1.5},o:`Maureen vaccinates 94 children. One mum says "I didn't know it was still a thing". It is still a thing.`},
  {t:'Send letters and carry on',fx:{safety:-2,patients:-1},o:`Nine families book in. The outbreak team calls to ask what else you're doing.`}
 ]},

{id:'flu_saturday',who:'maureen',title:'Flu Saturday',months:[5,6],
 text:`The flu vaccines have arrived. Maureen proposes the traditional Flu Saturday: 1,100 jabs in six hours, a one-way system through the car park and a staff rota with military precision.`,
 choices:[
  {t:'Go big: Flu Saturday',fx:{cash:5,team:-3,you:-3,patients:3,safety:1},o:`1,137 vaccines. Someone faints (fine). Someone brings a dog (fine). The pharmacy chain two streets away is quietly furious.`},
  {t:'Opportunistic jabs only',fx:{cash:1.5,patients:-1},o:`Most of your over-65s get their vaccine at the pharmacy. You lose the income, not the sleep.`}
 ]},

{id:'heatwave',who:'bev',title:'Heatwave',months:[2,3,4],
 text:`It's 33°C. The server cupboard is 41°C and making a noise like a hairdryer. The waiting room smells like a bus.`,
 choices:[
  {t:'Buy portable air conditioning (£800)',fx:{cash:-0.8,team:3},o:`The server stops wheezing. So does Maureen.`},
  {t:'Prop the doors and windows open',fx:{safety:-2,team:-1},o:`A pigeon enters Room 5 during a smear. Consent was not obtained, from anyone.`}
 ]},

{id:'pharmacy_close',who:'chemist',title:'The pharmacy on the high street',
 text:`Ashok rings. The chain pharmacy on the high street is closing next month. That's 4,000 prescriptions a month looking for somewhere to go, and a lot of Pharmacy First consultations coming back to you.`,
 choices:[
  {t:'Work with Ashok on a plan',fx:{you:-2,patients:1,demand:1},o:`Ashok takes on extra staff and a delivery van. You redirect sensibly. It's still busier.`},
  {t:'Nothing you can do',fx:{demand:2.5,patients:-2},o:`Demand at the surgery goes up. So do complaints about "the chemist".`}
 ]},

{id:'online_all_day',who:'dept',title:'Open all hours',months:[5,6,7],
 text:`New requirement: the online consultation tool must stay open all day. At 8:04am on day one there are 212 requests. One says: "Can I have an appointment for next Thursday? Not urgent. Also my wart."`,
 choices:[
  {t:'Comply, and add a clinician to triage the flow',fx:{team:-2,cash:-1,demand:1},o:`A GP triages the online flow all morning. It works. It also means one fewer GP seeing patients.`},
  {t:'Comply with a much better form',fx:{you:-2,demand:1.5},o:`You rewrite the form with Bev. Now it asks "is this urgent?" Everyone ticks yes.`}
 ]},

{id:'enhanced_access',who:'pcn',title:'Saturday sessions',
 text:`The PCN needs someone to cover Saturday enhanced access clinics for three months. It pays well. Saturday mornings used to be for parkrun and being a person.`,
 choices:[
  {t:'Take them',fx:{you:-3},run(){ addMod({id:'ea',label:'Saturday enhanced access',months:3,capAdd:30,fx:{cash:1.2,you:-1}}); },o:`You do Saturdays. The patients are working people who can't come in the week. They are wonderfully grateful.`},
  {t:'Decline',fx:{you:1},o:`Parkrun. PB. Worth it.`}
 ]},

{id:'accountant',who:'accountant',title:'Quarterly figures',months:[3,6,9],
 text:()=> S.cash<10 ? `Neville from the accountants looks over his glasses. "The partners' drawings are running ahead of profit. At this rate you'll be paying money back in at year end. Personally."` : `Neville from the accountants looks over his glasses. "It's healthier than most. Although your staff costs are rising faster than your income. As everyone's are."`,
 choices:[
  {t:'Cut partners\' drawings for three months',fx:{you:-2,okoye:6,cash:6},o:`You all take a pay cut for a quarter. The overdraft breathes out. Your mortgage breathes in.`},
  {t:'Review every contract and direct debit',fx:{cash:2.5,you:-2},o:`You find £2,500 of savings, including a subscription to a magazine about hospital car parks.`},
  {t:'Thank Neville and change nothing',fx:{you:1},o:`He nods, in a way that means "I'll send you an email you won't read".`}
 ]},

{id:'pension',who:'accountant',title:'The pension',
 text:`Your NHS Pension statement has arrived. It's late, it's wrong, and it says you worked 0 sessions in 2023. The helpline hold music is Vivaldi's Four Seasons. All four.`,
 choices:[
  {t:'Spend an evening fixing it',fx:{you:-3},o:`Ninety minutes of hold music later, a lovely woman called Janet fixes it. You nearly send Janet flowers.`},
  {t:'Future you can deal with it',fx:{you:1},o:`Future you is going to be so annoyed.`}
 ]},

{id:'hospital_discharge',who:'hospital',title:'The Christmas clear-out',months:[8],
 text:`It's 23rd December. St Swithin's has discharged 38 of your patients in two days to free beds. Every discharge letter ends "GP to follow up bloods in one week and review medications". The first week of January is going to be busy.`,
 choices:[
  {t:'Bounce the inappropriate requests back',fx:{inbox:40,team:1,safety:-1},o:`You send a polite template about the hospital arranging its own tests. Half come back to you anyway, in January.`},
  {t:'Just do them all',fx:{inbox:80,you:-4,safety:2,patients:2},o:`Raj and you work through them on Christmas Eve. Every one gets done. You eat a mince pie from the reception tin, standing up.`}
 ]}
);
