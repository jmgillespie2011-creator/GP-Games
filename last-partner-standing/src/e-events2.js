/* ===================== EVENTS 2: patients, team, you ===================== */
EVENTS.push(
{id:'higgins_list',who:'higgins',title:'The list',
 text:`Mrs Higgins has brought a list. It is double-sided. Item one is her knee. Item seven is "the thing with my eye, but only on Tuesdays". She has also brought you a tin of shortbread.`,
 choices:[
  {t:'Work through all seven items',fx:{patients:5,you:-4},o:`Forty minutes later you are 35 minutes behind, but you now know everything about her eye. The shortbread is excellent.`},
  {t:'"Let\'s do the two most important today."',fx:{patients:1,you:-1},o:`She chooses the knee and, unexpectedly, item five: "chest feels tight on the stairs". Good call. You arrange an ECG.`},
  {t:'"One problem per appointment, I\'m afraid."',fx:{patients:-4,you:1},o:`She rebooks for items two to seven. As six separate appointments. On six separate days.`}
 ]},

{id:'ai_printout',who:'patient',title:'Dr Chatbot',
 text:`A 34-year-old man arrives with a 12-page printout. "I put my symptoms into an AI. It says Addison's disease, lupus, or a rare parasite from Peru." He has been tired since his baby was born four months ago.`,
 choices:[
  {t:'Go through the printout together, properly',fx:{patients:4,you:-3},o:`It takes 25 minutes. He leaves reassured, with bloods booked and a sleep plan. He asks if he can give the AI your feedback.`},
  {t:'Order every test on the list to settle it',fx:{patients:3,inbox:35,cash:-0.3},o:`Seventeen blood tests. Sixteen are normal. The seventeenth is borderline and generates four more appointments.`},
  {t:'"The internet is not a doctor."',fx:{patients:-4,you:1},o:`He posts a one-star review: "Dismissive. The AI had better bedside manner." It is hard to argue.`}
 ]},

{id:'antibiotics',who:'patient',title:'I know my body',months:[6,7,8,9,10],
 text:`"I've had a cold for four days. I always need antibiotics for it. I know my body." Her chest is clear. Her temperature is 37.1. She has taken the afternoon off work for this.`,
 choices:[
  {t:'Explain viral infections and safety-net',fx:{patients:-2,safety:2},o:`She sighs heavily and leaves with a leaflet. She is better by Sunday, which she puts down to the honey.`},
  {t:'Give a delayed prescription',fx:{patients:1,safety:1},o:`"Only if it's not better in a week." She collects it the same afternoon. You are almost certain.`},
  {t:'Just give her the amoxicillin',fx:{patients:3,safety:-3},o:`She is delighted. Your antibiotic prescribing data is not. The ICB medicines team will be in touch.`}
 ]},

{id:'backdated_note',who:'patient',title:'Just a little note',
 text:`A patient wants a fit note backdated three weeks to cover a cancelled holiday for an insurance claim. "It was stress. From the holiday. That I didn't go on."`,
 choices:[
  {t:'Decline. Offer a private letter describing today\'s consultation.',fx:{patients:-2,safety:2},o:`He grumbles about "red tape" and pays the £35 fee. The letter says exactly what happened, which is not what he wanted.`},
  {t:'Introduce a practice-wide private letter fee list',fx:{patients:-3,team:2},run(){ addMod({id:'fees',label:'Private fee income',months:99,fx:{cash:0.4}}); },o:`Reception gets a laminated fee list. Requests for "a quick letter" drop by half. Income from the rest: about £400 a month.`},
  {t:'Write it. It\'s easier.',fx:{patients:2,safety:-4},o:`You sign it. Then you lie awake thinking about the phrase "fitness to practise".`}
 ]},

{id:'facebook',who:'paper',title:'The Facebook group',
 text:`The {place} Community Chat group has a post: "ANYONE ELSE UNABLE TO GET THROUGH TO {surgery}??? 🤬🤬". It has 312 comments. Someone has posted a photo of your car, parked.`,
 choices:[
  {t:'Post a calm explainer about how to get help',fx:{patients:3,you:-2},o:`"Thanks for explaining!!" says one comment. "Typical excuses" says another. Net positive, mostly.`},
  {t:'Ignore it. Never read the comments.',fx:{patients:-2,you:1},o:`You don't read the comments. Bev does, and summarises them for you at length.`},
  {t:'Invite the angriest poster to join the patient group',fx:{patients:4,you:-1},alt:{p:0.35,fx:{patients:-3,you:-3},o:`She comes. She brings the other 311 commenters' concerns in a ring binder.`},o:`She comes, listens, and becomes your most ferocious defender online. Nobody saw that coming.`}
 ]},

{id:'pratt_complaint',who:'pratt',title:'A formal complaint',
 text:`Mr Pratt has written. Four pages, single spaced, with footnotes. His routine appointment was offered in "an unacceptable" three days. He has copied in the ICB, the Ombudsman and, for reasons unclear, the Archbishop of Canterbury.`,
 choices:[
  {t:'Invite him in to talk it through',fx:{you:-3,patients:2},alt:{p:0.3,fx:{you:-5},o:`The meeting lasts 90 minutes. He brings a Dictaphone. He is satisfied in the sense that he now has more material.`},o:`He talks for an hour. At the end he shakes your hand: "First time anyone's listened." He sends Christmas cards now.`},
  {t:'Send the standard written response',fx:{patients:-1,safety:1},o:`Your response is measured and correct. His reply is longer.`},
  {t:'Suggest he might be happier registered elsewhere',fx:{you:2},alt:{p:0.6,fx:{patients:-5,sched:[['pratt_mp',1]]},o:`He is not happier. He writes to his MP. And the paper.`},o:`He registers across town. The practice across town sends you a bottle of wine.`}
 ]},

{id:'pratt_mp',arc:1,who:'mp',title:'A letter from Westminster',
 text:`Sir Geoffrey Pomfrey MP has written about "serious concerns raised by a constituent". He would be "delighted to visit and see the challenges first-hand", ideally with a photographer.`,
 choices:[
  {t:'Invite him to shadow a Monday',fx:{you:-3,patients:4},alt:{p:0.4,fx:{patients:-2,you:-3},o:`He stays 40 minutes, takes a selfie with the flu vaccines, and announces "more funding for GPs" that turns out to be last year's funding.`},o:`He sees the 8am queue, sits in on triage, and goes quiet. He writes a column about it. It is weirdly good.`},
  {t:'Reply with a factual letter and some statistics',fx:{you:-1,safety:1},o:`His office replies thanking you for your "valuable insights". Nothing else happens, which counts as a win.`}
 ]},

{id:'abuse',who:'kayleigh',title:'On the front line',
 text:`A man has been shouting at Kayleigh for ten minutes because his repeat prescription "should have been done already". It was requested 40 minutes ago. Kayleigh is 22. She is shaking.`,
 choices:[
  {t:'Zero tolerance: warning letter, then removal',fx:{team:6,patients:-2},o:`The letter goes out. The team notices you backed them. That matters more than you realise.`},
  {t:'Step out and de-escalate it yourself',fx:{team:3,you:-3,patients:1},o:`You calm him down. It takes 15 minutes you did not have. Kayleigh brings you a tea later without being asked.`},
  {t:'Fit panic alarms and a proper screen (£2,000)',fx:{team:4,safety:2,cash:-2},o:`The installer asks if you'd like the bulletproof option. You pause for longer than you'd like to admit.`}
 ]},

{id:'aldi',who:'kayleigh',title:'An offer from Aldi',cond:()=>S.staff.recep>=3,
 text:`"Aldi have offered me £1.60 an hour more," Kayleigh says, "and nobody at Aldi has ever called me a jumped-up little secretary." She does not want to leave. She also does not want to be poor.`,
 choices:[
  {t:'Match it, and rise the whole reception team',fx:{team:8},run(){ S.payX=(S.payX||0)+1.1; },o:`The team gets a raise. It costs about £1,100 a month. Reception morale is the best it has been in years.`},
  {t:'Match it for Kayleigh only',fx:{team:-2},run(){ S.payX=(S.payX||0)+0.25; },o:`She stays. Everyone finds out within the hour. Reception has a new topic of conversation.`},
  {t:'Wish her well',fx:{team:-5},run(){ S.staff.recep--; },o:`She goes. The Aldi on the bypass now has the best customer service in the county.`}
 ]},

{id:'bingo',who:'patient',title:'A home visit request',
 text:`"Mum can't possibly come to the surgery. She's too frail." The request comes in at 11:40. Kayleigh adds: "She's at bingo on Thursdays though. Won £40 last week."`,
 choices:[
  {t:'Visit anyway after morning surgery',fx:{you:-3,patients:2},o:`She's fine. She's also delightful, and she has a leg ulcer nobody knew about. Worth it, on balance.`},
  {t:'Offer a phone consultation first',fx:{patients:-1},o:`Daughter is outraged. Mum is on speakerphone, and it turns out she only wanted her pills changing.`},
  {t:'Send the paramedic',need:()=>S.staff.para>0,why:'You don\'t have a paramedic',fx:{patients:1,you:1},o:`The paramedic goes. Mum asks her about bingo tips. They are now friends.`}
 ]},

{id:'care_home',who:'icb',title:'The care home',
 text:`The 64-bed care home on Mill Lane has lost its GP practice. The ICB asks if you'll take it on: weekly ward rounds, anticipatory care plans, and around 40 calls a week. They'll pay for it.`,
 choices:[
  {t:'Take it on',fx:{list:64,demand:2,patients:2},run(){ addMod({id:'carehome',label:'Care home enhanced service',months:99,fx:{cash:1.4}}); },o:`Ward round on Tuesdays. The care home staff are wonderful. The paperwork is not. £1.4k a month and a lot of phone calls.`},
  {t:'Decline. You can\'t cover it safely.',fx:{you:1,patients:-1},o:`Jonathan sighs audibly on the call. The home goes to the practice across town, who complain about it at every PCN meeting.`}
 ]},

{id:'estate',who:'bev',title:'Six hundred new homes',cond:()=>S.practiceKey!=='city',
 text:`The new estate on the old airfield is finished: 600 homes, one pub, no new surgery. The Section 106 money for "healthcare infrastructure" has been spent on a roundabout.`,
 choices:[
  {t:'Register everyone who comes',fx:{list:520,team:-2,patients:2},o:`Five hundred new patients in two months. More money, more demand, and a lot of toddlers with ears.`},
  {t:'Apply to close the list temporarily',fx:{list:180,team:2},alt:{p:0.5,fx:{list:520,team:-3,you:-2},o:`The ICB refuses. The patients come anyway.`},o:`The ICB agrees to a short closure. Some patients come anyway, via "boundary exceptions" Bev has never heard of.`}
 ]},

{id:'mounjaro',who:'patient',title:'New year, new jab',months:[8,9,10],
 text:`It's January. Forty-one online requests this week say some version of "I want Mounjaro". Three attach photos of a friend who "lost four stone". The phased NHS eligibility criteria fit on one page. The demand does not.`,
 choices:[
  {t:'Set up a structured weight clinic',fx:{demand:1.5,team:-2,patients:3},run(){ addMod({id:'weight',label:'Weight management clinic',months:3,fx:{cash:0.8}}); },o:`Maureen runs it. Criteria, counselling, follow-up. It is actually good care. It is also a lot of it.`},
  {t:'Apply the criteria strictly and explain why',fx:{patients:-3,safety:1},o:`Most people understand. One writes to the Daily Mail. The Mail is not interested in the eligibility criteria.`},
  {t:'Point people to private providers',fx:{patients:-1,you:1,inbox:25},o:`Private prescribing surges. So do the letters asking you to "please monitor".`}
 ]},

{id:'shared_care',who:'raj',title:'Please could the GP...',
 text:`Raj has 23 requests from private clinics asking you to take over prescribing and monitoring. There are no commissioned shared care agreements for most of them. "What's our policy?" he asks. You don't have one.`,
 choices:[
  {t:'Accept them all to keep patients happy',fx:{patients:3,safety:-4,inbox:40},o:`Twenty-three new monitoring schedules. Six have no baseline bloods. Raj starts a spreadsheet with a skull emoji in the title.`},
  {t:'Write a policy: no agreement, no shared care',fx:{patients:-3,safety:3,you:1},o:`Patients are unhappy. Some are fairly unhappy. But now there's a clear answer, and it's written down, and Raj stops twitching.`},
  {t:'Case by case',fx:{you:-3,safety:1},o:`Each one takes 20 minutes. You approve nine. Raj respects you but also looks tired.`}
 ]},

{id:'google_review',who:'kayleigh',title:'One star',
 text:`New Google review: "⭐ Receptionist looked at me funny. Doctor was 7 minutes late. Parking a disgrace. Would not recommend." It's the fourth this month. Your average is now 2.1.`,
 choices:[
  {t:'Reply publicly and politely',fx:{patients:1,you:-1},alt:{p:0.4,fx:{patients:-2,you:-2},o:`He replies to your reply. Then his cousin does. It becomes a thread.`},o:`"Thank you for your feedback, we're sorry..." It's bland and perfect. Nobody reads it.`},
  {t:'Ask happy patients to leave reviews',fx:{patients:3,team:2},o:`Mrs Higgins leaves one. It is 600 words long and mentions the shortbread. Your average climbs to 3.4.`},
  {t:'Never look at Google reviews again',fx:{you:2},o:`Liberating. You mute the notifications and feel ten years younger.`}
 ]},

{id:'gift',who:'patient',title:'A token of thanks',months:[8],
 text:`A grateful patient leaves a bottle of 18-year-old single malt at reception with a card: "For the doctor who found my cancer early." It is worth about £120.`,
 choices:[
  {t:'Accept, and record it in the gifts register',fx:{you:4,safety:1},o:`You write it in the register, as the rules require. Then you write the patient a card back. You keep that card for years.`},
  {t:'Raffle it for the staff Christmas fund',fx:{team:4},o:`Maureen wins. She doesn't drink whisky. She sells it to Alan for £60 and buys the team doughnuts.`}
 ]},

{id:'dna',who:'bev',title:'Did not attend',
 text:`Last month 186 appointments were booked and not attended. That's about 30 GP sessions. Bev has made a poster. It says "186 PEOPLE WASTED APPOINTMENTS LAST MONTH" in red capital letters.`,
 choices:[
  {t:'Automated text reminders with an easy cancel link',fx:{cash:-0.5,demand:-1.5,patients:1},o:`DNAs drop by a third. The text also says "Reply CANCEL". Three people reply "CANCEL MY ACCOUNT". It is not that kind of service.`},
  {t:'Put the poster up',fx:{patients:-2,demand:-0.5},o:`The people who read the poster are the people who came. They feel told off.`},
  {t:'Leave it. Some of them had reasons.',fx:{you:1},o:`Fair. Some of them did. Some of them were at bingo.`}
 ]},

{id:'queue_rain',who:'kayleigh',title:'Queue in the rain',months:[7,8,9,10],
 text:`It's 7:40am and there are 30 people queuing outside in the rain. Someone has brought a camping chair. You have total triage. They know. They came anyway because "the phones never answer".`,
 choices:[
  {t:'Open early, hand out tea, triage at the door',fx:{patients:4,team:-3,you:-2},o:`The camping chair man turns out to have pneumonia. Door triage works. It also takes two receptionists off the phones.`},
  {t:'Keep the doors shut until 8, stick to the system',fx:{patients:-3,team:1},o:`At 8:00 the doors open and 30 damp, furious people all ask for "just a quick word".`}
 ]},

{id:'med_student',who:'med',title:'A student for the summer',months:[2,3,4,5],
 text:`The medical school asks if Oliver, a third-year student, can sit in for four weeks. He is keen, polite, and has never seen a patient over 30 who wasn't in a hospital bed.`,
 choices:[
  {t:'Take him. Teaching is why you became a doctor.',fx:{you:2,team:2,cash:0.8},o:`He is brilliant with Mrs Higgins. At the end he says he wants to be a GP. You tell him to think very carefully, and to go ahead.`},
  {t:'Not this year',fx:{you:1},o:`He goes to dermatology. He sends a photo from the conference in Barcelona.`}
 ]},

{id:'training',who:'pcn',title:'Become a training practice?',months:[0,1,2],
 text:`The deanery is desperate for training places. If you become a GP trainer, you'll get a registrar from August. Six months of trainer's course first. "It's rewarding," Clare says. "And the grant helps."`,
 choices:[
  {t:'Sign up. Grow your own GPs.',fx:{you:-4,team:2},run(){ addMod({id:'registrar',label:'GP registrar in post',months:8,at:4,capAdd:70,fx:{cash:0.7,you:-1}}); },o:`Trainer's course on Thursday evenings. Dr Ellie Chen will join in August. You buy a book about Balint groups.`},
  {t:'Not this year',fx:{you:1},o:`Maybe next year. Probably next year. You say that every year.`}
 ]},

{id:'reg_crisis',who:'reg',title:'A registrar in the doorway',cond:()=>hasMod('registrar')&&S.month>=5,
 text:`Ellie is in your doorway at 5:50pm. "Sorry. I've got a baby with a temperature and a rash, and I just need to run it past you." The last three times, she was right.`,
 choices:[
  {t:'Go and see the baby with her',fx:{you:-2,safety:3,team:2},o:`It's a viral rash. You go through the traffic-light features together. She'll be a very good GP.`},
  {t:'Talk it through, then trust her judgement',fx:{you:1,safety:1},o:`She's got it right. She wanted to be told. You tell her. That's supervision.`}
 ]},

{id:'pay_award',who:'bev',title:'The pay award',months:[0,1,2],
 text:`Staff have seen the news: NHS Agenda for Change staff are getting a pay rise. Your staff aren't on Agenda for Change, but they can read. The contract uplift for staff pay was, in Bev's words, "a joke".`,
 choices:[
  {t:'Match it in full',fx:{team:7},run(){ S.payX=(S.payX||0)+1.8; },o:`About £1,800 a month more on the payroll. The team is grateful, and says so. The accountant says something else.`},
  {t:'Give half',fx:{team:-1},run(){ S.payX=(S.payX||0)+0.9; },o:`It is received with resignation, which is better than resignations.`},
  {t:'Nothing this year',fx:{team:-9},o:`Maureen asks to see the partners' drawings. You change the subject. She notices.`}
 ]},

{id:'bev_retire',who:'bev',title:'Bev has news',months:[5,6,7,8,9],
 text:`Bev sits down. "I'm 64. My husband wants to buy a caravan. I'm thinking of retiring at Christmas." Bev is the only person who knows the password to the payroll system, the smartcard admin and the alarm code.`,
 choices:[
  {t:'Offer a retention bonus and three days a week (£3k)',fx:{cash:-3,team:3},o:`She takes it. "Three days. And I'm not doing CQC again." Fair.`},
  {t:'Recruit a new practice manager',fx:{team:-3,you:-2},run(){ addMod({id:'newpm',label:'New practice manager settling in',months:3,fx:{safety:-2,you:-1}}); },o:`The new manager is sharp and has an MBA. It will take her three months to find where Bev kept everything.`},
  {t:'Promote Sharon, the deputy',fx:{team:2},alt:{p:0.4,fx:{team:-3,safety:-3},o:`Sharon is overwhelmed by week two. Bev comes in "just on Tuesdays" to help. Unpaid. Somehow it's worse.`},o:`Sharon is brilliant. It turns out she's been doing half of Bev's job for years.`}
 ]},

{id:'maureen_course',who:'maureen',title:'The diabetes course',
 text:`Maureen wants to do an advanced diabetes course: two days a month for three months, paid by the practice. "Then I can start insulin myself. I'm fed up of waiting for you lot."`,
 choices:[
  {t:'Pay for it (£1,200) and cover her sessions',fx:{cash:-1.2,team:3,qof:4},o:`She comes back with a certificate and a new level of authority, which previously you didn't think possible.`},
  {t:'Not now, maybe next year',fx:{team:-4},o:`She takes it well. Then she books the course herself and asks for study leave. She knows the rules better than you.`}
 ]},

{id:'xmas_party',who:'bev',title:'The Christmas do',months:[8],
 text:`Christmas party. Last year's was a curry and a quiz that ended with the nurses and reception not speaking until February. What's the plan?`,
 choices:[
  {t:'Proper night out, practice pays (£2,500)',fx:{team:9,cash:-2.5},o:`A three-course dinner, a DJ and a group photo nobody is allowed to post. Maureen and Kayleigh do the Macarena together. Peace is restored.`},
  {t:'Secret Santa and mince pies',fx:{team:2},o:`You get a mug that says "I survived a partners' meeting". It's accurate.`},
  {t:'Cancelled due to winter pressures',fx:{team:-7,cash:0.5},o:`Everyone understands. Everyone also remembers.`}
 ]},

{id:'fish',who:'maureen',title:'The microwave incident',
 text:`Somebody has microwaved fish in the staff kitchen. Again. There is an unsigned note on the fridge. There is a counter-note. The counter-note has been annotated.`,
 choices:[
  {t:'Buy a second microwave, for fish only (£90)',fx:{team:3,cash:-0.1},o:`The fish microwave gets its own laminated sign. It is the best £90 you spend all year.`},
  {t:'Write a kitchen policy',fx:{team:-2,safety:1},o:`Policy KIT-01, version 1.0. It is ratified at a staff meeting. It is ignored by Thursday.`},
  {t:'Stay out of it',fx:{team:-1,you:1},o:`The note war escalates to Post-its on your door. You are Switzerland.`}
 ]},

{id:'cat',who:'cat',title:'A new team member',
 text:`A ginger cat has moved into the car park. Staff have named it QOF. It sleeps on the bonnet of whichever car is warmest. Someone has already bought it a bowl.`,
 choices:[
  {t:'Adopt QOF. Every practice needs a mascot.',fx:{team:7,safety:-2},o:`QOF gets a collar, a bed in the admin office and an Instagram account with more followers than the practice.`},
  {t:'Call the cat rescue',fx:{team:-4,safety:1},o:`QOF goes to a lovely home. The staff room is quieter. Someone puts up a "missing you" poster.`},
  {t:'Unofficially tolerate QOF',fx:{team:3},alt:{p:0.3,fx:{team:2,safety:-4},o:`The CQC report contains the sentence "a cat was observed in the dispensary".`},o:`QOF is fed "by nobody". Four bowls appear. QOF gets fat.`}
 ]},

{id:'wfh',who:'bev',title:'Working from home',
 text:`The admin team asks if they can work from home two days a week. "We only type letters and code documents. We could do it in our pyjamas." Two of them already look like they do.`,
 choices:[
  {t:'Yes. Laptops and smartcard readers (£1,500)',fx:{team:6,cash:-1.5,inbox:-40},o:`Productivity goes up. Nobody knows why. Everyone suspects the lack of Derek Pratt at the front desk.`},
  {t:'No. We need people in the building.',fx:{team:-4},o:`They accept it. Two start looking at NHS admin jobs that offer hybrid working.`}
 ]},

{id:'noro',who:'maureen',title:'Norovirus',months:[7,8,9,10],
 text:`Norovirus is working its way through the staff. Four people are off. Maureen is in, but green. She insists she's fine, then leaves the room at speed.`,
 choices:[
  {t:'Send everyone symptomatic home for 48 hours',fx:{safety:3,team:2},run(){ addMod({id:'noro',label:'Norovirus: staff off sick',months:1,capMul:0.9}); },o:`Capacity drops for the month. The outbreak stops with your staff, not your patients.`},
  {t:'Soldier on, it\'s winter',fx:{team:-4,safety:-4},alt:{p:0.4,fx:{team:-6,safety:-6,patients:-3},run(){ addMod({id:'noro2',label:'Norovirus outbreak',months:1,capMul:0.8}); },o:`It spreads to three patients and the care home. The outbreak team becomes your pen pal.`},o:`You get away with it. Nobody feels good about it.`}
 ]},

{id:'whatsapp',who:'kayleigh',title:'WhatsApp',
 text:`There's a row in the staff WhatsApp group. It started about who restocks the printer paper. It is now about "respect" and "some people". It has 214 messages. You're in the group.`,
 choices:[
  {t:'Get the two sides in a room with biscuits',fx:{team:5,you:-2},o:`It turns out nobody knew whose job the printer was. Now Sharon knows. It is Sharon.`},
  {t:'Mute the group. Forever.',fx:{you:3,team:-2},o:`Blissful silence. You miss the message about the fire drill.`}
 ]},

{id:'pcn_arrs',who:'pcn',title:'Free staff!',cond:()=>arrsCount()<ARRS_CAP,
 text:`Clare from the PCN has unspent ARRS budget. "Would you like a mental health practitioner? Fully funded. They start next month." The PCN will pay. The question is where they'll sit.`,
 choices:[
  {t:'Yes, find them a room',fx:{staff:{mhp:1},patients:2},o:`They start next month. Patients who needed longer than ten minutes finally get it. You need to find a room.`},
  {t:'No room at the inn',fx:{you:1},o:`The funding goes to the practice across town, which has a portakabin.`}
 ]},

{id:'rooms',who:'bev',title:'Room for everyone?',cond:()=>roomsNeeded()>S.rooms,
 text:`Every consulting room is double booked on Tuesdays. The physio is working in the baby-changing room. "We need more space," Bev says, "or fewer people. And we need the people."`,
 choices:[
  {t:'Convert the staff room into a clinic room',fx:{rooms:1,team:-6},o:`The staff room is now Room 11. Lunch is eaten in the corridor. Morale takes it personally.`},
  {t:'Hire a portakabin for the car park (£14,000)',fx:{rooms:2,cash:-14},o:`It arrives on a lorry. It has air conditioning and a ramp. It is the nicest room in the building.`},
  {t:'Hot-desk and rota harder',fx:{team:-2,you:-2},o:`Bev builds a room rota on a spreadsheet so complex it becomes self-aware.`}
 ]},

{id:'pcn_meeting',who:'pcn',title:'Neighbourhood transformation',
 text:`The PCN board meets Tuesday 1-5pm: "Integrated Neighbourhood Teams: a transformation journey." There will be sticky notes. Your attendance is "strongly encouraged".`,
 choices:[
  {t:'Go. Someone has to represent the practice.',fx:{you:-3,cash:0.6,team:1},o:`Four hours of sticky notes. You secure a share of the new frailty funding and eat a surprising number of free biscuits.`},
  {t:'Send Bev',fx:{team:-1},o:`Bev comes back with a new acronym and a quiet fury.`},
  {t:'Skip it',fx:{you:2},alt:{p:0.4,fx:{you:1,cash:-1},o:`The PCN divides the new money between practices who turned up.`},o:`Nothing happens. It often doesn't.`}
 ]},

{id:'pcn_cd',who:'pcn',title:'A promotion?',months:[2,3,4,5,6],
 text:`Clare is stepping down as PCN Clinical Director. "You'd be great," she says. "It pays for two sessions a week, and you get a lanyard." There are 11 practices in the PCN, and each has opinions.`,
 choices:[
  {t:'Accept the role',fx:{team:1},run(){ addMod({id:'cd',label:'PCN Clinical Director',months:99,fx:{cash:1.3,you:-2}}); },o:`You are now responsible for eleven practices' worth of opinions. The money is useful. The meetings are not.`},
  {t:'Decline',fx:{you:2},o:`Someone else gets the lanyard. You sleep well.`}
 ]},

{id:'collective',who:'lmc',title:'Collective action',months:[1,2,3,4,5,6,7],
 text:`The LMC is urging practices to adopt safe working: a cap of 25 patient contacts per clinician per day, with overflow to local hubs. "It's about safety," Steve says. "Also sanity."`,
 choices:[
  {t:'Implement the safe working cap',fx:{patients:-3},run(){ addMod({id:'safe',label:'Safe working cap',months:99,capMul:0.94,fx:{you:2,team:1}}); },o:`Lists stop at 25. The overflow goes to the hub, which is full by 10am. But you leave by 7pm for the first time since you qualified.`},
  {t:'Carry on as normal',fx:{you:-1},o:`You keep going. So does the queue.`}
 ]},

{id:'survey_bad',who:'paper',title:'GP Patient Survey',months:[3],cond:()=>S.st.patients<50,
 text:`The GP Patient Survey results are out. {surgery}: "ease of getting through on the phone" is in the bottom 10% nationally. The {paper} has made a league table.`,
 choices:[
  {t:'Publish an action plan in the waiting room',fx:{patients:2,you:-2},o:`It's honest, specific and has dates on it. Somebody writes "LOL" on it in biro.`},
  {t:'Point out that 84 people responded',fx:{patients:-2,you:1},o:`Statistically, you are correct. Emotionally, nobody cares.`}
 ]},

{id:'survey_good',who:'paper',title:'GP Patient Survey',months:[3],cond:()=>S.st.patients>=50,
 text:`The GP Patient Survey results are out. {surgery} is above the national average for "overall experience". The {paper} runs it on page 11, next to the marrow.`,
 choices:[
  {t:'Buy the team cake',fx:{team:4,cash:-0.1},o:`You tell the team it's their result. It is.`},
  {t:'Frame the page for reception',fx:{team:2,patients:1},o:`It hangs next to the sign about abusive behaviour. Nice balance.`}
 ]},

{id:'appraisal',who:'you',title:'Appraisal season',
 text:`Your appraisal is due. You need a year of CPD reflections, a quality improvement activity, patient feedback and a reflection on a significant event. You have one reflection, written in 2024. It is about burnout.`,
 choices:[
  {t:'Spend the weekend on the portfolio',fx:{you:-4,safety:2},o:`Your appraiser praises your "rich reflective practice". You reflect on how much you'd like your weekend back.`},
  {t:'Ask to defer it three months',fx:{you:2},o:`Deferred. The problem is now in March, alongside QOF, the accounts and the new contract. Great.`}
 ]},

{id:'nativity',who:'home',title:'The nativity',months:[8],
 text:`It's the school nativity at 2pm on Thursday. Your child is playing "Third Sheep". They have been practising their "baa" for a week. You have a 14-patient afternoon list.`,
 choices:[
  {t:'Cancel the afternoon. You\'re going.',fx:{you:9,patients:-2,team:-1},o:`Third Sheep's "baa" is magnificent. You film all of it. You watch it again at 11pm while doing the results.`},
  {t:'Ask a partner to cover',need:()=>activeOthers()>0,why:'There\'s nobody left to ask',fx:{you:6,team:-2},o:`They cover. You owe them. You'll be paying that back in February.`},
  {t:'Stay. Someone has to see the patients.',fx:{you:-9},o:`You get a video on WhatsApp at 2:47pm. You watch it between patients 9 and 10. It's the only good part of the day.`}
 ]},

{id:'lunch',who:'you',title:'Lunch',
 text:`You realise you haven't eaten lunch since Tuesday. Today's lunch so far is a Rich Tea biscuit and half a banana a patient's child gave you.`,
 choices:[
  {t:'Block 30 minutes every day. Protected.',fx:{you:6,patients:-2},o:`It feels radical. It shouldn't. You eat a sandwich sitting down and nearly cry.`},
  {t:'Keep going. Lunch is for the weak.',fx:{you:-4,patients:1},o:`You finish the day on four coffees and the other half of the banana.`}
 ]},

{id:'dinner',who:'home',title:'"Home for dinner?"',
 text:`"Will you be home for dinner this week?" The question is gentle. The subtext is not. You worked until 8:40pm every night last week.`,
 choices:[
  {t:'Promise Wednesday. Mean it.',fx:{you:5},alt:{p:0.35,fx:{you:-5},o:`At 6:15pm Wednesday a patient collapses in the waiting room. You get home at 9. The dinner is in the oven, under foil, with a note.`},o:`You're home at 6:30. There is pasta, and nobody talks about the practice for three whole hours.`},
  {t:'"After QOF year end. I promise."',fx:{you:-4},o:`It's not the first time you've said it. You notice they don't reply.`}
 ]},

{id:'gmc',who:'you',title:'A letter from the GMC',w:0.5,
 text:`A brown envelope. The GMC has received a complaint about you from a patient whose request for a sick note you declined. They are "assessing whether it requires investigation". Your stomach falls through the floor.`,
 choices:[
  {t:'Ring your medical defence organisation',fx:{you:-6},run(){ schedule('gmc_closed',2); },o:`The adviser is calm. "We see these all the time. Send me your notes." It helps, a bit.`},
  {t:'Deal with it yourself',fx:{you:-10},alt:{p:0.5,fx:{you:-12,safety:-2},o:`You write a long, defensive response at 2am. Your defence organisation later calls it "a learning opportunity".`},run(){ schedule('gmc_closed',2); },o:`You draft a careful, factual response. Four drafts. No sleep.`}
 ]},

{id:'gmc_closed',arc:1,who:'you',title:'Case closed',
 text:`The GMC writes: "no further action". The complaint did not meet the threshold for investigation. It took eleven weeks. You'll remember them for considerably longer.`,
 choices:[{t:'Breathe',fx:{you:8},o:`You go for a walk at lunchtime, the first in months. The sky is enormous.`}]}
);
