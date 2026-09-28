/* ===================== EVENTS 7: the long haul =====================
 Cards for later years and practices in trouble. `pmin` is the pressure a card needs before it can be dealt:
 pressure() adds one for each year served, one for each partner who has fallen, and a half for each meter below 30.
 So a comfortable first year never sees these, and a struggling practice sees them sooner.
*/
EVENTS.push(
{id:'p_ai_scribe',who:'rep',title:'The AI scribe',pmin:1,tag:'story',
 text:`A company offers an AI scribe that listens to consultations and writes the notes. £450 a month for the practice. "It saves each GP an hour a day," says the rep, who has never written a set of notes.`,
 choices:[
  {t:'Trial it, with patient consent and a data protection check',fx:{you:3,cash:-0.9,safety:1,team:1},run(){ addMod({id:'scribe',label:'AI scribe',months:99,fx:{cash:-0.45},aim:{you:2}}); },o:`The notes are good, occasionally too good: one records a patient's views on their neighbour's hedge. You spend less time typing and more time looking at people.`},
  {t:'Not until the ICB has a view',fx:{you:-1},o:`The ICB's view is due "in the next financial year".`}
 ]},
{id:'p_building_sold',once:1,who:'landlord',title:'Under new ownership',pmin:1,cond:()=>!!S.flags.soldBuilding,tag:'story',
 text:`Your landlord has sold the building to an investment fund you've never heard of. Their first letter is about the rent review. Their second is about "unlocking the value of the car park".`,
 choices:[
  {t:'Get a surveyor to fight the review (£3,000)',fx:{cash:-3,you:-2},alt:{p:0.4,fx:{you:-2},run(){ S.premX = (S.premX || 0) + 0.8; },o:`The surveyor does their best. The rent still goes up £800 a month.`},o:`The surveyor finds three errors in the fund's valuation. The review is settled at the old rent, for now.`},
  {t:'Accept it',fx:{you:1},run(){ S.premX = (S.premX || 0) + 1.5; },o:`The rent goes up £1,500 a month. The NHS reimbursement doesn't.`}
 ]},
{id:'p_icb_merger',who:'icb',title:'A new ICB',pmin:1,tag:'story',
 text:`Your ICB is merging with the one next door. Jonathan has a new job title, a new email address and no idea who approves your premises bid now. Everything submitted before the merger has to be submitted again.`,
 choices:[
  {t:'Resubmit everything, again',fx:{you:-3,icb:3},o:`Eleven forms, some of them identical to the forms they replace. The new ICB is grateful. It says so in a template.`},
  {t:'Wait for the dust to settle',fx:{icb:-3,you:1},o:`The dust settles in about nine months.`}
 ]},
{id:'p_sandra_retires',once:1,who:'kayleigh',title:'Sandra retires',pmin:1,tag:'story',
 text:`Sandra is retiring after twenty years on reception. She knows every patient by voice, which consultant's secretary actually answers, and how to reset the phone system with a paperclip.`,
 choices:[
  {t:'A proper send-off and a paid handover month',fx:{team:5,cash:-2.5},run(){ if (S.staff.recep > 1) vacate('recep', 'std'); else advertise('recep', 1); },o:`Sandra trains her replacement for a month and leaves a notebook titled "What Actually Happens". It becomes the most important document in the building.`},
  {t:'Cake, card, and advertise the post',fx:{team:1},run(){ if (S.staff.recep > 1) vacate('recep', 'std'); else advertise('recep', 1); addMod({id:'sandra', label:'Nobody knows where anything is', months:2, aim:{patients:-2, team:-2}}); },o:`She goes on Friday. On Monday nobody can find the paperclip.`}
 ]},
{id:'p_partner_hours',who:'okoye',title:'Fewer sessions',pmin:1,cond:()=>isActive('okoye'),tag:'story',
 text:`Nadia wants to drop to four sessions a week. "I've done the maths. I'm working 55 hours for the pay of 40. I'd rather work 35 for the pay of 30."`,
 choices:[
  {t:'Agree, and recruit to cover',fx:{team:2,okoye:-15},run(){ pt('okoye').clin = Math.max(3, pt('okoye').clin - 1); },o:`Nadia stays, on fewer sessions. The rota has a hole in it, and she looks five years younger.`},
  {t:'Ask her to wait a year',fx:{okoye:15,you:-1},o:`She waits. She also updates her CV. You can tell because she asks you to be a referee "for something else".`}
 ]},
{id:'p_complaint_ombudsman',who:'pratt',title:'The Ombudsman',pmin:1,tag:'story',
 info:'If a patient is unhappy with a practice\'s response to a complaint, they can take it to the Parliamentary and Health Service Ombudsman, which can investigate and recommend remedies.',
 text:`A complaint you thought was closed eighteen months ago has reached the Parliamentary and Health Service Ombudsman. They'd like the full records, the timeline and your reflections, within four weeks.`,
 choices:[
  {t:'Do it properly, with your defence organisation',fx:{you:-4,safety:2},o:`It takes three evenings. The Ombudsman finds the practice's response "reasonable, but could have been more timely". You'll take it.`},
  {t:'Hand it to Bev',fx:{team:-3,you:-1},alt:{p:0.3,fx:{safety:-3,rep:-2},o:`Bev sends the wrong patient's timeline. The Ombudsman is not amused.`},o:`Bev sends it in on time, beautifully indexed.`}
 ]},
{id:'p_list_growth',who:'bev',title:'Phase two',pmin:1,cond:()=>S.practiceKey!=='city',tag:'story',
 text:`The housing estate has a phase two: 400 more homes. The developer's leaflet promises "excellent local amenities, including a GP surgery". It means yours.`,
 choices:[
  {t:'Register them and ask the ICB for premises money',fx:{rep:2,icb:2},run(){ S.list += 350; S.newRegs.push({ n: 350, until: S.month + 12 }); plant({ in: 4, p: 0.35, fx: { rooms: 1 }, note: 'The ICB agreed to fund a new consulting room from the housing developer\'s contribution.' }); },o:`Three hundred and fifty new patients by the autumn. The funding follows them, about a year behind.`},
  {t:'Ask to close the list',fx:{icb:-6,rep:-2},o:`The ICB says no. The patients register anyway, via a process called "being allocated".`,run(){ S.list += 250; S.newRegs.push({ n: 250, until: S.month + 12 }); }}
 ]},
{id:'p_your_knee',who:'you',title:'Your knee',pmin:1,tag:'story',
 text:`Your knee has been bad for a year. Your own GP has referred you. The orthopaedic waiting list is 58 weeks. There's a private slot next month for £11,000.`,
 choices:[
  {t:'Pay for it yourself',fx:{you:6},o:`The surgery goes well. The £11,000 comes out of your own savings, then spend two weeks on crutches doing telephone triage from the sofa.`},
  {t:'Wait like everyone else',fx:{you:-4},later:[{in:4,p:0.5,fx:{you:-3},note:'Your knee gave way on the practice stairs. The waiting list letter says you are "in the queue".'}],o:`You join the list. You now understand your patients' letters in a new and personal way.`}
 ]},
{id:'p_trainee_returns',once:1,who:'reg',title:'Ellie is back',pmin:1,cond:()=>!!S.flags.training,w:()=>(S.flags.taughtEllie || 0) >= 2 ? 3 : 1,tag:'story',
 text:`Ellie, your old registrar, has finished training. She'd like to come back as a salaried GP, and she's asking about partnership "in a year or two".`,
 choices:[
  {t:'Offer her a job, and a route to partnership',need:()=>gpHeadroom() >= 6,why:'No room for another GP in this area',fx:{team:5,you:3},run(){ addStaff('salaried', 1); },o:`Ellie starts next month. This is what growing your own GPs was for.`},
  {t:'You can\'t afford another GP',fx:{team:-2},o:`She takes a job across town. She sends a very gracious email.`}
 ]},
{id:'p_nhs_app',who:'patient',title:'The app',pmin:1,tag:'story',
 text:`A national update means patients can now see their test results in the NHS App the moment they're filed, before anyone has spoken to them. Forty people rang yesterday about results that were normal.`,
 choices:[
  {t:'Add plain-English comments to every result',fx:{you:-3,patients:3,inbox:40},o:`"Normal, no action." "Slightly low, nothing to worry about, recheck in a year." Four hundred comments a week. The calls stop.`},
  {t:'Let reception reassure people',fx:{team:-3,patients:-1},o:`Reception becomes an unofficial results service. They're good at it. They didn't sign up for it.`}
 ]},
{id:'p_locum_chambers',who:'agency',title:'The locum chambers',pmin:1,tag:'story',
 text:`Three local GPs have set up a locum chambers. They'll supply regular faces for your rota, at £95 an hour, if you commit to eight sessions a week for a year.`,
 choices:[
  {t:'Sign up',fx:{patients:3,you:2},run(){ addMod({ id: 'chambers', label: 'Locum chambers contract', months: 12, capAdd: 112, fx: { cash: -13.2, inbox: 15 } }); },o:`About £13,000 a month for 112 extra appointments a week. Same three faces, every week. Patients start asking for them by name.`},
  {t:'Stay flexible',fx:{},o:`You keep booking locums one session at a time, at whatever the agency charges that week.`}
 ]},
{id:'p_burnout_wave',who:'maureen',title:'Running on empty',pmin:2,tag:'real',src:['S36'],
 info:'In the national GP Worklife Survey, GPs reported high levels of stress, and job satisfaction has fallen over the last decade. Practice nurses and reception staff report similar pressures.',
 text:`Maureen asks for a word. "Three of the team are on antidepressants, two are job hunting, and I cried in the sluice on Tuesday. Something has to give, and I'd rather it wasn't us."`,
 choices:[
  {t:'Close for a protected afternoon each month (£2,000 locum cover)',fx:{team:8,patients:-2,cash:-2,aim:{team:2}},o:`The first afternoon, nobody knows what to do with themselves. By the third, it's the most useful four hours of the month.`},
  {t:'Pay for staff counselling (£150 a month)',fx:{team:4},run(){ addMod({ id: 'counsel', label: 'Staff counselling', months: 99, fx: { cash: -0.15 }, aim: { team: 1 } }); },o:`Four people use it in the first month. Nobody says who.`},
  {t:'"We just need to get through winter."',fx:{team:-6},o:`Maureen nods. She doesn't argue. That's what worries you.`}
 ]},
{id:'p_merger_again',who:'rowe',title:()=>S.seen.merger_offer?'Parkside, again':'Parkside calls',cond:()=>((S.yr||0)>=1&&activeOthers()<=1)||S.cash<S.overdraft/2,w:()=>S.cash<S.overdraft/2?4:1,tag:'story',
 text:()=>`Dr Rowe from Parkside Surgery rings${S.seen.merger_offer ? ' again' : ''}. ${S.cash < S.overdraft / 2 ? `"I hear the bank is getting twitchy. Before it gets worse: merge with us. Your staff keep their jobs and your patients keep their doctors."` : `"We're both too small to survive on our own. I'd rather merge with you than be taken over by Apex. Think about it before they do."`}`,
 choices:[
  {t:'Merge',run(){ S.exit = 'merged'; return { o: `The lawyers take four months. Your brass plate comes down and goes in a drawer at home.` }; }},
  {t:'Not yet',fx:{you:-1},o:`"Not yet," she says. "That's what I said, two years ago."`}
 ]},
{id:'p_heatwave_again',who:'bev',title:'Record heat',pmin:1,months:[2,3,4],tag:'story',
 text:`It's the hottest day on record. The vaccine fridge is struggling, the server cupboard is at 44°C, and a pensioner has fainted in the car park.`,
 choices:[
  {t:'Cancel routine clinics and run a cool room for the vulnerable',fx:{patients:3,rep:3,team:-2},o:`The waiting room becomes a cooling centre with free water and a fan the size of a jet engine. The local paper runs a photo.`},
  {t:'Keep going and hope',fx:{safety:-3},later:[{in:1,p:0.4,fx:{cash:-4,safety:-2},note:'The heatwave took the vaccine fridge above 8°C for a day. £4,000 of stock quarantined.'}],o:`You keep going. Everyone is very, very hot.`}
 ]},
{id:'p_apex_again',who:'apex',title:'A better offer',pmin:2,cond:()=>S.cash<0||activeOthers()===0,tag:'story',
 text:`Apex Primary Care is back, with a better offer: they'll take the lease, the staff and the overdraft. You'd be a salaried "Clinical Director" with a car allowance.`,
 choices:[
  {t:'Sign',run(){ S.exit = 'sold'; return { o: `You sign. The overdraft is someone else's problem. So, from Monday, is the practice.` }; }},
  {t:'Tell them it isn\'t for sale',fx:{team:3,you:1},o:`"Everything is for sale," the man says, kindly. "Eventually."`}
 ]},
{id:'p_new_contract_model',who:'dept',title:'A new model',pmin:2,tag:'speculative',
 info:'Invented: the future of the partnership model is regularly debated, with proposals for more salaried GPs, larger providers and neighbourhood health services. This card imagines one version.',
 text:`The government announces a consultation on "moving beyond the partnership model". Practices may be offered the chance to hand their contract to a new neighbourhood health organisation and become salaried.`,
 choices:[
  {t:'Respond to the consultation with the LMC',fx:{you:-2,team:1},o:`Your response is forty pages. The summary of responses, published a year later, quotes one line of it.`},
  {t:'Start planning for either outcome',fx:{you:-1,safety:1},o:`You draw up two plans. Both involve Bev.`}
 ]}
,
/* ---------- the three-year review: the long game's big set-piece (years 3, 6, 9) ---------- */
{id:'review_3y',arc:1,who:'icb',title:'The three-year review',tag:'story',
 info:'Invented as a game milestone. In real life GMS contracts don\'t expire, but ICBs review practices\' performance and CQC re-inspects based on risk.',
 text:()=>`Three years since the last one. The ICB and CQC want to review everything: access, safety, the team, the accounts and you. Jonathan's email says it's "supportive, not punitive". It has four attachments.`,
 choices:[
  {t:'A weekend of preparation with the whole team',fx:{you:-4,team:-2},run(){ return review3y(6); }},
  {t:'Let the record speak for itself',fx:{},run(){ return review3y(0); }}
 ]}
);
// passing takes steady meters, not heroics: no meter below 35 and a decent average
function review3y(prep) {
  const st = S.st, avg = STAT_KEYS.reduce((a, k) => a + st[k], 0) / 4, min = Math.min(...STAT_KEYS.map(k => st[k]));
  const cq = S.cqc ? { o: 8, g: 4, ri: -4, i: -10 }[S.cqc.overall] : 0;
  const mark = avg + prep + cq + (S.cash >= 0 ? 3 : -3);
  if (min >= 35 && mark >= 58) { applyFx({ you: 8, team: 6, icb: 10, rep: 6, cash: 15 }); return { o: `Passed, with praise. The review calls the practice "resilient and well led", and the ICB offers a £15,000 transformation grant. Bev frames the letter. You go home at 5pm, once.` }; }
  if (min >= 25 && mark >= 48) { applyFx({ you: 2, icb: 2 }); return { o: `Passed, with conditions: an action plan on your weakest area, reviewed in six months. It's fine. Fine is good.` }; }
  applyFx({ you: -6, icb: -10, rep: -4 }); addMod({ id: 'review_plan', label: 'ICB improvement plan after the review', months: 6, aim: { patients: -3, team: -3 }, hours: 2 });
  return { o: `Failed. The ICB puts the practice on a formal improvement plan: monthly meetings, a named "support" officer and a lot of spreadsheets. It will be a long six months.` };
}

