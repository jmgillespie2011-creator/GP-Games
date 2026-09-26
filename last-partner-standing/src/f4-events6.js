/* ===================== EVENTS 6: demand from outside the building =====================
 Things that change what patients ask for: celebrity diagnoses and documentaries, services the ICB closes,
 and the hospital waiting list landing back on the practice.
*/
const illPartner = () => ['okoye', 'hartley', 'tom', 'priya'].find(x => isActive(x)) || null;

EVENTS.push(
{id:'psa_surge',who:'kayleigh',title:'The PSA rush',tag:'real',src:['S68','S69'],
 info:'England has no national prostate screening programme. Men over 50 can ask their GP for a PSA test after talking through its benefits and harms: false positives, and finding slow cancers that would never have caused trouble. Black men and men with a family history may be advised to start at 45. After Sir Chris Hoy spoke publicly about his advanced prostate cancer in 2024, demand for PSA tests and online risk checks surged, and the NHS was asked to review the guidance.',
 text:`A famous sportsman has talked on breakfast TV about his advanced prostate cancer. By 10am there are 64 online requests for a PSA test, from men aged 29 to 91. "One of them says his wife made him," says Kayleigh. "That's most of them, to be fair."`,
 choices:[
  {t:'Test everyone who wants one, after a proper conversation',fx:{patients:3,you:-2,inbox:60,safety:1},run(){ addMod({id:'psa',label:'PSA test surge',months:2,demand:3}); },later:[{in:2,p:0.5,fx:{safety:2,inbox:20},note:'The PSA surge found three men with raised results who needed urgent referral. One had no symptoms at all.'}],o:`Two months of PSA conversations, blood tests and follow-ups. Most results are normal. Some aren't, and those men are glad they asked.`},
  {t:'Run an HCA-led PSA clinic with a clear leaflet on pros and cons',need:()=>S.staff.hca>0,why:'You need a healthcare assistant',fx:{patients:3,team:-1,inbox:45,cash:-0.3},run(){ addMod({id:'psa',label:'PSA clinic',months:2,demand:1.5}); },o:`The leaflet does the counselling. The HCA does the bloods. Men who still want the test get it; a surprising number decide they'd rather not, and that's fine too.`},
  {t:'Test those the guidance covers: over 50, or 45 with risk factors',fx:{patients:-2,safety:1,rep:-1},run(){ addMod({id:'psa',label:'PSA questions',months:1,demand:1}); },later:[{in:1,p:0.6,fx:{inbox:20,you:-1},note:'Private PSA results from men you didn\'t test have arrived for you to interpret.'}],o:`Most of the younger men understand. Some pay for a private test online and send you the result anyway.`}
 ]},

{id:'meno_testosterone',who:'patient',title:'After the documentary',tag:'real',src:['S70','S71','S78','S79'],
 info:'NICE\'s menopause guideline says to consider testosterone for menopausal women with low sexual desire if HRT alone isn\'t effective. It isn\'t licensed for women in the UK, so it\'s prescribed off-label. NHS prescriptions of testosterone for women rose about tenfold between 2015 and 2022, with spikes after each of Davina McCall\'s menopause documentaries in 2021 and 2022. Experts point out the evidence is for libido, not energy or brain fog. Women\'s health hubs, set up in every ICB area with £25 million of national funding in 2023/24 and 2024/25, bring menopause care, contraception including coils and implants, heavy periods and pelvic pain into one community service, often run by a PCN.',
 text:`A new menopause documentary aired last night. This morning, 23 requests mention testosterone. Some women are already on HRT and still have low libido. Some haven't started HRT at all. Three want it "for brain fog and energy, like on the programme".`,
 choices:[
  {t:'Set up a menopause clinic: get HRT right first, testosterone where it fits',fx:{patients:4,you:-2,safety:1,rep:2},run(){ addMod({id:'meno',label:'Menopause review clinic',months:2,demand:1.5,hours:1.5}); },o:`You and Maureen run a Thursday menopause clinic. Most women are best helped by getting their HRT right. A few with low libido despite HRT start testosterone, off-label, with a follow-up plan and blood tests.`},
  {t:'Set up a women\'s health hub with the PCN',need:()=>S.icb>=35,why:'The ICB won\'t fund a hub while relations are this poor',fx:{you:-3,team:-1,icb:3,rep:3,patients:2,aim:{patients:1}},run(){ addMod({id:'wh_hub',label:'Women\'s health hub (PCN)',months:99,at:S.month+2,demand:-1.5,hours:1.5,fx:{cash:0.4}}); },o:`You bid for the ICB's hub money with the other PCN practices. In two months there's a Wednesday women's health hub: menopause reviews, coils and implants fitted in one visit, and a GP with a special interest who actually has time. Your share of the running is an evening a week. Your own lists get lighter.`},
  {t:'Refer them all to the specialist menopause service',fx:{patients:-1,inbox:20},later:[{in:2,p:0.6,fx:{patients:-2,inbox:15},note:'The specialist menopause clinic has a 40-week wait. Women are coming back asking what to do in the meantime.'}],o:`Twenty-three referrals. The service acknowledges them all, and says it will be in touch.`},
  {t:'Explain it\'s for low libido after HRT, and decline the rest',fx:{patients:-3,safety:1,rep:-1,you:1},o:`It's what the guidance says. Several women are disappointed, and two of them are right that nobody had ever reviewed their HRT properly.`}
 ]},

{id:'derm_closure',who:'icb',title:'A pathway review',tag:'real',src:['S72','S73'],
 info:'ICBs commission community dermatology services locally, and some have been paused or closed. In 2026, for example, services delivered by GP practices in East Sussex were suspended. When a service goes, its patients come back to general practice, and more are referred to hospital dermatology, where waits are already long.',
 text:`Jonathan from the ICB writes: the community dermatology service will close at the end of the month "as part of a pathway review". Its patients now come back to you: eczema that needs a plan, moles that need a look, and anything the hospital won't take.`,
 choices:[
  {t:'Absorb the work',fx:{demand:2,inbox:30,you:-1},o:`The skin appointments start the following Monday. So do the photos of moles, which the online form rejects if they're over 2MB, so they arrive by email instead.`},
  {t:'Train a GP in dermoscopy and run your own skin clinic (£2,500)',fx:{demand:2,cash:-2.5,you:-2,safety:2},run(){ addMod({id:'derm',label:'In-house skin clinic',months:99,demand:-1.5,hours:1}); },o:`A dermoscope, a two-day course and a Tuesday skin clinic. You catch a melanoma in the second month, and send far fewer "just in case" referrals.`},
  {t:'Push back with the LMC and neighbouring practices',fx:{icb:-2,you:-1},alt:{p:0.6,fx:{demand:2,icb:-3,you:-2},o:`The ICB "notes your concerns". The service closes on schedule.`},o:`Three practices and the LMC write together. The ICB agrees to keep the service going for another year while it "reviews options".`}
 ]},

{id:'hospital_waits',who:'bev',title:'Waiting well',rep:1,max:2,tag:'real',src:['S74','S75'],
 info:'In July 2026 about 7.3 million cases were on the hospital waiting list in England, and only around six in ten had waited less than the 18-week standard. Hospitals are meant to handle their own waiting-list questions, but in practice many patients come back to their GP for pain relief, sick notes, and letters asking for their care to be expedited. Those letters work best when something has changed clinically.',
 text:`This week 38 patients have asked you to "chase" or "expedite" their hospital care. A hip replacement 18 months overdue. A man whose painkillers have stopped working. A woman who can't go back to work until her gallbladder comes out. The hospital's letters all say "you will be contacted in due course".`,
 choices:[
  {t:'Write an expedite letter for everyone who asks',fx:{inbox:40,you:-3,patients:2},later:[{in:2,p:0.7,fx:{patients:-2,you:-1},note:'Most of the expedite letters got the same reply: "Your patient remains on the waiting list."'}],o:`Thirty-eight letters. Every patient feels heard, for now.`},
  {t:'Expedite where things have changed, and help everyone else wait well',fx:{you:-3,patients:3,safety:2,team:-1},run(){ addMod({id:'waitwell',label:'Supporting patients on hospital waiting lists',months:3,demand:2}); },o:`Clinical change gets a letter with the details the hospital needs. Everyone else gets a review: pain relief, physio, a fit note if they need one, and the hospital's own number for waiting-list questions.`},
  {t:'Give them the hospital\'s waiting-list number and a template letter',fx:{patients:-3,rep:-2,you:1},later:[{in:1,p:0.5,fx:{safety:-3,you:-2},note:'A man waiting for a cardiology appointment got worse while he was redirected to the hospital helpline. He was admitted through A&E.'}],o:`It's the hospital's list, and technically their job. Patients ring the number. Then they ring you.`}
 ]}
,

/* ---------- late-year shocks: one per game, scheduled in newGame ---------- */
// (illPartner is defined at the top of this file)
{id:'twist_ill',arc:1,who:'bev',title:'A partner off sick',tag:'story',
 text:()=>{ const id=illPartner(); return id ? `${PARTNERS0[id].short} has been signed off for two months after an operation that "won't be a big deal". Their patients, their sessions and their share of the running of the place are now everyone else's.` : `You've been told to take two weeks off after a minor operation. You're the only partner. There isn't anyone to hand to.`; },
 choices:[
  {t:'Book locum cover for their sessions',fx:{cash:-8,team:1},run(){ if(illPartner()) addMod({id:'ill',label:`${PARTNERS0[illPartner()].short} off sick`,months:2,away:illPartner(),capAdd:50,fx:{inbox:40}}); },o:`The locums see patients. Nobody picks up the results, the complaints or the rota. Those come to you.`},
  {t:'Share their work between the rest of you',fx:{team:-3,you:-4},run(){ if(illPartner()) addMod({id:'ill',label:`${PARTNERS0[illPartner()].short} off sick`,months:2,away:illPartner(),hours:6}); else addMod({id:'ill',label:'Working through recovery',months:1,hours:4,aim:{you:-4}}); },o:`Everyone takes a bit more. Two months of long days, and it shows.`},
  {t:'Cut routine appointments until they\'re back',fx:{patients:-6,rep:-3,icb:-2},run(){ if(illPartner()) addMod({id:'ill',label:`${PARTNERS0[illPartner()].short} off sick`,months:2,away:illPartner()}); },o:`Same-day care only, for two months. The phones don't get quieter, just angrier.`}
 ]},

{id:'twist_fire',arc:1,who:'landlord',title:'Fire doors',tag:'story',
 text:()=>S.flags.soldBuilding ? `The fire risk assessment has condemned 14 fire doors and the alarm panel. The landlord says it's "a tenant's repair under clause 22". Quote: £38,000.` : `The fire risk assessment has condemned 14 fire doors and the alarm panel. You own the building. Quote: £38,000.`,
 choices:[
  {t:'Pay it now',fx:{cash:-38,safety:4,aim:{safety:1}},o:`New doors, new panel, a certificate for the wall. The overdraft remembers.`},
  {t:'Take a loan over five years',fx:{safety:4,you:-2},run(){ S.loan=(S.loan||0)+0.75; },o:`About £750 a month for five years, on top of everything else.`},
  {t:'Do the worst doors now, the rest next year',fx:{cash:-12,safety:1},later:[{in:2,p:0.5,fx:{safety:-6,cash:-5,rep:-2},note:'The fire service inspected and issued a notice about the remaining fire doors. The work is now urgent, and dearer.'}],o:`Four doors and the panel this year. The other ten have laminated signs saying "keep shut".`}
 ]},

{id:'twist_flood',arc:1,who:'bev',title:'Burst pipe',tag:'story',
 text:`A pipe burst in the loft overnight. Two consulting rooms and the records store are under an inch of water. The insurer's loss adjuster can come "in about ten days".`,
 choices:[
  {t:'Hire a portakabin for the car park while it\'s fixed (£9,000)',fx:{cash:-9,team:1},o:`Two clinic rooms on a lorry by Thursday. Patients think it's an upgrade.`},
  {t:'Double up and work around it',fx:{team:-4,patients:-2},run(){ addMod({id:'flood',label:'Two rooms out after the flood',months:2,rooms:-2}); },o:`Two months of shared rooms, clashing clinics and a dehumidifier the size of a fridge.`},
  {t:'Move some clinics to the neighbouring practice',fx:{you:-2,icb:1},run(){ addMod({id:'flood',label:'Clinics hosted next door',months:2,rooms:-1,hours:2}); },o:`Parkside lends you two rooms on Tuesdays and Thursdays. You owe Dr Rowe a very large favour.`}
 ]}
,
/* ---------- endless mode: the start of each new year ---------- */
{id:'year_new',arc:1,who:'bev',title:()=>`Year ${(S.yr || 0) + 1}`,tag:'speculative',
 info:'From year two the game invents the future: demand grows about 5% a year, funding rises about 2% while staff costs rise about 3.5%, and the years wear on you. In real life, practice funding has tended to lag behind rising costs and demand.',
 text:()=>`1st April ${2026 + (S.yr || 0)}. Year ${(S.yr || 0) + 1} as a partner. Bev has put a cake in the staff room with "${(S.yr || 0) + 1}" piped on it in green icing. The new contract uplift is smaller than the pay award, again, and the list has grown, again. ${activeOthers() === 0 ? 'The brass plate still has only your name on it.' : ''}`,
 choices:[
  {t:'An away day to plan the year (£2,000)',fx:{team:5,cash:-2,you:1},o:`A hotel conference room, bad coffee, good ideas. Three of them survive until June.`},
  {t:'Book all your leave for the year now',fx:{you:4,team:-1},o:`Your leave is in the rota before anyone else's. It's the most senior thing you've done all year.`},
  {t:'Cut the cake and get on with it',fx:{team:2},o:`The cake lasts eleven minutes. Morning surgery starts at 8:00, as it always will.`}
 ]}
);
