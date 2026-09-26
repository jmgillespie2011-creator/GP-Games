/* ===================== EVENTS 5: CQC myths, oddities and the walkround =====================
 Real rules from CQC's own "GP mythbusters", and the things practices do anyway.
 cqcPrep() banks a little credit for the inspection: runCQC adds it to Safe and half of it to Well-led.
*/
const cqcPrep = n => { S.flags.cqcPrep = (S.flags.cqcPrep || 0) + n; };
const preCQC = () => !S.flags.cqcDone;

EVENTS.push(
{id:'gavin_mock',who:'gavin',title:'212 must-haves',months:[1,2,3,4,5,6,7],cond:preCQC,tag:'real',src:['S45','S52'],
 info:'CQC publishes more than a hundred "GP mythbusters" that say what inspectors do and don\'t expect. A whole industry of consultants sells preparation anyway. GPs have described a "culture of fear" around inspections, and in one case a non-clinical inspector told a practice to stock a drug it would almost never use.',
 text:`Gavin, a CQC compliance consultant, offers a mock inspection for £3,000. His brochure lists "212 must-haves for Outstanding". Some of them are laws. Some of them are Gavin's opinions, in bold.`,
 choices:[
  {t:'Book Gavin (£3,000)',fx:{cash:-3,safety:4,team:-3,you:-1},run(){ cqcPrep(3); },o:`Gavin finds 212 things. About forty matter: out-of-date adrenaline, a blocked fire exit, a sharps bin nobody has emptied since the spring. The other 172 include a policy for the kettle. The team does all 212, just in case.`},
  {t:'Read CQC\'s own mythbusters and walk the building yourself',fx:{you:-2,safety:3},run(){ cqcPrep(2); },o:`You read them on the sofa. CQC doesn't require most of what Gavin sells. It does want the things that could actually hurt someone. Your partner asks if this is a hobby now.`},
  {t:'"We\'re fine."',fx:{you:1},later:[{in:2,p:0.35,fx:{safety:-3},note:'Because nobody walked round the building: the fire exit has been quietly blocked by flu vaccine boxes since August.'}],o:`You probably are. Probably.`}
 ]},

{id:'fish_tank',who:'gerald',title:'The fish tank',months:[1,2,3,4,5,6,7,8],cond:preCQC,tag:'story',src:['S45','S50','S56'],
 info:'CQC expects every part of a practice to be risk-assessed, including its water, where legionella is the usual worry. Aquariums can carry Mycobacterium marinum ("fish tank granuloma"), which infects cuts on hands and arms and doesn\'t pass from person to person. Stories about inspectors wanting a fish tank risk assessment are practice-manager folklore. We couldn\'t find a published CQC report that demands one, so this card is folklore built on real rules.',
 text:`"The fish tank," says the man doing the fire check, pen poised. "Where's the risk assessment?" Gerald, a goldfish who has outlived three practice managers, looks back at him. The children love Gerald. Mr Pratt has complained about him twice.`,
 choices:[
  {t:'Write Gerald a risk assessment',fx:{you:-1,safety:1,team:2},run(){ cqcPrep(1); },o:`Two pages. Hazards: water, electricity, a glass box at toddler height, and Gerald. Controls: a lid, gloves for cleaning the tank, and a sign asking children not to tap. Risk: low. Gerald is now the best-documented member of the practice.`},
  {t:'Rehome Gerald with Kayleigh',fx:{patients:-2,team:-2},o:`Gerald moves into Kayleigh's flat. Reception gets asked "where's the fish?" thirty times a day. The empty corner is somehow worse.`},
  {t:'Leave it. He\'s a goldfish.',fx:{you:1},later:[{in:3,p:0.35,fx:{you:-2,safety:-1},note:'Because Gerald never got a risk assessment: "Aquarium (no risk assessment)" appeared in the inspection feedback, just below the blind cord.'}],o:`Gerald stays, undocumented, and apparently happy about it.`}
 ]},

{id:'furosemide',who:'lmc',title:'The furosemide question',months:[2,3,4,5,6,7,8,9],tag:'real',src:['S46','S52'],
 info:'CQC\'s guidance gives a suggested list of emergency medicines for GP practices. It says the list is neither exhaustive nor mandatory: practices decide what to stock for their own situation and keep a risk assessment for anything they leave out. A GP campaign against a "culture of fear" in inspections began after a non-clinical inspector told a practice to stock furosemide.',
 text:`At the LMC meeting, a GP from across the county is still upset. A non-clinical inspector told her practice to stock furosemide in the emergency box. "It's for severe heart failure," she says. "Hardly anyone gives it outside hospital. Not even the ambulance crews."`,
 choices:[
  {t:'Check your emergency drugs and write down why each gap is justified',fx:{you:-2,safety:3,aim:{safety:1}},run(){ cqcPrep(2); },o:`CQC's own guidance says its list isn't mandatory. What it wants is a reason for each gap. Yours fits on one side of A4 and mentions furosemide by name.`},
  {t:'Buy some furosemide, just in case (£60)',fx:{cash:-0.1,you:1},o:`It goes in the emergency box. It'll expire unused in 2028, and someone will have to log that too.`},
  {t:'Help the LMC write to CQC',fx:{you:-1,team:1,icb:1},o:`A firm, polite letter that quotes the CQC's own mythbuster back at it. The reply thanks you for your feedback and says inspectors will be "reminded".`}
 ]},

{id:'curtains',who:'bev',title:'Curtain day',months:[1,2,3,4,5,6,7,8,9,10],tag:'rule',src:['S47'],
 info:'CQC\'s mythbuster on privacy curtains says there is no set frequency for changing them. They must look clean, and they must be changed straight away if soiled. Many practices still change disposable curtains on a fixed date, because that\'s what the date on the curtain says.',
 text:`The disposable curtains round the couches have a date written on them in marker, six months ago today. "They're due," Bev says. "Twelve at £45 each." They look spotless.`,
 choices:[
  {t:'Replace them all, on the day',fx:{cash:-0.55},o:`Fresh curtains, freshly dated. It's a small waste of money that makes everyone feel safer, which in general practice passes for a policy.`},
  {t:'Change them when they\'re soiled, and check them weekly',fx:{safety:1,team:-1},run(){ cqcPrep(1); },o:`You add a weekly curtain check to the cleaning schedule and swap two that have marks on them. The other £450 stays in the account. Bev writes "per CQC mythbuster 6" on the schedule, underlined.`}
 ]},

{id:'knitted_ducks',who:'higgins',title:'The knitted ducks',months:[1,2,3,4,5,6,7,8],cond:preCQC,tag:'rule',src:['S45','S54'],
 info:'CQC expects toys in waiting rooms to be kept clean. It doesn\'t expect a specific toy policy or a set cleaning frequency. Soft toys are harder to clean than wipeable ones, so many practices wash them on a rota or take them out.',
 text:`Mrs Higgins has knitted a family of ducks for the children's corner: a mother, five ducklings, and one with a tiny stethoscope "for the doctor". Someone has told reception that soft toys are "banned by CQC". Mrs Higgins is in the waiting room, watching.`,
 choices:[
  {t:'Keep the ducks, add wipe-clean toys, and put both on the cleaning rota',fx:{patients:2,team:-1},run(){ cqcPrep(1); },o:`The ducks go through the hot wash every Friday. They come out slightly more alarming each time. Mrs Higgins is delighted.`},
  {t:'Put the ducks on the reception desk, out of reach',fx:{patients:1,team:1},o:`They become the practice mascots. Nobody touches them. Infection risk: nil. Morale: ducks.`},
  {t:'Quietly bin them',fx:{patients:-3,you:-2},o:`Mrs Higgins finds the doctor duck in the bin by the staff door. She doesn't say anything. There is no shortbread in December.`}
 ]},

{id:'carpet',who:'bev',title:'The carpet',months:[1,2,3,4,5,6,7,8,9],tag:'rule',src:['S48','S54'],
 info:'CQC\'s guidance says carpet is acceptable where spills are unlikely, such as waiting rooms, consulting rooms and offices. It shouldn\'t be used where body fluids may be spilt, such as treatment rooms.',
 text:`The treatment room, where Maureen does bloods and dressings, is carpeted. Beige, 1994, with a stain the shape of Wales. The waiting room is carpeted too. A flooring firm has quoted £11,000 "to be CQC-compliant throughout".`,
 choices:[
  {t:'Re-floor the treatment room only (£3,500)',fx:{cash:-3.5,safety:3,aim:{safety:1}},run(){ cqcPrep(2); },o:`Sealed, wipeable vinyl where the blood is. The waiting room keeps its carpet, which CQC is perfectly happy with. Wales is gone.`},
  {t:'Re-floor everything (£11,000)',fx:{cash:-11,safety:3,team:1},run(){ cqcPrep(2); },o:`Shiny floors throughout. The waiting room now echoes like a swimming pool, and every dropped set of keys sounds like gunfire.`},
  {t:'Move bloods to a room that already has vinyl',fx:{team:-2,safety:2},run(){ cqcPrep(1); },o:`Maureen moves. She loses her window and gains the room next to the toilet. It works. She mentions it every day.`}
 ]},

{id:'dbs_expiry',who:'bev',title:'Do DBS checks expire?',months:[2,3,4,5,6,7,8,9,10],tag:'rule',src:['S51','S55'],
 info:'A DBS certificate has no expiry date. CQC\'s mythbuster says employers decide if and when to re-check, based on the role and the risk. Non-clinical staff who act as chaperones may need a check, and they need training.',
 text:`The HR company's newsletter says every DBS check "should be renewed every three years". That's 23 staff at about £50 each, plus a week of Kayleigh's life. Meanwhile two receptionists chaperone and have never had a check.`,
 choices:[
  {t:'Re-check everybody',fx:{cash:-1.2,team:-2},o:`Twenty-three forms. The cleaner, who has worked here since 1998, is re-checked twice because the first form was lost. The receptionists who chaperone are finally covered, along with everyone else.`},
  {t:'Check and train the chaperones, and write a risk-based policy',fx:{cash:-0.2,safety:3},run(){ cqcPrep(2); },o:`The two receptionists who chaperone get checks and proper training. Everyone else is covered by a one-page policy saying when you re-check and why. CQC's mythbusters describe exactly this.`},
  {t:'Only nurses chaperone until it\'s sorted',fx:{safety:1,patients:-2,team:-1},o:`Patients who need a chaperone now wait until a nurse is free. The nurses notice.`}
 ]},

{id:'cqc_factual',arc:1,who:'bev',title:'The draft report',cond:()=>S.cqc&&S.cqc.overall==='ri',tag:'real',src:['S53'],
 info:'Before a CQC report is published, the practice gets a draft and can challenge factual errors, with evidence. In one real case, CQC changed a student health service\'s rating from "requires improvement" to good after admitting that due process hadn\'t been followed. Among other things, inspectors had asked about care of older people at a practice whose patients were all students.',
 text:`The draft report has arrived. You have ten working days to challenge anything factually wrong. Paragraph 4 criticises access to "the first-floor lift". There's no first floor. There's no lift. Paragraph 9 quotes a policy that belongs to a different practice.`,
 choices:[
  {t:'Challenge it properly, with evidence',fx:{you:-3},
   run(){ if(chance(0.35)){ S.cqc.overall='g'; for(const k in S.cqc.rates) if(S.cqc.rates[k]==='ri') S.cqc.rates[k]='g'; applyFx({team:5,you:6,rep:4}); return {o:`Forty pages of evidence, sent at 11:58pm on day ten. Three weeks later CQC agrees that several findings "were not supported by the evidence". The rating is changed to Good. Bev frames the letter next to the certificate.`}; }
     return {o:`CQC removes the lift and the other practice's policy. The rating stays at Requires improvement. At least it's now wrong about the right building.`}; }},
  {t:'Correct the lift and get on with the action plan',fx:{safety:2,team:-1,aim:{safety:1}},o:`You fix the obvious errors and start on the 23 actions. Some of them are fair, and you're a bit annoyed about that.`}
 ]},

{id:'mini_walkround',kind:'mini',game:'walkround',rep:1,max:2,who:'bev',title:'The Walkround',months:[1,2,3,4,5,6,7,8],cond:preCQC,w:()=>S.seen.cqc_call?4:1,tag:'rule',src:['S45','S46','S49','S54'],
 info:'CQC publishes "GP mythbusters" saying what it does and doesn\'t expect. Real risks, such as expired emergency drugs, blocked fire exits and fridges out of range, need fixing. Routine checks need records. Some choices need a written risk assessment. Plenty of popular "CQC rules" aren\'t rules at all.',
 text:`Bev hands you a clipboard. "Walk the building like Patricia would." Some things need fixing today. Some just need a log to prove you check them. Some need a written risk assessment. And some are myths that cost practices a fortune.`,
 choices:[
  {t:'Grab the clipboard (45-second game)',play:1},
  {t:'Leave it to Gavin\'s checklist (£1,500)',fx:{cash:-1.5,safety:2,team:-1},o:`Gavin does the walkround. He finds the blind cord, the adrenaline and eleven things that aren't rules. The team fixes all of them.`}
 ]}
);
