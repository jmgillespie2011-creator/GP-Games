/* ===================== EVENTS 8: the long haul, part two =====================
 More cards for later years (most need pressure, `pmin`, or a second year):
 - ways to fight for money: sale and leaseback, renting rooms, service bids, a partner buying in, a GP claimed through ARRS;
 - people coming back: Nadia from Perth, Alan as a locum, Mrs Higgins at 90, Gerald's last swim;
 - the grind of later years: partners burning out or retiring, a neighbouring practice closing, a new clinical system.
*/
const leaverPartner = () => ['okoye', 'tom', 'priya', 'hartley'].find(x => isActive(x)) || null;
const leaverName = () => (PARTNERS0[leaverPartner()] || { short: 'A partner' }).short;
const yr1 = () => (S.yr || 0) >= 1;
EVENTS.push(
/* ---------- fighting for money ---------- */
{id:'p_leaseback',once:1,who:'accountant',title:'Sell the building?',pmin:1,cond:()=>!S.flags.soldBuilding&&S.cash<20,tag:'real',src:['S30','S44'],
 info:'Some partnerships sell their premises to an investor and lease them back, releasing the partners\' capital. The NHS keeps reimbursing a notional or actual rent, but a commercial landlord can charge more than the reimbursement and control repairs and extensions.',
 text:`Neville has had an offer. A healthcare property fund will buy the building for a good price and lease it straight back to you for 25 years. "It releases your capital," he says. "It also means you'll never own anything again."`,
 choices:[
  {t:'Sell and lease back',fx:{capital:160,team:-1,flags:{soldBuilding:1}},run(){ S.premX = (S.premX || 0) + 2.2; },o:`£160,000 lands in the practice account. So does a 60-page lease, with a rent review every five years that only goes up. Rent above the reimbursement: £2,200 a month.`},
  {t:'Keep the building',fx:{you:-1},o:`You keep the building, the roof and the boiler. Neville nods, the way he does when he disagrees.`}
 ]},
{id:'p_room_rental',who:'bev',title:'Weekend tenants',pmin:1,cond:()=>!hasMod('rental'),tag:'story',
 text:`A private physiotherapist and a podiatrist want to rent two rooms on Saturdays and one evening a week. "It's free money," Bev says. "Apart from the cleaning, the alarm, the insurance, the car park and the complaints about the car park."`,
 choices:[
  {t:'Rent them the rooms',fx:{you:-1},run(){ addMod({ id: 'rental', label: 'Weekend room rental', months: 99, fx: { cash: 0.9 } }); },o:`£900 a month, paid on time, which makes them the most reliable people you deal with.`},
  {t:'Keep the building for NHS work',fx:{team:1},o:`The rooms stay dark on Saturdays. The cleaner is relieved.`}
 ]},
{id:'p_les_bid',who:'icb',title:'A service to bid for',pmin:1,tag:'story',
 text:`The ICB is inviting bids for a local enhanced service: in-house spirometry and anticoagulation monitoring for the neighbourhood. It pays well, if you can staff it. The bid form is 22 pages and due in nine days.`,
 choices:[
  {t:'Write the bid',fx:{you:-3},run(){ const ok = chance(0.5 + (S.icb - 55) / 120); plant({ in: 2, fx: ok ? { cash: 3, rep: 2 } : { you: -1 }, note: ok ? 'The ICB accepted your bid for the local enhanced service. It pays about £1,500 a month, for two years, and brings its own patients.' : 'Your service bid came second. The feedback says "strong, but not quite aligned with the strategic direction".' }); if (ok) addMod({ id: 'les', label: 'Local enhanced service', months: 24, at: S.month + 2, fx: { cash: 1.5 }, demand: 1, hours: 1 }); },o:`Two evenings and a weekend. The bid goes in at 11:58pm. The ICB's view of you will matter.`},
  {t:'Not this time',fx:{},o:`The practice across the ring road wins it. Their partners look tired at the next PCN meeting, and richer.`}
 ]},
{id:'p_buyin',who:'bev',title:'Buying in',pmin:1,cond:()=>S.staff.salaried>=1&&S.partners.priya.status==='none'&&activeOthers()<=2,tag:'real',src:['S23','S44'],
 info:'New partners usually buy in with a share of the working capital, often around £25,000, and sometimes a share of the premises. It shares the liability and the profit.',
 text:`Dr Priya Nair, one of your salaried GPs, asks to become a partner. She has read the accounts, twice, and wants to buy in with £30,000 of working capital. "I'd rather own the problem than rent it," she says.`,
 choices:[
  {t:'Welcome her to the partnership',fx:{capital:30,team:4,you:3},run(){ S.staff.salaried--; S.partners.priya.status = 'active'; S.partners.priya.clin = 6; },o:`The partnership deed gets a new signature. The profit is split one more way, and so is everything else.`},
  {t:'Not yet',fx:{team:-2},o:`She takes it well. Six months later she takes a partnership across town.`}
 ]},
{id:'p_arrs_gp',who:'ward',title:'A GP through the PCN',pmin:1,cond:()=>S.practiceKey!=='city'||gpHeadroom()<6,tag:'real',src:['S4','S84'],
 info:'From 2026/27, PCNs can claim GPs through the Additional Roles Reimbursement Scheme, up to £152,900 a year for a full-time GP including on-costs, as long as the GP hasn\'t worked substantively for a practice in the PCN in the previous 12 months.',
 text:()=>`Dr Sam Ward is back, fully qualified and still looking. Since this year's contract, the PCN can claim a GP from its additional-roles budget, and Clare says your share could cover him for six sessions a week. The budget has about £${Math.max(0, Math.round(arrsLeft()))}k a year left.`,
 choices:[
  {t:'Employ him through the PCN budget',fx:{team:3,patients:2},run(){ S.staff.salaried++; S.arrsGP = (S.arrsGP || 0) + 1; },o:()=>`Sam starts next month. His pay is claimed from the additional-roles budget${arrsLeft() < 0 ? ', which is now over, so the practice pays the difference' : ''}. He needs a room, which is the other budget you're always over.`},
  {t:'Keep the budget for pharmacists and physios',fx:{},o:`Sam takes a job in the next PCN. He sends a thank-you email anyway.`}
 ]},
{id:'p_drawings',who:'accountant',title:'Tighten the belts',pmin:1,cond:()=>S.cash<S.overdraft/2,tag:'story',
 text:`Neville wants the partners to leave £20,000 each in the practice for a year. "It's that or the bank decides for you," he says, not unkindly.`,
 choices:[
  {t:'Leave the money in',fx:{capital:20,you:-4,okoye:6},o:`The overdraft breathes out. At home, the conversation about the holiday is shorter than you'd like.`},
  {t:'Cut staff costs instead',need:()=>S.staff.recep>2,why:'There is no one left to cut',fx:{cash:4,team:-6,patients:-2},run(){ S.staff.recep--; },o:`A receptionist's post isn't replaced. The queue at 8am notices before anyone else does.`}
 ]},
/* ---------- people coming back ---------- */
{id:'p_nadia_back',once:1,who:'okoye',title:'Postcard from Perth',cond:()=>yr1()&&S.partners.okoye.status==='left',tag:'story',
 text:`An email from Nadia, from Perth. "The pay is great and the patients are lovely. But the heat, the snakes, and I miss the rain, which I never thought I'd type. Is there still a room with a window?"`,
 choices:[
  {t:'Welcome her back as a partner',fx:{capital:25,team:6,you:4},run(){ S.partners.okoye.status = 'active'; S.okoye = 20; },o:`Nadia is back by the autumn, tanned and oddly calm. She takes the room with the window. Nobody argues.`},
  {t:'Offer her salaried sessions',fx:{team:3,patients:2},run(){ S.staff.salaried++; },o:`Six sessions, no liability, no overdraft. "Honestly," she says, "that's why I left."`},
  {t:'Tell her she\'s better off in the sun',fx:{you:-1},o:`She replies with a photo of a beach and the words "you're right, I'm sorry".`}
 ]},
{id:'p_alan_locum',once:1,who:'hartley',title:'Alan is bored',cond:()=>yr1()&&S.partners.hartley.status==='left',tag:'story',
 text:`Alan rings. The cruise was lovely, the garden is done, and his wife has asked him, kindly, to find something to do. "Two sessions a week? I'll do them at mate's rates. No home visits."`,
 choices:[
  {t:'Book him for a year',fx:{team:3,patients:2},run(){ addMod({ id: 'alan', label: 'Alan back as a locum', months: 12, capAdd: 28, fx: { cash: -0.9 } }); },o:`Alan is back on Tuesdays and Thursdays, telling the goat story to a new generation of patients.`},
  {t:'Thank him, but no',fx:{},o:`He takes up bowls. He's already on the committee.`}
 ]},
{id:'p_higgins_90',once:1,who:'higgins',title:'Ninety',cond:()=>yr1(),tag:'story',
 text:`Mrs Higgins is ninety on Friday. Her daughter has asked if "her doctor" might sign the card the family is making. There's a photo of the ducks on the front.`,
 choices:[
  {t:'Sign it, and drop it round yourself',fx:{you:4,patients:2,rep:1,team:-1,inbox:30},o:`There is shortbread. There are four generations in one small front room. You stay twenty minutes longer than you should, and don't regret it.`},
  {t:'Sign it and send it with the district nurses',fx:{you:1},o:`The daughter sends a photo of her holding the card. She's wearing her good cardigan.`}
 ]},
{id:'p_gerald',once:1,who:'gerald',title:'Gerald',cond:()=>(S.yr||0)>=2&&!S.flags.geraldGone,tag:'story',
 text:`Gerald, the waiting-room goldfish, has died, peacefully, aged about nine. Three children have made cards. Someone has already asked, carefully, whether the risk assessment needs updating.`,
 choices:[
  {t:'Gerald the Second',fx:{team:3,patients:1},run(){ S.flags.gerald2 = 1; },o:`A new goldfish arrives on Monday. Everyone agrees he looks exactly like Gerald. The risk assessment is updated with a single word: "Gerald (II)".`},
  {t:'Leave the tank empty in his memory',fx:{team:-1},run(){ S.flags.geraldGone = 1; },o:`The empty tank becomes a book swap. It's lovely. It's not the same.`}
 ]},
{id:'p_kayleigh_train',once:1,who:'kayleigh',title:'Kayleigh has a plan',cond:()=>yr1()&&S.staff.recep>=3&&!S.flags.kayleighNA,tag:'story',
 text:`Kayleigh wants to train as a nursing associate: an apprenticeship, two years, mostly on the job. "I'm good with people and I'm good under pressure," she says. "I've done eight years on the front desk. Nursing will be restful."`,
 choices:[
  {t:'Back her, and fund the apprenticeship',fx:{team:5,cash:-1.5,flags:{kayleighNA:1}},run(){ S.staff.recep--; S.staff.hca++; plant({ in: 12, fx: { team: 3, patients: 2, qof: 1 }, note: 'Kayleigh passed her nursing associate apprenticeship. She runs the Tuesday blood pressure clinic and still answers the phone when it rings too long.' }); },o:`Reception loses its best voice. The treatment room gains its most unflappable trainee.`},
  {t:'Not now, reception needs her',fx:{team:-4},later:[{in:4,p:0.5,fx:{team:-2},note:'Kayleigh has started the nursing associate course at the hospital instead. She popped in to say goodbye.'}],o:`She understands. She also downloads the hospital's application form that evening.`}
 ]},
/* ---------- the grind of later years ---------- */
{id:'p_partner_burnout',who:'bev',title:'A partner on the edge',pmin:2,cond:()=>!!leaverPartner(),tag:'real',src:['S36'],
 info:'In the national GP Worklife Survey, a large share of GPs reported high stress and an intention to leave direct patient care within five years. Partners carry the business risk on top of the clinical work.',
 text:()=>`${leaverName()} missed the partners' meeting and was found in their car in the staff car park, engine off, not moving. "I'm fine," they said. They are not fine.`,
 choices:[
  {t:'Insist on a month off, and cover it',fx:{cash:-5,team:-2},run(){ const id = leaverPartner(); if (id) addMod({ id: 'rest_' + id, label: `${PARTNERS0[id].short} on sick leave`, months: 1, away: id }); },o:`A month off, a GP of their own, and a proper return plan. They come back slower and steadier. That's the point.`},
  {t:'Share their sessions for a while',fx:{you:-5,team:-3},run(){ const id = leaverPartner(); if (id) addMod({ id: 'rest_' + id, label: `${PARTNERS0[id].short} on reduced sessions`, months: 2, away: id, hours: 4 }); },o:`Everyone takes a bit more. It's a lot of "a bit".`},
  {t:'"We all feel like that."',fx:{},later:[{in:2,p:0.55,fx:{team:-4,you:-2,sched:[['p_partner_retires',0]]},note:'The partner who said "I\'m fine" wasn\'t. Their resignation letter is on your desk.'}],o:`Nobody says anything. That's the problem.`}
 ]},
{id:'p_partner_retires',who:'deed',title:'Early retirement',pmin:2,cond:()=>!!leaverPartner()&&activeOthers()>=1,tag:'real',src:['S23','S43'],
 info:'Partners can retire from the partnership with the notice their deed requires, often six months. Many GPs now plan to retire at or before 60, and whoever remains takes on the leases, loans and staff contracts.',
 text:()=>`${leaverName()} gives six months' notice. "I've done the sums on my pension. If I stay, I'm working for nothing, and I'm tired." It's a very reasonable letter. It's also a disaster.`,
 choices:[
  {t:'Offer fewer sessions and no management role',fx:{cash:-3,you:-2},alt:{p:0.5,fx:{you:-2},run(){ const id = leaverPartner(); if (id) partnerLeaves(id); },o:`They think about it for a week, and say no, kindly. They leave at the end of the notice period, and the brass plate loses another name.`},run(){ if (!S._alt) { const id = leaverPartner(); if (id) pt(id).clin = Math.max(3, pt(id).clin - 2); } },o:`They stay, on fewer sessions. The rota has a hole, but the partnership doesn't.`},
  {t:'Accept it and start recruiting',fx:{team:-3,you:-2},run(){ const id = leaverPartner(); if (id) partnerLeaves(id); schedule('partner_advert', 1); },o:`You shake hands, and start writing the advert. It will say "vibrant". It won't say "overdraft".`}
 ]},
{id:'p_list_dispersal',who:'icb',title:'The practice down the road',pmin:1,tag:'story',
 text:`The practice on Station Road is closing: two partners retiring, nobody to take over. The ICB is dispersing its 4,000 patients, and "expects" you to take 1,500 of them. The funding follows them. The GPs don't.`,
 choices:[
  {t:'Take them, and ask for the premises money to go with them',fx:{team:-3,icb:5,flags:{dispersed:1}},run(){ S.flags.dispersedYr = S.yr || 0; S.list += 1500; S.newRegs.push({ n: 1500, until: S.month + 12 }); },o:`Fifteen hundred new patients over three months. The first week, reception registers 200 of them by hand. The money arrives a quarter later.`},
  {t:'Object, with the LMC',fx:{icb:-6,you:-2},alt:{p:0.6,fx:{icb:-4,team:-2},run(){ S.list += 1200; S.newRegs.push({ n: 1200, until: S.month + 12 }); },o:`The objection is noted. The patients are allocated anyway: 1,200 of them.`},run(){ if (!S._alt) { S.list += 500; S.newRegs.push({ n: 500, until: S.month + 12 }); } },o:`The ICB spreads them more widely. You get 500.`}
 ]},
{id:'p_system_change',who:'it',title:'A new clinical system',pmin:1,tag:'story',
 text:`The ICB is moving every practice to a new clinical system, "to align the estate". Yours is scheduled for March, the month before QOF year end. Training is a four-hour video. The migration will take the system offline for three days.`,
 choices:[
  {t:'Go early, in the summer',fx:{you:-3,team:-3},run(){ addMod({ id: 'sysmove', label: 'New clinical system bedding in', months: 2, capMul: 0.92, hours: 2 }); },o:`Two rough months in the quiet season. By the autumn, everyone can find the button for repeats.`},
  {t:'Push back to after year end',fx:{icb:-3},alt:{p:0.5,fx:{you:-4,qof:-4,team:-3},run(){ addMod({ id: 'sysmove', label: 'System migration in QOF season', months: 2, capMul: 0.88, hours: 3 }); },o:`The ICB says the date can't move. Three days offline in QOF season. It's as bad as it sounds.`},o:`The ICB agrees to April. You have bought yourself a whole new set of problems, later.`}
 ]},
{id:'p_nurse_poached',who:'maureen',title:'An offer from the PCN',pmin:1,cond:()=>S.staff.nurse>=1,tag:'story',
 text:`One of your practice nurses has been offered a PCN post: Band 7, study leave, no QOF recalls. The PCN is, technically, you and ten other practices.`,
 choices:[
  {t:'Match it (£400 a month)',fx:{team:3},run(){ S.payX = (S.payX || 0) + 0.4; },o:`She stays. The other nurses find out what she's paid by lunchtime.`},
  {t:'Wish her well',fx:{team:-3,qof:-2},run(){ S.staff.nurse--; S.vac.nurse = (S.vac.nurse || 0) + 1; },o:`She moves across to the PCN. You'll see her at the hub on Thursdays, doing the job she used to do here.`}
 ]},
{id:'p_insurance',who:'bev',title:'The renewal',pmin:1,tag:'story',
 text:`The buildings and liability insurance renewal is up 38%. The broker blames "the claims environment", the flat roof, and the fish tank.`,
 choices:[
  {t:'Pay it',fx:{cash:-4},o:`Paid. The fish tank is now insured for more than Bev's car.`},
  {t:'Shop around (Bev\'s week)',fx:{team:-2,cash:-2},o:`Bev gets it down to 21%. She'd like it minuted that this took her four days.`}
 ]},
{id:'p_pension_charge',who:'pcse',title:'A tax bill for your pension',pmin:1,tag:'story',
 text:`A letter explains that your NHS pension grew faster than the annual allowance, so you owe a tax charge on money you won't see for twenty years. The letter includes a helpline. The helpline includes Vivaldi.`,
 choices:[
  {t:'Use Scheme Pays and move on',fx:{you:-2},o:`The scheme pays the charge and takes it out of your pension later. It's fine. It's also absurd.`},
  {t:'Drop a session to keep under the limit',fx:{you:2,patients:-2},run(){ S.plan.clin = Math.max(3, S.plan.clin - 1); },o:`You drop a session to avoid being taxed for working. Somewhere, a spreadsheet at the Treasury is very pleased.`}
 ]},
{id:'p_violence',who:'kayleigh',title:'A serious incident',pmin:1,tag:'real',src:['S37'],
 info:'In a 2026 study of 1,152 general practice staff, 92.3% had faced verbal abuse and 47.7% physical violence or threats. Reception staff were the most affected.',
 text:`A man threw a chair across reception because his prescription wasn't ready. Nobody was hurt, just. Two of the team went home in tears. The police came, eventually.`,
 choices:[
  {t:'Remove him from the list and review security (£3,000)',fx:{team:6,cash:-3,aim:{team:1}},o:`A screen, a panic button that works and a proper policy. The team knows you stood behind them.`},
  {t:'A debrief, and carry on',fx:{team:-3},o:`Everyone says they're fine. Two of them start looking at other jobs.`}
 ]},
{id:'p_estates',who:'icb',title:'Not fit for purpose',pmin:2,tag:'real',src:['S31'],
 info:'In a 2025 BMA survey, only half of practices said their premises were suitable for present needs, and 83% said they couldn\'t meet future demand.',
 text:`An ICB estates survey has rated your building "not fit for purpose": too small, too hot, not accessible upstairs. There's no money attached, just the rating, and a line in the next CQC report.`,
 choices:[
  {t:'Commission an architect for a bid (£4,000)',fx:{cash:-4},run(){ const ok = chance(0.4 + (S.icb - 55) / 150); plant({ in: 6, fx: ok ? { rooms: 2, team: 5, patients: 2 } : { team: -2 }, note: ok ? 'The ICB approved your premises bid. Two new rooms and a lift by the spring.' : 'The premises bid was rejected. "Insufficient capital this financial year."' }); },o:`Drawings, a business case and a lot of hoping.`},
  {t:'Make do',fx:{safety:-2,team:-2},o:`You put a sign on the stairs and a fan in the waiting room. Next summer will be the same.`}
 ]},
{id:'p_award',who:'paper',title:'Practice of the Year?',pmin:1,cond:()=>STAT_KEYS.every(k=>S.st[k]>=45),tag:'story',
 text:`{surgery} has been shortlisted for a regional "Practice of the Year" award. The ceremony is in a hotel ballroom, black tie, on a Thursday night.`,
 choices:[
  {t:'Take the whole team',fx:{team:8,cash:-2,rep:3},o:`You don't win. Maureen dances with the regional director of something. The team talks about it for a year.`},
  {t:'Send Bev with a speech, just in case',fx:{team:3,rep:2},o:`You win. Bev reads the speech, then says something much better that wasn't in it.`}
 ]},
{id:'p_ai_triage',who:'rep',title:'An AI at the front door',pmin:2,tag:'speculative',
 info:'Invented, but not far off: suppliers are offering AI tools that sort online requests and suggest who should deal with them. The regulation of these tools is still developing.',
 text:`A supplier offers an AI triage tool: it reads every online request and sorts it into "today", "this week" and "pharmacy". £1,200 a month. The demo was flawless. The demo always is.`,
 choices:[
  {t:'Trial it, with a clinician checking every decision',fx:{you:-2,cash:-1.2},run(){ addMod({ id: 'aitriage', label: 'AI triage trial', months: 3, fx: { cash: -1.2 }, demand: -3, aim: { team: 1 } }); },o:`It's good at sorting and bad at nuance. The clinician checking it finds two it would have sent to the pharmacy that needed a GP today.`},
  {t:'Not until someone else goes first',fx:{},o:`The practice across town goes first. You watch.`}
 ]},
{id:'p_winter_crisis',who:'hospital',title:'OPEL 4',pmin:2,months:[8,9,10],tag:'real',src:['S1'],
 info:'OPEL is the NHS\'s escalation framework for operational pressure; level 4 is the highest. When hospitals are at OPEL 4, ambulance handovers are delayed and discharges speed up, and general practice feels both.',
 text:`St Swithin's has declared OPEL 4. Ambulances are queuing outside A&E, and the hospital is asking GPs to "consider alternatives to admission" and to take early discharges.`,
 choices:[
  {t:'Set up a same-day hot clinic for the frail',fx:{you:-4,team:-3,patients:4,icb:4},o:`Two GPs, a room and a lot of home visits. Eleven people stay out of hospital who would have gone in. You're exhausted.`},
  {t:'Business as usual',fx:{patients:-3,safety:-2},o:`Your patients wait eight hours on trolleys, and some of them ring you from there.`}
 ]},
{id:'p_qof_changes',who:'dept',title:'QOF, retired',pmin:2,tag:'speculative',
 info:'Invented: QOF indicators are regularly retired and replaced, and the money is often moved into core funding or new schemes.',
 text:`A third of the QOF indicators have been "retired" and the money moved into a new "outcomes framework", details to follow. Your recall spreadsheets now measure things nobody pays for.`,
 choices:[
  {t:'Redesign your recalls around the new framework',fx:{you:-3,team:-2,qof:3},o:`New templates, new searches, new everything. Maureen names the spreadsheet "QOF 2: The Reckoning".`},
  {t:'Wait for the details',fx:{qof:-3},o:`The details arrive in March.`}
 ]},/* ---------- stories that carry across years ---------- */
{id:'p_gerald2',who:'gerald',title:'Gerald (II)',cond:()=>S.flags.gerald2&&!S.flags.gerald2Out,tag:'story',
 text:`Gerald (II) has jumped out of his tank, twice, and been found on the carpet by a four-year-old, who saved him both times. The four-year-old's mum would like this minuted. So would the four-year-old.`,
 choices:[
  {t:'A lid, and a certificate for the hero',fx:{patients:2,team:2,cash:-0.1},o:`The certificate says "Fish Rescuer First Class". It goes on the fridge at home and on the practice Facebook page.`},
  {t:'Rehome him with the four-year-old',fx:{team:-1,patients:1,flags:{gerald2Out:1}},o:`Gerald (II) moves to a bigger tank in a bungalow on Mill Lane. The waiting room is quieter.`}
 ]},
{id:'p_higgins_bench',once:1,who:'bev',title:'A bench',cond:()=>S.ever&&S.ever.p_higgins_90&&(S.yr||0)>=2,tag:'story',
 text:`Mrs Higgins died last week, at home, as she wanted, with her daughter there. The family would like to put a bench outside the surgery, "because she spent half her life in that waiting room, and she liked it".`,
 choices:[
  {t:'Yes, and go to the funeral',fx:{you:2,patients:3,team:2,cash:-0.4},o:`A locum covers your morning. The church is full. The bench goes in by the ducks, with a small brass plate.`},
  {t:'Yes, and send flowers',fx:{you:-1,patients:2},o:`The bench goes in. You sit on it once, in May, for four minutes.`}
 ]},
{id:'p_dispersed_needs',once:1,who:'maureen',title:'The Station Road patients',cond:()=>S.flags.dispersed&&(S.yr||0)>(S.flags.dispersedYr||0),tag:'story',
 text:`The patients you took from Station Road have settled in. Their records haven't: half their long-term conditions were never coded, and 140 are overdue a review. Maureen has printed the list. It is long.`,
 choices:[
  {t:'A catch-up clinic, two evenings a week for a quarter',fx:{team:-3,cash:-2.4,qof:4,safety:3},o:`Coffee, biscuits and 140 reviews. Maureen finds three diabetics nobody knew about.`},
  {t:'Pick them up as they come in',fx:{safety:-3,qof:-2},later:[{in:3,p:0.4,fx:{safety:-4,you:-2},note:'A Station Road patient with a missed kidney result came in unwell. It was caught in time. Only just.'}],o:`They'll come in eventually. Some of them will come in by ambulance.`}
 ]},
{id:'p_anniversary',once:1,who:'bev',title:'Fifty years',cond:()=>(S.yr||0)>=2,tag:'story',
 text:`{surgery} is fifty years old this month. Bev has found the original opening photo: three GPs, one receptionist, a typewriter and a very large plant. The plant is, somehow, still in reception.`,
 choices:[
  {t:'An open afternoon and cake',fx:{team:4,patients:3,rep:3,cash:-0.8},o:`The local paper sends a photographer. The plant is in every picture.`},
  {t:'A card for the staff room',fx:{team:1},o:`It's signed by everyone. The plant gets watered.`}
 ]},
{id:'p_list_cleanse',who:'pcse',title:'Ghost patients',pmin:1,tag:'real',src:['S4'],
 info:'Practices are paid the global sum per registered patient, and NHS England and its support services periodically check lists for people who have moved away or died.',
 text:`A list-cleaning exercise has found 380 "ghost patients": people who moved away years ago and never deregistered. They'll come off the list, and the money comes off with them, unless each one replies to a letter.`,
 choices:[
  {t:'Let it run',fx:{list:-380,you:-1},o:`380 people you've never seen stop paying for themselves. The waiting room is exactly as full.`},
  {t:'Check every one by hand first',fx:{list:-260,team:-3},o:`Reception rings round. 120 are very much alive and very much still here, and slightly offended.`}
 ]},
{id:'p_lab_outage',who:'hospital',title:'The lab is down',pmin:2,tag:'story',
 text:`A cyber attack has taken out the hospital pathology service. Blood tests are limited to "urgent only" for six weeks. Every routine monitoring test you'd booked is now a phone call to cancel and a list to rebook.`,
 choices:[
  {t:'Keep a proper list and rebook in order',fx:{team:-3,inbox:120,safety:2},o:`Maureen's spreadsheet becomes the most important document in the building.`},
  {t:'Tell patients to rebook themselves when it\'s back',fx:{patients:-3,safety:-3},later:[{in:3,p:0.4,fx:{safety:-3},note:'A patient on a monitored drug went three months without bloods after the lab outage, because nobody rebooked them.'}],o:`Some do. Some don't.`}
 ]},
{id:'p_back_office',who:'pcn',title:'Share the back office?',pmin:1,cond:()=>!hasMod('backoffice'),tag:'story',
 text:`The practice across the ring road suggests sharing a back office: one finance team, one HR person, one set of policies. Nobody merges, nobody loses their name on the door. It saves money, and there'll be a year of arguing about whose spreadsheet wins.`,
 choices:[
  {t:'Do it',fx:{team:-4,you:-2},run(){ addMod({ id: 'backoffice', label: 'Shared back office', months: 99, fx: { cash: 1.3 } }); },o:`Bev and her opposite number have a long lunch and emerge with a plan. Savings of about £1,300 a month, once it beds in.`},
  {t:'Stay independent',fx:{},o:`You keep your own spreadsheets. They're wrong in ways you understand.`}
 ]}
);
