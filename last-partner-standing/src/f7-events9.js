/* ===================== EVENTS 9: the paperwork around the edges =====================
 Thirty more cards, most of them for any year: the rules GPs meet every week (subject access,
 fitness to drive, firearms forms, the duty of candour, Awaab's Law letters, speaking up),
 the building and the rota going wrong, and a few harder ones once the pressure builds (`pmin`).
*/
EVENTS.push(
/* ---------- real rules ---------- */
{id:'sar_request',who:'bev',title:'Thirty years of notes',tag:'real',src:['S87'],
 info:'Under UK GDPR, people can ask for a copy of their records. In most cases the practice must reply within one month and can\'t charge. Anything about other people, such as relatives or staff opinions shared in confidence, has to be checked and redacted first.',
 text:`A solicitor has sent a subject access request for a patient's complete record: thirty years, 1,400 pages, free of charge, due in one month. Somewhere in there are letters about his ex-wife and a note from a social worker.`,
 choices:[
  {t:'Bev\'s team reads and redacts every page',fx:{team:-3,inbox:80},o:`Two admin staff, three weeks, one black pen that runs out. It goes on day 29.`},
  {t:'Pay a records company to do it (£1,200)',fx:{cash:-1.2},o:`It comes back in ten days, redacted, indexed and faintly smug.`},
  {t:'Send it as it is. It\'s his record.',fx:{you:1},later:[{in:3,p:0.45,fx:{safety:-4,you:-4,icb:-2},note:'The ex-wife\'s address was in the notes you sent. She has complained to the ICO, and the ICB wants to see your data protection policy.'}],o:`It goes in the post the same afternoon. Nobody reads it first.`}
 ]},
{id:'dvla_driver',who:'patient',title:'Still driving',tag:'real',src:['S88','S89'],
 info:'Drivers must tell the DVLA about conditions that affect their driving. If a patient can\'t or won\'t stop driving when they shouldn\'t, GMC guidance says the doctor should try to persuade them, and then tell the DVLA, and let the patient know they are doing so.',
 text:`A taxi driver has a condition that, under the DVLA's rules, means he must stop driving for now. You told him last month. His car is outside, engine running, and his next fare is at 10.`,
 choices:[
  {t:'Tell him again, then tell the DVLA yourself',fx:{you:-3,safety:4,patients:-2},o:`He calls you some names in the car park and cancels his fares. He's back in six months with his licence and a grudging thank you.`},
  {t:'Write down that you advised him, and leave it there',fx:{you:1},later:[{in:2,p:0.25,fx:{safety:-6,you:-8},note:'The taxi driver had an episode at the wheel. Nobody was badly hurt. Your notes say you advised him to stop. The coroner\'s officer would like to know what you did next.'}],o:`It's in the notes. That's something.`}
 ]},
{id:'firearms_form',who:'bev',title:'Shotgun season',months:[4,5,6],tag:'real',src:['S90','S29'],
 info:'Firearm and shotgun certificate applications need information from a GP or other suitably qualified doctor. It isn\'t NHS work, so practices can charge, and a GP can decline, in which case the applicant must find another doctor.',
 text:`Eleven firearms medical forms have arrived at once, all from the same clay pigeon club. Each one needs a read of the whole record for mental health, alcohol and neurology. The club's secretary asks if you could "just tick them".`,
 choices:[
  {t:'Do them properly, and charge the fee',fx:{cash:0.9,inbox:60,you:-2},o:`Eleven forms, ten clear. One you need to think about, carefully.`},
  {t:'Decline firearms work as a practice',fx:{patients:-2,rep:-1},o:`You send a polite letter. The club finds a private doctor who does them online. You'll hear from the police if anything changes.`}
 ]},
{id:'candour',who:'maureen',title:'Telling them',tag:'real',src:['S91'],
 info:'The duty of candour means being open with patients when something goes wrong. For notifiable safety incidents, the practice must tell the patient, apologise and follow it up in writing. An apology isn\'t an admission of liability.',
 text:`An abnormal result was filed without action. The patient's treatment started six weeks late. They're recovering, but they don't know why the delay happened. Maureen has found the audit trail.`,
 choices:[
  {t:'Meet them, apologise and put it in writing',fx:{you:-4,safety:4,patients:1,aim:{safety:1}},o:`It's the worst half hour of your month. At the end, they shake your hand. The significant event review changes how results are filed.`},
  {t:'Fix the process quietly',fx:{safety:-2},later:[{in:4,p:0.4,fx:{patients:-4,you:-6,icb:-4},note:'The family asked for the records and found the result. Their complaint mentions the duty of candour, and so does the CQC query that followed.'}],o:`The process is fixed. The patient doesn't know. You do.`}
 ]},
{id:'mould_letters',who:'patient',title:'Damp and mould',tag:'real',src:['S92','S29'],
 info:'Since October 2025, Awaab\'s Law makes social landlords investigate significant damp and mould within 10 working days of being told, and make homes safe. Tenants don\'t need a GP letter for that, but many are still asked for one.',
 text:`Fourteen requests this month for "a letter from the doctor" about damp and mould, most from the same housing association's estate. Two involve small children with chests that won't clear.`,
 choices:[
  {t:'Write them, free',fx:{inbox:70,patients:3,you:-1},o:`Fourteen letters. The housing association replies to the first one in a week. Funny, that.`},
  {t:'Charge the private letter fee',fx:{cash:0.4,patients:-3,rep:-2},o:`It's allowed. It's also on the estate's Facebook group by teatime.`},
  {t:'Send a leaflet on Awaab\'s Law instead',fx:{inbox:-10,patients:-1},alt:{p:0.35,fx:{patients:-3,you:-1},o:`The housing association insists on a doctor's letter anyway. The families come back, crosser.`},o:`Most tenants report it directly and quote the law. The landlord moves faster than any letter would have made it.`}
 ]},
{id:'ftsu',who:'kayleigh',title:'An anonymous note',tag:'real',src:['S93'],
 info:'NHS England expects primary care workers to have a way to raise concerns, including access to a trained Freedom to Speak Up guardian, often shared across a PCN or ICB.',
 text:`An unsigned note in the staff room suggestion box: "Nobody here feels able to raise things. Last time someone did, they got moved to the scanning room." Kayleigh says she didn't write it. She says it quickly.`,
 choices:[
  {t:'Sign up to the PCN\'s speak-up guardian and hold a staff meeting',fx:{team:4,you:-2,cash:-0.4,aim:{team:1}},o:`The meeting is awkward for twenty minutes and useful for forty. Three things change. The scanning room gets a window.`},
  {t:'"My door is always open"',fx:{team:-3},later:[{in:3,p:0.35,fx:{team:-5,safety:-2},note:'A member of staff raised concerns with CQC directly, because they didn\'t think anyone here would listen.'}],o:`Your door is always open. Nobody comes through it.`}
 ]},
{id:'appt_data',who:'paper',title:'League table',tag:'real',src:['S94'],
 info:'NHS England publishes monthly appointment data for every practice. It only counts what is recorded in the appointment book, and coding differs between practices, so comparisons can mislead.',
 text:`{paper} has ranked every practice in the area by appointments per patient. {surgery} is second from bottom, because half your telephone consultations were never put in the appointment book.`,
 choices:[
  {t:'Fix how the team books and codes',fx:{inbox:50,team:-2,rep:3},o:`Three months later you're mid-table, having done exactly the same work.`},
  {t:'Write to the paper about data quality',fx:{you:-2},alt:{p:0.5,fx:{rep:-2},o:`They print it under the headline "GP blames the data".`},o:`They print a correction on page 17, beside the crossword.`}
 ]},
/* ---------- the week, going wrong ---------- */
{id:'fit_notes',who:'patient',title:'Back to work',months:[9,10],tag:'story',
 text:`The first week of January. Forty-one requests for fit notes, eleven of them for "stress", six backdated to Christmas Eve. Each one needs reading, and some need a conversation.`,
 choices:[
  {t:'You do them all, properly',fx:{inbox:90,you:-3,patients:2},o:`It takes two admin sessions. Two of the "stress" requests turn into appointments that matter.`},
  {t:'Share them with the pharmacist and physio',need:()=>S.staff.pharm + S.staff.physio > 0,why:'You have no pharmacist or physio',fx:{inbox:30,team:-2},o:`The physio takes the backs, the pharmacist the flu. You take the rest.`},
  {t:'Seven-day self-certification first, then book in',fx:{patients:-3,inbox:20},o:`Correct, and not popular. Reception explains it forty times.`}
 ]},
{id:'wasps',who:'bev',title:'Wasps',months:[3,4,5],tag:'story',
 text:`There's a wasps' nest the size of a rugby ball above the main entrance. A patient has already been stung, and has been very reasonable about it. The next one may not be.`,
 choices:[
  {t:'Pest control today (£180)',fx:{cash:-0.2,team:1},o:`A man in a white suit, twenty minutes, a very dead nest.`},
  {t:'Put up a sign and use the side door',fx:{patients:-2},later:[{in:1,p:0.35,fx:{patients:-2,rep:-2},note:'A second patient was stung at the side door, which turned out to be closer to the nest. It made the local Facebook group.'}],o:`"PLEASE USE SIDE DOOR (WASPS)". It's the most-read sign in the building.`}
 ]},
{id:'power_cut',who:'maureen',title:'The fridge',tag:'real',src:['S49'],
 info:'Vaccine fridges must stay between 2 and 8°C. If the cold chain breaks, vaccines are quarantined, and the practice asks the manufacturer or public health for advice before using them. Some will have to be destroyed.',
 text:`A power cut overnight. The vaccine fridge logger shows it reached 13°C for five hours. There's £3,000 of vaccine inside and a baby clinic at 9.`,
 choices:[
  {t:'Quarantine it all and get advice',fx:{cash:-3,safety:4,team:-2,patients:-1},o:`Half is usable, half goes in the yellow bin. The baby clinic moves to Thursday.`},
  {t:'It\'s probably fine. Carry on.',fx:{},later:[{in:2,p:0.35,fx:{safety:-6,icb:-5,you:-4},note:'The fridge log from the power cut came up in an audit. Forty-two children need their vaccines repeated, and their parents need a letter explaining why.'}],o:`The clinic runs on time.`}
 ]},
{id:'referral_bounced',who:'hospital',title:'Returned to sender',tag:'story',
 text:`St Swithin's has rejected nine referrals this month: "Please arrange bloods, imaging and a trial of treatment before re-referring." Some of that is fair. Some of it is the hospital's work, moved to you.`,
 choices:[
  {t:'Do the work and re-refer',fx:{inbox:80,you:-2,patients:1},o:`Nine patients, nine more months of your time. The hospital's waiting list looks shorter.`},
  {t:'Push back through the LMC',fx:{you:-1,icb:-2},later:[{in:3,p:0.5,fx:{you:2,inbox:-40},note:'The LMC agreed a new interface rule with St Swithin\'s: the service that wants a test arranges it.'}],o:`Steve at the LMC says he has a folder for this. It's thick.`}
 ]},
{id:'easter',who:'bev',title:'Easter weekend',months:[0],tag:'story',
 text:`Easter is four days of closed doors and one very long Tuesday after it. The ICB would "welcome" practices opening on Saturday morning, paid at the usual extended-hours rate.`,
 choices:[
  {t:'Open Saturday morning',fx:{team:-3,cash:0.8,patients:2},o:`Fifty appointments, all used. Maureen brings hot cross buns.`},
  {t:'Stay closed and brace for Tuesday',fx:{patients:-2,inbox:40},o:`Tuesday arrives, as promised, with everything that happened since Thursday.`}
 ]},
{id:'locum_no_show',who:'agency',title:'7:45am',tag:'story',
 text:`The locum booked for today's clinic has cancelled by text: "unwell, sorry". Eighteen patients are booked from 8:30. The agency has someone else, at a "short-notice rate".`,
 choices:[
  {t:'Do it yourself on top of your list',fx:{you:-4,patients:1},o:`Thirty-six patients. You eat lunch at 4pm, standing up.`},
  {t:'Pay the short-notice rate',fx:{cash:-1.1},o:`A cheerful locum arrives at 8:40 and asks where the toilets are.`},
  {t:'Rebook the list',fx:{patients:-4,safety:-1,team:-2},o:`Reception rings eighteen people. Two of them should have been seen today.`}
 ]},
{id:'wedding',who:'kayleigh',title:'The wedding',months:[1,2,3],tag:'story',
 text:`Three receptionists have asked for the same Friday off: Kayleigh's cousin is getting married, and apparently half of reception is invited. That leaves two people for 8am.`,
 choices:[
  {t:'Say yes to all three',fx:{team:5,patients:-3},o:`The photos are lovely. The phones that Friday were not.`},
  {t:'One can go',fx:{team:-4},o:`Kayleigh goes. The other two look at you differently for a month.`},
  {t:'Yes, and pay bank staff to cover (£600)',fx:{team:4,cash:-0.6,patients:-1},o:`The cover staff don't know anyone's nan, but they answer the phone.`}
 ]},
{id:'phishing',who:'it',title:'Your password has expired',tag:'story',
 text:`An email that looked exactly like an NHSmail notice asked staff to "re-verify" their password. Kevin did. So, it turns out, did two others. Nothing seems to have happened yet.`,
 choices:[
  {t:'Report it, reset everything, book training',fx:{team:-2,cash:-0.3,safety:2},o:`A painful afternoon of new passwords. The IT helpdesk says you did the right thing, then closes the ticket.`},
  {t:'Change Kevin\'s password and move on',fx:{},later:[{in:1,p:0.35,fx:{safety:-4,cash:-3,icb:-3},note:'Kevin\'s account sent 3,000 phishing emails to other practices overnight. The data security team would like a word, and an incident report.'}],o:`Kevin picks a new password. It is his dog's name, with a 2.`}
 ]},
{id:'parking',who:'landlord',title:'The neighbours',tag:'story',
 text:`Residents on the next street have written to the council about "surgery parking". They have a point: the car park has 14 spaces and 40 staff. They also have a banner.`,
 choices:[
  {t:'Staff park at the leisure centre and walk',fx:{team:-3,rep:2},o:`Eight minutes each way, in the rain. The banner comes down.`},
  {t:'Point out that it\'s a surgery',fx:{rep:-3,you:1},o:`The council sends a letter. The residents send a petition. The banner gets bigger.`}
 ]},
{id:'student_nurse',who:'maureen',title:'A student nurse',tag:'story',
 text:`The university needs placements for student nurses. Maureen would supervise. It means slower clinics for ten weeks, and a small placement payment.`,
 choices:[
  {t:'Take her',fx:{team:-1,cash:0.4},later:[{in:10,p:0.5,fx:{staff:{nurse:1},team:3},note:'The student nurse you hosted has qualified and applied for your vacancy. Maureen interviewed her in five minutes.'}],o:`She's good, and asks the questions everyone else stopped asking.`},
  {t:'Not this term',fx:{},o:`The placement goes to the practice across town. So, eventually, does the nurse.`}
 ]},
{id:'rx_forgery',who:'chemist',title:'Your signature',tag:'story',
 text:`Ashok at the pharmacy rings: someone has been using stolen prescription paper, with your name, to get controlled drugs. Three pharmacies have filled them.`,
 choices:[
  {t:'Police, the NHS counter fraud service and electronic scripts only',fx:{you:-2,team:-2,safety:3},o:`Paper prescriptions go in a locked drawer. The forgeries stop in a week.`},
  {t:'Warn the local pharmacies and leave it there',fx:{safety:-2},later:[{in:2,p:0.3,fx:{safety:-3,you:-3},note:'More forged prescriptions in your name turned up in the next town. The police want a statement.'}],o:`Ashok says he'll pass it on. He sounds unconvinced.`}
 ]},
{id:'school_letters',who:'patient',title:'For the school',tag:'story',
 text:`A secondary school has told parents that any absence needs "a letter from the GP". Twenty-three requests this week, mostly for colds.`,
 choices:[
  {t:'Write them',fx:{inbox:50,patients:1,you:-1},o:`Twenty-three letters saying a child had a cold. It's not why you went to medical school.`},
  {t:'Write to the head teacher instead',fx:{you:1,patients:-2},alt:{p:0.4,fx:{patients:-3},o:`The head teacher replies that it's "school policy". The parents are caught in the middle and cross with you.`},o:`The school changes its letter. The requests stop.`}
 ]},
{id:'benefit_letters',who:'patient',title:'Supporting letters',tag:'story',
 text:`Requests for letters to support benefit claims and appeals have doubled. Each one is a real person with a real deadline, and each takes twenty minutes you don't have.`,
 choices:[
  {t:'Write them, free',fx:{inbox:70,you:-2,patients:3},o:`You write them in the evenings. Some of them work.`},
  {t:'A factual printout from the record only',fx:{patients:-3,team:1,inbox:-10},o:`It's fair and consistent. It's not what people hoped for.`}
 ]},
{id:'snow',who:'bev',title:'Snow',months:[9,10],tag:'story',
 text:`Eight inches overnight. The roads are closed, half the staff can't get in, and the phones have started anyway.`,
 choices:[
  {t:'A telephone-only day, staff working from home',fx:{patients:-2,safety:-1,team:1},o:`It mostly works. The GP with a 4x4 does the three visits that can't wait.`},
  {t:'Walk in and open up',fx:{you:-4,team:3,patients:2},o:`Forty minutes in wellies. You open the doors at 8:15 to a waiting room with two people in it, both delighted.`}
 ]},
{id:'cleaner',who:'bev',title:'No cleaner',tag:'story',
 text:`The cleaning contractor has gone into administration. The bins are full, the floors are sticky, and the infection control audit is next month.`,
 choices:[
  {t:'A new contract, at £300 a month more',fx:{team:1},run(){ addMod({ id: 'cleaner', label: 'Dearer cleaning contract', months: 99, fx: { cash: -0.3 } }); },o:`A new firm starts on Monday. They're thorough, and they know it.`},
  {t:'Everyone cleans for half an hour at the end of the day',fx:{team:-5,safety:-2},o:`The team cleans. The team resents it. The audit finds dust on the tops of the curtain rails.`}
 ]},
{id:'nurse_prescriber',who:'maureen',title:'Maureen wants to prescribe',tag:'story',
 text:`Maureen wants to do the independent prescribing course: one day a week at the university for six months, then she can manage her own asthma and diabetes patients start to finish.`,
 choices:[
  {t:'Back her',fx:{team:3,cash:-1},run(){ addMod({ id: 'nmp', label: 'Maureen on her prescribing course', months: 6, capMul: 0.97 }); plant({ in: 7, fx: { qof: 3, patients: 2, aim: { patients: 1 } }, note: 'Maureen qualified as a prescriber. Her asthma and diabetes reviews now end with a prescription, not a note for the GP.' }); },o:`Maureen buys a new ring binder. It's the happiest you've seen her.`},
  {t:'Not this year',fx:{team:-3,okoye:2},o:`She takes it well, and asks again in the spring, less patiently.`}
 ]},
{id:'lpa',who:'patient',title:'Capacity, please',tag:'story',
 text:`A family wants you to confirm their father has capacity to sign a lasting power of attorney and a new will, today, before his daughter flies home. He's 91, frail and very clear about what he wants.`,
 choices:[
  {t:'Do a proper assessment, as private work',fx:{cash:0.2,inbox:20,you:-1},o:`Forty minutes, careful notes and a fee. He knows exactly what he's signing, and why.`},
  {t:'Suggest the solicitor arranges it',fx:{patients:-1},o:`The solicitor finds a private doctor. The daughter makes her flight, just.`}
 ]},
{id:'interpreter',who:'bev',title:'On hold',cond:()=>S.practiceKey==='city',tag:'story',
 text:`The telephone interpreter line has a 40-minute hold for Tigrinya this week. There are six patients booked who need one.`,
 choices:[
  {t:'Book face-to-face interpreters (£1,500)',fx:{cash:-1.5,patients:3,safety:2},o:`Longer appointments, and the right answers. One patient finally explains the headache she's had for a year.`},
  {t:'Let family members interpret',fx:{safety:-3,patients:-1},later:[{in:2,p:0.3,fx:{safety:-4,you:-2},note:'A teenager interpreted a serious diagnosis for her mother. She left out the parts she couldn\'t bear to say.'}],o:`It's quicker. It's not the same.`}
 ]},
/* ---------- once the pressure builds ---------- */
{id:'p_cqc_framework',who:'cqc',title:'The new framework',pmin:1,tag:'speculative',
 info:'Invented, but familiar: CQC has changed how it assesses GP practices several times, each with new evidence categories and ratings.',
 text:`CQC has announced another new assessment framework, with new "quality statements" and a new portal. Your policies were written for the last one. Some for the one before.`,
 choices:[
  {t:'A management session a week until it\'s all mapped',fx:{you:-3,team:-2},run(){ if (typeof cqcPrep === 'function') cqcPrep(8); },o:`Sixty-two policies, re-headed. The content is the same, and now it's in the right boxes.`},
  {t:'Wait until they visit',fx:{safety:-2},o:`The portal sends a reminder every week. It's very polite.`}
 ]},
{id:'p_pcn_split',who:'pcn',title:'The PCN splits',pmin:1,tag:'story',
 text:`Two practices are leaving your PCN to join a bigger one across the county. The PCN has to renegotiate everything: staff contracts, the hub, and who does the Saturday clinics.`,
 choices:[
  {t:'Take on more of the PCN\'s work',fx:{you:-4,cash:1.5,icb:2},o:`More meetings, a bigger share of the money, and a Saturday rota with your name on it more often.`},
  {t:'Let the PCN shrink',fx:{cash:-1.5,team:-2},o:`Fewer shared staff, fewer meetings. The pharmacist now covers four practices instead of three.`}
 ]},
{id:'p_near_miss',who:'chemist',title:'Caught',pmin:2,tag:'story',
 text:`Ashok rings at 6pm: a prescription you wrote at the end of a 13-hour day had a dose ten times too high. He caught it. He's kind about it. You go cold anyway.`,
 choices:[
  {t:'A significant event, and no clinics after 6pm',fx:{patients:-3,safety:3,you:2,aim:{you:1}},o:`You write it up honestly. The team talks about tired prescribing without blaming anyone. You leave at 6 on Thursdays now.`},
  {t:'Thank him, and carry on',fx:{},later:[{in:2,p:0.4,fx:{safety:-5,you:-6},note:'Another late-evening error, and this time the pharmacy didn\'t catch it. The patient is fine. You aren\'t.'}],o:`You thank Ashok. You carry on. You're very tired.`}
 ]},
{id:'p_viral_video',who:'kayleigh',title:'Filmed',pmin:1,tag:'story',
 text:`A relative filmed Kayleigh at the front desk explaining, calmly, that there were no appointments left, and posted it with the caption "Rude receptionist". It has 40,000 views, and Kayleigh's name.`,
 choices:[
  {t:'Stand by her publicly',fx:{team:6,rep:-2},o:`A short statement: she did her job, politely, under pressure. Most of the comments turn. Kayleigh keeps a copy.`},
  {t:'A general apology for "any distress"',fx:{team:-6,rep:1},o:`The video fades. Kayleigh reads the apology twice and starts looking at jobs.`}
 ]},
{id:'p_appraiser',who:'jobs',title:'A job on the side',pmin:2,tag:'story',
 text:`The ICB wants GP appraisers: one session a week, paid, away from the practice. It's interesting, it's respected, and it's a morning where nobody rings you.`,
 choices:[
  {t:'Take it',fx:{you:4,cash:0.7,patients:-2},run(){ S.plan.clin = Math.max(3, S.plan.clin - 1); },o:`Thursday mornings you appraise other GPs. They are all as tired as you. It helps, oddly.`},
  {t:'The practice needs every session',fx:{you:-2},o:`You stay. The advert closes on Friday.`}
 ]}
);
