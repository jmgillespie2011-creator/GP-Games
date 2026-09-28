/* ===================== EVENTS 1: story arcs =====================
 Event: {id, who, title, text, tag ('real'|'rule'|'story'|'speculative'), src:[S-ids], info (the real-world explainer),
         cond(), months[], w, arc (scheduled only), rep, max, kind:'mini', game, after()}
 Choice: {t, fx:{...}|()=>{...}, o, alt:{p,fx,o,run}, need(), why, run()=>({o,html}|void), play}
 fx keys: patients team you safety cash capital qof inbox list demand admin rooms okoye icb rep
          aim:{meter:n} (lasting shift in where a meter settles) staff:{} flags:{} sched:[[id,n]] mod:{} later:[{in,p,fx,note}]
*/
const EVENTS = [];

EVENTS.push(
{id:'welcome',arc:1,who:'bev',title:'Welcome to the partnership',tag:'real',src:['S23','S44'],
 info:'New partners usually buy in with a share of the working capital, often around £25,000, and sign a partnership deed. Partners are jointly and severally liable for the practice\'s debts, and drawings are not profits: the real share is settled after the year-end accounts.',
 text:`Your name is on the contract now. Also the lease, the bank mandate and the overdraft. "Partners have unlimited liability," Bev says, handing you a lanyard. "Right. Where do you want to start?"`,
 choices:[
  {t:'Meet every member of staff, one by one',fx:()=>({team:S.st.team < 55 ? 7 : 4,you:-3,aim:{team:1}}),o:`Twenty-three conversations. You learn who makes the tea, who does the rota, and that nobody has fixed the back door since 2019. People remember that you asked.`},
  {t:'Go through the practice accounts line by line',fx:()=>({cash:S.cash < 35 ? 6 : 3,you:-3}),o:`You find a direct debit for a photocopier the practice hasn't owned since 2017. Cancelled. You feel like a partner already.`},
  {t:'Clear the inbox so you start clean',fx:{inbox:-120,you:-4,safety:2},o:`You file until 9pm. A letter from 2023 asks you to "please arrange" something. You decide it has arranged itself.`}
 ]},

{id:'hartley_retire',arc:1,who:'hartley',title:'Six months\' notice',tag:'real',src:['S23','S43'],
 info:'Partnership deeds usually require six months\' notice to retire and often stagger leaving dates so the practice isn\'t left with one partner. Whoever remains takes on the leases, loans and staff contracts.',
 text:`"I'm retiring at the end of September. Six months' notice, as the deed requires." Alan beams. He does six clinical sessions a week, owns a third of the building, and is the only person who understands the dispensary stock system.`,
 choices:[
  {t:'"Congratulations, Alan. We\'ll manage."',fx:{team:2,flags:{hartleyGo:5},sched:[['hartley_building',2],['hartley_farewell',5]]},o:`He shakes your hand for slightly too long. "You'll be fine. It practically runs itself."`},
  {t:'"Would you retire and return? Four sessions, no admin?"',fx:{sched:[['hartley_building',2]]},
   run(){ if(chance(0.55)){ pt('hartley').clin=4; S.flags.hartleyGo=11; schedule('hartley_farewell_late',11-S.month); return {o:`He thinks about it over a Garibaldi. "Four sessions. No home visits. And I keep my parking space." Deal. He stays until March.`}; }
     S.flags.hartleyGo=5; schedule('hartley_farewell',5-S.month); S.st.you=clamp(S.st.you-2); return {o:`"My wife has booked a cruise," he says. "Round the world. Leaves 1st October." It was never really a question.`}; }}
 ]},

{id:'hartley_building',arc:1,who:'hartley',title:'About the building',cond:()=>isActive('hartley'),tag:'real',src:['S30','S44'],
 info:'Many practices own their premises. The NHS reimburses a "notional rent" set by a valuer and reviewed every three years, but a retiring partner still expects to be paid for their share of the building.',
 text:`"One small thing. I own a third of the building. My share is valued at £210,000, and I'd like it before I go." Premises ownership: the gift that keeps on giving.`,
 choices:[
  {t:'Take out a partnership loan and buy him out',fx:{you:-4,flags:{loan:1}},run(){S.loan=(S.loan||0)+1.6;},o:`The bank is delighted. You now own a larger share of a building with a flat roof. Repayments: £1,600 a month for twenty years, and the notional rent review is in two years.`},
  {t:'Ask Nadia to take on half the debt with you',need:()=>isActive('okoye'),why:'Nadia is no longer a partner',fx:{okoye:22,you:-2},run(){S.loan=(S.loan||0)+0.8;},o:`Nadia signs. She doesn't make eye contact. She makes a phone call in the car park that lasts forty minutes.`},
  {t:'Sell the building to an investor and lease it back',fx:{capital:22,team:-2,flags:{soldBuilding:1}},run(){S.premX=(S.premX||0)+2.4;},o:`Alan gets his money and the partners release some capital. The new landlord, a pension fund in Guernsey, sends a lease with an upward-only rent review. Rent above the reimbursement: £2,400 a month.`}
 ]},

{id:'hartley_farewell',arc:1,who:'bev',title:'Alan\'s leaving do',cond:()=>isActive('hartley'),tag:'story',
 text:`It's Alan's last week. The collection envelope contains £43.20 and a button. He has asked, loudly, whether there will be "a speech and a proper send-off".`,
 choices:[
  {t:'Book the function room at the Fox & Hounds (£1,500)',fx:{team:7,cash:-1.5},o:`He cries during his speech. So does Maureen. The karaoke goes on until 1am. It's the best night the practice has had in years.`},
  {t:'Cake and a card in the staff room',fx:{team:2},o:`A caterpillar cake and a card that says "Good luck in your new job". Alan is gracious about it.`}
 ],
 after(){ partnerLeaves('hartley'); }},

{id:'hartley_farewell_late',arc:1,who:'hartley',title:'Alan hangs up the stethoscope',cond:()=>isActive('hartley'),tag:'story',
 text:`Alan did his four sessions right to the end. Thirty-five years. He leaves you his desk, a tin of travel sweets, and a 1994 BNF "for sentimental value".`,
 choices:[
  {t:'Organise a proper send-off (£1,500)',fx:{team:6,cash:-1.5,you:2},o:`He tells the story about the home visit and the goat. Everyone has heard it. Everyone laughs anyway.`},
  {t:'A handshake and a heartfelt card',fx:{team:2,you:1},o:`"You'll be fine," he says. "Better than fine." You almost believe him.`}
 ],
 after(){ partnerLeaves('hartley'); }},

{id:'okoye_email',arc:1,who:'okoye',title:'Just a joke',cond:()=>isActive('okoye'),tag:'real',src:['S36','S80','S81','S82'],
 info:'Australian GPs are mostly paid a share of what they bill Medicare and patients, usually 65% to 70%, and practices recruiting from overseas often guarantee an hourly rate for the first months. Job sites put the average Perth GP at about A$181 an hour (A$139 to A$237), or about A$225,000 a year. At A$1.88 to the pound in September 2026, A$200 an hour is about £106. In the national GP Worklife Survey, 37% of UK GPs reported a considerable or high intention to leave direct patient care within five years, and Australian recruiters advertise to them directly.',
 text:`Nadia forwards you a job advert. Perth, Western Australia: "A$200 an hour guaranteed for six months, then 70% of billings. Four-day week, 15-minute appointments, the clinic shuts at 5pm." That's about £106 an hour. "Ha! As if!" she writes. Later, passing her room, you catch a glimpse of her screen. An AI chatbot is halfway through "Your 12-month plan to move to Perth as a GP: registration, visas, schools".`,
 choices:[
  {t:'Offer to take over her QOF lead role',fx:{okoye:-18,you:-3,qof:2,mod:{id:'qoflead',label:'You took on the QOF lead role',months:6,hours:1.5}},o:`She hugs you. You now own the diabetes recall spreadsheet, which has 14 tabs and a macro nobody understands. It'll cost you an evening a week for a while.`},
  {t:'Laugh along: "Who even wants sunshine?"',fx:{okoye:12,you:1},o:`She laughs. The next time you pass her room, the chat window is minimised. Not closed.`},
  {t:'Suggest a month\'s sabbatical this summer',fx:{okoye:-26,team:1,mod:{id:'okoye_away',label:'Nadia on sabbatical',months:1,at:3,away:'okoye'}},o:`She takes July. She'll come back tanned, rested and slightly suspicious of how nice it felt. You'll be a partner short that month.`}
 ]},

{id:'okoye_leaving',arc:1,who:'okoye',title:'Nadia closes the door',cond:()=>isActive('okoye')&&S.okoye>=60,tag:'story',
 text:`"I've accepted the job in Perth. I'll work my notice until the end of January." She has already bought sun cream. Factor 50. The big bottle.`,
 choices:[
  {t:'Offer her fewer sessions and protected admin time',fx:{cash:-4},alt:{p:0.5,fx:{you:-3},o:`She is touched. She still goes. "It's not the money. It's that I haven't eaten lunch sitting down since 2021."`},
   run(){ if(!S._alt){ S.okoye=30; pt('okoye').clin=4; return {o:`She takes a long breath. "Four sessions. Protected admin time. And I get the room with the window." Deal. Nadia stays.`}; } schedule('okoye_goodbye',Math.max(0,9-S.month)); }},
  {t:'Wish her well and start planning',fx:{you:-2,team:-3},run(){ schedule('okoye_goodbye',Math.max(0,9-S.month)); },o:`You say the right things. Then you go to your room and look at the rota for February for a long time.`}
 ]},

{id:'okoye_staying',arc:1,who:'okoye',title:'Chat history',cond:()=>isActive('okoye')&&S.okoye<60,tag:'story',
 text:`Nadia calls you into her room and turns the screen round. She's deleting a chat called "Moving to Perth as a GP". "This place is mad," she says, "but it's our mad."`,
 choices:[
  {t:'Hug her (awkwardly)',fx:{team:3,you:3},alt:{p:0.35,fx:{team:-1,you:-1},o:`She goes for a handshake at the same moment. It becomes a sort of high five. Neither of you will ever mention it again.`},o:`It's exactly as awkward as expected. Word gets round. Morale improves.`},
  {t:'Buy her a proper coffee',fx:{you:2,team:1},o:`Flat white, oat milk, from the good place. Twenty minutes of actual conversation. Neither of you mentions work.`}
 ]},

{id:'okoye_goodbye',arc:1,who:'okoye',title:'G\'day from the future',cond:()=>isActive('okoye'),tag:'story',
 text:`Nadia's last day. She leaves a card on your desk: "Sorry, not sorry. Come and visit." Her patients have been asking who their new doctor is. Nobody knows yet.`,
 choices:[
  {t:'Send her off with a proper lunch',fx:{team:3,cash:-0.5},o:`She cries in the car park, then drives to the airport. The WhatsApp photos arrive a week later. There is a beach.`},
  {t:'Get straight back to work',fx:{you:-2},o:`You split her patients across the remaining lists. Nobody gets lunch.`}
 ],
 after(){ partnerLeaves('okoye'); }},

{id:'tom_partner',arc:1,who:'tom',title:'Tom has a question',cond:()=>S.staff.salaried>=1&&!S.flags.tomGone&&!isActive('tom'),tag:'real',src:['S11','S23'],
 info:'Partner numbers are falling: full-time equivalent partners in England dropped by 336 in a year. Many salaried GPs are wary of unlimited liability and premises debt.',
 text:`Tom, your salaried GP, catches you by the kettle. "I've been thinking. I'd like to become a partner." He has been reading the accounts. He has questions about the overdraft.`,
 choices:[
  {t:'"Yes. Welcome to the partnership."',fx:{team:4,you:2,capital:25},run(){ loseStaff('salaried','std'); S.partners.tom.status='active'; },o:`Tom buys in with £25,000 of working capital and a bottle of prosecco. He'll share the profits, the decisions and the liability.`},
  {t:'"Not this year. Let\'s review it in twelve months."',fx:{team:-2},alt:{p:()=>S.flags.taughtTom ? 0.25 : 0.5,o:`Tom nods. Six weeks later he hands in his notice. He's joining a practice across town as a partner.`,fx:{team:-3,sched:[['tom_leaves',1]]}},o:`Tom nods slowly. "Fair enough." He stays, but he has stopped volunteering for things.`},
  {t:'Offer him a pay rise to stay salaried',fx:{team:1},run(){ S.tomRaise=0.8; },o:`An extra £800 a month. He takes it. "No liability, no drawings, no HMRC in January," he says. You are briefly jealous of your own employee.`}
 ]},

{id:'tom_leaves',arc:1,who:'tom',title:'Tom\'s last day',cond:()=>S.staff.salaried>=1&&!S.flags.tomGone&&!isActive('tom'),tag:'story',
 text:`Tom's last day. He's off to be a partner at the practice on the other side of the ring road. He leaves 40 unfiled results and a thank-you card.`,
 choices:[{t:'Wish him well',fx:{inbox:40,team:-2},run(){ loseStaff('salaried','std'); S.flags.tomGone=1; },o:`You now have one fewer GP and a new appreciation for how much Tom actually did.`}]},

{id:'partner_advert',who:'bev',title:'Advertise for a partner?',months:[4,5,6,7,8,9],cond:()=>activeOthers()<=1,tag:'real',src:['S11'],
 info:'Partnership adverts often get few or no applicants. Nationally, 15% of GPs said they couldn\'t find suitable GP work, but most newly qualified GPs want salaried or locum roles rather than partnership.',
 text:`"We're thin on partners," Bev says. "Do we advertise? The last partnership advert in {place} got one applicant. He wanted to work Tuesdays only and bring his dog."`,
 choices:[
  {t:'Advertise nationally (£1,500)',fx:{cash:-1.5},run(){ if(chance((0.25+(S.rep-55)/200+(S.st.team-50)/250)*(gpHeadroom()<6?0.3:1))) schedule('partner_applicant',2); else plant({in:2,note:'Your partnership advert closed with no applicants. A locum rang to ask if the rate was per hour.'}); },o:`The advert goes out. You check the inbox every morning like it's exam results day. Your reputation and your team's morale will decide who applies.`},
  {t:'Don\'t bother. Salaried GPs are the future.',fx:{you:1},o:`You tell yourself this is a strategic decision. It's mostly a financial one.`}
 ]},

{id:'partner_applicant',arc:1,who:'bev',title:'An actual applicant',cond:()=>activeOthers()<=2,tag:'story',
 text:`Dr Priya Nair, eight years qualified and salaried in the city, wants to become a partner. Her conditions: six sessions, no premises liability, and she never, ever does the Christmas Eve duty.`,
 choices:[
  {t:'Welcome her aboard',fx:{team:5,you:4,capital:25},run(){ S.partners.priya.status='active'; },o:`Priya starts next month with £25,000 of capital and a label maker. The partnership has hope again.`},
  {t:'Decline. The terms are too much.',fx:{you:-1},o:`She joins the practice across the ring road. You see her in Tesco. She looks well rested.`}
 ]},

{id:'apex_offer',who:'apex',title:'An exciting opportunity',months:[6,7,8,9],w:()=>activeOthers()<=1||S.cash<0?2:1,tag:'real',src:['S11'],
 info:'Some practices hand their contracts to larger organisations or corporate providers. Since 2015, 1,480 practices in England have closed or merged.',
 text:`A man in a gilet takes you for lunch. Apex Primary Care Ltd would like to "acquire the contract and unlock synergies". They'll pay for your share, and you can stay on as a salaried "Clinical Lead". Your lunch is £38. He doesn't stay for pudding.`,
 choices:[
  {t:'Sell. Let someone else hold the liability.',run(){ S.exit='sold'; return {o:`You sign. The papers take three minutes. The phones switch to a national call centre the following Monday.`}; }},
  {t:'Politely decline',fx:{you:1},o:`"Totally understand," he says, already typing an email to the practice down the road.`},
  {t:'Tell him where to put his synergies',fx:{team:4,you:3,rep:2},o:`Word reaches the whole building by lunchtime. Morale is briefly excellent.`}
 ]},

{id:'cqc_call',who:'bev',title:'The phone call',months:[4,5,6,7,8],w:()=>S.st.safety<45||S.rep<45?5:3,tag:'real',src:['S33'],
 info:'CQC rates practices on five key questions. About 5% of practices are rated Requires Improvement or Inadequate. Inspections are increasingly triggered by risk: complaints, data and intelligence from the ICB.',
 text:`Bev walks in and closes the door. She never closes the door. "CQC just rang. Inspection in two weeks." Somewhere, a fire safety policy last reviewed in 2021 begins to sweat.`,
 choices:[
  {t:'All hands: weekend prep marathon',fx:{safety:9,team:-6,you:-5},o:`Policies updated, fridges logged, the emergency drugs box has in-date adrenaline. Everyone is exhausted.`},
  {t:'Hire a CQC consultant (£5,000)',fx:{safety:10,cash:-5,team:-1},o:`Gavin arrives with 400 pages of templates and a lanyard that says "Compliance Is Care".`},
  {t:'"We are always inspection-ready."',fx:{you:1},o:`You say this with confidence. Bev writes something in her notebook and underlines it twice.`}
 ],
 after(){ schedule('cqc_visit',1); }},

{id:'cqc_visit',arc:1,who:'cqc',title:'Inspection day',tag:'rule',src:['S33'],
 info:'The rating for each key question comes from evidence: your records and policies (safety), outcomes such as QOF (effective), patient feedback (caring), access (responsive) and leadership and culture (well-led).',
 text:`Patricia Sharpe arrives at 8:29 with a clipboard, a lanyard and an expression you can't read. She'd like to see the fridge logs, the significant event log, the complaints file, and "just how things really are".`,
 choices:[{t:'Show her how things really are',run(){ return runCQC(); }}]},

{id:'qof_yearend',arc:1,who:'bev',title:'Six weeks to go',tag:'rule',src:['S3','S13'],
 info:'QOF achievement is measured on 31 March. Points scale between lower and upper thresholds for each indicator. The balance above your aspiration payments is paid by the end of June.',
 text:()=>`"QOF year end is 31st March. We're at ${Math.round(S.qof)}%." Each 1% is worth about £${Math.round(qofValueK(1)*1000).toLocaleString('en-GB')}, paid next June. Bev has printed the list of patients still missing their reviews. It's the thickness of a paperback.`,
 choices:[
  {t:'Saturday recall clinics for the rest of the year',fx:()=>({qof:S.qof < 70 ? 13 : 7,you:-5,team:-4,cash:-1.5}),o:`Four Saturdays of spirometry, foot checks and blood pressures. Maureen does her last one wearing a tiara for reasons nobody explains.`},
  {t:'Text blast, and exception-report where it\'s genuinely justified',fx:()=>({qof:S.qof < 70 ? 3 : 5,safety:-1}),o:`The team sends 1,100 texts. Twelve people reply "STOP". One replies with a photo of their cat.`},
  {t:'Accept fate',fx:{you:2},o:`You decide QOF is a construct. The accountant will tell you in June exactly how expensive this construct is.`}
 ]},

{id:'contract_new',arc:1,who:'dept',title:'Next year\'s contract',tag:'speculative',
 info:'Contract changes for the following April are usually announced between February and March, leaving practices weeks to plan. The details of the 2027/28 contract in this card are invented.',
 text:()=>`The GP contract for ${2027 + (S.yr || 0)}/${28 + (S.yr || 0)} has been announced. It was trailed in a Sunday paper, confirmed on breakfast radio, and reached the practice on 28th March. It starts on 1st April. It's 94 pages long.`,
 choices:[
  {t:'Read all 94 pages tonight',fx:()=>({you:-3,safety:S.st.safety < 45 ? 5 : 2}),o:`Page 61 contains a new requirement. Page 88 contains the funding for it, which is less than the cost of doing it.`},
  {t:'Wait for the LMC summary',fx:{you:2},o:`The LMC summary arrives two days later. It's two pages long and mostly swearing, professionally phrased.`}
 ]},

{id:'mini_docman',kind:'mini',game:'docman',rep:1,max:3,who:'bev',title:'Docman Dash',w:()=>S.inbox>350?2:1.1,tag:'story',
 text:`The document inbox has {inbox} items in it. Bev asks if you want to blitz some yourself between patients. Letters, results and requests: file it, action it, flag it urgent, or bounce it back to where it belongs.`,
 choices:[
  {t:'Grab a coffee and blitz it (45-second game)',play:1},
  {t:'Delegate: pay the admin team overtime to pre-sort',fx:{inbox:-60,cash:-0.6},later:[{in:1,p:0.25,fx:{safety:-3},note:'Because the admin team pre-sorted the inbox under pressure: an urgent potassium sat in "routine" for two days.'}],o:`They sort 60 items. It's mostly fine.`}
 ]},

{id:'mini_triage',kind:'mini',game:'triage',rep:1,max:3,who:'kayleigh',title:'The 8am Rush',w:1.1,tag:'rule',src:['S1'],
 info:'Under the 2026/27 contract, practices can\'t cap online requests. Urgent needs must be dealt with the same day and non-urgent ones by the end of the next working day. Good care navigation sends patients straight to the right service.',
 text:`08:00. The phone queue says 63. The online form has 41 new requests, and under this year's contract you can't switch it off. Kayleigh looks at you with the eyes of a soldier in a war film. "Can you help triage?"`,
 choices:[
  {t:'Take the hot seat (45-second game)',play:1},
  {t:'Let reception work through the template',fx:{patients:-1,demand:0.5},o:`The template does its best. Three sore throats get GP appointments, and a sprained ankle waits for a paramedic call-back.`}
 ]}
);
