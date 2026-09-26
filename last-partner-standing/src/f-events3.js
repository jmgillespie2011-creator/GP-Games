/* ===================== EVENTS 3: money, safety, systems ===================== */
EVENTS.push(
{id:'fridge',who:'maureen',title:'The vaccine fridge',tag:'rule',
 info:'Vaccines must be stored between 2°C and 8°C. After a cold-chain breach the stock is quarantined and the manufacturers are asked whether it\'s still usable. Using compromised vaccines can mean recalling patients to be revaccinated.',
 text:`Monday morning. The vaccine fridge data logger shows it reached 11°C for about six hours over the weekend. Inside: £7,000 of vaccines. Maureen is holding the logger like it's a murder weapon.`,
 choices:[
  {t:'Quarantine the stock and ask the manufacturers for stability advice',fx:{you:-2,safety:4,cash:-2.5,aim:{safety:1}},o:`About two thirds is fine according to the manufacturers' data. The rest is binned. You write it up as a significant event and fit a second alarm. The system works.`},
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
 text:`A hospital letter about Mrs A was scanned into Mrs B's record, then posted to Mrs B. Mrs B rings to say she has "learned a lot about Mrs A's bowels".`,
 choices:[
  {t:'Log it as a data breach and apologise to both',fx:{safety:4,you:-2},o:`You assess it against the reporting criteria, record it properly and apologise to both patients. Mrs A is gracious. Mrs B is enjoying herself.`},
  {t:'Apologise and move on',fx:{you:1},later:[{in:2,p:0.35,fx:{safety:-8,rep:-3,cash:-5},note:'Mrs A complained to the Information Commissioner about the misfiled letter. The legal advice cost £5,000.'}],o:`It blows over. Probably.`}
 ]},

{id:'methotrexate',who:'raj',title:'Nine months without bloods',tag:'story',
 text:`Raj has found a patient on methotrexate who hasn't had a blood test in nine months. The repeats have gone out every month without anyone noticing. Raj thinks there are more.`,
 choices:[
  {t:'Run a full high-risk drug monitoring audit',need:()=>S.staff.pharm>0,why:'You need a clinical pharmacist',fx:{safety:6,inbox:40,team:-1,aim:{safety:2}},o:`Raj finds 31 patients overdue monitoring. Two had significant results. The audit may have saved a life, and now it runs every quarter.`},
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

{id:'it_outage',who:'it',title:'System down',tag:'story',
 text:`08:04 Monday. The clinical system is down. No records, no prescribing, no appointments. The helpdesk estimates "sometime today". The waiting room is filling up.`,
 choices:[
  {t:'Paper day: handwritten notes, scan later',fx:{safety:-2,you:-2,team:3,inbox:60},o:`Maureen finds the paper prescription pads. Alan knows how to do this from 1989. There's a Blitz spirit. Then there's the scanning.`},
  {t:'Urgent-only service until it\'s back',fx:{patients:-4,you:1},o:`It's back at 1:40pm. You spend the afternoon rebooking the morning.`}
 ]},

{id:'phones',who:'kayleigh',title:'The phones have died',cond:()=>!S.flags.telephony,tag:'story',
 text:`08:00:14. The phone system has crashed. It was installed in 2008, and the engineer who understood it has retired to Spain. People are ringing 111 to ask why the surgery isn't answering.`,
 choices:[
  {t:'Commit to a cloud telephony upgrade',fx:{you:-1,flags:{telephony:1}},o:`You sign the contract. Going live is now a project you can choose: queue positions, call-backs and data you can actually use.`},
  {t:'Get it patched up (£900)',fx:{cash:-0.9,patients:-2},later:[{in:3,p:0.6,fx:{patients:-4,rep:-3},note:'The patched-up phone system crashed again at 8am on a Monday.'}],o:`It's working by 10am.`}
 ]},

{id:'roof',who:'bev',title:'Drip',tag:'story',
 text:`There's water coming through the ceiling of Room 3. It's landing, with some precision, on the examination couch. The flat roof has been "fine for years".`,
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
 text:`Chad would love to buy lunch for Wednesday's clinical meeting and "share some exciting data" on a new inhaler. The sandwiches are from the good deli. The data is from the good marketing department.`,
 choices:[
  {t:'Accept, and critique the data afterwards',fx:{team:3,you:1},o:`The sandwiches are excellent. Raj takes the trial apart slide by slide. Chad takes notes. Everyone learns something.`},
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
 text:`Jonathan from the ICB needs your "access improvement plan" by Friday. There's a 14-page template. Completing it unlocks a payment. Not completing it "will be noted".`,
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
  {t:'Catch-up clinics every evening this week',fx:{team:-3,you:-2,safety:3,qof:2,cash:1.5,rep:2},o:`Maureen vaccinates 94 children. One parent says "I didn't know it was still a thing". It is still a thing.`},
  {t:'Send letters and carry on',fx:{safety:-2,patients:-1},o:`Nine families book in. The outbreak team calls to ask what else you're doing.`}
 ]},

{id:'heatwave',who:'bev',title:'Heatwave',months:[2,3,4],tag:'story',
 text:`It's 33°C. The server cupboard is 41°C and making a noise like a hairdryer. The waiting room smells like a bus.`,
 choices:[
  {t:'Buy portable air conditioning (£800)',fx:{cash:-0.8,team:3},o:`The server stops wheezing. So does Maureen.`},
  {t:'Prop the doors and windows open',fx:{safety:-2,team:-1},o:`A pigeon enters Room 5 during a smear. Consent was not obtained, from anyone.`}
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
);
