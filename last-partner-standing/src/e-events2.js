/* ===================== EVENTS 2: patients, team, you ===================== */
EVENTS.push(
{id:'higgins_list',who:'higgins',title:'The list',tag:'story',
 text:`Mrs Higgins has brought a list. It's double-sided. Item one is her knee. Item five, in smaller writing, says "chest goes tight on the stairs, probably nothing". She has also brought you a tin of shortbread.`,
 choices:[
  {t:'Work through all seven items',fx:{patients:4,you:-4,rep:1},later:[{in:1,p:0.6,fx:{safety:2,rep:1},note:'Mrs Higgins\' ECG, from item five of her list, showed atrial fibrillation. She\'s now on anticoagulation. Good catch.'}],o:`Forty minutes later you're 35 minutes behind, but you've booked an ECG for item five. The shortbread is excellent.`},
  {t:'"Let\'s do the two most important today."',fx:{patients:1,you:-1},later:[{in:1,p:0.5,fx:{safety:2},note:'Mrs Higgins\' ECG showed atrial fibrillation. She chose item five as her second problem. Good instinct, hers.'}],o:`She chooses the knee and, after a pause, item five. You arrange an ECG.`},
  {t:'"One problem per appointment, I\'m afraid."',fx:{patients:-3,you:1},later:[{in:1,p:0.35,fx:{safety:-4,rep:-2,you:-3},note:'Mrs Higgins was admitted with a fast, irregular heart rate. It was item five on the list you didn\'t get to.'},{in:1,p:1,fx:{inbox:12},note:'Mrs Higgins rebooked items two to seven as six separate appointments.'}],o:`She folds the list away without a word. Your clinic runs to time.`}
 ]},

{id:'ai_printout',who:'patient',title:'Dr Chatbot',tag:'story',
 text:`A 34-year-old man brings a 12-page printout. "I put my symptoms into an AI. It says Addison's disease, lupus, or a rare parasite." He's been exhausted since his baby was born four months ago. He looks it.`,
 choices:[
  {t:'Go through the printout together, properly',fx:{patients:4,you:-3,rep:1},o:`It takes 25 minutes. He leaves reassured, with sensible bloods booked and a plan for sleep. He asks if he can give the AI your feedback.`},
  {t:'Order every test on the list to settle it',fx:{patients:3,inbox:35,cash:-0.3},later:[{in:1,p:0.6,fx:{inbox:25,you:-2},note:'Because you ordered everything on the AI\'s list: one borderline result has generated four more tests and two referrals.'}],o:`Seventeen blood tests. Sixteen will be normal.`},
  {t:'"The internet isn\'t a doctor."',fx:{patients:-4,you:1,rep:-1},o:`He posts a one-star review: "Dismissive. The AI had better bedside manner." It stings because it's a little bit true.`}
 ]},

{id:'antibiotics',who:'patient',title:'Just in case',months:[6,7,8,9,10],tag:'story',
 text:`A mum has taken the afternoon off work because her son's cold "went to his chest last winter and he ended up in hospital". Today his chest is clear and his temperature is 37.1. She's frightened, not demanding.`,
 choices:[
  {t:'Explain viral infections, and give clear safety-netting',fx:{patients:1,safety:2},o:`You tell her exactly what would worry you and when to come back. She writes it down. He's better by Sunday.`},
  {t:'Give a delayed prescription',fx:{patients:2,safety:1},o:`"Only if it isn't better in a few days, or if these things happen." She understands. She doesn't collect it.`},
  {t:'Just give him the amoxicillin',fx:{patients:3,safety:-3},later:[{in:3,p:0.45,fx:{icb:-3,you:-1},note:'The ICB medicines team flagged your antibiotic prescribing rates. There\'s a template to complete.'}],o:`She's relieved. Your antibiotic prescribing data isn't.`}
 ]},

{id:'insurer_letter',who:'insurer',title:'Unfit to travel',tag:'real',src:['S29'],
 info:'Insurance reports and letters are private work. Practices can charge for them, and GPs can only certify what they know from their own records.',
 text:`A travel insurer wants a GP to certify that a patient was "medically unfit to travel" three weeks ago, so they'll pay out on a cancelled holiday. You didn't see her then. There's nothing in the notes.`,
 choices:[
  {t:'Decline, and offer a private letter about what the records show',fx:{patients:-1,safety:2},o:`She pays £35 for a factual letter that says there's no consultation on record. The insurer rejects the claim. She's cross with the insurer, not you.`},
  {t:'Introduce a clear private fee list for letters and reports',fx:{patients:-2,team:2},run(){ addMod({id:'fees',label:'Private fee income',months:99,fx:{cash:0.4}}); },o:`Reception gets a laminated fee list. Requests for "a quick letter" halve. Income from the rest: about £400 a month.`},
  {t:'Write what she needs. It\'s easier.',fx:{patients:2,safety:-4},later:[{in:3,p:0.3,fx:{you:-6,safety:-3},note:'The insurer\'s fraud team has asked for the medical records behind your letter. Your defence organisation is "concerned".'}],o:`You sign it, and lie awake thinking about the phrase "fitness to practise".`}
 ]},

{id:'facebook',who:'paper',title:'The Facebook group',tag:'story',
 text:`The {place} Community Chat group has a post: "ANYONE ELSE UNABLE TO GET THROUGH TO {surgery}??? 🤬". It has 312 comments. Most are about the phones. They're not wrong about the phones.`,
 choices:[
  {t:'Post a calm explainer about how to get help',fx:{patients:2,you:-2,rep:3},o:`"Thanks for explaining!!" says one comment. "Typical excuses" says another. Net positive, mostly.`},
  {t:'Ignore it. Never read the comments.',fx:{you:1,rep:-3},o:`You don't read the comments. Bev does, and summarises them for you at length.`},
  {t:'Invite the post\'s author to join the patient group',fx:{you:-1},alt:{p:0.35,fx:{you:-3,rep:-1},o:`She comes. She brings the other 311 commenters' concerns in a ring binder.`},run(){ if(!S._alt) applyFx({rep:5,aim:{patients:1}}); },o:`She comes, listens, and becomes your most ferocious defender online. Nobody saw that coming.`}
 ]},

{id:'pratt_complaint',who:'pratt',title:'A formal complaint',tag:'rule',
 info:'NHS complaints must be acknowledged within three working days, and complainants can escalate to the Parliamentary and Health Service Ombudsman. Many complaints are really about access.',
 text:`Mr Pratt has written a formal complaint. He was told to ring back at 8am four days running, then offered a routine appointment in three weeks. He has copied in the ICB and his MP. He isn't wrong.`,
 choices:[
  {t:'Invite him in to talk it through',fx:{you:-3,patients:2,rep:2},o:`He talks for an hour about his wife's dementia and why he gets so angry on the phone. At the end he shakes your hand: "First time anyone's listened."`},
  {t:'Send a careful written response',fx:{patients:-1,safety:1},o:`Your response is measured and correct. His reply is longer.`},
  {t:'Suggest he might be happier registered elsewhere',fx:{you:1},alt:{p:0.65,fx:{patients:-4,rep:-4,icb:-2,sched:[['pratt_mp',1]]},o:`He isn't happier. He writes to his MP, and to the paper.`},o:`He registers across town. It doesn't feel like a win.`}
 ]},

{id:'pratt_mp',arc:1,who:'mp',title:'A letter from Westminster',tag:'story',
 text:`Sir Geoffrey Pomfrey MP has written about "serious concerns raised by a constituent". He'd be "delighted to visit and see the challenges first-hand", ideally with a photographer.`,
 choices:[
  {t:'Invite him to shadow a Monday',fx:{you:-3},alt:{p:0.4,fx:{rep:-2,you:-3},o:`He stays 40 minutes, takes a selfie with the flu vaccines, and announces "more funding for GPs" that turns out to be last year's funding.`},run(){ if(!S._alt) applyFx({rep:5,patients:3,icb:2}); },o:`He sees the 8am queue, sits in on triage, and goes quiet. He writes a column about it. It's weirdly good.`},
  {t:'Reply with a factual letter and some statistics',fx:{you:-1,safety:1},o:`His office thanks you for your "valuable insights". Nothing else happens, which counts as a win.`}
 ]},

{id:'abuse',who:'kayleigh',title:'On the front line',max:2,rep:1,tag:'real',src:['S37'],w:()=>S.practiceKey==='city'?2:1,
 info:'In a 2026 study of 1,152 general practice staff, 92.3% had faced verbal abuse and 47.7% physical violence or threats. Reception staff were the most affected.',
 text:`A man has been shouting at Kayleigh for ten minutes because his prescription "should have been done already". It was requested 40 minutes ago. Kayleigh is 22. She's shaking.`,
 choices:[
  {t:'Zero tolerance: warning letter, then removal',fx:{team:6,patients:-1,aim:{team:2}},o:`The letter goes out. The team notices you backed them, and they'll remember it.`},
  {t:'Step out and de-escalate it yourself',fx:{team:3,you:-3,patients:1},o:`You calm him down. It takes 15 minutes you didn't have. Kayleigh brings you a tea later without being asked.`},
  {t:'Fit panic alarms and a proper screen (£2,000)',fx:{team:4,cash:-2,aim:{team:1,safety:1}},o:`The installer asks if you'd like the bulletproof option. You pause for longer than you'd like to admit.`}
 ]},

{id:'aldi',who:'kayleigh',title:'An offer from Aldi',cond:()=>S.staff.recep>=3,tag:'real',src:['S18'],
 info:'The National Living Wage rose to £12.71 an hour in April 2026. Practice pay has to compete with supermarkets, and every rise also costs 15% employer NI above £5,000 a year.',
 text:`"Aldi have offered me £1.60 an hour more," Kayleigh says, "and nobody at Aldi has ever called me a jumped-up little secretary." She doesn't want to leave. She also doesn't want to be poor.`,
 choices:[
  {t:'Raise pay for the whole reception team',fx:{team:6,aim:{team:3}},run(){ S.payX=(S.payX||0)+1.1; },o:`The team gets a raise, costing about £1,100 a month. Reception morale is the best it has been in years.`},
  {t:'Match it for Kayleigh only',fx:{team:-1},run(){ S.payX=(S.payX||0)+0.3; addMod({id:'resent',label:'Resentment over a pay rise for one',months:3,aim:{team:-3}}); },o:`She stays. Everyone finds out within the hour.`},
  {t:'Wish her well',fx:{team:-5},run(){ S.staff.recep--; },o:`She goes. The Aldi on the bypass now has the best customer service in the county.`}
 ]},

{id:'home_visit',who:'patient',title:'A home visit request',tag:'story',
 text:`A daughter asks for a home visit for her mum, 88, who "isn't herself". Mum gets a lift to the day centre on Thursdays, so reception isn't sure she qualifies. The home-visit criteria were last updated when the practice still had a fax machine.`,
 choices:[
  {t:'Visit after morning surgery',fx:{you:-3,patients:2,rep:1},o:`She's confused and feverish: a urine infection with delirium. You start treatment and arrange for someone to check in tomorrow. Glad you went.`},
  {t:'Offer a phone consultation first',fx:{patients:-1},later:[{in:1,p:0.3,fx:{patients:-2,safety:-3},note:'The woman you assessed by phone was admitted overnight with delirium from a urine infection.'}],o:`The daughter describes her mum as "a bit muddled". You arrange a urine sample.`},
  {t:'Send the paramedic',need:()=>S.staff.para>0,why:'You don\'t have a paramedic',fx:{patients:1,you:1},o:`The paramedic goes, finds a urine infection with delirium, starts treatment and rings you from the car. This is what the role is for.`}
 ]},

{id:'care_home',who:'icb',title:'The care home',tag:'real',src:['S3','S4'],
 info:'Care home residents count 1.43 times in the funding formula, and PCNs get a care home premium of £133.16 per bed. In return: weekly ward rounds, care plans and a lot of phone calls.',
 text:`The 64-bed care home on Mill Lane has lost its GP practice. The ICB asks if you'll take it on: weekly ward rounds, anticipatory care plans and around 40 calls a week.`,
 choices:[
  {t:'Take it on',fx:{list:64,demand:2,patients:1,icb:4},run(){ S.careBeds+=64; addMod({id:'carehome',label:'Care home ward rounds',months:99,hours:1.5,fx:{cash:0.7}}); },o:`Ward round on Tuesdays. The care staff are wonderful. The funding comes through the formula and the PCN; the phone calls come through you.`},
  {t:'Decline. You can\'t cover it safely.',fx:{you:1,icb:-3},o:`Jonathan sighs audibly. The home goes to the practice across town, who complain about it at every PCN meeting.`}
 ]},

{id:'estate',who:'bev',title:'Six hundred new homes',cond:()=>S.practiceKey!=='city',tag:'real',src:['S3'],
 info:'New registrants count 1.46 times in the global sum for their first year, which reflects the extra work of new patients. The demand arrives with them.',
 text:`The new estate on the old airfield is finished: 600 homes, one pub, no new surgery. The money set aside for "healthcare infrastructure" has been spent on a roundabout.`,
 choices:[
  {t:'Register everyone who comes',fx:{team:-2,rep:2},run(){ S.list+=520; S.newRegs.push({n:520,until:S.month+12}); },o:`Five hundred and twenty new patients in two months. More money, more demand, and a lot of toddlers with ears.`},
  {t:'Apply to close the list',fx:{team:2,icb:-8,rep:-3},alt:{p:0.5,fx:{team:-3,you:-2,icb:-5},run(){ S.list+=520; S.newRegs.push({n:520,until:S.month+12}); },o:`The ICB refuses. The patients come anyway.`},run(){ if(!S._alt){ S.list+=180; S.newRegs.push({n:180,until:S.month+12}); } },o:`The ICB agrees to a short closure. Some patients come anyway, through exceptions Bev has never heard of.`}
 ]},

{id:'mounjaro',who:'patient',title:'"Offered by GPs"',months:[3,4,5,6,7,8,9,10],tag:'real',src:['S76','S77'],
 info:'NICE approved tirzepatide (Mounjaro) for obesity, and since 23 June 2025 ICBs have had to fund it in primary care, phased in over several years. The first people eligible have a BMI of 40 or more and at least four of five weight-related conditions. Practices aren\'t obliged to prescribe it. Whether there is a locally commissioned service (LCS) paying for the diet and activity support, the monitoring and the staff time depends on the ICB, and many practices have had none.',
 text:`New NHS guidance on weight-loss jabs led last night's news: "Mounjaro to be offered by GPs". Forty-one online requests since, most starting "I saw on the news". In this first phase, the NHS criteria are a BMI of 40 or more and four of five weight-related conditions: about a dozen of your patients qualify. Your ICB hasn't commissioned a local service, so there's no money for the support and monitoring that's meant to go with it.`,
 choices:[
  {t:'Prescribe for the eligible few and build the support yourselves, unfunded',fx:{patients:3,team:-2,you:-2,qof:1},run(){ addMod({id:'weight',label:'Unfunded weight management clinic',months:3,demand:1.5,hours:1}); },o:`Maureen runs the checks and follow-ups on top of her diabetes clinics. It's good care. Nobody is paying for it, and the other 29 requests still need a reply.`},
  {t:'Apply the criteria, and wait for a funded local service',fx:{patients:-3,safety:1},later:[{in:2,p:0.5,fx:{rep:-2,patients:-2},note:'The Facebook group is convinced a practice two towns over prescribes Mounjaro to anyone who asks. It doesn\'t.'}],o:`Reception sends a clear message about the criteria. Most people understand. Some are very upset, and you understand why.`},
  {t:'Point people to private providers',fx:{patients:-1,you:1,inbox:25},later:[{in:1,p:1,fx:{inbox:30},note:'Private weight-loss prescribers have sent 30 letters asking you to "please monitor".'}],o:`Private prescribing surges, and so do the letters about it.`},
  {t:'Press the ICB, with the PCN, to commission a proper service',fx:{you:-1,icb:-1},later:[{in:3,p:0.5,fx:{cash:2,team:1},note:'The ICB has commissioned a weight management LCS. Funding and a shared dietitian arrive.'}],o:`The PCN writes to the ICB with the numbers. The reply says a service is "being scoped".`}
 ]},

{id:'shared_care',who:'raj',title:'Please could the GP...',tag:'real',src:['S25'],
 info:'Shared care, where a GP takes over prescribing and monitoring from a specialist, is voluntary and should come with an agreement. Unfunded requests from private providers became a flashpoint in the BMA\'s 2025/26 dispute.',
 text:`Raj has 23 requests from private clinics asking you to take over prescribing and monitoring. There are no shared care agreements for most of them. "What's our policy?" he asks. You don't have one.`,
 choices:[
  {t:'Accept them all to keep patients happy',fx:{patients:3,safety:-4,inbox:40},later:[{in:2,p:0.4,fx:{safety:-5,you:-3},note:'A patient on one of the private shared-care requests went four months without monitoring bloods.'}],o:`Twenty-three new monitoring schedules. Six have no baseline bloods. Raj starts a spreadsheet with a skull in the title.`},
  {t:'Write a policy: no agreement, no shared care',fx:{patients:-3,safety:3,you:1,aim:{safety:1}},o:`Some patients are unhappy, and you understand why. But now there's a clear answer, written down, and Raj stops twitching.`},
  {t:'Case by case',fx:{you:-3,safety:1},o:`Each one takes 20 minutes. You approve nine. Raj respects you but also looks tired.`}
 ]},

{id:'google_review',who:'kayleigh',title:'One star',tag:'real',src:['S34'],
 info:'Nationally, about 57% of patients find it easy to contact their practice by phone. Online reviews mostly reflect that first contact.',
 text:`New review: "⭐ Rang 47 times. Gave up. Staff lovely once you get through." It's the fourth this month about the phones.`,
 choices:[
  {t:'Reply publicly and explain the new call-back options',fx:{you:-1,rep:1},o:`It's specific and honest. Two people reply that they didn't know about the call-back option.`},
  {t:'Ask happy patients to leave reviews',fx:{team:2,rep:3},o:`Mrs Higgins leaves one. It's 600 words long and mentions the shortbread.`},
  {t:'Never look at reviews again',fx:{you:2,rep:-1},o:`Liberating. The reviews carry on without you.`}
 ]},

{id:'gift',who:'patient',title:'A token of thanks',months:[8],tag:'story',
 text:`A grateful patient leaves a bottle of 18-year-old single malt at reception with a card: "For the doctor who found my cancer early." It's worth about £120.`,
 choices:[
  {t:'Accept it, and record it in the gifts register',fx:{you:4,safety:1},o:`You write it in the register, as the rules require. Then you write the patient a card back. You keep theirs for years.`},
  {t:'Raffle it for the staff Christmas fund',fx:{team:4},o:`Maureen wins. She doesn't drink whisky. She sells it to Alan for £60 and buys the team doughnuts.`}
 ]},

{id:'dna',who:'bev',title:'Did not attend',tag:'story',
 text:`Last month 186 booked appointments weren't attended. That's about 30 GP sessions. Bev has made a poster that says "186 PEOPLE WASTED APPOINTMENTS" in red capitals.`,
 choices:[
  {t:'Automated reminders with an easy cancel link',fx:{demand:-1.5,patients:1},run(){ addMod({id:'sms',label:'Text reminder service',months:99,fx:{cash:-0.15}}); },o:`Missed appointments drop by a third, for about £150 a month. Three people reply "CANCEL MY ACCOUNT". It isn't that kind of service.`},
  {t:'Put the poster up',fx:{patients:-2,demand:-0.5,rep:-1},o:`The people who read the poster are the people who came. They feel told off.`},
  {t:'Leave it. Most of them had reasons.',fx:{you:1},o:`Fair. Several were stuck in the phone queue trying to cancel.`}
 ]},

{id:'queue_rain',who:'kayleigh',title:'Queue in the rain',months:[7,8,9,10],tag:'story',cond:()=>!S.flags.telephonyLive,
 text:`It's 7:40am and there are 30 people queuing outside in the rain. Someone has brought a camping chair. They came in person because "the phones never answer".`,
 choices:[
  {t:'Open early, hand out tea, triage at the door',fx:{patients:4,team:-3,you:-2,rep:2},o:`The man in the camping chair turns out to have pneumonia. Door triage works. It also takes two receptionists off the phones.`},
  {t:'Keep the doors shut until 8, stick to the system',fx:{patients:-3,team:1,rep:-2},o:`At 8:00 the doors open and 30 damp, frustrated people all ask for "just a quick word".`}
 ]},

{id:'med_student',who:'med',title:'A student for the summer',months:[2,3,4,5],tag:'story',
 text:`The medical school asks if Oliver, a third-year student, can sit in for four weeks. He's keen, polite, and has never seen a patient over 30 who wasn't in a hospital bed.`,
 choices:[
  {t:'Take him. Teaching is why you became a doctor.',fx:{you:2,team:2,cash:0.8},o:`He's brilliant with Mrs Higgins. At the end he says he wants to be a GP. You tell him to think carefully, and to go ahead.`},
  {t:'Not this year',fx:{you:1},o:`He goes to dermatology. He sends a photo from a conference in Barcelona.`}
 ]},

{id:'training',who:'pcn',title:'Become a training practice?',months:[0,1,2],tag:'story',
 text:`The deanery is desperate for training places. If you become a GP trainer, a registrar arrives in August. You'll need a trainer's course, a room and supervision time. "Trainees often become your next partners," Clare says.`,
 choices:[
  {t:'Sign up. Grow your own GPs.',fx:{you:-4,team:2,flags:{training:1}},run(){ addMod({id:'registrar',label:'GP registrar in post',months:8,at:4,capAdd:70,hours:1.5,fx:{cash:0.7}}); },o:`Trainer's course on Thursday evenings. Dr Ellie Chen joins in August.`},
  {t:'Not this year',fx:{you:1},o:`Maybe next year. You say that every year.`}
 ]},

{id:'reg_crisis',who:'reg',title:'A registrar in the doorway',cond:()=>hasMod('registrar')&&S.month>=5,tag:'story',
 text:`Ellie is in your doorway at 5:50pm. "Sorry. I've got a baby with a temperature and a rash, and I just need to run it past you." The last three times, she was right.`,
 choices:[
  {t:'Go and see the baby with her',fx:{you:-2,safety:3,team:2},o:`It's a viral rash. You go through the traffic-light features together. She'll be a very good GP.`},
  {t:'Talk it through, then trust her judgement',fx:{you:1,safety:1},o:`She's got it right. She wanted to hear it. You tell her. That's supervision.`}
 ]},

{id:'bev_retire',who:'bev',title:'Bev has news',months:[5,6,7,8,9],tag:'story',
 text:`Bev sits down. "I'm 64. My husband wants to buy a caravan. I'm thinking of retiring at Christmas." Bev is the only person who knows the payroll password, the smartcard admin and the alarm code.`,
 choices:[
  {t:'Offer a retention bonus and three days a week (£3,000)',fx:{cash:-3,team:3},o:`She takes it. "Three days. And I'm not doing CQC again." Fair.`},
  {t:'Recruit a new practice manager',fx:{team:-3,you:-2},run(){ addMod({id:'newpm',label:'New practice manager settling in',months:3,aim:{safety:-6,team:-2},hours:1}); },o:`The new manager is sharp and has an MBA. It'll take her three months to find where Bev kept everything.`},
  {t:'Promote Sharon, the deputy',fx:{team:2},alt:{p:0.4,fx:{team:-3},run(){ addMod({id:'sharon',label:'Sharon overwhelmed',months:3,aim:{safety:-5}}); },o:`Sharon is overwhelmed by week two. Bev comes in "just on Tuesdays" to help, unpaid. Somehow it's worse.`},o:`Sharon is brilliant. It turns out she's been doing half of Bev's job for years.`}
 ]},

{id:'maureen_course',who:'maureen',title:'The diabetes course',tag:'story',
 text:`Maureen wants to do an advanced diabetes course: two days a month for three months, paid by the practice. "Then I can start insulin myself. I'm fed up of waiting for you lot."`,
 choices:[
  {t:'Pay for it (£1,200) and cover her sessions',fx:{cash:-1.2,team:3,qof:2},later:[{in:3,p:1,fx:{qof:4,safety:1},note:'Maureen finished her diabetes course. She\'s already started three patients on insulin and cleared the diabetes review backlog.'}],o:`She'll come back with a certificate and a new level of authority, which you didn't think possible.`},
  {t:'Not now, maybe next year',fx:{team:-4},later:[{in:2,p:0.5,fx:{team:-2},note:'Maureen booked the diabetes course herself and applied for study leave. She knows the rules better than you.'}],o:`She takes it well. Suspiciously well.`}
 ]},

{id:'xmas_party',who:'bev',title:'The Christmas do',months:[8],tag:'story',
 text:`Christmas party. Last year's was a curry and a quiz that ended with the nurses and reception not speaking until February. What's the plan?`,
 choices:[
  {t:'Proper night out, practice pays (£2,500)',fx:{team:9,cash:-2.5},o:`Three courses, a DJ and a group photo nobody is allowed to post. Maureen and Kayleigh do the Macarena together. Peace is restored.`},
  {t:'Secret Santa and mince pies',fx:{team:2},o:`You get a mug that says "I survived a partners' meeting". It's accurate.`},
  {t:'Cancelled due to winter pressures',fx:{team:-6,cash:0.5},run(){ addMod({id:'noparty',label:'Still sore about the cancelled party',months:3,aim:{team:-3}}); },o:`Everyone understands. Everyone also remembers.`}
 ]},

{id:'fish',who:'maureen',title:'The microwave incident',tag:'story',
 text:`Somebody has microwaved fish in the staff kitchen. Again. There's an unsigned note on the fridge. There's a counter-note. The counter-note has been annotated.`,
 choices:[
  {t:'Buy a second microwave, for fish only (£90)',fx:{team:3,cash:-0.1},o:`The fish microwave gets its own laminated sign. Best £90 you spend all year.`},
  {t:'Write a kitchen policy',fx:{team:-2,safety:1},o:`Policy KIT-01, version 1.0, ratified at a staff meeting. Ignored by Thursday.`},
  {t:'Stay out of it',fx:{team:-1,you:1},o:`The note war escalates to Post-its on your door. You are Switzerland.`}
 ]},

{id:'cat',who:'cat',title:'A new team member',tag:'story',
 text:`A ginger cat has moved into the car park. Staff have named it QOF. It sleeps on the bonnet of whichever car is warmest. Someone has already bought it a bowl.`,
 choices:[
  {t:'Adopt QOF. Every practice needs a mascot.',fx:{team:6,safety:-2,aim:{team:1}},later:[{in:4,p:0.3,fx:{safety:-3},note:'An infection control audit found cat hair in the treatment room. QOF has been rehomed to the admin office.'}],o:`QOF gets a collar, a bed in the admin office and more social media followers than the practice.`},
  {t:'Call the cat rescue',fx:{team:-4,safety:1},o:`QOF goes to a lovely home. The staff room is quieter. Someone puts up a "missing you" poster.`},
  {t:'Unofficially tolerate QOF',fx:{team:3},alt:{p:0.3,fx:{team:2,safety:-4},o:`The inspection notes include the sentence "a cat was observed in the dispensary".`},o:`QOF is fed "by nobody". Four bowls appear. QOF gets fat.`}
 ]},

{id:'wfh',who:'bev',title:'Working from home',tag:'story',
 text:`The admin team asks to work from home two days a week. "We code letters and summarise records. We could do it in our pyjamas." Two of them already look like they do.`,
 choices:[
  {t:'Yes. Laptops and smartcard readers (£1,500)',fx:{team:5,cash:-1.5,inbox:-40,aim:{team:2}},o:`Productivity goes up. Nobody's sure why. Everyone suspects the quieter kitchen.`},
  {t:'No. We need people in the building.',fx:{team:-4},later:[{in:2,p:0.45,fx:{admin:4,team:-2},note:'An admin coder left for an NHS job with hybrid working. Letters are now piling up faster.'}],o:`They accept it. Two start looking at jobs that offer hybrid working.`}
 ]},

{id:'noro',who:'maureen',title:'Norovirus',months:[7,8,9,10],tag:'story',
 text:`Norovirus is working its way through the staff. Four people are off. Maureen is in, but green. She insists she's fine, then leaves the room at speed.`,
 choices:[
  {t:'Send everyone with symptoms home for 48 hours',fx:{safety:3,team:2},run(){ addMod({id:'noro',label:'Norovirus: staff off sick',months:1,capMul:0.9}); },o:`Capacity drops for the month. The outbreak stops with your staff, not your patients.`},
  {t:'Soldier on, it\'s winter',fx:{team:-4,safety:-4},alt:{p:0.4,fx:{team:-6,safety:-6,patients:-3},run(){ addMod({id:'noro2',label:'Norovirus outbreak',months:1,capMul:0.8}); },o:`It spreads to three patients and the care home. The outbreak team becomes your pen pal.`},o:`You get away with it. Nobody feels good about it.`}
 ]},

{id:'whatsapp',who:'kayleigh',title:'WhatsApp',tag:'story',
 text:`There's a row in the staff WhatsApp group. It started with who restocks the printer paper. It's now about "respect" and "some people". It has 214 messages. You're in the group.`,
 choices:[
  {t:'Get the two sides in a room with biscuits',fx:{team:5,you:-2},o:`It turns out nobody knew whose job the printer was. Now Sharon knows. It's Sharon.`},
  {t:'Mute the group. Forever.',fx:{you:3,team:-2},o:`Blissful silence. You miss the message about the fire drill.`}
 ]},

{id:'pcn_arrs',who:'pcn',title:'Free staff!',cond:()=>arrsCount()<ARRS_CAP,tag:'real',src:['S4'],
 info:'The PCN is reimbursed for additional roles up to a cap for each role. The practice gets the clinician, but has to provide a room, induction and clinical supervision.',
 text:`Clare from the PCN has unspent additional-roles budget. "Would you like a mental health practitioner? Fully funded. They start next month." The PCN pays. The question is where they'll sit.`,
 choices:[
  {t:'Yes, find them a room',fx:{staff:{mhp:1},patients:2},o:`Patients who need longer than ten minutes will finally get it. You need to find a room, and an hour a week to supervise.`},
  {t:'No room at the inn',fx:{you:1},o:`The funding goes to the practice across town, which has a portakabin.`}
 ]},

{id:'rooms',who:'bev',title:'Room for everyone?',cond:()=>roomsNeeded()>roomsAvail(),tag:'real',src:['S31'],
 info:'In a 2025 BMA survey, only half of practices said their premises were suitable for present needs and 83% said they couldn\'t meet future demand. 42% of bids for improvement funding since 2022 were rejected.',
 text:`Every consulting room is double booked on Tuesdays. The physio is working in the baby-changing room. "We need more space," Bev says, "or fewer people. And we need the people."`,
 choices:[
  {t:'Convert the staff room into a clinic room',fx:{rooms:1,team:-5,aim:{team:-2}},o:`The staff room is now a clinic room. Lunch is eaten in the corridor. Morale takes it personally.`},
  {t:'Hire a portakabin for the car park (£14,000)',fx:{rooms:2,cash:-14},o:`It arrives on a lorry. It has air conditioning and a ramp. It's the nicest room in the building.`},
  {t:'Bid for improvement funding (£3,000 for the architect)',fx:{cash:-3},run(){ const ok=chance(0.45+(S.icb-55)/150); plant({in:5,fx:ok?{rooms:2,team:5}:{team:-2},note:ok?'The premises improvement bid was approved. Two new consulting rooms by spring.':'The premises improvement bid was rejected: "insufficient strategic priority".'}); },o:`The architect draws two extra rooms. The decision will take about five months, and the ICB's opinion of you matters.`}
 ]},

{id:'pcn_meeting',who:'pcn',title:'Neighbourhood transformation',tag:'story',
 text:`The PCN board meets Tuesday 1-5pm: "Integrated Neighbourhood Teams: a transformation journey." There will be sticky notes. Your attendance is "strongly encouraged".`,
 choices:[
  {t:'Go. Someone has to represent the practice.',fx:{you:-3,cash:0.6,team:1,icb:2},o:`Four hours of sticky notes. You secure a share of the new frailty funding and eat a surprising number of free biscuits.`},
  {t:'Send Bev',fx:{team:-1},o:`Bev comes back with a new acronym and a quiet fury.`},
  {t:'Skip it',fx:{you:2},alt:{p:0.4,fx:{you:1,cash:-1,icb:-2},o:`The PCN divides the new money between the practices that turned up.`},o:`Nothing happens. It often doesn't.`}
 ]},

{id:'pcn_cd',who:'pcn',title:'A promotion?',months:[2,3,4,5,6],tag:'story',
 text:`Clare is stepping down as PCN Clinical Director. "You'd be great," she says. "It pays for two sessions a week, and you get a lanyard." There are eleven practices in the PCN, and each one has opinions.`,
 choices:[
  {t:'Accept the role',fx:{team:1,icb:4},run(){ addMod({id:'cd',label:'PCN Clinical Director',months:99,hours:4,fx:{cash:1.3}}); },o:`You're now responsible for eleven practices' opinions. The money helps. The four extra hours a week don't.`},
  {t:'Decline',fx:{you:2},o:`Someone else gets the lanyard. You sleep well.`}
 ]},

{id:'collective',who:'lmc',title:'Safe working',months:[1,2,3,4,5,6,7],tag:'real',src:['S25','S38'],
 info:'The BMA\'s safe working guidance suggests 25 patient contacts per GP per day. The BMA says it protects patients from unsafe care; critics, including ministers, say it reduces access. GPs rejected the 2026/27 contract changes by 98.9% in a BMA referendum.',
 text:`The LMC is urging practices to adopt safe working: a cap of 25 patient contacts per GP per day, with overflow to local hubs. "It's about safety," Steve says. "Also sanity."`,
 choices:[
  {t:'Implement the safe working cap',fx:{patients:-3,icb:-4},run(){ addMod({id:'safe',label:'Safe working cap',months:99,capMul:0.94,aim:{you:6,team:2,safety:3}}); },o:`Lists stop at 25. The overflow goes to the hub, which is full by 10am. But you leave by 7pm for the first time since you qualified.`},
  {t:'Carry on as normal',fx:{you:-1},o:`You keep going. So does the queue.`}
 ]},

{id:'appraisal',who:'you',title:'Appraisal season',tag:'story',
 text:`Your appraisal is due. You need a year of learning reflections, a quality improvement activity, patient feedback and a significant event reflection. You have one reflection, written in 2024. It's about burnout.`,
 choices:[
  {t:'Spend the weekend on the portfolio',fx:{you:-4,safety:2},o:`Your appraiser praises your "rich reflective practice". You reflect on how much you'd like your weekend back.`},
  {t:'Ask to defer it three months',fx:{you:2},later:[{in:3,p:1,fx:{you:-5},note:'Your deferred appraisal arrived, on top of everything else. You wrote reflections until 1am.'}],o:`Deferred. It'll be back.`}
 ]},

{id:'nativity',who:'home',title:'The nativity',months:[8],tag:'story',
 text:`It's the school nativity at 2pm on Thursday. Your child is playing Third Sheep, and has been practising their "baa" for a week. You have a 14-patient afternoon list.`,
 choices:[
  {t:'Cancel the afternoon. You\'re going.',fx:{you:9,patients:-2,team:-1},o:`Third Sheep's "baa" is magnificent. You film all of it, and watch it again at 11pm while doing the results.`},
  {t:'Ask a partner to cover',need:()=>activeOthers()>0,why:'There\'s nobody left to ask',fx:{you:6,team:-2},o:`They cover. You owe them, and you'll be paying that back in February.`},
  {t:'Stay. Someone has to see the patients.',fx:{you:-9},o:`You get a video at 2:47pm and watch it between patients 9 and 10. It's the only good part of the day.`}
 ]},

{id:'lunch',who:'you',title:'Lunch',tag:'real',src:['S36'],
 info:'Partners on seven or eight sessions report working about 46 hours a week. A nominal 4h10m session takes about six real hours once the admin is done.',
 text:`You realise you haven't eaten lunch since Tuesday. Today's lunch so far is a Rich Tea biscuit and half a banana a patient's child gave you.`,
 choices:[
  {t:'Block 30 minutes every day. Protected.',fx:{you:5},run(){ addMod({id:'lunch',label:'Protected lunch break',months:99,capMul:0.985,aim:{you:3}}); },o:`It feels radical. It shouldn't. You eat a sandwich sitting down and nearly cry.`},
  {t:'Keep going. Lunch is for the weak.',fx:{you:-4,patients:1},o:`You finish the day on four coffees and the other half of the banana.`}
 ]},

{id:'dinner',who:'home',title:'"Home for dinner?"',tag:'story',
 text:`"Will you be home for dinner this week?" The question is gentle. The subtext isn't. You worked until 8:40pm every night last week.`,
 choices:[
  {t:'Promise Wednesday. Mean it.',fx:{you:5},alt:{p:0.35,fx:{you:-5},o:`At 6:15pm on Wednesday a patient collapses in the waiting room. You get home at 9. Dinner is in the oven, under foil, with a note.`},o:`You're home at 6:30. There's pasta, and nobody talks about the practice for three whole hours.`},
  {t:'"After QOF year end. I promise."',fx:{you:-4},o:`It's not the first time you've said it. You notice they don't reply.`}
 ]},

{id:'gmc',who:'you',title:'A letter from the GMC',w:0.5,tag:'real',src:['S40'],
 info:'The state-backed indemnity scheme covers NHS clinical negligence claims, but not GMC investigations, inquests or complaints. For those, GPs rely on a medical defence organisation.',
 text:`A brown envelope. The GMC has received a complaint about you and is "assessing whether it requires investigation". Your stomach falls through the floor.`,
 choices:[
  {t:'Ring your medical defence organisation',fx:{you:-6},run(){ schedule('gmc_closed',2); },o:`The adviser is calm. "We see these all the time. Send me your notes." It helps, a bit.`},
  {t:'Deal with it yourself',fx:{you:-10},alt:{p:0.5,fx:{you:-12,safety:-2},o:`You write a long, defensive response at 2am. Your defence organisation later calls it "a learning opportunity".`},run(){ schedule('gmc_closed',2); },o:`You draft a careful, factual response. Four drafts. No sleep.`}
 ]},

{id:'gmc_closed',arc:1,who:'you',title:'Case closed',tag:'story',
 text:`The GMC writes: "no further action". The complaint didn't meet the threshold for investigation. It took eleven weeks. You'll remember them for considerably longer.`,
 choices:[{t:'Breathe',fx:{you:8},o:`You go for a walk at lunchtime, the first in months. The sky is enormous.`}]}
);
