import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, GraduationCap, CheckCircle2, ExternalLink, ChevronDown, ChevronLeft, ChevronRight, Landmark, Search, Flame, Globe2, LayoutGrid, X } from 'lucide-react';
import { AdsterraNativeBanner } from '../ads/AdsterraUnits';

type StaticPage = 'about' | 'contact' | 'privacy' | 'terms';

interface ScholarshipsPageProps {
  onNavigateHome: () => void;
  onNavigateJobs?: () => void;
  onNavigateStatic?: (page: StaticPage) => void;
  onNavigateWorldNews?: () => void;
  onNavigateEntertainment?: () => void;
}

interface Scholarship {
  id: string;
  name: string;
  sponsor: string;
  location: string;
  level: string;
  deadline: string;
  image: string;
  summary: string;
  coverage: string[];
  eligibility: string[];
  howToApply: string;
  applyUrl: string;
  applyLabel: string;
  infoUrl?: string;
  note?: string;
}

// Categories used for the sidebar/filter pills. A scholarship can match more than one
// (e.g. "Masters / Professional") — matching is done by substring, not exact equality.
const LEVEL_CATEGORIES = ['Undergraduate', 'Masters', 'PhD / Postgraduate', 'Fellowship / Training'] as const;
type LevelCategory = (typeof LEVEL_CATEGORIES)[number];

function matchesCategory(level: string, category: LevelCategory): boolean {
  const l = level.toLowerCase();
  switch (category) {
    case 'Undergraduate':
      return l.includes('undergraduate');
    case 'Masters':
      return l.includes('masters');
    case 'PhD / Postgraduate':
      return l.includes('phd') || l.includes('postgraduate') || l.includes('postdoctoral') || l.includes('doctoral');
    case 'Fellowship / Training':
      return l.includes('fellowship') || l.includes('training') || l.includes('research') || l.includes('professional');
  }
}

// Best-effort extraction of a concrete "Month D, YYYY" date out of free-text deadline
// strings like "August 21, 2026 (Undergraduate: August 31, 2026)" or "Not specified —
// applications open June 29, 2026". Returns null when no parseable date is present
// (e.g. "Varies by country and track"), which is treated as "no known deadline" rather
// than sorted arbitrarily.
function parseDeadlineDate(deadline: string): Date | null {
  const match = deadline.match(/([A-Z][a-z]+ \d{1,2},\s*\d{4})/);
  if (!match) return null;
  const parsed = new Date(match[1]);
  return isNaN(parsed.getTime()) ? null : parsed;
}

const scholarships: Scholarship[] = [
  {
    id: 'pearson',
    name: 'Lester B. Pearson International Scholarship',
    sponsor: 'University of Toronto',
    location: 'Toronto, Canada',
    level: 'Undergraduate',
    deadline: 'November 6, 2026',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Convocation_Hall_in_UofT.jpg',
    summary: "The university's most prestigious award for international students, recognizing outstanding academic achievement, creativity, and leadership potential. It's one of the largest scholarship programs for international students in Canada.",
    coverage: [
      'Full tuition for four years',
      'Books and incidental fees',
      'Full on-campus residence support for four years',
    ],
    eligibility: [
      'International student (non-Canadian, requiring a study permit)',
      'In your final year of senior secondary school in 2026/2027, or graduated no earlier than June 2026',
      'Beginning undergraduate studies at the University of Toronto in September 2027',
    ],
    howToApply: 'You must be nominated by your school, then apply for undergraduate admission to the University of Toronto — you\'ll receive a private scholarship application link once nominated. School nomination deadline: October 9, 2026. UofT admission application deadline: October 16, 2026. Pearson Scholarship application deadline: November 6, 2026.',
    applyUrl: 'https://future.utoronto.ca/pearson-scholarships',
    applyLabel: 'Official Scholarship Page',
    infoUrl: 'https://future.utoronto.ca/how-to-apply',
  },
  {
    id: 'erasmus',
    name: 'Erasmus Mundus Joint Master Scholarship — MARIHE',
    sponsor: 'Erasmus Mundus (EU Consortium)',
    location: 'Austria, China, Finland, Germany, Hungary, India, Portugal',
    level: 'Masters',
    deadline: 'September 21, 2026',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/960px-Flag_of_Europe.svg.png',
    summary: "Funded by the EU's Erasmus Mundus programme, this joint Master's in Research and Innovation in Higher Education (MARIHE) is delivered by a consortium of universities across three continents.",
    coverage: [
      'Tuition and participation costs fully covered',
      '€1,400 monthly allowance for travel, visa, installation, and subsistence',
      'Worldwide health and accident insurance',
      'Extra support for students from deprived or first-in-family backgrounds (limited slots)',
    ],
    eligibility: [
      'Hold a first university degree (3 years minimum) in any discipline',
      'Highly motivated and ambitious about higher education',
      'Sufficient English language proficiency (exemptions apply for prior study in English-medium countries)',
    ],
    howToApply: 'Apply online via the MARIHE application portal (evalato). Round 1 requires the application form, passport/ID copy, CV (Europass format), motivation letter, degree certificates, transcripts, proof of English proficiency, two recommendation letters, and an essay. Shortlisted candidates proceed to Round 2 (a short video). Read the official MARIHE Guidelines for Applicants before starting.',
    applyUrl: 'https://11547.evalato.com/',
    applyLabel: 'Apply via MARIHE Portal',
    infoUrl: 'https://www.marihe.eu/',
  },
  {
    id: 'eth-zurich-excellence',
    name: 'ETH Zurich Excellence Scholarship & Opportunity Programme',
    sponsor: 'ETH Zurich',
    location: 'Zurich, Switzerland',
    level: 'Masters',
    deadline: 'November 30, 2026 (application window opens November 1, 2026)',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Switzerland.svg?width=1200',
    summary: 'A merit-based scholarship for incoming Master\'s students at ETH Zurich, covering tuition and providing a living stipend for top academic performers from anywhere in the world.',
    coverage: [
      'CHF 12,000 per semester for living and study expenses',
      'Full tuition fee waiver for the duration of the Master\'s programme',
    ],
    eligibility: [
      'Applying for a Master\'s programme at ETH Zurich, starting Fall 2027',
      'Ranked in approximately the top 10% of your Bachelor\'s graduating class',
      'Open to both Swiss and international students',
    ],
    howToApply: 'Apply through the ETH Zurich student portal during the November 2026 application window; scholarship decisions are communicated by end of March 2027.',
    applyUrl: 'https://ethz.ch/students/en/studies/financial/scholarships/excellencescholarship.html',
    applyLabel: 'Official ETH Zurich Scholarship Page',
  },
  {
    id: 'truman-scholarship',
    name: 'Harry S. Truman Scholarship',
    sponsor: 'The Harry S. Truman Scholarship Foundation',
    location: 'United States (study can be anywhere)',
    level: 'Undergraduate (Junior year)',
    deadline: 'February 2, 2027',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_the_United_States.svg?width=1200',
    summary: 'A prestigious U.S. federal scholarship for college juniors committed to careers in public service, government, or the nonprofit sector, providing funding toward graduate study.',
    coverage: [
      'Up to $30,000 toward graduate school',
      'Priority admission and merit stipends at some partner graduate programs',
      'Leadership training, career counseling, and a professional network of Truman Scholars',
    ],
    eligibility: [
      'U.S. citizen or U.S. national, in your junior year of a bachelor\'s degree',
      'Nominated by your college or university (most schools have an internal nomination deadline before the national one)',
      'Strong record of public-service leadership and a clear commitment to a public-service career',
    ],
    howToApply: 'Work with your school\'s Truman Faculty Representative to be nominated, then submit the full application by the national deadline.',
    applyUrl: 'https://www.truman.gov/apply/applying/important-dates',
    applyLabel: 'Official Truman Scholarship Page',
    note: 'Most institutions set an internal nomination deadline weeks before the national deadline — confirm your school\'s date with your Truman Faculty Representative.',
  },
  {
    id: 'soros-fellowship-new-americans',
    name: 'Paul & Daisy Soros Fellowships for New Americans',
    sponsor: 'Paul & Daisy Soros Fellowships for New Americans',
    location: 'United States (study at any U.S. graduate school)',
    level: 'Masters / PhD',
    deadline: 'October 29, 2026, 2:00 PM ET',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Statue_of_Liberty_7.jpg?width=1200',
    summary: 'A fellowship for immigrants and children of immigrants pursuing full-time graduate study in the United States, recognizing New Americans\' contributions to American life.',
    coverage: [
      'Up to $90,000 total: a $25,000 annual stipend plus half of tuition and fees, for up to two years',
    ],
    eligibility: [
      'Green card holder, naturalized citizen, or child of two naturalized-citizen parents',
      'Under 31 years old at the application deadline',
      'Planning to enroll full-time in a graduate degree program at a U.S. institution',
    ],
    howToApply: 'Apply online with a full application and a minimum of three recommendations submitted by the deadline; finalists are invited to virtual interviews in early 2027.',
    applyUrl: 'https://pdsoros.org/application-process/',
    applyLabel: 'Official Application Page',
  },
  {
    id: 'hertz-foundation-fellowship',
    name: 'Hertz Foundation Fellowship',
    sponsor: 'Fannie and John Hertz Foundation',
    location: 'United States (study at a Hertz-affiliated university)',
    level: 'PhD',
    deadline: 'Late October 2026 (application opens August 31, 2026)',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_the_United_States.svg?width=1200',
    summary: 'A five-year fellowship for PhD students in the applied physical, biological, and engineering sciences, valued for its flexible funding and hands-on, innovation-focused community.',
    coverage: [
      'Full tuition and fees for up to five years',
      'An annual living stipend',
    ],
    eligibility: [
      'U.S. citizen or permanent resident',
      'Pursuing or planning a PhD in an applied science, engineering, or mathematics field at a Hertz-affiliated university',
      'Strong record of innovative, hands-on research or problem-solving',
    ],
    howToApply: 'Apply online once the 2027 application opens on August 31, 2026; the process includes a written application, references, and interview rounds.',
    applyUrl: 'https://www.hertzfoundation.org/hertz-fellowship/apply/',
    applyLabel: 'Official Hertz Fellowship Page',
  },
  {
    id: 'questbridge-national-college-match',
    name: 'QuestBridge National College Match',
    sponsor: 'QuestBridge',
    location: 'United States',
    level: 'Undergraduate',
    deadline: 'October 1, 2026',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_the_United_States.svg?width=1200',
    summary: 'Matches high-achieving, low-income high school seniors with full four-year scholarships at QuestBridge\'s partner colleges, covering the full cost of attendance.',
    coverage: [
      'Full four-year scholarship covering tuition, room, board, and fees at a partner college',
    ],
    eligibility: [
      'High school senior graduating in the current academic year',
      'Strong academic record and demonstrated financial need',
      'U.S. high school student, including international applicants at U.S.-curriculum schools per current program rules',
    ],
    howToApply: 'Create a QuestBridge account and submit the National College Match application, including academic records, essays, and recommendations, by the October deadline.',
    applyUrl: 'https://www.questbridge.org/apply-to-college/programs/national-college-match/apply',
    applyLabel: 'Apply via QuestBridge',
  },
  {
    id: 'russia',
    name: 'Open Doors Scholarship to Study in Russia',
    sponsor: 'Association of Global Universities (Open Doors)',
    location: 'Russia',
    level: 'Undergraduate / Masters / Doctoral / Post-doc',
    deadline: 'November 1, 2026 (registration opens August 20, 2026)',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Saint_Basil%27s_Cathedral_and_the_Red_Square.jpg/1280px-Saint_Basil%27s_Cathedral_and_the_Red_Square.jpg',
    summary: 'An annual, free-of-charge online competition across 14 subject areas that gives winners a streamlined route to bachelor\'s, master\'s, or doctoral admission — or a post-doc research position — at a leading Russian university.',
    coverage: [
      'Free tuition (plus a year of complimentary Russian language training if needed)',
      'One-stop system to choose a university and degree programme',
      'For post-doc winners: a funded research position with access to state-of-the-art equipment',
    ],
    eligibility: [
      'Foreign citizens and stateless persons; age brackets vary by track (16–23 bachelor\'s, 20–33 master\'s, 22–35 doctoral, 24–39 post-doc)',
      'Must not already hold the degree level being applied for',
      'Competition conducted in English and Russian',
    ],
    howToApply: 'Registration and portfolio submission run August 20 – November 1, 2026, followed by staged evaluation rounds through February 2027.',
    applyUrl: 'https://od.globaluni.ru/',
    applyLabel: 'Official Open Doors Site',
  },
  {
    id: 'schwarzman',
    name: 'Schwarzman Scholars Program',
    sponsor: 'Schwarzman Scholars, at Tsinghua University',
    location: 'Beijing, China',
    level: 'Masters',
    deadline: 'September 20, 2026',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Skyline_of_Beijing_CBD_with_B-5906_approaching_%2820211016171955%29_%281%29.jpg/1280px-Skyline_of_Beijing_CBD_with_B-5906_approaching_%2820211016171955%29_%281%29.jpg',
    summary: 'A highly selective, one-year fully funded master\'s in Global Affairs at Tsinghua University, built to develop a global community of future leaders and deepen understanding between China and the rest of the world.',
    coverage: [
      'Tuition, fees, room and board',
      'Travel to and from Beijing, in-country study tours, course materials',
      'A laptop, health insurance, and a personal stipend',
    ],
    eligibility: [
      'Undergraduate degree completed (or on track to complete) before the enrollment year',
      'Aged 18–28 as of August 1 of the enrollment year',
      'English proficiency (TOEFL 100 / IELTS 7 / equivalent, waived in some cases)',
    ],
    howToApply: 'Complete the online application, which can be saved and resumed before final submission.',
    applyUrl: 'https://www.schwarzmanscholars.org/admissions/',
    applyLabel: 'Official Admissions Page',
  },
  {
    id: 'mcgill',
    name: 'Mastercard Foundation Scholars Program at McGill University',
    sponsor: 'Mastercard Foundation, at McGill University',
    location: 'Montreal, Canada',
    level: 'Masters',
    deadline: 'August 21, 2026',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Montreal%2C_Quebec_skyline.jpg/1280px-Montreal%2C_Quebec_skyline.jpg',
    summary: 'For gifted African leaders and changemakers pursuing master\'s study aimed at transforming nutrition, public health, public policy, or sustainable agriculture across the continent.',
    coverage: [
      'Full international tuition and on-campus housing',
      'Personal monthly stipend and academic resources',
      'Pre-arrival and immigration support',
    ],
    eligibility: [
      'Citizen of, and living in, an eligible African country',
      'Never registered for or completed a master\'s degree',
      'Aged 35 or younger; admissible to Canada as an international student',
      'Demonstrated leadership, community service, and financial need',
    ],
    howToApply: 'Attending a mandatory virtual information session (scheduled by region) is required before receiving access to the application form.',
    applyUrl: 'https://www.mcgill.ca/mastercardfdn-scholars/apply/eligibility',
    applyLabel: 'Eligibility & How to Apply',
    infoUrl: 'https://www.mcgill.ca/mastercardfdn-scholars/',
    note: 'A mandatory regional info session must be attended before the application form is released — check the program page for the current schedule.',
  },
  {
    id: 'portugal',
    name: 'Portugal Government International Scholarship',
    sponsor: 'Government of Portugal',
    location: 'Portugal',
    level: 'Undergraduate / Masters / PhD',
    deadline: 'September 30, 2026',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Lisboa_-_Portugal_%2852597836992%29.jpg/1280px-Lisboa_-_Portugal_%2852597836992%29.jpg',
    summary: 'Financial support from the Government of Portugal for students of all nationalities enrolled (or admitted) at an approved Portuguese higher education institution.',
    coverage: [
      'Full tuition fee coverage',
      'Monthly stipend of up to €1,250',
    ],
    eligibility: [
      'Open to students of all nationalities',
      'Must meet the admission requirements of the selected university/programme',
      'Proof of English or Portuguese language proficiency, depending on instruction language',
    ],
    howToApply: 'Apply through the DGES portal after securing admission and enrollment at a recognized institution.',
    applyUrl: 'https://www.dges.gov.pt/wwwbeon/',
    applyLabel: 'Apply via DGES Portal',
    infoUrl: 'https://www.gov.pt/servicos/candidatar-se-a-uma-bolsa-de-estudo-para-o-ensino-superior',
  },
  {
    id: 'pretoria',
    name: 'University of Pretoria (UP) Mastercard Foundation Scholarship',
    sponsor: 'Mastercard Foundation, at the University of Pretoria',
    location: 'Pretoria, South Africa',
    level: 'Undergraduate / Honours / Masters',
    deadline: 'September 30, 2026 (Undergraduate: August 31, 2026)',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Uniegebou.jpg',
    summary: 'Since 2014, UP and the Mastercard Foundation have offered scholarships and wraparound support to high-achieving young Africans facing economic and social barriers, including refugees and persons with disabilities.',
    coverage: [
      'Start-up funds, visa fees, and annual tuition support',
      'Monthly stipend, campus room and board, health insurance',
      'A one-time African-based summer internship (flight and stipend)',
    ],
    eligibility: [
      'Accepted (or applying) to an undergraduate, Honours, or Masters programme at UP',
      'Facing significant socio-economic barriers; priority to refugees, IDPs, and persons with disabilities',
      'Demonstrated leadership and community service, with strong academic performance',
    ],
    howToApply: 'You must apply to UP first, then submit the relevant scholarship form (undergraduate or postgraduate) by email with supporting documents.',
    applyUrl: 'https://upnet.up.ac.za/upapply/signon.html',
    applyLabel: 'Apply to UP First',
    note: 'The University of Pretoria\'s general info page currently blocks access from some regions/networks — the application portal above is the verified working link.',
  },
  {
    id: 'ireland',
    name: 'Government of Ireland Fellows Programme',
    sponsor: 'Government of Ireland, Department of Foreign Affairs and Trade',
    location: 'Ireland',
    level: 'Masters',
    deadline: 'Not specified (applications open June 29, 2026)',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Dublin_-_aerial_-_2025-07-07_01.jpg/1280px-Dublin_-_aerial_-_2025-07-07_01.jpg',
    summary: 'A fully funded, one-year master\'s fellowship for early- to mid-career professionals from developing countries, focused on building capacity to deliver the UN Sustainable Development Goals in the Fellow\'s home country.',
    coverage: [
      'Programme fees, flights, accommodation, and living costs',
      'One-year master\'s study (10–16 months depending on programme)',
    ],
    eligibility: [
      'Eligibility and available strands vary by country — some are by invitation only via designated partner organisations',
      'IELTS (or equivalent) English proficiency required',
    ],
    howToApply: 'A three-stage process: preliminary application, detailed application (if shortlisted), then interviews. Check country-specific criteria before applying.',
    applyUrl: 'https://www.ireland.ie/en/ireland-fellows-programme/applying-for-the-ireland-fellows-programme/',
    applyLabel: 'Guidance & Application Forms',
    infoUrl: 'https://www.ireland.ie/en/ireland-fellows-programme/ireland-fellows-programme-overview/',
  },
  {
    id: 'coca-cola-scholars-program',
    name: 'Coca-Cola Scholars Program',
    sponsor: 'Coca-Cola Scholars Foundation',
    location: 'United States',
    level: 'Undergraduate',
    deadline: 'September 30, 2026, 5:00 PM ET',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_the_United_States.svg?width=1200',
    summary: 'A $20,000 achievement-based scholarship for U.S. high school seniors, recognizing leadership, academic achievement, and community service.',
    coverage: [
      '$20,000 scholarship, awarded to 150 students nationally each year',
    ],
    eligibility: [
      'High school senior graduating during the current school year, planning to enroll full-time in college',
      'U.S. citizen, national, or permanent resident',
      'Strong record of leadership and community service',
    ],
    howToApply: 'Complete the online application, including short-answer questions about leadership and service, by the September deadline.',
    applyUrl: 'https://www.coca-colascholarsfoundation.org/apply/',
    applyLabel: 'Apply Online',
  },
  {
    id: 'the-gates-scholarship',
    name: 'The Gates Scholarship',
    sponsor: 'The Bill & Melinda Gates Foundation',
    location: 'United States',
    level: 'Undergraduate',
    deadline: 'September 15, 2026',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_the_United_States.svg?width=1200',
    summary: 'A highly selective, last-dollar scholarship covering the full cost of college attendance for outstanding, Pell-eligible, minority high school seniors.',
    coverage: [
      'Full cost of attendance not covered by other financial aid, through college completion',
    ],
    eligibility: [
      'High school senior, Pell Grant-eligible, and a minority student per program criteria',
      'Minimum 3.3 cumulative GPA',
      'U.S. citizen, national, or permanent resident',
    ],
    howToApply: 'Create an account and complete the online application, including an essay and letters of recommendation, by the September deadline.',
    applyUrl: 'https://www.thegatesscholarship.org/scholarship/',
    applyLabel: 'Apply Online',
  },
  {
    id: 'vfw-voice-of-democracy',
    name: 'VFW Voice of Democracy Scholarship',
    sponsor: 'Veterans of Foreign Wars (VFW) and its Auxiliary',
    location: 'United States',
    level: 'Undergraduate (High School)',
    deadline: 'October 31, 2026',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_the_United_States.svg?width=1200',
    summary: 'An audio-essay scholarship competition for high school students, awarding up to $30,000 for an original recorded essay on a patriotic theme.',
    coverage: [
      'Scholarships up to $30,000 for the national first-place winner, plus additional national and local awards',
    ],
    eligibility: [
      'Students in grades 9–12 at the time of entry',
      'Entry submitted through a local VFW Post or participating high school, not directly to VFW national',
    ],
    howToApply: 'Submit your original audio essay entry through your local VFW Post or high school before the October 31 deadline — entries are not accepted directly through the national website.',
    applyUrl: 'https://www.vfw.org/community/youth-and-education/youth-scholarships',
    applyLabel: 'Official VFW Scholarship Page',
  },
  {
    id: 'sabanci',
    name: 'Sabancı University Scholarship',
    sponsor: 'Sabancı University',
    location: 'Istanbul, Turkey',
    level: 'Undergraduate / Masters / PhD',
    deadline: 'August 28, 2026',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Historical_peninsula_and_modern_skyline_of_Istanbul.jpg/1280px-Historical_peninsula_and_modern_skyline_of_Istanbul.jpg',
    summary: 'All international applicants who meet Sabancı University\'s admission requirements are automatically considered for a scholarship — no separate scholarship application is needed, though competition for higher award levels is keen.',
    coverage: [
      'Full tuition exemption for nearly all admitted graduate students',
      'Monthly stipend, free dorm room, health insurance, and laptop for most graduate scholars',
    ],
    eligibility: [
      'Domestic or international applicant admitted to Sabancı University',
      'Enrolling in an Undergraduate, Masters, or PhD programme',
    ],
    howToApply: 'Scholarship consideration happens automatically as part of admission — apply for undergraduate or graduate study directly through the university.',
    applyUrl: 'https://www.sabanciuniv.edu/en/graduate-scholarships',
    applyLabel: 'Graduate Scholarships Page',
    infoUrl: 'https://iro.sabanciuniv.edu/en/scholarships',
  },
  {
    id: 'rhodes',
    name: 'Rhodes Scholarship',
    sponsor: 'Rhodes Trust, at the University of Oxford',
    location: 'Oxford, United Kingdom',
    level: 'Masters / Postgraduate',
    deadline: 'August 27, 2026 (applications open June 1, 2026)',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Radcliffe_Camera%2C_Oxford_-_Oct_2006.jpg/1280px-Radcliffe_Camera%2C_Oxford_-_Oct_2006.jpg',
    summary: 'A fully funded, merit-based postgraduate scholarship enabling talented young people worldwide to study full-time at the University of Oxford, building an international community of public-spirited leaders.',
    coverage: [
      'Oxford course fees and an annual stipend (£20,400 for 2025–26, ~£1,700/month)',
      'Application, visa, and health surcharge fees; two economy flights to/from the UK',
    ],
    eligibility: [
      'Eligibility and application requirements vary significantly by home country',
      'Selection is based on academic excellence, achievement outside the classroom, character, and leadership potential',
    ],
    howToApply: 'Review the specific eligibility criteria for your home country before applying — the process and constituency rules differ by region.',
    applyUrl: 'https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/',
    applyLabel: 'Official Rhodes Scholarship Page',
  },
  {
    id: 'chevening',
    name: 'Chevening Scholarships',
    sponsor: 'UK Foreign, Commonwealth and Development Office (FCDO)',
    location: 'United Kingdom',
    level: 'Masters',
    deadline: 'Applications currently closed — next cycle expected to open August 2026',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/London_Skyline_%28125508655%29.jpeg/1280px-London_Skyline_%28125508655%29.jpeg',
    summary: 'A fully funded, highly competitive UK government scholarship enabling outstanding emerging leaders from around the world to pursue a one-year master\'s degree in the UK.',
    coverage: [
      'Tuition fees, living expenses (stipend), and return flights to the UK',
    ],
    eligibility: [
      'At least two years (2,800 hours) of work experience',
      'Must commit to returning to your home country for at least two years after the award',
      'A strong record of leadership and influence',
    ],
    howToApply: 'Checked directly on the official site: as of today, Chevening applications are closed. The next cycle is expected to open in August 2026 — check the site for the exact reopening date before the window closes again.',
    applyUrl: 'https://www.chevening.org/apply/',
    applyLabel: 'Official Apply Page',
    infoUrl: 'https://www.chevening.org/scholarships/',
    note: 'Applications are currently closed at time of listing — this is not a live open cycle yet.',
  },
  {
    id: 'mccall-macbain',
    name: 'McCall MacBain Scholarship',
    sponsor: 'McCall MacBain Foundation, at McGill University',
    location: 'Montreal, Canada',
    level: 'Masters / Professional',
    deadline: 'August 19, 2026 (most applicants) / September 23, 2026 (Canadian & US university students, and Canadians abroad)',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Montreal%2C_Quebec_skyline.jpg/1280px-Montreal%2C_Quebec_skyline.jpg',
    summary: 'A full scholarship for master\'s or professional studies at McGill University, for students demonstrating leadership potential and a commitment to positive impact. Up to 30 scholarships are awarded per cohort.',
    coverage: [
      'Full tuition and fees for an eligible master\'s or second-entry professional programme at McGill',
      'A living stipend of $2,300 per month during academic terms',
    ],
    eligibility: [
      'Enrolling in an eligible master\'s or professional degree at McGill',
      'Demonstrated leadership, community engagement, and academic strength',
      'Must be nominated/endorsed by your university to apply',
    ],
    howToApply: 'Applications for the 2027 cohort open June 1, 2026. Confirm with your university whether it participates in the endorsement process before applying.',
    applyUrl: 'https://apply.mccallmacbainscholars.org/apply',
    applyLabel: 'Apply via Official Portal',
    infoUrl: 'https://mccallmacbainscholars.org/apply/',
  },
  {
    id: 'worldbank-africa',
    name: 'World Bank Group Africa Fellowship Program',
    sponsor: 'World Bank Group (WBG)',
    location: 'Washington, D.C., USA (or a WBG country office)',
    level: 'PhD / Postdoctoral',
    deadline: 'August 25, 2026 (application launched July 15, 2026)',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/12-07-13-washington-by-RalfR-08.jpg/1280px-12-07-13-washington-by-RalfR-08.jpg',
    summary: 'A six-month fellowship giving Sub-Saharan African PhD candidates and recent graduates hands-on experience in development research, economic policy, and operations at World Bank Group offices.',
    coverage: [
      'Six-month assignment at WBG headquarters (Washington, D.C.) or a country office',
      'Hired as an Extended Term Consultant (ETC) for six months starting January 2027, upon acceptance',
    ],
    eligibility: [
      'Sub-Saharan Africa national; PhD candidate (final year) or recent graduate (within 3 years of completion)',
      'Aged 32 or younger by January 1, 2027',
      'Excellent English, strong quantitative and analytical skills',
    ],
    howToApply: 'Apply online during the open window (launched July 15, 2026). Selection runs in two phases — an initial shortlist by specialization, then final selection in consultation with WBG units.',
    applyUrl: 'https://wbgfellowship.worldbank.org/register/africa-fellowship-program',
    applyLabel: 'Apply on WBG Portal',
    infoUrl: 'https://www.worldbank.org/en/region/afr/brief/world-bank-group-africa-fellowship-program',
    note: 'The application portal sits behind a standard Cloudflare bot-check — this is normal browser verification, not a broken link.',
  },
  {
    id: 'mext',
    name: 'Japanese Government (MEXT) Scholarship',
    sponsor: 'Ministry of Education, Culture, Sports, Science and Technology (MEXT), Japan',
    location: 'Japan',
    level: 'Undergraduate / Masters / PhD / Research / Teacher Training',
    deadline: 'Varies by country and track — set by your local Japanese embassy or host university',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/1280px-Skyscrapers_of_Shinjuku_2009_January.jpg',
    summary: 'Since 1954, the Japanese government has funded international students across seven scholarship tracks (research, undergraduate, Japanese studies, teacher training, technical college, and the Young Leaders Program) to study at Japanese institutions.',
    coverage: [
      'Full tuition exemption',
      'Monthly stipend: ¥143,000–145,000 (most tracks), ¥117,000 (undergraduate/technical college), ¥242,000 (Young Leaders Program)',
      'Round-trip airfare to Japan',
    ],
    eligibility: [
      'Varies by track — see the specific programme guidelines for age, academic, and language requirements',
    ],
    howToApply: 'Two application routes: (1) via recommendation from a Japanese embassy/diplomatic mission in your country, or (2) via recommendation from a Japanese university with a MEXT quota. Requirements and deadlines differ by route — confirm with your local embassy or target university.',
    applyUrl: 'https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/',
    applyLabel: 'Official MEXT Guidance',
  },
  {
    id: 'gates-cambridge',
    name: 'Gates Cambridge Scholarship',
    sponsor: 'Gates Cambridge Trust, at the University of Cambridge',
    location: 'Cambridge, United Kingdom',
    level: 'Masters / PhD',
    deadline: 'Closed for 2026/27 entry — reopens September 2026 for 2027/28 entry',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Cambridge_-_Kings_College_vue_des_backs.jpg/1280px-Cambridge_-_Kings_College_vue_des_backs.jpg',
    summary: 'A full-cost, highly competitive scholarship for outstanding applicants from outside the UK to pursue a full-time postgraduate degree of any subject at the University of Cambridge.',
    coverage: [
      'University Composition Fee and college fees',
      'Maintenance allowance, plus one economy return airfare per year',
      'Additional funding for dependants and a Discretionary Funding pot for academic expenses',
    ],
    eligibility: [
      'Applying for full-time postgraduate study at Cambridge (not a UK citizen)',
      'Demonstrated intellectual ability, leadership potential, and a commitment to improving the lives of others',
    ],
    howToApply: 'Runs on two annual cycles: an earlier October round for US citizens resident in the US, and a later round (December/early January deadlines, course-dependent) for everyone else, aligned with Cambridge\'s own postgraduate admissions timeline.',
    applyUrl: 'https://www.gatescambridge.org/apply/',
    applyLabel: 'Official Apply Page',
    infoUrl: 'https://www.gatescambridge.org/apply/timeline/',
    note: 'Applications for 2026/27 entry are currently closed — the next round opens in September 2026 for 2027/28 entry.',
  },
  {
    id: 'commonwealth-masters',
    name: 'Commonwealth Master\'s Scholarships',
    sponsor: 'Commonwealth Scholarship Commission in the UK (CSC), funded by the FCDO',
    location: 'United Kingdom',
    level: 'Masters',
    deadline: 'Annual cycle — typically opens in autumn for the following academic year; check the CSC site for exact 2027 dates',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Houses_of_Parliament_in_2022_%28cropped%29.jpg/1280px-Houses_of_Parliament_in_2022_%28cropped%29.jpg',
    summary: 'Around 800 Commonwealth Scholarships and Fellowships are awarded each year for full-time taught Master\'s study in the UK, aimed at talented individuals from eligible low- and middle-income Commonwealth countries who could not otherwise afford to study there.',
    coverage: [
      'Approved tuition fees, return airfare, and a personal living allowance (stipend)',
      'Additional grants and thesis-related costs where applicable',
    ],
    eligibility: [
      'Citizen of, or with refugee/asylum status in, an eligible low- or middle-income Commonwealth country',
      'Unable to afford to study in the UK without this scholarship',
      'Applying under one of the CSC\'s six development themes',
    ],
    howToApply: 'Apply through the CSC\'s online application system, choosing an eligible course and UK university under one of the six CSC development themes.',
    applyUrl: 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/',
    applyLabel: 'Official CSC Programme Page',
    infoUrl: 'https://cscuk.fcdo.gov.uk/apply/',
  },
  {
    id: 'daad-epos',
    name: 'DAAD Development-Related Postgraduate Courses (EPOS)',
    sponsor: 'German Academic Exchange Service (DAAD), funded by the Federal Ministry for Economic Cooperation and Development (BMZ)',
    location: 'Germany',
    level: 'Masters / PhD',
    deadline: 'Set individually by each of the 30+ participating courses — mostly clustered June–October 2026',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/General_view_over_bonn_%28cropped%29.jpg/1280px-General_view_over_bonn_%28cropped%29.jpg',
    summary: 'Individual scholarships for graduates from developing countries to pursue development-related postgraduate courses — over 30 English-taught programmes spanning development economics, renewable energy, tropical forestry, public policy, and more — at selected German universities.',
    coverage: [
      'Monthly stipend: €992 (Master\'s) / €1,300 (PhD)',
      'Tuition waiver, return flights, health insurance, and a preparatory German language course',
    ],
    eligibility: [
      'A university degree and (usually) relevant professional experience, from a developing country',
      'Specific academic and language requirements set by each individual course',
    ],
    howToApply: 'There is no single EPOS application portal — you apply directly to the specific course you\'re interested in via the DAAD scholarship database, following that course\'s own deadline and document requirements.',
    applyUrl: 'https://www.daad.de/en/information-services-for-higher-education-institutions/further-information-on-daad-programmes/epos/',
    applyLabel: 'Official EPOS Programme Page',
    note: 'The DAAD site occasionally shows a bot-verification challenge to automated tools — this is standard browser verification and resolves normally for real visitors.',
  },
  {
    id: 'fulbright-foreign',
    name: 'Fulbright Foreign Student Program',
    sponsor: 'U.S. Department of State, administered by the Institute of International Education (IIE)',
    location: 'United States',
    level: 'Masters / PhD',
    deadline: 'Set by your local Fulbright Commission/Foundation or U.S. Embassy — most 2027/28 deadlines fall between roughly February and October 2026',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/12-07-13-washington-by-RalfR-08.jpg/1280px-12-07-13-washington-by-RalfR-08.jpg',
    summary: 'Around 4,000 grants are awarded annually for foreign students to pursue a Master\'s or Doctorate degree, or conduct research, at institutions across the United States — one of the world\'s largest and most prestigious international exchange programmes.',
    coverage: [
      'Tuition, a living stipend, airfare, and health insurance (exact package varies by country/commission)',
    ],
    eligibility: [
      'Varies by country — administered locally by your home country\'s Fulbright Commission/Foundation or U.S. Embassy',
    ],
    howToApply: 'Select your country/area on the official application site to be routed to your local Fulbright Commission or Embassy\'s specific process and deadline.',
    applyUrl: 'https://foreign.fulbrightonline.org/apply',
    applyLabel: 'Select Your Country to Apply',
  },
  {
    id: 'australia-awards',
    name: 'Australia Awards Scholarships',
    sponsor: 'Australian Government, Department of Foreign Affairs and Trade (DFAT)',
    location: 'Australia',
    level: 'Masters / PhD',
    deadline: '2027 intake closed April 30, 2026 — next round expected to open around February 2027',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Canberra_panorama_from_Mount_Ainslie.jpg/1280px-Canberra_panorama_from_Mount_Ainslie.jpg',
    summary: 'Long-term development scholarships for people from eligible countries across the Indo-Pacific, Africa, and the Middle East to undertake full-time undergraduate or postgraduate study in Australia.',
    coverage: [
      'Full tuition, a living-cost stipend, establishment allowance, and return airfare',
      'Overseas Student Health Cover for the length of the award',
    ],
    eligibility: [
      'Citizen of an eligible partner country (varies by region)',
      'Meets the academic and English-language requirements of the chosen course',
    ],
    howToApply: 'Applications are submitted via the OASIS online portal during the annual window (typically February–April), when open.',
    applyUrl: 'https://www.studyaustralia.gov.au/en/tools-and-resources/news/australia-awards-scholarships-applications-2027',
    applyLabel: 'Official Programme Update',
    note: 'The 2027-intake application window has already closed (it ran Feb 1 – Apr 30, 2026). Listed here for visibility ahead of the next round.',
  },
  {
    id: 'knight-hennessy',
    name: 'Knight-Hennessy Scholars',
    sponsor: 'Knight-Hennessy Scholars, at Stanford University',
    location: 'Stanford, California, USA',
    level: 'Masters / PhD / Professional',
    deadline: 'October 6, 2026, 1:00 PM Pacific Time',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Stanford%2C_California%2C_United_States_Post_Office%2C_March_2019.jpg/1280px-Stanford%2C_California%2C_United_States_Post_Office%2C_March_2019.jpg',
    summary: 'A graduate scholarship at Stanford University for future leaders across every discipline, providing up to three years of funding alongside a leadership development programme and a diverse, multidisciplinary cohort.',
    coverage: [
      'Full tuition, a living stipend, and travel funding for up to three years of graduate study',
    ],
    eligibility: [
      'Must separately apply to, and be accepted into, a full-time Stanford graduate degree programme',
      'No more than seven years of post-bachelor\'s work/study experience by matriculation (varies by rule specifics)',
    ],
    howToApply: 'Submit two concurrent applications: one to Knight-Hennessy Scholars, and one to your chosen Stanford graduate programme(s).',
    applyUrl: 'https://apply.knight-hennessy.stanford.edu/apply/',
    applyLabel: 'Apply via Official Portal',
    infoUrl: 'https://knight-hennessy.stanford.edu/admission',
  },
  {
    id: 'manaaki-nz',
    name: 'Manaaki New Zealand Scholarships',
    sponsor: 'New Zealand Ministry of Foreign Affairs and Trade (MFAT), administered by Education New Zealand',
    location: 'New Zealand',
    level: 'Undergraduate / Masters / PhD',
    deadline: 'Applications open March 1, 2027 and close April 10, 2027 (NZ time)',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Wellington_Harbour%2C_New_Zealand%2C_Nov._2009.jpg/1280px-Wellington_Harbour%2C_New_Zealand%2C_Nov._2009.jpg',
    summary: 'Funded through the New Zealand Aid Programme, these scholarships support students from eligible developing countries across Africa, Asia, Latin America, and the Pacific to study in New Zealand and contribute to their home country\'s development.',
    coverage: [
      'Tuition fees, living costs, establishment allowance, and health/travel insurance',
      'Return airfares to and from New Zealand',
    ],
    eligibility: [
      'Citizen and resident of an eligible country (varies by scholarship category)',
      'Meets academic and English-language requirements for the chosen programme',
    ],
    howToApply: 'Applications open March 1, 2027. The portal can close early for countries with high application volumes, so early submission is recommended.',
    applyUrl: 'https://www.nzscholarships.govt.nz/',
    applyLabel: 'Official Programme Site',
  },
  {
    id: 'turkiye-scholarships',
    name: 'Türkiye Scholarships',
    sponsor: 'Republic of Türkiye',
    location: 'Türkiye',
    level: 'Undergraduate / Masters / PhD / Research',
    deadline: 'General scholarships: Jan 10 – Feb 20 each year (next window ~January 2027). Success Scholarship: October–November 2026.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Ankara_from_bus_station.jpg/1280px-Ankara_from_bus_station.jpg',
    summary: 'A comprehensive government scholarship programme covering full degree study, research stays, and a dedicated "Success Scholarship" track, open to international students across dozens of Turkish universities.',
    coverage: [
      'Tuition, monthly stipend, accommodation, health insurance, and one round-trip flight ticket',
      'A one-year Turkish language course before degree study begins',
    ],
    eligibility: [
      'International student meeting the GPA and age requirements of the chosen programme level',
      'Different criteria and calendars apply to General, Success, and Research scholarship tracks',
    ],
    howToApply: 'Apply online through the official Türkiye Scholarships portal during the relevant application window for your chosen track.',
    applyUrl: 'https://www.turkiyeburslari.gov.tr/',
    applyLabel: 'Official Application Portal',
  },
];

function ScholarshipCard({ item, isOpen, onToggle }: { item: Scholarship; isOpen: boolean; onToggle: () => void }) {
  return (
    <motion.div
      layout
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="grid md:grid-cols-[280px_1fr]">
        <div className="relative h-48 md:h-full min-h-[200px] overflow-hidden bg-slate-100">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <span className="absolute top-3 left-3 bg-[#2563eb] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
            {item.level}
          </span>
        </div>

        <div className="p-5 md:p-6 flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <Landmark size={12} />
                {item.sponsor}
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 leading-snug">
                {item.name}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-[12px] font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[#68A108] shrink-0" />
              {item.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-[#68A108] shrink-0" />
              Deadline: <span className="text-slate-900">{item.deadline}</span>
            </span>
          </div>

          <p className="text-[13px] text-slate-600 leading-relaxed mt-3">
            {item.summary}
          </p>

          <button
            onClick={onToggle}
            className="mt-4 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#68A108] hover:text-[#528005] transition-colors self-start"
          >
            {isOpen ? 'Hide Details' : 'View Full Details'}
            <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-slate-100 space-y-4"
            >
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
                  <GraduationCap size={13} className="text-[#68A108]" /> What It Covers
                </h4>
                <ul className="space-y-1.5">
                  {item.coverage.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px] text-slate-600">
                      <CheckCircle2 size={13} className="text-[#68A108] shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-900 mb-2">
                  Eligibility
                </h4>
                <ul className="space-y-1.5">
                  {item.eligibility.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px] text-slate-600">
                      <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0 mt-2" />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-900 mb-2">
                  How to Apply
                </h4>
                <p className="text-[12.5px] text-slate-600 leading-relaxed">{item.howToApply}</p>
              </div>

              {item.note && (
                <p className="text-[11.5px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
                  {item.note}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={item.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-[#68A108] hover:bg-[#528005] text-white px-4 py-2.5 rounded-xl transition-colors"
                >
                  {item.applyLabel} <ExternalLink size={12} />
                </a>
                {item.infoUrl && (
                  <a
                    href={item.infoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    More Info <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ScholarshipsPage({ onNavigateHome, onNavigateJobs, onNavigateStatic, onNavigateWorldNews, onNavigateEntertainment }: ScholarshipsPageProps) {
  const [openId, setOpenId] = useState<string | null>('pearson');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | LevelCategory>('All');
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const skipNextUrlSync = useRef(true);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const jumpToSearch = () => {
    searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    searchInputRef.current?.focus();
  };

  // Deep-link support: reflect the open scholarship in the URL for sharing/bookmarking,
  // and restore it on load or when the user navigates with back/forward.
  useEffect(() => {
    const idFromPath = (path: string) => {
      const match = path.match(/^\/scholarships\/(.+)$/);
      if (!match) return null;
      const id = decodeURIComponent(match[1]);
      return scholarships.some((s) => s.id === id) ? id : null;
    };

    const initial = idFromPath(window.location.pathname);
    if (initial) {
      setOpenId(initial);
      const idx = scholarships.findIndex((s) => s.id === initial);
      if (idx !== -1) setCurrentPage(Math.floor(idx / ITEMS_PER_PAGE) + 1);
    }

    const onPopState = () => setOpenId(idFromPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false;
      return;
    }
    const targetPath = openId ? `/scholarships/${encodeURIComponent(openId)}` : '/scholarships';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  }, [openId]);

  const enriched = useMemo(
    () => scholarships.map((s) => ({ ...s, deadlineDate: parseDeadlineDate(s.deadline) })),
    []
  );

  const categoryCounts = useMemo(() => {
    const counts = {} as Record<LevelCategory, number>;
    for (const cat of LEVEL_CATEGORIES) {
      counts[cat] = scholarships.filter((s) => matchesCategory(s.level, cat)).length;
    }
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enriched.filter((s) => {
      const matchesQuery =
        !q || [s.name, s.sponsor, s.location, s.summary].some((field) => field.toLowerCase().includes(q));
      const matchesCat = selectedCategory === 'All' || matchesCategory(s.level, selectedCategory);
      return matchesQuery && matchesCat;
    });
  }, [enriched, searchQuery, selectedCategory]);

  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const skipNextPageReset = useRef(true);

  // Reset to page 1 whenever the search/category filters change (but not on initial
  // mount, so a deep link's page jump above doesn't get immediately overwritten).
  useEffect(() => {
    if (skipNextPageReset.current) {
      skipNextPageReset.current = false;
      return;
    }
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const closingSoon = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return enriched
      .filter((s): s is typeof s & { deadlineDate: Date } => !!s.deadlineDate && s.deadlineDate.getTime() >= startOfToday.getTime())
      .sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime())
      .slice(0, 5);
  }, [enriched]);

  const regionCount = useMemo(() => {
    const set = new Set(scholarships.map((s) => s.location.split(/[,/]/)[0].trim()));
    return set.size;
  }, []);

  const jumpToCard = (id: string) => {
    const idx = filtered.findIndex((s) => s.id === id);
    if (idx !== -1) setCurrentPage(Math.floor(idx / ITEMS_PER_PAGE) + 1);
    setOpenId(id);
    // Give the page-change a render cycle to mount the target card before scrolling to it.
    setTimeout(() => {
      cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const navItems = [
    { name: 'HOME', active: false, onClick: onNavigateHome },
    { name: 'WORLD NEWS', active: false, onClick: () => (onNavigateWorldNews ? onNavigateWorldNews() : onNavigateHome()) },
    { name: 'ENTERTAINMENT', active: false, onClick: () => (onNavigateEntertainment ? onNavigateEntertainment() : onNavigateHome()) },
    { name: 'JOBS', active: false, onClick: () => onNavigateJobs?.() },
    { name: 'SCHOLARSHIPS', active: true, onClick: () => {} },
  ];

  return (
    <div className="relative overflow-x-hidden bg-slate-50 min-h-screen">
      {/* Header — matches the homepage layout: logo left, ad banner right */}
      <header
        className="bg-neutral-950 border-b border-neutral-900 relative overflow-hidden py-8"
        style={{ backgroundImage: 'radial-gradient(#1e293b 1.2px, transparent 1.2px)', backgroundColor: '#090d16', backgroundSize: '16px 16px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/40 to-neutral-950/80 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center relative z-10 gap-6">
          <div className="flex flex-col items-start text-left select-none">
            <h1
              className="text-4xl md:text-5xl font-black tracking-tighter flex items-center cursor-pointer text-white hover:opacity-95 transition-opacity"
              onClick={onNavigateHome}
            >
              <span>Simplify Feed</span>
              <span className="w-3.5 h-3.5 bg-[#68A108] rounded-full ml-2 self-end mb-2"></span>
            </h1>
            <p className="text-[10px] uppercase font-black tracking-[0.25em] text-[#68A108] font-mono leading-none mt-2">
              Real News. Real Jobs. Real Opportunities.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end text-right gap-1.5 select-none shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-white">
              <CheckCircle2 size={13} className="text-[#68A108]" />
              Verified Opportunities Only
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono max-w-[260px] leading-relaxed">
              Sourced from official institution &amp; government portals
            </div>
            <div className="text-[10px] font-bold text-[#68A108] font-mono uppercase tracking-wider">
              {scholarships.length} Opportunities · Updated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-[#68A108] sticky top-0 z-50 shadow-md border-b border-[#528005]">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center flex-wrap gap-y-2">
          <ul className="flex items-center flex-wrap">
            {navItems.map((item) => (
              <li
                key={item.name}
                onClick={item.onClick}
                className={`flex items-center gap-1.5 px-5 py-4.5 text-[13px] font-sans font-bold tracking-tight border-r border-[#528005] cursor-pointer transition-colors group relative text-white
                  ${item.active ? 'bg-[#528005]' : 'hover:bg-[#528005]'}`}
              >
                {item.name}
              </li>
            ))}
          </ul>
          <button
            onClick={jumpToSearch}
            className="hidden sm:flex items-center gap-2 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white/90 hover:text-white transition-colors"
          >
            <Search size={15} />
            Search Opportunities
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        {/* Page hero */}
        <div className="mb-8 text-center">
          <span className="inline-block bg-[#2563eb]/10 text-[#2563eb] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
            Verified Opportunities
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Scholarships & Fellowships
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
            A hand-picked selection of fully-funded and highly competitive opportunities for students and young professionals worldwide.
          </p>
        </div>

        {/* Search + category filter pills */}
        <div className="mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, sponsor, or country…"
              className="w-full pl-9 pr-9 py-2.5 text-[13px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#68A108]/30 focus:border-[#68A108] transition-colors placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(['All', ...LEVEL_CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10.5px] font-black uppercase tracking-wider px-3.5 py-2 rounded-full border transition-colors whitespace-nowrap
                  ${selectedCategory === cat
                    ? 'bg-[#68A108] border-[#68A108] text-white'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-[#68A108]/50 hover:text-[#68A108]'
                  }`}
              >
                {cat} ({cat === 'All' ? scholarships.length : categoryCounts[cat]})
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11.5px] font-bold text-slate-400 mb-5">
          {filtered.length === 0
            ? 'Showing 0 opportunities'
            : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of ${filtered.length} opportunities`}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
          {/* Scholarship cards */}
          <div className="space-y-5 min-w-0">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center"
                >
                  <p className="text-sm font-bold text-slate-500">No scholarships match your filters.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                    className="mt-3 text-[11px] font-black uppercase tracking-wider text-[#68A108] hover:text-[#528005]"
                  >
                    Clear filters
                  </button>
                </motion.div>
              ) : (
                paginatedItems.map((item) => (
                  <div key={item.id} ref={(el) => { cardRefs.current[item.id] = el; }}>
                    <ScholarshipCard
                      item={item}
                      isOpen={openId === item.id}
                      onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                    />
                  </div>
                ))
              )}
            </AnimatePresence>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center hover:bg-[#333] hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-current rounded-xl shadow-xs"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 border text-xs font-black transition-all rounded-xl shadow-xs
                      ${currentPage === i + 1
                        ? 'bg-[#68A108] border-[#68A108] text-white'
                        : 'bg-white border-slate-200 hover:border-[#333] hover:bg-[#333] hover:text-white'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center hover:bg-[#333] hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-current rounded-xl shadow-xs"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            {/* Stat tile */}
            <div
              className="rounded-2xl p-5 text-white relative overflow-hidden"
              style={{ backgroundImage: 'radial-gradient(#1e293b 1.2px, transparent 1.2px)', backgroundColor: '#090d16', backgroundSize: '14px 14px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#68A108]/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 text-[#68A108] mb-3">
                  <Globe2 size={15} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Global Reach</span>
                </div>
                <div className="text-3xl font-black leading-none">{scholarships.length}</div>
                <div className="text-[11px] font-bold text-neutral-400 mt-1">Verified opportunities</div>
                <div className="h-px bg-white/10 my-3" />
                <div className="text-2xl font-black leading-none">{regionCount}+</div>
                <div className="text-[11px] font-bold text-neutral-400 mt-1">Countries &amp; regions represented</div>
              </div>
            </div>

            {/* Advertisement */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <AdsterraNativeBanner />
            </div>

            {/* Browse by level */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-900 mb-3">
                <LayoutGrid size={14} className="text-[#68A108]" /> Browse by Level
              </h3>
              <ul className="space-y-1">
                {LEVEL_CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)}
                      className={`w-full flex items-center justify-between text-left px-2.5 py-2 rounded-lg text-[12px] font-bold transition-colors
                        ${selectedCategory === cat ? 'bg-[#68A108]/10 text-[#68A108]' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                        {categoryCounts[cat]}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Closing soon */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-900 mb-3">
                <Flame size={14} className="text-orange-500" /> Closing Soon
              </h3>
              <ol className="space-y-3">
                {closingSoon.map((s, i) => (
                  <li key={s.id}>
                    <button
                      onClick={() => jumpToCard(s.id)}
                      className="w-full flex items-start gap-2.5 text-left group"
                    >
                      <span className="shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black flex items-center justify-center mt-0.5 group-hover:bg-[#68A108] group-hover:text-white transition-colors">
                        {i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[12px] font-bold text-slate-700 leading-snug group-hover:text-[#68A108] transition-colors truncate">
                          {s.name}
                        </span>
                        <span className="block text-[10.5px] font-semibold text-slate-400 mt-0.5">
                          {s.deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-10">
          Every "Apply" link above goes directly to the official institution or application portal — never a third-party listing. Always confirm current deadlines and terms before applying.
        </p>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          <h2
            className="text-3xl font-black flex items-center grayscale opacity-10 select-none cursor-pointer"
            onClick={onNavigateHome}
          >
            Simplify Feed
            <span className="w-2 h-2 bg-[#333] rounded-full ml-0.5"></span>
          </h2>
          <div className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-20 text-center">
            SYSTEM VERSION 9.1.0 / BUILD 2026 / NEWS PORTAL
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] font-bold text-slate-500">
            <button onClick={() => onNavigateStatic?.('about')} className="hover:text-[#68A108] transition-colors cursor-pointer">About</button>
            <button onClick={() => onNavigateStatic?.('contact')} className="hover:text-[#68A108] transition-colors cursor-pointer">Contact</button>
            <button onClick={() => onNavigateStatic?.('privacy')} className="hover:text-[#68A108] transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => onNavigateStatic?.('terms')} className="hover:text-[#68A108] transition-colors cursor-pointer">Terms of Use</button>
            <a href="/rss.xml" className="hover:text-[#68A108] transition-colors cursor-pointer">RSS</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
