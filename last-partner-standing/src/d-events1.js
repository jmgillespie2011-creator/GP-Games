/* ===================== EVENTS 1: story arcs =====================
 Event: {id, who, title, text, cond(), months[], w, arc (scheduled only), rep (repeatable), max, kind:'mini', game}
 Choice: {t, fx:{...}|()=>{...}, o, alt:{p,fx,o}, need(), why, run()=>({o,html}|void)}
 fx keys: patients team you safety cash qof inbox list demand admin rooms okoye staff:{} flags:{} sched:[[id,inMonths]] mod:{}
*/
const EVENTS = [];

EVENTS.push(
{id:'welcome',arc:1,who:'bev',title:'Welcome to the partnership',
 text:`Your name is on the contract now. Also the lease, the bank mandate and the overdraft. "Partners have unlimited liability," Bev says, handing you a lanyard. "Right. Where do you want to start?"`,
 choices:[
  {t:'Meet every member of staff, one by one',fx:{team:6,you:-3},o:`Twenty-three conversations. You learn who makes the tea, who does the rota, and that nobody has fixed the back door since 2019.`},
  {t:'Go through the practice accounts line by line',fx:{cash:4,you:-3},o:`You find a direct debit for a photocopier the practice has not owned since 2017. Cancelled. You feel like a partner already.`},
  {t:'Clear the inbox so you start clean',fx:{inbox:-120,you:-4,safety:2},o:`You file until 9pm. A letter from 2023 asks you to "please arrange" something. You decide it has arranged itself.`}
 ]},

{id:'hartley_retire',arc:1,who:'hartley',title:'Wonderful news',
 text:`"I'm retiring at the end of September! Thirty-four years. The golf club has been very patient." Alan beams. He does 6 clinical sessions a week, and nobody else knows how the dispensary stock system works.`,
 choices:[
  {t:'"Congratulations, Alan. We\'ll manage."',fx:{team:2,flags:{hartleyGo:5},sched:[['hartley_building',2],['hartley_farewell',5]]},o:`He shakes your hand for slightly too long. "You'll be fine. It practically runs itself."`},
  {t:'"Would you retire and return? Four sessions, no admin?"',fx:{sched:[['hartley_building',2]]},
   run(){ if(chance(0.55)){ pt('hartley').clin=4; S.flags.hartleyGo=11; schedule('hartley_farewell_late',11-S.month); return {o:`He thinks about it over a Garibaldi. "Four sessions. No home visits. And I keep my parking space." Deal. He stays until March.`}; }
     S.flags.hartleyGo=5; schedule('hartley_farewell',5-S.month); S.st.you=clamp(S.st.you-2); return {o:`"My wife has booked a cruise," he says. "Round the world. Leaves 1st October." It was never really a question.`}; }}
 ]},

{id:'hartley_building',arc:1,who:'hartley',title:'About the building',cond:()=>pt('hartley').status==='active',
 text:`"One small thing. I own a third of the building. My share is valued at £210,000, and I'd like it before I go." Premises ownership: the gift that keeps on giving.`,
 choices:[
  {t:'Take out a partnership loan and buy him out',fx:{you:-4,flags:{loan:1}},run(){S.loan=(S.loan||0)+1.6;},o:`The bank is delighted. You now own a larger share of a building with a flat roof. Repayments: £1.6k a month, for twenty years.`},
  {t:'Ask Nadia to take on half the debt with you',need:()=>isActive('okoye'),why:'Nadia is no longer a partner',fx:{okoye:22,you:-2},run(){S.loan=(S.loan||0)+0.8;},o:`Nadia signs. She does not make eye contact. She makes a phone call in the car park that lasts forty minutes.`},
  {t:'Sell the building to an investor and lease it back',fx:{cash:22,team:-2,flags:{soldBuilding:1}},run(){S.premX=(S.premX||0)+2.4;},o:`Alan gets his money and the practice gets a cash injection. The new landlord, a pension fund in Guernsey, sends a lease with a five-yearly upward-only rent review.`}
 ]},

{id:'hartley_farewell',arc:1,who:'bev',title:'Alan\'s leaving do',cond:()=>pt('hartley').status==='active',
 text:`It's Alan's last week. The collection envelope contains £43.20 and a button. He has asked, loudly, whether there will be "a speech and a proper send-off".`,
 choices:[
  {t:'Book the function room at the Fox & Hounds (£1,500)',fx:{team:7,cash:-1.5},o:`He cries during his speech. So does Maureen. The karaoke goes on until 1am. It is the best night the practice has had in years.`},
  {t:'Cake and a card in the staff room',fx:{team:2},o:`A Colin the Caterpillar and a card that says "Good luck in your new job". Alan is gracious about it.`}
 ],
 after(){ partnerLeaves('hartley'); }},

{id:'hartley_farewell_late',arc:1,who:'hartley',title:'Alan hangs up the stethoscope',cond:()=>pt('hartley').status==='active',
 text:`Alan did his four sessions right to the end. Thirty-five years. He leaves you his desk, a tin of travel sweets, and a 1994 BNF "for sentimental value".`,
 choices:[
  {t:'Organise a proper send-off (£1,500)',fx:{team:6,cash:-1.5,you:2},o:`He tells the story about the home visit and the goat. Everyone has heard it. Everyone laughs anyway.`},
  {t:'A handshake and a heartfelt card',fx:{team:2,you:1},o:`"You'll be fine," he says. "Better than fine." You almost believe him.`}
 ],
 after(){ partnerLeaves('hartley'); }},

{id:'okoye_email',arc:1,who:'okoye',title:'Just a joke',cond:()=>isActive('okoye'),
 text:`Nadia forwards you a job advert. Perth, Western Australia. AUD 420,000, four-day week, 15-minute appointments. "Ha! As if!" she writes. You notice she has printed it out and laminated it.`,
 choices:[
  {t:'Offer to take over her QOF lead role',fx:{okoye:-18,you:-3,qof:2},o:`She hugs you. You now own the diabetes recall spreadsheet, which has 14 tabs and a macro nobody understands.`},
  {t:'Laugh along: "Who even wants sunshine?"',fx:{okoye:12,you:1},o:`She laughs. The laminated advert goes back in her bag. Carefully.`},
  {t:'Suggest a month\'s sabbatical this summer',fx:{okoye:-26,team:1,mod:{id:'okoye_away',label:'Nadia on sabbatical',months:1,at:3,away:'okoye'}},o:`She takes July. She comes back tanned, rested and slightly suspicious of how nice it felt.`}
 ]},

{id:'okoye_leaving',arc:1,who:'okoye',title:'Nadia closes the door',cond:()=>isActive('okoye')&&S.okoye>=60,
 text:`"I've accepted the job in Perth. I'll work my notice until the end of January." She has already bought sun cream. Factor 50. The big bottle.`,
 choices:[
  {t:'Offer her fewer sessions and a bigger profit share',fx:{cash:-4},alt:{p:0.5,fx:{you:-3},o:`She is touched. She still goes. "It's not the money. It's that I haven't eaten lunch sitting down since 2021."`},
   run(){ if(!S._alt){ S.okoye=30; pt('okoye').clin=4; return {o:`She takes a long breath. "Four sessions. Protected admin time. And I get the room with the window." Deal. Nadia stays.`}; } schedule('okoye_goodbye',Math.max(0,9-S.month)); }},
  {t:'Wish her well and start planning',fx:{you:-2,team:-3},run(){ schedule('okoye_goodbye',Math.max(0,9-S.month)); },o:`You say the right things. Then you go to your room and look at the rota for February for a long time.`}
 ]},

{id:'okoye_staying',arc:1,who:'okoye',title:'The laminated advert',cond:()=>isActive('okoye')&&S.okoye<60,
 text:`Nadia drops something in the confidential waste. It's the laminated Perth advert. "This place is mad," she says, "but it's our mad."`,
 choices:[
  {t:'Hug her (awkwardly)',fx:{team:3,you:3},o:`It is exactly as awkward as expected. Kayleigh sees and tells everyone. Morale improves.`},
  {t:'Buy her a proper coffee',fx:{you:2,team:1},o:`Flat white, oat milk, from the good place. Twenty minutes of actual conversation. Neither of you mentions work.`}
 ]},

{id:'okoye_goodbye',arc:1,who:'okoye',title:'G\'day from the future',cond:()=>isActive('okoye'),
 text:`Nadia's last day. She leaves a card on your desk: "Sorry, not sorry. Come and visit. The sessions here are FOUR HOURS." Her patients have been asking who their new doctor is.`,
 choices:[
  {t:'Send her off with a proper lunch',fx:{team:3,cash:-0.5},o:`She cries in the car park, then drives to the airport. The WhatsApp photos arrive a week later. There is a beach.`},
  {t:'Get straight back to work',fx:{you:-2},o:`You split her patients across the remaining lists. Nobody gets lunch.`}
 ],
 after(){ partnerLeaves('okoye'); }},

{id:'tom_partner',arc:1,who:'tom',title:'Tom has a question',cond:()=>S.staff.salaried>=1&&!S.flags.tomGone&&!isActive('tom'),
 text:`Tom, your salaried GP, catches you by the kettle. "I've been thinking. I'd like to become a partner." He has been reading the accounts. He has questions about the overdraft.`,
 choices:[
  {t:'"Yes. Welcome to the partnership."',fx:{team:4,you:2,cash:10},run(){ S.staff.salaried--; S.partners.tom.status='active'; },o:`Tom buys in with £10k of capital and a bottle of prosecco. He is a partner now. He will take a share of the profits, and of the liability.`},
  {t:'"Not this year. Let\'s review it in twelve months."',fx:{team:-2},alt:{p:0.5,o:`Tom nods. Six weeks later he hands in his notice. He's joining a practice across town as a partner.`,fx:{team:-3,sched:[['tom_leaves',1]]}},o:`Tom nods slowly. "Fair enough." He stays, but he has stopped volunteering for things.`},
  {t:'Offer him a pay rise to stay salaried',fx:{team:1},run(){ S.tomRaise=0.8; },o:`An extra £800 a month. He takes it. "No liability, no drawings, no stress," he says. You are briefly jealous of your own employee.`}
 ]},

{id:'tom_leaves',arc:1,who:'tom',title:'Tom\'s last day',cond:()=>S.staff.salaried>=1&&!S.flags.tomGone&&!isActive('tom'),
 text:`Tom's last day. He's off to be a partner at the practice on the other side of the ring road. He leaves 40 unfiled results and a thank-you card.`,
 choices:[{t:'Wish him well',fx:{inbox:40,team:-2},run(){ S.staff.salaried--; S.flags.tomGone=1; },o:`You now have one fewer GP and a new appreciation for how much Tom actually did.`}]},

{id:'partner_advert',who:'bev',title:'Advertise for a partner?',months:[4,5,6,7,8,9],cond:()=>activeOthers()<=1,
 text:`"We're thin on partners," Bev says. "Do we advertise? The last partnership advert in {place} got no applicants. Well, one. He wanted to work Tuesdays only and bring his dog."`,
 choices:[
  {t:'Advertise nationally (£1,500)',fx:{cash:-1.5},alt:{p:0.45,o:`Six weeks. No applicants. The advert gets shared on a GP forum with the caption "LOL, unlimited liability".`,fx:{you:-2}},run(){ if(!S._alt) schedule('partner_applicant',2); },o:`The advert goes out. You check the inbox every morning like it's exam results day.`},
  {t:'Don\'t bother. Salaried GPs are the future.',fx:{you:1},o:`You tell yourself this is a strategic decision. It is mostly a financial one.`}
 ]},

{id:'partner_applicant',arc:1,who:'bev',title:'An actual applicant',cond:()=>activeOthers()<=2,
 text:`Dr Priya Nair, eight years qualified, currently salaried in the city, wants to become a partner. Her conditions: six sessions, no premises liability, and she never, ever does the Christmas Eve duty.`,
 choices:[
  {t:'Welcome her aboard',fx:{team:5,you:4,cash:12},run(){ S.partners.priya.status='active'; },o:`Priya starts next month with £12k of capital and a label maker. The partnership has hope again.`},
  {t:'Decline. The terms are too much.',fx:{you:-1},o:`She joins the practice across the ring road. You see her in Tesco. She looks well rested.`}
 ]},

{id:'apex_offer',who:'apex',title:'An exciting opportunity',months:[6,7,8,9],w:1.4,
 text:`A man in a gilet takes you for lunch. Apex Primary Care Ltd would like to "acquire the contract and unlock synergies". They'll pay your share, and you can stay on as a salaried "Clinical Lead". Your lunch is £38. He does not stay for pudding.`,
 choices:[
  {t:'Sell. Let someone else hold the liability.',run(){ S.soldOut=1; return {o:`You sign. The papers take three minutes. The phone system changes to a national call centre the following Monday.`}; }},
  {t:'Politely decline',fx:{you:1},o:`"Totally understand," he says, already typing an email to the practice down the road.`},
  {t:'Tell him where to put his synergies',fx:{team:4,you:3,patients:1},o:`Kayleigh tells the whole building. Morale is briefly excellent.`}
 ]},

{id:'cqc_call',who:'bev',title:'The phone call',months:[4,5,6,7,8],w:3,
 text:`Bev walks in and closes the door. She never closes the door. "CQC just rang. Inspection in two weeks." Somewhere, a fire safety policy last reviewed in 2021 begins to sweat.`,
 choices:[
  {t:'All hands: weekend prep marathon',fx:{safety:9,team:-6,you:-5},o:`Policies updated, fridges logged, the emergency drugs box finally has in-date adrenaline. Everyone is exhausted.`},
  {t:'Hire a CQC consultant (£5,000)',fx:{safety:10,cash:-5,team:-1},o:`Gavin arrives with 400 pages of templates and a lanyard that says "Compliance Is Care".`},
  {t:'"We are always inspection-ready."',fx:{you:1},o:`You say this with confidence. Bev writes something in her notebook and underlines it twice.`}
 ],
 after(){ schedule('cqc_visit',1); }},

{id:'cqc_visit',arc:1,who:'cqc',title:'Inspection day',
 text:`Patricia Sharpe arrives at 8:29 with a clipboard, a lanyard and an expression you cannot read. She would like to see the fridge logs, the significant event log, the complaints file, and "just how things really are".`,
 choices:[{t:'Show her how things really are',run(){ return runCQC(); }}]},

{id:'qof_yearend',arc:1,who:'bev',title:'Six weeks to go',
 text:`"QOF year end is 31st March. We're sitting at {qof}%." Bev has printed the list of patients still missing their reviews. It is the thickness of a paperback.`,
 choices:[
  {t:'Saturday recall clinics for the rest of the year',fx:{qof:9,you:-5,team:-4,cash:-1.5},o:`Four Saturdays of spirometry, foot checks and blood pressures. Maureen does her last one wearing a tiara for reasons nobody explains.`},
  {t:'Text blast plus a push on exception reporting where it\'s justified',fx:{qof:4,safety:-1},o:`The care-coordination team sends 1,100 texts. Twelve people reply "STOP". One replies with a photo of their cat.`},
  {t:'Accept fate',fx:{you:2},o:`You decide QOF is a construct. The accountant will tell you in June exactly how expensive this construct is.`}
 ]},

{id:'contract_new',arc:1,who:'dept',title:'Next year\'s contract',
 text:`The GP contract for next year has been announced. It was trailed in a Sunday newspaper, confirmed on breakfast radio, and reached the practice on 28th March. It starts on 1st April. It is 94 pages long.`,
 choices:[
  {t:'Read all 94 pages tonight',fx:{you:-3,safety:2},o:`Page 61 contains a new requirement. Page 88 contains the funding for it, which is less than the cost of doing it.`},
  {t:'Wait for the LMC summary',fx:{you:2},o:`The LMC summary arrives two days later. It is two pages long and mostly swearing, professionally phrased.`}
 ]},

{id:'mini_docman',kind:'mini',game:'docman',rep:1,max:3,who:'bev',title:'Docman Dash',w:1.1,
 text:`The document inbox has {inbox} items in it. Bev asks if you want to blitz some yourself between patients. Letters, results and requests: file it, action it, flag it urgent, or bounce it back to where it belongs.`,
 choices:[
  {t:'Grab a coffee and blitz it (45-second game)',play:1},
  {t:'Delegate: pay the admin team overtime to pre-sort',fx:{inbox:-60,cash:-0.6},o:`They sort 60 items. One urgent potassium sits in "routine" until Thursday. Nobody died. This time.`}
 ]},

{id:'mini_triage',kind:'mini',game:'triage',rep:1,max:3,who:'kayleigh',title:'The 8am Rush',w:1.1,
 text:`08:00. The phone queue says 63. The online consultation tool has 41 new requests. Kayleigh looks at you with the eyes of a soldier in a war film. "Can you help triage?"`,
 choices:[
  {t:'Take the hot seat (45-second game)',play:1},
  {t:'Let reception work through the template',fx:{patients:-1,demand:0.5},o:`The template does its best. Three sore throats get GP appointments and a sprained ankle gets a call-back from the paramedic.`}
 ]}
);
