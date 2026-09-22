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

// Date this list was last audited against official sources. Bump it whenever the
// entries below are re-verified - it is shown to visitors as "Updated".
const LAST_UPDATED = 'Sep 22, 2026';

const scholarships: Scholarship[] = [
  {
    "id": "pearson",
    "name": "Lester B. Pearson International Scholarship",
    "sponsor": "University of Toronto",
    "location": "Toronto, Canada",
    "level": "Undergraduate",
    "deadline": "November 6, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/c/c9/Convocation_Hall_in_UofT.jpg",
    "summary": "The University of Toronto's premier award recognizing exceptional international students who demonstrate exceptional academic achievement, creativity, and leadership.",
    "coverage": [
      "Full tuition for four years of undergraduate study",
      "Incidental and laboratory fees fully covered",
      "Full residence support and meal plan for four years",
      "Book allowance and initial arrival stipend"
    ],
    "eligibility": [
      "International applicant requiring a Canadian study permit",
      "Currently in final year of secondary school or graduated no earlier than June 2026",
      "Nominated by applicant secondary school guidance counselor or headmaster",
      "Beginning first undergraduate degree at University of Toronto in 2027"
    ],
    "howToApply": "Obtain an official school nomination through your high school guidance office. Once nominated, complete the University of Toronto undergraduate admission application followed by the personalized Pearson Scholarship online form.",
    "applyUrl": "https://future.utoronto.ca/pearson-scholarships",
    "applyLabel": "Official Pearson Portal",
    "infoUrl": "https://future.utoronto.ca/how-to-apply"
  },
  {
    "id": "rhodes-scholarship-oxford",
    "name": "Rhodes Scholarships at Oxford University",
    "sponsor": "The Rhodes Trust",
    "location": "Oxford, United Kingdom",
    "level": "Masters / PhD / Postgraduate",
    "deadline": "October 7, 2026 (United States) — deadlines vary by constituency; e.g. Canada closes September 24, 2026",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Radcliffe%20Camera%2C%20Oxford%20-%20Oct%202006.jpg?width=1280",
    "summary": "The world's oldest and most prestigious international postgraduate award, enabling outstanding young leaders from around the globe to study at the University of Oxford.",
    "coverage": [
      "Oxford course and college fees",
      "Annual living stipend",
      "Visa and health-surcharge costs",
      "Return flights to and from Oxford"
    ],
    "eligibility": [
      "Eligibility and application rules vary by country / regional constituency",
      "Selection weighs academic excellence, character, leadership and commitment to service",
      "Use the Rhodes Trust's eligibility checker to find your constituency and its timeline"
    ],
    "howToApply": "Use the Rhodes Trust's eligibility checker to identify your constituency, then apply through that constituency's own process and deadline.",
    "applyUrl": "https://www.rhodeshouse.ox.ac.uk/scholarships/applications/",
    "applyLabel": "Apply on Rhodes Trust",
    "infoUrl": "https://www.rhodeshouse.ox.ac.uk/",
    "note": "There is no single global deadline. Some constituencies have already closed (India in July and Pakistan in August 2026), so check yours first."
  },
  {
    "id": "gates-cambridge",
    "name": "Gates Cambridge Scholarships",
    "sponsor": "Bill & Melinda Gates Foundation & University of Cambridge",
    "location": "Cambridge, United Kingdom",
    "level": "Masters / PhD / Postgraduate",
    "deadline": "October 14, 2026 (US citizens resident in the US) — December 8, 2026 or January 6, 2027 for all other applicants, depending on course",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Kings%20College%20Cambridge%20Chapel%20from%20the%20river.jpg?width=1280",
    "summary": "Full-cost awards for outstanding applicants outside the UK to pursue a full-time postgraduate degree in any subject available at the University of Cambridge.",
    "coverage": [
      "University Composition Fee at the appropriate international rate",
      "Maintenance allowance for living costs (rate set annually)",
      "One economy single airfare at both the beginning and end of the course",
      "Visa and Immigration Health Surcharge costs",
      "Discretionary funding for academic development and family allowance"
    ],
    "eligibility": [
      "Citizen of any country outside the United Kingdom",
      "Applying to pursue a full-time residential course of study (PhD, MSc, MLitt, or one-year postgraduate)",
      "Demonstrated intellectual capacity, leadership potential, and commitment to improving others' lives"
    ],
    "howToApply": "Applications reopened in September 2026 for 2027/28 entry. Apply to your Cambridge course through the Graduate Admissions Portal by the deadline for your course, and complete the Gates Cambridge funding section.",
    "applyUrl": "https://www.gatescambridge.org/apply/",
    "applyLabel": "Gates Cambridge Portal",
    "infoUrl": "https://www.postgraduate.study.cam.ac.uk/"
  },
  {
    "id": "chevening-scholarships",
    "name": "Chevening Scholarships UK",
    "sponsor": "Foreign, Commonwealth & Development Office (FCDO)",
    "location": "United Kingdom (Any University)",
    "level": "Masters",
    "deadline": "October 6, 2026 (11:00 UTC)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Palace%20of%20Westminster%2C%20London%20-%20Feb%202007.jpg?width=1280",
    "summary": "The UK government's global scholarship programme, funded by the FCDO and partner organizations, offering full financial support to study for any eligible master's degree at any UK university.",
    "coverage": [
      "Full university tuition fees for a one-year Master's degree",
      "Monthly living stipend set to standard UK regional student rates",
      "Economy travel to and from the UK via approved routes",
      "Arrival allowance, departure allowance, and visa application fee contribution",
      "Access to exclusive Chevening networking events, trips, and cultural experiences"
    ],
    "eligibility": [
      "Citizen of a Chevening-eligible country or territory",
      "Undergraduate degree equivalent to an upper second-class 2:1 honours degree in the UK",
      "Minimum of two years (equivalent to 2,800 hours) of demonstrable work experience",
      "Commitment to return to home country for a minimum of two years after award ends"
    ],
    "howToApply": "Submit your application through the official Chevening online application system (e-Chevening). Choose three eligible Master's courses across UK institutions.",
    "applyUrl": "https://www.chevening.org/apply/",
    "applyLabel": "Official Chevening Portal",
    "infoUrl": "https://www.chevening.org/scholarships/",
    "note": "Applications opened on August 4, 2026. The closing time is in UTC, so check the equivalent time in your country."
  },
  {
    "id": "eth-zurich-excellence",
    "name": "ETH Zurich Excellence Scholarship & Opportunity Programme (ESOP)",
    "sponsor": "ETH Zurich",
    "location": "Zurich, Switzerland",
    "level": "Masters",
    "deadline": "November 30, 2026",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/ETH%20Zurich%2C%20Main%20building.jpg?width=1280",
    "summary": "Supports students with outstanding academic records who wish to pursue their Master's degree at ETH Zurich, one of the world's premier science and technology universities.",
    "coverage": [
      "Living and study allowance of CHF 12,000 per semester (CHF 24,000 per academic year)",
      "Full tuition fee waiver for the entire duration of the Master's degree",
      "Dedicated faculty mentorship and invitation to the ETH Foundation network"
    ],
    "eligibility": [
      "Outstanding academic results in undergraduate Bachelor studies (top 10% of class)",
      "Applying for a regular Master of Science program at ETH Zurich",
      "Submission of a pre-proposal for the prospective Master's thesis"
    ],
    "howToApply": "Apply online via the ETH Zurich eApply admissions portal during the autumn application window, selecting the ESOP scholarship option.",
    "applyUrl": "https://ethz.ch/students/en/studies/financial/scholarships/excellencescholarship.html",
    "applyLabel": "ETH Zurich ESOP Portal",
    "infoUrl": "https://ethz.ch/en.html"
  },
  {
    "id": "knight-hennessy-scholars",
    "name": "Knight-Hennessy Scholars at Stanford University",
    "sponsor": "Stanford University",
    "location": "Stanford, California, USA",
    "level": "Masters / PhD / Postgraduate / Fellowship / Training",
    "deadline": "October 6, 2026, 1:00 pm Pacific Time (submit your Stanford graduate application by its own deadline or December 1, 2026, whichever comes first)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Stanford%20Oval%20May%202011%20panorama.jpg?width=1280",
    "summary": "A multidisciplinary scholarship program that prepares a community of emerging global leaders to address complex challenges through graduate education across all seven schools at Stanford.",
    "coverage": [
      "Full tuition and associated fees for up to three years of graduate study",
      "Stipend for living and academic expenses (such as room, board, books, and health insurance)",
      "Annual round-trip airfare to and from Stanford",
      "Leadership development programming through the King Global Leadership Program"
    ],
    "eligibility": [
      "Open to citizens of all countries worldwide",
      "Earned first bachelor's degree within the past seven years",
      "Applying concurrently to any full-time Stanford graduate degree program (JD, MA, MBA, MD, MS, DMA, or PhD)"
    ],
    "howToApply": "Submit an online application to Knight-Hennessy Scholars including essays, video statement, resume, and recommendations, and separately submit your Stanford graduate degree application.",
    "applyUrl": "https://knight-hennessy.stanford.edu/admission/planning-apply",
    "applyLabel": "Knight-Hennessy Portal",
    "infoUrl": "https://knight-hennessy.stanford.edu/"
  },
  {
    "id": "erasmus-mundus-joint-masters",
    "name": "Erasmus Mundus Joint Masters Scholarships (EMJM)",
    "sponsor": "European Commission (European Union)",
    "location": "Multiple European & International Partner Universities",
    "level": "Masters",
    "deadline": "Varies by programme — confirmed 2027 deadlines include December 1, 2026, January 7, 2027 and February 1, 2027",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Europe.svg?width=960",
    "summary": "High-level integrated study programmes designed and delivered by an international partnership of higher education institutions across Europe and beyond.",
    "coverage": [
      "100% tuition fee waiver and participation cost coverage",
      "Monthly subsistence allowance of €1,400 for up to 24 months",
      "Comprehensive worldwide health and accident insurance coverage",
      "Full travel and visa relocation allowances"
    ],
    "eligibility": [
      "Students who have obtained a first higher education degree (Bachelor or equivalent)",
      "Open to applicants from any country in the world",
      "Fulfill the specific academic criteria set by the chosen EMJM consortium"
    ],
    "howToApply": "Browse the official Erasmus Mundus Catalogue (EMJM Catalogue), select your preferred Master's programme, and apply directly via the specific consortium's web portal.",
    "applyUrl": "https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters",
    "applyLabel": "EU Erasmus Mundus Catalogue",
    "infoUrl": "https://ec.europa.eu/",
    "note": "There is no single deadline. Each consortium runs its own admissions process, so check the individual programme website."
  },
  {
    "id": "swiss-government-excellence",
    "name": "Swiss Government Excellence Scholarships for Foreign Scholars",
    "sponsor": "Federal Commission for Scholarships for Foreign Students (FCS)",
    "location": "All Swiss Cantonal Universities & Federal Institutes (ETH & EPFL), Switzerland",
    "level": "PhD / Postgraduate / Fellowship / Training",
    "deadline": "Varies by country — applications opened in August 2026; confirm your country’s deadline with the Swiss embassy or the official list",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Switzerland_%28Pantone%29.svg?width=960",
    "summary": "Awarded by the Swiss government to promote international exchange and research cooperation between Switzerland and over 180 other countries.",
    "coverage": [
      "Monthly scholarship stipend of CHF 1,920 for PhD/research and CHF 3,500 for postdoctoral fellows",
      "Mandatory Swiss health insurance premiums fully paid",
      "Flight allowance for return airfare to country of origin",
      "Housing allowance of CHF 300 paid once at the beginning of the scholarship",
      "Public transportation pass (half-fare card) valid across Swiss rail networks"
    ],
    "eligibility": [
      "Postgraduate researchers with a Master's degree or PhD wishing to undertake doctoral or post-doc research in Switzerland",
      "Written confirmation from an academic supervisor at a Swiss university accepting the candidate",
      "Detailed research proposal and strong academic letters of reference"
    ],
    "howToApply": "Contact the Swiss embassy in your country of origin to verify the national deadline and receive the official application package.",
    "applyUrl": "https://www.sbfi.admin.ch/en/swiss-government-excellence-scholarships",
    "applyLabel": "Swiss Federal Portal",
    "infoUrl": "https://www.eda.admin.ch/"
  },
  {
    "id": "eiffel-excellence-scholarship",
    "name": "France Excellence Eiffel Scholarship Programme",
    "sponsor": "Campus France & French Ministry for Europe and Foreign Affairs",
    "location": "French Universities & Grandes Écoles, France",
    "level": "Masters / PhD / Postgraduate",
    "deadline": "January 8, 2027 (French universities set earlier internal nomination deadlines, typically October–November 2026)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_France.svg?width=960",
    "summary": "Established by the French Ministry to enable French higher education institutions to attract top foreign students for master's and doctoral degree programs.",
    "coverage": [
      "Monthly living allowance (Master's and doctoral rates set by Campus France)",
      "International round-trip airfare and internal French transit",
      "French social security coverage and supplementary health insurance",
      "Assistance in finding student accommodation"
    ],
    "eligibility": [
      "Foreign nationality candidates up to 27 years old (Master's) or 32 years old (PhD)",
      "Fields of study: Science & Tech, Economics & Management, Law, and Political Science",
      "Direct application by the student is not permitted: must be nominated by a French institution"
    ],
    "howToApply": "Apply for admission to a French university or Grande École and express interest in the Eiffel scholarship. The French institution submits the dossier on your behalf to Campus France.",
    "applyUrl": "https://www.campusfrance.org/en/france-excellence-eiffel-scholarship-program",
    "applyLabel": "Campus France Portal",
    "infoUrl": "https://www.diplomatie.gouv.fr/",
    "note": "You cannot apply directly: a French institution must nominate you, so contact universities in September–October 2026."
  },
  {
    "id": "singa-singapore-award",
    "name": "Singapore International Graduate Award (SINGA)",
    "sponsor": "A*STAR, NTU, NUS & SUTD",
    "location": "Singapore",
    "level": "PhD / Postgraduate",
    "deadline": "December 1, 2026",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Singapore.svg?width=960",
    "summary": "A collaboration between A*STAR, NTU, NUS, and SUTD providing PhD training in biomedical sciences, computing, physical sciences, and engineering.",
    "coverage": [
      "Full tuition fees for up to 4 years of PhD studies",
      "Monthly stipend of SGD 2,700, increasing to SGD 3,200 after qualifying examination",
      "One-time airfare grant of up to SGD 1,500",
      "One-time settling-in allowance of SGD 1,000"
    ],
    "eligibility": [
      "Open to all international graduates with a passion for research and excellent academic results",
      "Good reports from academic referees and strong command of spoken and written English",
      "Candidates should hold or be on track to obtain a Bachelor's or Master's degree"
    ],
    "howToApply": "Explore research projects on the A*STAR website, choose a research focus, and submit your application online through the official SINGA application portal.",
    "applyUrl": "https://www.a-star.edu.sg/Scholarships/for-graduate-studies/singapore-international-graduate-award-singa",
    "applyLabel": "Apply on SINGA Portal",
    "infoUrl": "https://www.a-star.edu.sg/"
  },
  {
    "id": "commonwealth-masters-phd",
    "name": "Commonwealth Master's & PhD Scholarships",
    "sponsor": "Commonwealth Scholarship Commission in the UK (CSC) & FCDO",
    "location": "United Kingdom Universities",
    "level": "Masters / PhD / Postgraduate",
    "deadline": "October 20, 2026, 4:00 pm BST (applications opened September 8, 2026)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_the_United_Kingdom.svg?width=960",
    "summary": "Funded by the UK FCDO, enabling talented and motivated individuals from low and middle income Commonwealth countries to gain the skills needed for sustainable development.",
    "coverage": [
      "Approved airfare from your home country to the UK and return",
      "Full tuition fees paid directly to the host university",
      "Monthly living allowance (higher rate in London)",
      "Warm clothing, study travel grant, and family allowances where eligible"
    ],
    "eligibility": [
      "Citizen of or granted refugee status by an eligible Commonwealth country",
      "Hold a first degree of at least upper second class (2:1) honours standard",
      "Unable to afford to study in the UK without this scholarship"
    ],
    "howToApply": "You cannot apply directly to the CSC. You must be nominated by your country’s National Nominating Agency or an approved organisation, then apply through the CSC online system (CSC Central). Nominating agencies often set earlier deadlines.",
    "applyUrl": "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/",
    "applyLabel": "CSC UK Commonwealth Portal",
    "infoUrl": "https://cscuk.fcdo.gov.uk/"
  },
  {
    "id": "turkiye-burslari",
    "name": "Türkiye Scholarships (Türkiye Bursları)",
    "sponsor": "Presidency for Turks Abroad and Related Communities (YTB)",
    "location": "Top Universities Across Turkey",
    "level": "Undergraduate / Masters / PhD / Postgraduate",
    "deadline": "February 20, 2027 (application window January 10 – February 20, 2027)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Turkey.svg?width=960",
    "summary": "A government-funded competitive scholarship program awarded to outstanding students and researchers to pursue full-time degree studies in Turkey.",
    "coverage": [
      "University placement and full tuition fees",
      "Monthly stipend (rates set by Türkiye Scholarships)",
      "University dormitory accommodation",
      "One-year Turkish language course before academic studies",
      "Return flight ticket and health insurance"
    ],
    "eligibility": [
      "Citizens of all countries except Turkish citizens",
      "Minimum academic criteria: 70% for undergraduate, 75% for Master's/PhD, 90% for health sciences",
      "Under age 21 for Bachelor's, under 30 for Master's, and under 35 for PhD"
    ],
    "howToApply": "Open an account on the Türkiye Scholarships Application System (TBBS), upload documents, select university departments, and submit before the February deadline.",
    "applyUrl": "https://www.turkiyeburslari.gov.tr/",
    "applyLabel": "Türkiye Bursları Portal",
    "infoUrl": "https://www.turkiyeburslari.gov.tr/en"
  },
  {
    "id": "kaust-fellowship",
    "name": "KAUST Fellowship for Graduate Studies",
    "sponsor": "King Abdullah University of Science and Technology",
    "location": "Thuwal, Saudi Arabia",
    "level": "Masters / PhD / Postgraduate",
    "deadline": "January 3, 2027 (August 2027 intake for MS, MS/PhD and PhD) — the January 2027 PhD intake closes September 27",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Saudi_Arabia.svg?width=960",
    "summary": "A premier award supporting all admitted Master's and PhD students at KAUST, providing comprehensive funding in advanced scientific and engineering research.",
    "coverage": [
      "Full tuition support for MS and PhD programs",
      "Monthly living allowance",
      "On-campus housing",
      "Medical and dental insurance",
      "Relocation allowance and annual round-trip flights"
    ],
    "eligibility": [
      "Applicants with a Bachelor's or Master's degree in STEM fields",
      "Minimum TOEFL iBT score of 79 or IELTS of 6.5",
      "Strong quantitative aptitude and dedication to cutting-edge research"
    ],
    "howToApply": "Submit an online application for admission to KAUST graduate studies; every accepted student is automatically awarded the full KAUST Fellowship.",
    "applyUrl": "https://www.kaust.edu.sa/en/study/admissions",
    "applyLabel": "KAUST Admissions Portal",
    "infoUrl": "https://www.kaust.edu.sa/"
  },
  {
    "id": "clarendon-fund-oxford",
    "name": "Clarendon Fund Scholarships at Oxford",
    "sponsor": "Oxford University Press & University of Oxford",
    "location": "Oxford, United Kingdom",
    "level": "Masters / PhD / Postgraduate",
    "deadline": "January 8, 2027 (some courses have an earlier December 2026 deadline; check your course page)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Radcliffe%20Camera%2C%20Oxford%20-%20Oct%202006.jpg?width=1280",
    "summary": "Oxford's largest graduate scholarship scheme, offering around 140 fully-funded awards each year to outstanding graduate scholars from all around the world.",
    "coverage": [
      "Full coverage of Oxford course tuition and college fees",
      "Annual grant for living expenses",
      "Access to Clarendon Scholars’ Council events and networking"
    ],
    "eligibility": [
      "Applicants from all nations applying for a new full-time or part-time Master's or DPhil (PhD) course at Oxford",
      "Selection based purely on outstanding academic merit and potential"
    ],
    "howToApply": "Simply apply for graduate study at Oxford by the relevant December or January deadline for your course; all eligible applicants are automatically considered.",
    "applyUrl": "https://www.ox.ac.uk/clarendon",
    "applyLabel": "Clarendon Fund Page",
    "infoUrl": "https://www.ox.ac.uk/admissions/graduate"
  },
  {
    "id": "weidenfeld-hoffmann-trust",
    "name": "Weidenfeld-Hoffmann Scholarships and Leadership Programme",
    "sponsor": "Weidenfeld-Hoffmann Trust & University of Oxford",
    "location": "Oxford, United Kingdom",
    "level": "Masters",
    "deadline": "January 8, 2027 (some courses have an earlier December 2026 deadline; check your course page)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Radcliffe%20Camera%2C%20Oxford%20-%20Oct%202006.jpg?width=1280",
    "summary": "Cultivates the leaders of tomorrow by providing outstanding university graduates from emerging economies with full funding and comprehensive leadership training.",
    "coverage": [
      "100% of Oxford tuition and college fees",
      "Living stipend to cover accommodation and meals",
      "Leadership Programme with professional skills seminars and retreats"
    ],
    "eligibility": [
      "Applying to an eligible Master's course at Oxford in business, policy, environmental change, or law",
      "National of an eligible country in Eastern Europe, Central Asia, South Asia, Middle East, Africa, or Latin America",
      "Intention to return to home country to serve public life upon graduation"
    ],
    "howToApply": "Tick the Weidenfeld-Hoffmann box in the Funding section of Oxford's graduate application form and upload the required Weidenfeld-Hoffmann questionnaire.",
    "applyUrl": "https://www.ox.ac.uk/admissions/graduate/fees-and-funding/fees-funding-and-scholarship-search/weidenfeld-hoffmann-scholarships-and-leadership-programme",
    "applyLabel": "Oxford Weidenfeld Portal",
    "infoUrl": "https://whtrust.org/"
  },
  {
    "id": "nl-scholarship-netherlands",
    "name": "NL Scholarship (Formerly Holland Scholarship)",
    "sponsor": "Dutch Ministry of Education, Culture and Science",
    "location": "Participating Research Universities, Netherlands",
    "level": "Undergraduate / Masters",
    "deadline": "February 1, 2027 or May 1, 2027, depending on the institution",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_the_Netherlands.svg?width=960",
    "summary": "Financed by the Dutch Ministry of Education, Culture and Science to support international students from outside the EEA wishing to pursue a Bachelor's or Master's in the Netherlands.",
    "coverage": [
      "Scholarship grant of €5,000, €10,000 or €15,000 awarded in the first year of study",
      "Contribution towards tuition costs and living expenditure in Dutch student cities"
    ],
    "eligibility": [
      "Nationality is non-EEA",
      "Applying for a full-time Bachelor's or Master's at a participating Dutch higher education institution",
      "Have not previously studied in the Netherlands"
    ],
    "howToApply": "Apply directly for an eligible programme at your chosen participating Dutch university, and submit the NL scholarship application form via the university portal.",
    "applyUrl": "https://www.studyinnl.org/finances/nl-scholarship",
    "applyLabel": "Study in NL Portal",
    "infoUrl": "https://www.studyinnl.org/",
    "note": "There is no single national deadline. Each participating Dutch institution sets its own, so check the institution’s website."
  },
  {
    "id": "yenching-academy-fellowship",
    "name": "Yenching Academy Fellowship at Peking University",
    "sponsor": "Peking University",
    "location": "Beijing, China",
    "level": "Masters / Fellowship / Training",
    "deadline": "November 30, 2026 (9:00 am Beijing time; applications opened September 1, 2026)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_the_People%27s_Republic_of_China.svg?width=960",
    "summary": "A fully funded master's program in China Studies designed to cultivate students who will serve as bridges between China and the rest of the world.",
    "coverage": [
      "Tuition coverage for the Master of China Studies program",
      "Accommodation on the Peking University campus",
      "Monthly living stipend",
      "Round-trip travel stipend between your home country and Beijing",
      "Field study trips across China"
    ],
    "eligibility": [
      "Minimum of a Bachelor's degree in any field, awarded no later than August 31 of enrollment year",
      "Outstanding academic record, strong English proficiency, and intercultural readiness",
      "Record of extracurricular leadership, community engagement, and social responsibility"
    ],
    "howToApply": "Submit an online application via the Yenching Academy Admissions Portal with transcripts, personal statement, study plan, CV, and two academic recommendation letters.",
    "applyUrl": "https://yenchingacademy.pku.edu.cn/ADMISSIONS.htm",
    "applyLabel": "Yenching Admissions Page",
    "infoUrl": "https://yenchingacademy.pku.edu.cn/",
    "note": "Students and alumni of Partner Universities must go through their home university’s internal pre-selection before applying."
  },
  {
    "id": "adb-japan-scholarship",
    "name": "Asian Development Bank–Japan Scholarship Program (ADB-JSP)",
    "sponsor": "Asian Development Bank & Government of Japan",
    "location": "Designated Institutions in Asia & Pacific (Japan, Singapore, Australia, etc.)",
    "level": "Masters",
    "deadline": "November 5, 2026 (e.g. Ritsumeikan APU) — deadlines vary by host institution; University of Tokyo: December 10, 2026",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Shinjuku%20skyline%2C%20Tokyo%20-%20Sony%20A7R%20(11831328835).jpg?width=1280",
    "summary": "Aims to provide an opportunity for well-qualified citizens of ADB developing member countries to undertake postgraduate studies in economics, business, science, and technology.",
    "coverage": [
      "Full tuition fees and admission charges",
      "Monthly subsistence and housing allowance",
      "Allowance for books and instructional materials",
      "Medical insurance coverage and round-trip economy airfare"
    ],
    "eligibility": [
      "National of an ADB borrowing member country under 35 years old",
      "Bachelor's degree with superior academic record and at least 2 years of professional work experience",
      "Commitment to return and contribute to home country development for at least two years"
    ],
    "howToApply": "Send your application for admission and the ADB-JSP scholarship form directly to the designated academic institution of your choice.",
    "applyUrl": "https://www.adb.org/work-with-us/careers/japan-scholarship-program",
    "applyLabel": "ADB-JSP Official Page",
    "infoUrl": "https://www.adb.org/",
    "note": "Each host university sets its own ADB-JSP deadline, so confirm with the institution you plan to attend."
  },
  {
    "id": "skoll-scholarship-oxford",
    "name": "Skoll Scholarship for MBA at Saïd Business School",
    "sponsor": "Skoll Centre for Social Entrepreneurship, University of Oxford",
    "location": "Oxford, United Kingdom",
    "level": "Masters",
    "deadline": "January 6, 2027 (final MBA application stage) — earlier stages close September 2, October 5 and November 4, 2026",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Radcliffe%20Camera%2C%20Oxford%20-%20Oct%202006.jpg?width=1280",
    "summary": "A competitive scholarship for incoming MBA students who pursue entrepreneurial solutions for urgent social and environmental challenges.",
    "coverage": [
      "Full funding for Oxford 1-year MBA tuition and college fees",
      "Essential living stipend grant up to £17,500",
      "Lifetime membership in the global community of Skoll social entrepreneurs"
    ],
    "eligibility": [
      "Candidates who have started or led an entrepreneurial social venture for at least 3 years",
      "Demonstrated impact addressing a societal or environmental issue",
      "Must receive an offer of admission to the Oxford Saïd MBA programme"
    ],
    "howToApply": "Apply to the Oxford MBA at Saïd Business School in any of Stages 1 to 4 and upload your responses to the Skoll Scholarship essay questions as part of the MBA application.",
    "applyUrl": "https://www.sbs.ox.ac.uk/oxford-experience/scholarships-and-funding/skoll-scholarship",
    "applyLabel": "Saïd Skoll Portal",
    "infoUrl": "https://www.skollcentre.org/"
  },
  {
    "id": "beit-trust-scholarships",
    "name": "Beit Trust Postgraduate Scholarships",
    "sponsor": "The Beit Trust",
    "location": "Universities in the UK & South Africa",
    "level": "Masters",
    "deadline": "February 12, 2027 (applications open December 1, 2026)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_the_United_Kingdom.svg?width=960",
    "summary": "Awarded to graduates who are nationals of Zambia, Zimbabwe, or Malawi for Master's degrees at partner universities in the United Kingdom or South Africa.",
    "coverage": [
      "Fees, tuition, and college costs paid in full",
      "Personal allowance stipend calculated to cover accommodation and meals comfortably",
      "Return economy flight tickets and baggage allowance",
      "Laptop computer allowance and settling-in grant"
    ],
    "eligibility": [
      "Nationals of Zambia, Zimbabwe, or Malawi under the age of 30 (or 35 for medical doctors)",
      "Hold a degree of at least Upper Second Class (2:1)",
      "Demonstrated intention to return home to benefit their native country"
    ],
    "howToApply": "Download the application form from the Beit Trust website, complete it with academic transcripts and references, and submit by email before the deadline.",
    "applyUrl": "https://beittrust.org.uk/beit-trust-scholarships/",
    "applyLabel": "Beit Trust Portal",
    "infoUrl": "https://beittrust.org.uk/"
  },
  {
    "id": "aga-khan-foundation-isp",
    "name": "Aga Khan Foundation International Scholarship Programme (AKF ISP)",
    "sponsor": "Aga Khan Development Network (AKDN)",
    "location": "Leading Universities Globally",
    "level": "Masters / PhD / Postgraduate",
    "deadline": "March 31, 2027 (2027–28 applications expected to open January 1, 2027)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Aga%20Khan%20Museum%20in%20Toronto-%20Exterior.jpg?width=1280",
    "summary": "Supports outstanding students from developing countries who have no other means of financing their postgraduate education to build future leaders.",
    "coverage": [
      "Tuition and living expenses funded as a 50% grant and 50% loan",
      "Annual review and renewal for the duration of the course",
      "Repayment of the loan portion begins after graduation"
    ],
    "eligibility": [
      "Nationals of developing countries where AKF has existing offices",
      "Consistently excellent academic records and genuine financial need",
      "Under 30 years of age (priority given to young scholars)"
    ],
    "howToApply": "Contact the local Aga Khan Foundation office or Aga Khan Education Board in your country of current residence to obtain application forms.",
    "applyUrl": "https://www.akdn.org/our-agencies/aga-khan-foundation/international-scholarship-programme",
    "applyLabel": "AKDN Scholarship Page",
    "infoUrl": "https://www.akdn.org/"
  },
  {
    "id": "peo-international-peace-scholarship",
    "name": "P.E.O. International Peace Scholarship (IPS)",
    "sponsor": "P.E.O. International",
    "location": "United States & Canada",
    "level": "Masters / PhD / Postgraduate",
    "deadline": "December 15, 2026",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_the_United_States.svg?width=960",
    "summary": "Provides educational grants for women from other countries to pursue full-time graduate study in the United States and Canada.",
    "coverage": [
      "Maximum scholarship award of $12,500 USD per academic year",
      "Renewable for up to two additional years of graduate study"
    ],
    "eligibility": [
      "Female citizen of a country other than the United States or Canada",
      "Admitted to full-time graduate study at an accredited college or university in the US or Canada",
      "Promise to return to home country to utilize education to foster world peace"
    ],
    "howToApply": "Submit the electronic Eligibility Form between September 15 and December 15, 2026. If confirmed eligible, submit the full online application by March 2027.",
    "applyUrl": "https://www.peointernational.org/educational-support/international-peace-scholarship-fund/",
    "applyLabel": "P.E.O. IPS Portal",
    "infoUrl": "https://www.peointernational.org/"
  },
  {
    "id": "humboldt-research-fellowship",
    "name": "Alexander von Humboldt Research Fellowships",
    "sponsor": "Alexander von Humboldt Foundation",
    "location": "German Universities & Research Institutes, Germany",
    "level": "Postgraduate / Fellowship / Training",
    "deadline": "Rolling — no fixed deadline; selection committees meet in March, July and November",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Germany.svg?width=960",
    "summary": "Enables excellent post-doctoral and experienced scientists and scholars of all nationalities and disciplines to conduct research in Germany.",
    "coverage": [
      "Monthly fellowship payments for 6–24 months of research in Germany",
      "Travel expenses, language course subsidies, and family allowances",
      "Access to the Humboldt alumni network"
    ],
    "eligibility": [
      "Completed your first doctorate within the past four years",
      "International publications and a research proposal that can be carried out in Germany",
      "A host at a research institution in Germany"
    ],
    "howToApply": "Apply online to the Humboldt Foundation with your research plan, host agreement and references. Applications can be submitted at any time and are reviewed at the next selection committee meeting.",
    "applyUrl": "https://www.humboldt-foundation.de/en/apply/sponsorship-programmes/humboldt-research-fellowship",
    "applyLabel": "Humboldt Portal",
    "infoUrl": "https://www.humboldt-foundation.de/"
  },
  {
    "id": "manaaki-nz-scholarships",
    "name": "Manaaki New Zealand Scholarships",
    "sponsor": "Ministry of Foreign Affairs and Trade (MFAT), New Zealand",
    "location": "Universities in New Zealand & Pacific Islands",
    "level": "Undergraduate / Masters / PhD / Postgraduate",
    "deadline": "April 10, 2027 (applications open March 1, 2027)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_New_Zealand.svg?width=960",
    "summary": "Government-funded scholarships for international students from eligible developing countries to study in New Zealand and build lasting global relationships.",
    "coverage": [
      "Full tuition fees for the duration of the qualification",
      "Weekly living allowance",
      "Establishment allowance and medical and travel insurance",
      "Return economy airfare and a reintegration allowance"
    ],
    "eligibility": [
      "Citizen of an eligible partner country in the Pacific, Asia, Africa, or Latin America",
      "Minimum age of 18 at start of study",
      "Fulfill academic and English language requirements of chosen institution",
      "Committed to returning to home country for at least two years after study"
    ],
    "howToApply": "Check country eligibility using the online eligibility questionnaire on the MFAT portal, then submit the electronic application form.",
    "applyUrl": "https://www.nzscholarships.govt.nz/",
    "applyLabel": "Manaaki NZ Portal",
    "infoUrl": "https://www.mfat.govt.nz/"
  },
  {
    "id": "hong-kong-phd-fellowship-scheme",
    "name": "Hong Kong PhD Fellowship Scheme (HKPFS) 2027/28",
    "sponsor": "Research Grants Council (RGC), Hong Kong",
    "location": "Hong Kong",
    "level": "PhD / Postgraduate",
    "deadline": "December 1, 2026 (12:00 noon Hong Kong time for the HKPFS form; full PhD application by 11:59 pm)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Hong%20Kong%20Skyline%20Restitch%20-%20Dec%202007.jpg?width=1280",
    "summary": "A fellowship for outstanding students of any nationality starting a full-time PhD at one of Hong Kong’s participating universities. 400 fellowships are available for 2027/28.",
    "coverage": [
      "Annual stipend of HK$344,400 (2026/27 rate, about US$44,000) for up to three years",
      "Annual conference and research-related travel allowance of HK$14,400"
    ],
    "eligibility": [
      "New full-time PhD students at one of the participating Hong Kong universities",
      "Open to applicants from all countries and regions",
      "You must also submit a PhD admission application to the university you choose"
    ],
    "howToApply": "Apply online for an HKPFS reference number (applications run September 1 – December 1, 2026), then submit your full PhD admission application to your chosen university by the deadline.",
    "applyUrl": "https://www.ugc.edu.hk/eng/rgc/funding_opport/hkpfs/",
    "applyLabel": "Official HKPFS Page",
    "note": "Stipend rates shown are for the 2026/27 academic year and are reviewed annually."
  },
  {
    "id": "reach-oxford-scholarship",
    "name": "Reach Oxford Scholarship",
    "sponsor": "University of Oxford",
    "location": "Oxford, United Kingdom",
    "level": "Undergraduate",
    "deadline": "October 15, 2026 (Oxford undergraduate application) — scholarship application by January 26, 2027 (12 noon UK time)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Radcliffe%20Camera%2C%20Oxford%20-%20Oct%202006.jpg?width=1280",
    "summary": "Oxford's scholarship for undergraduate students from lower-income countries. You must apply for admission to Oxford first before you can be considered.",
    "coverage": [
      "Support with course and college fees and living costs — see the Reach Oxford page for the current package"
    ],
    "eligibility": [
      "Applying for a 2027-entry undergraduate course at Oxford (application deadline October 15, 2026)",
      "Must apply for admission before being considered for the scholarship",
      "Country eligibility criteria apply — check the official page"
    ],
    "howToApply": "Submit your Oxford undergraduate application by October 15, 2026, then complete the Reach Oxford scholarship application by January 26, 2027.",
    "applyUrl": "https://www.ox.ac.uk/admissions/undergraduate/fees-and-funding/oxford-bursaries-and-scholarships/reach-oxford",
    "applyLabel": "Official Reach Oxford Page",
    "note": "Applicants are told the outcome by the end of May 2027, with selection in April."
  },
  {
    "id": "cambridge-trust-scholarships",
    "name": "Cambridge Trust Scholarships",
    "sponsor": "The Cambridge Trust & University of Cambridge",
    "location": "Cambridge, United Kingdom",
    "level": "Masters / PhD / Postgraduate",
    "deadline": "December 8, 2026 or January 6, 2027 (depending on your Cambridge course funding deadline)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Kings%20College%20Cambridge%20Chapel%20from%20the%20river.jpg?width=1280",
    "summary": "Scholarships for international students admitted to postgraduate study at the University of Cambridge. The Trust makes awards on a rolling basis from mid-February to the end of July.",
    "coverage": [
      "Awards vary by scholarship — the Cambridge Trust's scholarship search lists the full range and what each covers"
    ],
    "eligibility": [
      "Submit your Cambridge admission application by the funding deadline for your course",
      "Indicate in your application that you wish to be considered for funding",
      "Hold a conditional offer of admission"
    ],
    "howToApply": "Apply to your Cambridge course by the funding deadline shown on its course page (December 8, 2026 or January 6, 2027) and indicate that you want to be considered for funding.",
    "applyUrl": "https://www.cambridgetrust.org/scholarships",
    "applyLabel": "Cambridge Trust Scholarships"
  },
  {
    "id": "epfl-master-excellence-fellowships",
    "name": "EPFL Master Excellence Fellowships",
    "sponsor": "École Polytechnique Fédérale de Lausanne (EPFL)",
    "location": "Lausanne, Switzerland",
    "level": "Masters",
    "deadline": "December 15, 2026 (first round, external candidates) — second round March 31, 2027",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/EPFL%20Rolex%20Learning%20Center.jpg?width=1280",
    "summary": "Fellowships for the most deserving applicants to EPFL's master's programs, based on academic excellence, qualifications, and motivation.",
    "coverage": [
      "CHF 10,000 per semester for up to four semesters",
      "A reserved room in a student residence"
    ],
    "eligibility": [
      "Anyone applying to a master’s program at EPFL is eligible",
      "Selection is competitive and based on academic excellence and motivation"
    ],
    "howToApply": "Apply to an EPFL master’s program through the online application and tick the box to be considered for an excellence fellowship. For the first round, recommendation letters are due by January 31.",
    "applyUrl": "https://www.epfl.ch/education/master/master-excellence-fellowships/how-to-apply/",
    "applyLabel": "Official Application Page"
  },
  {
    "id": "paul-daisy-soros-fellowships",
    "name": "Paul & Daisy Soros Fellowships for New Americans (2027)",
    "sponsor": "Paul & Daisy Soros Fellowships for New Americans",
    "location": "United States",
    "level": "Masters / PhD / Postgraduate / Fellowship / Training",
    "deadline": "October 29, 2026, 2:00 pm ET",
    "image": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    "summary": "A graduate-school fellowship for immigrants and children of immigrants pursuing graduate study in the United States. 30 Fellows are selected each year.",
    "coverage": [
      "Up to $90,000 in funding toward graduate study, as reported for the 2027 competition"
    ],
    "eligibility": [
      "Must be a “New American”: an immigrant or child of immigrants, as defined on the Fellowship’s eligibility page",
      "A minimum of three recommendations must be submitted by the deadline"
    ],
    "howToApply": "Submit the 2027 application online by 2:00 pm ET on October 29, 2026. Finalists (77) are interviewed virtually in late January and early February 2027, and 30 Fellows are notified in March 2027.",
    "applyUrl": "https://pdsoros.org/application-process/",
    "applyLabel": "Application Process",
    "note": "No exceptions are made to the 2:00 pm ET deadline. Open to eligible New Americans only."
  },
  {
    "id": "marshall-scholarship-2027",
    "name": "Marshall Scholarship (2027 Competition)",
    "sponsor": "Marshall Aid Commemoration Commission",
    "location": "United Kingdom",
    "level": "Masters / PhD / Postgraduate",
    "deadline": "September 29, 2026 (5:00 pm in the time zone of your endorsing institution)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Palace%20of%20Westminster%2C%20London%20-%20Feb%202007.jpg?width=1280",
    "summary": "A fully funded graduate scholarship for U.S. citizens to pursue one to three years of postgraduate study at any UK university. Up to 50 scholarships are awarded each year.",
    "coverage": [
      "University tuition and fees",
      "Living stipend and an annual book grant",
      "Thesis grant, research and daily travel grants",
      "Return flights between the US and UK, and a dependent spouse allowance where applicable"
    ],
    "eligibility": [
      "U.S. citizens with a first degree from an accredited four-year U.S. college or university",
      "A minimum GPA of 3.7",
      "Graduated after April 2024"
    ],
    "howToApply": "You cannot apply directly: institutional endorsement is required, so contact your undergraduate institution as soon as possible.",
    "applyUrl": "https://www.marshallscholarship.org/apply/",
    "applyLabel": "How to Apply",
    "note": "Open to U.S. citizens only. Campus deadlines are usually earlier than the national deadline."
  },
  {
    "id": "fulbright-us-student-program-2027",
    "name": "Fulbright U.S. Student Program (2027–2028)",
    "sponsor": "U.S. Department of State (Fulbright Program)",
    "location": "Worldwide (host country of your choice)",
    "level": "Masters / PhD / Postgraduate / Fellowship / Training",
    "deadline": "October 6, 2026, 5:00 pm ET (campus deadlines are typically 4–6 weeks earlier)",
    "image": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    "summary": "Grants for U.S. citizens to study, conduct research, or teach English abroad for an academic year.",
    "coverage": [
      "Grant terms vary by host country and award type — see the program site for details"
    ],
    "eligibility": [
      "U.S. citizens or nationals at the time of the application deadline (permanent residents are not eligible)",
      "A conferred bachelor’s degree or equivalent before the start of the grant period"
    ],
    "howToApply": "Apply through the Fulbright online application. Confirm your campus deadline with your Fulbright Program Adviser.",
    "applyUrl": "https://us.fulbrightonline.org/",
    "applyLabel": "Official Fulbright U.S. Student Program",
    "note": "Open to U.S. citizens only. The 2027–2028 competition is open now."
  },
  {
    "id": "nsf-graduate-research-fellowship-2027",
    "name": "NSF Graduate Research Fellowship Program (GRFP) 2027",
    "sponsor": "U.S. National Science Foundation",
    "location": "United States",
    "level": "Masters / PhD / Postgraduate",
    "deadline": "October 16, 2026 (reference letters); application deadlines by field October 19–23, 2026",
    "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    "summary": "A fellowship supporting graduate students in research-based master’s and doctoral programs in STEM fields.",
    "coverage": [
      "Multi-year fellowship support including a stipend and a cost-of-education allowance — see NSF for current rates"
    ],
    "eligibility": [
      "U.S. citizen, national, or permanent resident at the time of submission",
      "Intend to enroll or be enrolled full-time in an eligible research-based master’s or doctoral program in a STEM field",
      "Completed less than one academic year in a graduate degree program"
    ],
    "howToApply": "Submit through Research.gov/GRFP. Deadlines by field: Life Sciences October 19; Computer Science October 20; Engineering October 22; Chemistry, Geosciences, Mathematical Sciences and Physics October 23. Reference letters are due October 16, 2026.",
    "applyUrl": "https://www.nsf.gov/funding/initiatives/grfp",
    "applyLabel": "Official NSF GRFP Page",
    "note": "Open to U.S. citizens, nationals and permanent residents only."
  },
  {
    "id": "ubc-international-leader-of-tomorrow",
    "name": "UBC Karen McKellin International Leader of Tomorrow Award",
    "sponsor": "University of British Columbia",
    "location": "Vancouver, Canada",
    "level": "Undergraduate",
    "deadline": "November 15, 2026 (International Scholars application; supporting documents by January 31, 2027)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Vancouver%20Skyline.jpg?width=1280",
    "summary": "A UBC award for exceptional international students entering undergraduate study, considered through the International Scholars Program.",
    "coverage": [
      "Funding for undergraduate study at UBC — see the International Scholars page for current terms"
    ],
    "eligibility": [
      "International students applying to UBC for 2027 entry",
      "Submit your UBC online admission application in late October 2026"
    ],
    "howToApply": "Apply to UBC, then complete the International Scholars application by November 15, 2026. Submit all required documents and English proficiency evidence by January 31, 2027.",
    "applyUrl": "https://you.ubc.ca/financial-planning/scholarships-awards-international-students/international-scholars/",
    "applyLabel": "International Scholars Program",
    "note": "Sources report slightly different dates, so confirm on UBC’s official page before applying."
  },
  {
    "id": "taiwan-scholarship-mofa",
    "name": "Taiwan Scholarship (MOFA) 2027",
    "sponsor": "Ministry of Foreign Affairs, Taiwan",
    "location": "Taiwan",
    "level": "Undergraduate / Masters / PhD",
    "deadline": "March 31, 2027 (applications accepted February 1 – March 31, 2027)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Taipei%20101%202009%20amk.jpg?width=1280",
    "summary": "A scholarship encouraging outstanding international students to study in Taiwan and promoting bilateral exchange.",
    "coverage": [
      "Scholarship support for study in Taiwan — see the official page for the current package"
    ],
    "eligibility": [
      "In principle granted to students from countries with diplomatic relations with Taiwan",
      "Special consideration may also be given to students from other countries"
    ],
    "howToApply": "Apply through the Taiwan Scholarships application system linked from the MOFA page during the February 1 – March 31 window.",
    "applyUrl": "https://en.mofa.gov.tw/cp.aspx?n=1325",
    "applyLabel": "Official MOFA Page"
  },
  {
    "id": "chinese-government-scholarship-csc",
    "name": "Chinese Government Scholarship (CSC) — 2027/28",
    "sponsor": "China Scholarship Council (CSC)",
    "location": "China",
    "level": "Undergraduate / Masters / PhD",
    "deadline": "Applications expected to open December 2026 — embassy and university deadlines vary, typically January–April 2027",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/The%20Great%20Wall%20of%20China%20at%20Jinshanling-edit.jpg?width=1280",
    "summary": "A fully funded Chinese government scholarship for undergraduate, master’s, and PhD study at Chinese universities.",
    "coverage": [
      "Tuition waiver and accommodation",
      "Comprehensive medical insurance",
      "Monthly living allowance"
    ],
    "eligibility": [
      "Type A: apply through the Chinese embassy or dispatching authority in your country",
      "Type B: apply directly to a participating Chinese university",
      "Requirements vary by programme and level"
    ],
    "howToApply": "Apply online through the CSC application system (campuschina.org / studyinchina.csc.edu.cn) and follow your embassy’s or university’s deadline.",
    "applyUrl": "https://studyinchina.csc.edu.cn/#/login",
    "applyLabel": "CSC Application Portal",
    "note": "The 2027/28 cycle dates follow the annual pattern and had not been published when this listing was checked, so confirm with your embassy or target university."
  },
  {
    "id": "hertz-foundation-fellowship-2027",
    "name": "Hertz Foundation Fellowship (2027)",
    "sponsor": "Fannie and John Hertz Foundation",
    "location": "United States",
    "level": "PhD / Postgraduate",
    "deadline": "October 30, 2026 (recommender evaluations due November 2, 2026, 6:00 pm PT)",
    "image": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    "summary": "A doctoral fellowship for graduate students in the applied physical, biological, and engineering sciences.",
    "coverage": [
      "Multi-year PhD funding — see the Hertz Foundation site for current terms"
    ],
    "eligibility": [
      "Applicants must meet the Hertz citizenship and residency requirements (confirm on the Hertz site)",
      "Pursuing a PhD in an eligible applied science, engineering, or mathematics field"
    ],
    "howToApply": "Complete the 2027 Hertz Fellowship application online by October 30, 2026. Recommenders submit evaluations by November 2, 2026.",
    "applyUrl": "https://www.hertzfoundation.org/hertz-fellowship/apply/",
    "applyLabel": "Apply for the Hertz Fellowship"
  },
  {
    "id": "truman-scholarship-2027",
    "name": "Harry S. Truman Scholarship (2027)",
    "sponsor": "Harry S. Truman Scholarship Foundation",
    "location": "United States",
    "level": "Undergraduate / Masters",
    "deadline": "February 2, 2027 (11:59 pm in your time zone; campus deadlines are usually earlier)",
    "image": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    "summary": "A scholarship for U.S. undergraduates who plan careers in public service, providing funding for graduate study.",
    "coverage": [
      "Up to $30,000 toward graduate study"
    ],
    "eligibility": [
      "U.S. citizens or nationals nominated by their institution",
      "Commitment to a career in public service"
    ],
    "howToApply": "Applicants apply through their institution’s Truman Faculty Representative. The Foundation confirms receipt by February 8, 2027, and notifies finalists on February 15, 2027.",
    "applyUrl": "https://www.truman.gov/apply/applying/important-dates",
    "applyLabel": "Important Dates",
    "note": "Open to U.S. citizens and nationals only."
  },
  {
    "id": "leiden-university-excellence-scholarship",
    "name": "Leiden University Excellence Scholarship (LExS)",
    "sponsor": "Leiden University",
    "location": "Leiden, Netherlands",
    "level": "Masters",
    "deadline": "December 1, 2026 (September 2027 intake; confirm on Leiden’s LExS page)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Academiegebouw%20Leiden.jpg?width=1280",
    "summary": "A scholarship for excellent students joining a full-time Leiden University master’s programme. Around 25 are awarded each year, and over a thousand students apply.",
    "coverage": [
      "Tuition fee awards of €10,000 to €19,000, depending on the award level"
    ],
    "eligibility": [
      "Excellent students joining a full-time Leiden master’s programme",
      "For most programmes, aimed at non-EEA/non-EFTA students; some programmes have different nationality rules",
      "Not available for non-advanced LLM programmes or MSc programmes at Leiden Law School"
    ],
    "howToApply": "Apply for admission to a Leiden master’s programme and submit your LExS application with a motivation letter inside the same online application, before the deadline. Late scholarship applications are not considered.",
    "applyUrl": "https://www.universiteitleiden.nl/en/scholarships/sea/leiden-university-excellence-scholarship-lexs",
    "applyLabel": "Official LExS Page",
    "note": "Faculty committees nominate recipients within 10 weeks of the deadline, and all applicants are told before the end of March."
  },
  {
    "id": "trudeau-foundation-doctoral-scholarships-2027",
    "name": "Pierre Elliott Trudeau Foundation Doctoral Scholarships (2027)",
    "sponsor": "Pierre Elliott Trudeau Foundation",
    "location": "Canada",
    "level": "PhD / Postgraduate",
    "deadline": "November 6, 2026 (request eligibility confirmation by October 2, 2026)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Vancouver%20Skyline.jpg?width=1280",
    "summary": "Doctoral scholarships for candidates in the humanities and social sciences whose research addresses issues relevant to Canada’s future.",
    "coverage": [
      "Doctoral scholarship funding — reported at up to $60,000 per scholar; confirm current terms with the Foundation"
    ],
    "eligibility": [
      "In the first or second year of doctoral studies when you apply",
      "Field of study broadly related to the humanities or social sciences",
      "Research that addresses issues relevant to Canada’s future"
    ],
    "howToApply": "Request eligibility confirmation by October 2, 2026, then submit the full application on the Foundation’s portal by November 6, 2026.",
    "applyUrl": "https://www.trudeaufoundation.ca/become-a-scholar/",
    "applyLabel": "Become a Scholar",
    "note": "The application period runs from September 1 to November 6, 2026."
  },
  {
    "id": "ceu-masters-stipend-awards",
    "name": "CEU Master’s Scholarships (Stipend Awards)",
    "sponsor": "Central European University (CEU)",
    "location": "Vienna, Austria",
    "level": "Masters",
    "deadline": "October 15, 2026 (23:59 Central European Time)",
    "image": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    "summary": "Financial support for master’s students at CEU. Stipend awards are assessed through the master’s application.",
    "coverage": [
      "Master’s Stipend Awards of €300 to €750 per month"
    ],
    "eligibility": [
      "Apply to a CEU master’s program and indicate your interest in funding in the application",
      "Institutional CEU financial aid is awarded only in the first two application rounds"
    ],
    "howToApply": "Apply to your chosen master’s program by the round deadline and complete the funding section. Admission decisions are expected between December 1, 2026 and January 15, 2027.",
    "applyUrl": "https://www.ceu.edu/admissions/master",
    "applyLabel": "CEU Master’s Admissions",
    "note": "Stipend awards are partial, not fully funded."
  }
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
  const [openId, setOpenId] = useState<string | null>(scholarships[0]?.id || null);
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
              {scholarships.length} Opportunities · Updated {LAST_UPDATED}
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
