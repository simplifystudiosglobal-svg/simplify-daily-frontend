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
const LAST_UPDATED = 'Sep 29, 2026';

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
    "deadline": "January 3, 2027 (August 2027 intake for MS, MS/PhD and PhD)",
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
  },
  {
    "id": "imperial-presidents-phd-scholarships-2027",
    "name": "President's PhD Scholarships",
    "sponsor": "Imperial College London",
    "location": "London, United Kingdom",
    "level": "PhD / Postgraduate",
    "deadline": "November 2, 2026 (first round) — later rounds January 11, 2027 and March 1, 2027",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Queen's%20Tower%20Imperial%20College%20London%20-%20geograph.org.uk%20-%202288317.jpg?width=1280",
    "summary": "Imperial's flagship doctoral award: 50 fully funded PhD places a year for outstanding students in any subject the College offers.",
    "coverage": [
      "Full tuition fees",
      "Stipend of £27,036 a year (2027–28 rate)",
      "£2,000 a year consumables fund for the first 3 years",
      "Bespoke events from the Early Career Researcher Institute"
    ],
    "eligibility": [
      "A first class undergraduate degree or equivalent, or a distinction in a standalone master's",
      "Open to home and international applicants",
      "Funded places start between August 1 and November 1, 2027"
    ],
    "howToApply": "There is no separate scholarship form. Apply for PhD admission through Imperial's online system by a round deadline, and your department nominates strong applicants.",
    "applyUrl": "https://www.imperial.ac.uk/study/fees-and-funding/postgraduate-doctoral/grants-scholarships/presidents-phd/",
    "applyLabel": "Apply via Imperial",
    "note": "First-round applicants hear by January 31, 2027. Applying early gives you more chances across rounds."
  },
  {
    "id": "tu-delft-van-effen-excellence-scholarship-2027",
    "name": "Justus & Louise van Effen Excellence Scholarships",
    "sponsor": "TU Delft (Justus & Louise van Effen Foundation)",
    "location": "Delft, Netherlands",
    "level": "Masters",
    "deadline": "December 1, 2026, 23:59 CET",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Library%20TUDelft.jpg?width=1280",
    "summary": "TU Delft's full scholarships for excellent international students admitted to its two-year MSc programmes, funded by the legacy of alumnus Justus van Effen.",
    "coverage": [
      "Full tuition fees for a TU Delft MSc programme (statutory or institutional rate)",
      "Contribution toward living expenses"
    ],
    "eligibility": [
      "Excellent international applicants (conditionally) admitted to a two-year regular TU Delft MSc",
      "Roughly the top 10% of graduates in a relevant previous programme",
      "A complete MSc application submitted before the scholarship deadline"
    ],
    "howToApply": "Complete your MSc application and upload the scholarship form, references and English test by December 1, 2026.",
    "applyUrl": "https://www.tudelft.nl/en/education/study-programme-orientation/practical-matters/scholarships",
    "applyLabel": "Apply via TU Delft",
    "note": "Missing the December 1 deadline means your scholarship application will not be reviewed. Winners are told by the end of March 2027."
  },
  {
    "id": "oxford-pershing-square-graduate-scholarships-2027",
    "name": "Oxford-Pershing Square Graduate Scholarships",
    "sponsor": "Pershing Square Foundation & Saïd Business School, University of Oxford",
    "location": "Oxford, United Kingdom",
    "level": "Masters",
    "deadline": "January 6, 2027 (1+1 MBA and scholarship); your Oxford master's course deadline in December or January also applies",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Said%20Business%20School.jpg?width=1280",
    "summary": "Full funding for up to five scholars a year to combine a one-year Oxford master's with a one-year MBA (the 1+1 MBA), for people committed to tackling social problems.",
    "coverage": [
      "Full funding for the one-year master's and the one-year MBA",
      "Membership of the Pershing Square scholar community"
    ],
    "eligibility": [
      "Applicants to the Oxford 1+1 MBA with a partner master's programme",
      "Strong record of impact and commitment to addressing social issues"
    ],
    "howToApply": "Apply to both your Oxford master's course (by its own deadline) and the 1+1 MBA with the scholarship by January 6, 2027.",
    "applyUrl": "https://www.sbs.ox.ac.uk/oxford-experience/scholarships-and-funding/oxford-pershing-square-graduate-scholarships",
    "applyLabel": "Apply via Saïd Business School",
    "note": "Shortlisting is expected in early April 2027, with interviews in late April or early May."
  },
  {
    "id": "oist-phd-program-2027",
    "name": "OIST PhD Program (Fully Funded)",
    "sponsor": "Okinawa Institute of Science and Technology (OIST)",
    "location": "Okinawa, Japan",
    "level": "PhD / Postgraduate",
    "deadline": "November 15, 2026, 23:59 JST (entry in May 2027, September 2027 or January 2028)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Campus%20(41641045911).jpg?width=1280",
    "summary": "A five-year, English-language PhD in Japan open to talented students from around the world, with research across physics, biology, chemistry, neuroscience, math and computing.",
    "coverage": [
      "Admitted PhD students are fully supported (tuition and living support)",
      "English-language research environment"
    ],
    "eligibility": [
      "Open to applicants of any nationality",
      "A bachelor's or master's degree in a relevant field",
      "Confirm your target laboratories have open PhD slots before applying"
    ],
    "howToApply": "Apply online with transcripts, a statement of purpose and a passport copy. You can submit only after at least two recommendation letters arrive.",
    "applyUrl": "https://www.oist.jp/admissions/phd-program/apply-phd",
    "applyLabel": "Apply on OIST",
    "note": "The application fee is 5,000 JPY."
  },
  {
    "id": "ista-phd-program-2027",
    "name": "ISTA PhD Program",
    "sponsor": "Institute of Science and Technology Austria (ISTA)",
    "location": "Klosterneuburg (Vienna), Austria",
    "level": "PhD / Postgraduate",
    "deadline": "January 8, 2027, 3:00 pm CET (call opens late October 2026; references due January 12)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Institute%20of%20Science%20and%20Technology%20Austria%20-%20roundabout.jpg?width=1280",
    "summary": "A fully funded, interdisciplinary PhD in the natural, mathematical and computer sciences at one of Europe's leading research institutes.",
    "coverage": [
      "Funded PhD position with an employment contract",
      "Rotations across research groups in the first year"
    ],
    "eligibility": [
      "Open to all nationalities",
      "A bachelor's or master's in biology, chemistry, neuroscience, mathematics, computer science, physics, data science, earth science or related areas"
    ],
    "howToApply": "Apply online once the call opens in late October. Interviews take place in March, and the programme starts on September 15, 2027.",
    "applyUrl": "https://phd.pages.ist.ac.at/phd-application-admission/",
    "applyLabel": "Apply on ISTA"
  },
  {
    "id": "embl-international-phd-2027",
    "name": "EMBL International PhD Programme (Winter Recruitment)",
    "sponsor": "European Molecular Biology Laboratory (EMBL)",
    "location": "Heidelberg, Barcelona, Hamburg, Grenoble, Rome and Hinxton (EMBL-EBI)",
    "level": "PhD / Postgraduate",
    "deadline": "October 12, 2026, 23:59 CET (references by October 14)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/EMBL%20Heidelberg%20ATC.jpg?width=1280",
    "summary": "Fully funded PhD positions at Europe's flagship life sciences laboratory, across its six sites.",
    "coverage": [
      "Funded PhD contract",
      "No application fees at any stage"
    ],
    "eligibility": [
      "Open to highly qualified students of all nationalities (EMBL member-state applicants are prioritised only when equally qualified)",
      "A degree that qualifies you for PhD study before starting by October 2027",
      "At least two academic references"
    ],
    "howToApply": "Apply through the EMBL International PhD Programme online portal. Email applications are not accepted.",
    "applyUrl": "https://www.embl.org/about/info/embl-international-phd-programme/application/",
    "applyLabel": "Apply on EMBL"
  },
  {
    "id": "mbzuai-graduate-scholarship-2027",
    "name": "MBZUAI Full Scholarship (MSc and PhD in AI)",
    "sponsor": "Mohamed bin Zayed University of Artificial Intelligence (MBZUAI)",
    "location": "Abu Dhabi, United Arab Emirates",
    "level": "Masters / PhD / Postgraduate",
    "deadline": "December 15, 2026 (Fall 2027 graduate intake)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Masdar%20City%20in%20March%202022%2001.jpg?width=1280",
    "summary": "Every admitted full-time MSc and PhD student at the AI-focused university receives a full scholarship.",
    "coverage": [
      "Full tuition",
      "Monthly stipend",
      "Health insurance",
      "Annual return airfare and UAE residence support"
    ],
    "eligibility": [
      "Open to students of all nationalities",
      "Meet the admission requirements of the chosen MSc or PhD programme"
    ],
    "howToApply": "Apply on the MBZUAI admissions portal by December 15. The Fall 2027 semester starts in mid-August 2027.",
    "applyUrl": "https://mbzuai.ac.ae/admissions",
    "applyLabel": "Apply on MBZUAI"
  },
  {
    "id": "ertegun-graduate-scholarship-2027",
    "name": "Mica and Ahmet Ertegun Graduate Scholarship in the Humanities",
    "sponsor": "Ertegun Graduate Scholarship Programme, University of Oxford",
    "location": "Oxford, United Kingdom",
    "level": "Masters / PhD / Postgraduate",
    "deadline": "Early January 2027 (your Oxford humanities course deadline; a few area studies courses differ)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Radcliffe%20Humanities%20building%20-%20geograph.org.uk%20-%208093014.jpg?width=1280",
    "summary": "Full funding for new graduate students in the humanities at Oxford, with membership of Ertegun House.",
    "coverage": [
      "Full course fees",
      "Annual living grant (£21,805 in 2026–27)",
      "Use of Ertegun House facilities and community"
    ],
    "eligibility": [
      "Students from all countries, including the UK",
      "Starting a new full-time graduate course in an eligible humanities subject"
    ],
    "howToApply": "Select the Ertegun scholarship in the funding section of your Oxford graduate application and attach the Ertegun supporting statement by your course's January deadline.",
    "applyUrl": "https://www.ertegun.ox.ac.uk/scholarships",
    "applyLabel": "Apply via Oxford"
  },
  {
    "id": "harding-distinguished-postgraduate-scholars-2027",
    "name": "Harding Distinguished Postgraduate Scholars Programme",
    "sponsor": "University of Cambridge",
    "location": "Cambridge, United Kingdom",
    "level": "PhD / Postgraduate",
    "deadline": "Your Cambridge PhD course funding deadline (early December 2026 or January 2027)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Senate%20House%20in%20Cambridge.jpg?width=1280",
    "summary": "Prestigious full PhD scholarships at Cambridge for academically outstanding students of any nationality.",
    "coverage": [
      "Full funding for PhD study at Cambridge (fees and maintenance)",
      "Membership of the Harding scholar community"
    ],
    "eligibility": [
      "Applicants of any nationality",
      "Applying for a full-time or part-time PhD (including MRes+PhD routes) and not yet started a doctorate"
    ],
    "howToApply": "Tick the funding box in the \"Funding your Study\" section of the Cambridge Applicant Portal and apply by your course's funding deadline.",
    "applyUrl": "https://www.hardingscholars.fund.cam.ac.uk/apply/application-and-eligibility-information",
    "applyLabel": "Apply via Cambridge",
    "note": "Awards are made in late February to early March 2027. Scholars are expected to live in the UK for most of their studies."
  },
  {
    "id": "auckland-doctoral-scholarship",
    "name": "University of Auckland Doctoral Scholarship",
    "sponsor": "University of Auckland",
    "location": "Auckland, New Zealand",
    "level": "PhD / Postgraduate",
    "deadline": "November 1, 2026 (next round); later rounds February 1, May 1 and August 1, 2027",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Clock%20Tower%2C%20University%20of%20Auckland.jpg?width=1280",
    "summary": "Auckland's main doctoral scholarship, open to high-achieving domestic and international doctoral candidates.",
    "coverage": [
      "Stipend and fees support (value varies)",
      "Tenure of up to 42 months"
    ],
    "eligibility": [
      "High-achieving applicants to an approved doctoral programme (PhD, DMedSc, DClinPsy, DocFA, EdD or DHSc)"
    ],
    "howToApply": "No separate application is needed. You are considered when you apply for doctoral admission. International applicants are advised to apply in the November and February rounds to leave time for visas.",
    "applyUrl": "https://www.auckland.ac.nz/en/study/scholarships-and-awards/find-a-scholarship/university-of-auckland-doctoral-scholarship-43-all.html",
    "applyLabel": "Apply via Auckland"
  },
  {
    "id": "unsw-international-scholarships-term1-2027",
    "name": "UNSW International Scientia Scholarships (Term 1, 2027)",
    "sponsor": "UNSW Sydney",
    "location": "Sydney, Australia",
    "level": "Undergraduate / Masters",
    "deadline": "October 30, 2026, 11:59 pm AEST",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Anzac%20Corps%20Memorial%20at%20UNSW%20Kensington%20campus.jpg?width=1280",
    "summary": "Merit scholarships for international students of any country starting undergraduate or postgraduate coursework degrees at UNSW in Term 1, 2027.",
    "coverage": [
      "Full tuition for the minimum program duration (Scientia, Offer 1)",
      "Or A$20,000 a year toward tuition (Scientia, Offer 2)"
    ],
    "eligibility": [
      "International students (non-Australian) starting full-time study in Term 1, 2027",
      "An offer of admission to an eligible program by October 30, 2026"
    ],
    "howToApply": "Register on the UNSW Scholarship Application Online portal and apply by October 30.",
    "applyUrl": "https://www.scholarships.unsw.edu.au/scholarships/id/1988",
    "applyLabel": "Apply on UNSW",
    "note": "Some awards on the same page are limited to particular countries, but the Scientia Scholarship is open to all international students."
  },
  {
    "id": "kaist-international-undergraduate-2027",
    "name": "KAIST Undergraduate Scholarship (International Admission)",
    "sponsor": "Korea Advanced Institute of Science and Technology (KAIST)",
    "location": "Daejeon, South Korea",
    "level": "Undergraduate",
    "deadline": "October 22, 2026 (Early Admission) — Regular Admission November 10, 2026 to January 14, 2027",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/KAIST%20fountains%20view.jpg?width=1280",
    "summary": "International applicants to Korea's top science and technology university are considered for a scholarship through the admission process itself.",
    "coverage": [
      "Tuition exemption for up to eight semesters",
      "KRW 350,000 monthly support",
      "Medical insurance"
    ],
    "eligibility": [
      "International applicants for Fall 2027 undergraduate entry",
      "Tick \"KAIST Scholarship\" in the Statement of Financial Resources"
    ],
    "howToApply": "Apply for international undergraduate admission by one of the deadlines and select the KAIST Scholarship in your application.",
    "applyUrl": "https://admission.kaist.ac.kr/intl-undergraduate/",
    "applyLabel": "Apply on KAIST"
  },
  {
    "id": "ellis-phd-program-2026-call",
    "name": "ELLIS PhD Program (AI and Machine Learning)",
    "sponsor": "European Laboratory for Learning and Intelligent Systems (ELLIS)",
    "location": "Leading AI labs across Europe",
    "level": "PhD / Postgraduate",
    "deadline": "October 31, 2026, 23:59 AoE (portal opens October 1, 2026)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/T%C3%BCbingen%20-%20Altstadt%20-%20Neckarfront%20-%20Ansicht%20von%20Neckarinsel%20mit%20Stocherkahn.jpg?width=1280",
    "summary": "Europe's central PhD recruitment in machine learning and AI, with each student co-supervised by advisors in two countries.",
    "coverage": [
      "Funded PhD positions through the host institutions",
      "Exchange with a second ELLIS advisor abroad"
    ],
    "eligibility": [
      "No nationality restriction",
      "Strong background for PhD study in machine learning or related fields"
    ],
    "howToApply": "Apply through the ELLIS central application portal between October 1 and 31, 2026.",
    "applyUrl": "https://ellis.eu/news/ellis-phd-program-call-for-applications-2026",
    "applyLabel": "Apply on ELLIS",
    "note": "Start dates depend on your advisors and institution; the PhD degree is awarded by a European institution."
  },
  {
    "id": "rockefeller-university-phd-2027",
    "name": "David Rockefeller Graduate Program in Bioscience",
    "sponsor": "The Rockefeller University",
    "location": "New York, NY, United States",
    "level": "PhD / Postgraduate",
    "deadline": "December 1, 2026 (entry in September 2027)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/The%20Rockefeller%20University%2C%20York%20Avenue%20NYC.jpg?width=1280",
    "summary": "A fully supported biomedical PhD in New York where international students apply through the same process as US students.",
    "coverage": [
      "Full tuition and a stipend for all admitted students",
      "Student housing support"
    ],
    "eligibility": [
      "Open to international and US applicants",
      "A bachelor's, master's or MD (or international equivalent)",
      "GRE and TOEFL are not required"
    ],
    "howToApply": "Apply online by December 1. Shortlisted candidates are invited to on-campus interviews in February.",
    "applyUrl": "https://www.rockefeller.edu/education-and-training/graduate-program-in-bioscience/admissions/",
    "applyLabel": "Apply on Rockefeller",
    "note": "The application fee is $50."
  },
  {
    "id": "warwick-chancellors-international-scholarship-2027",
    "name": "Warwick PGR Scholarships (including Chancellor's International Scholarships)",
    "sponsor": "University of Warwick",
    "location": "Coventry, United Kingdom",
    "level": "PhD / Postgraduate",
    "deadline": "December 10, 2026, 16:59 GMT (course application by December 7; call opens October 5, 2026)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Warwick%20University%20campus%20-%20geograph.org.uk%20-%205811826.jpg?width=1280",
    "summary": "Warwick's doctoral scholarship competition for PhD, MPhil/PhD and EngD students starting in October 2027, open to any nationality or fee status.",
    "coverage": [
      "Full academic fees (UK or international rate)",
      "Tax-free UKRI-rate stipend for 3.5 years",
      "£5,000 research training and support grant"
    ],
    "eligibility": [
      "Any nationality or fee status",
      "Starting an eligible research degree in October 2027"
    ],
    "howToApply": "Apply for your course by December 7, then submit the scholarship application through ITS by December 10.",
    "applyUrl": "https://warwick.ac.uk/services/dc/schols_fund/scholarships_and_funding/chancellors_int/",
    "applyLabel": "Apply on Warwick"
  },
  {
    "id": "vienna-biocenter-phd-autumn-2026",
    "name": "Vienna BioCenter PhD Programme (Autumn Call)",
    "sponsor": "Vienna BioCenter (IMP, IMBA, GMI, MFPL)",
    "location": "Vienna, Austria",
    "level": "PhD / Postgraduate",
    "deadline": "October 15, 2026, 23:59 CET (applications and references)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Campus-Vienna-Biocenter-01-.jpg?width=1280",
    "summary": "A fully funded international PhD in molecular life sciences at one of Europe's top biology campuses.",
    "coverage": [
      "Full-time employment contract of about €39,000–€42,900 gross a year (2025 rates)",
      "Health, pension and other insurance",
      "Tuition fees reimbursed"
    ],
    "eligibility": [
      "International applicants welcome, including non-EU/EEA citizens",
      "A degree that qualifies you for PhD study"
    ],
    "howToApply": "Submit the written application and references by October 15. Shortlisted candidates have online interviews and then a campus visit.",
    "applyUrl": "https://training.vbc.ac.at/phd-programme/applications/",
    "applyLabel": "Apply on Vienna BioCenter",
    "note": "Start dates are flexible, up to June 1, 2027."
  },
  {
    "id": "cshl-school-of-biological-sciences-phd-2027",
    "name": "CSHL School of Biological Sciences PhD",
    "sponsor": "Cold Spring Harbor Laboratory",
    "location": "Cold Spring Harbor, NY, United States",
    "level": "PhD / Postgraduate",
    "deadline": "December 1, 2026",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Cold%20Spring%20Harbor%20Laboratory.jpg?width=1280",
    "summary": "A fully funded biology PhD at a world-famous research laboratory, where about half of students come from outside the US.",
    "coverage": [
      "$50,000 annual stipend ($55,000 with an external fellowship)",
      "All tuition and fees, health and dental insurance",
      "Laptop, relocation and childcare support"
    ],
    "eligibility": [
      "Open to applicants worldwide",
      "A bachelor's degree or equivalent by enrollment",
      "TOEFL or IELTS for non-English-medium degrees; GRE not required"
    ],
    "howToApply": "Apply online by December 1 with transcripts, a personal statement and three recommendation letters.",
    "applyUrl": "https://www.cshl.edu/phd-program/how-to-apply/",
    "applyLabel": "Apply on CSHL"
  },
  {
    "id": "geneva-graduate-institute-financial-aid-2027",
    "name": "Geneva Graduate Institute Scholarships (MA and PhD)",
    "sponsor": "Geneva Graduate Institute (IHEID)",
    "location": "Geneva, Switzerland",
    "level": "Masters / PhD / Postgraduate",
    "deadline": "January 14, 2027 (all MA and PhD programmes; applications open October 1, 2026)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Geneva%20Graduate%20Institute.jpg?width=1280",
    "summary": "Financial aid for master's and PhD students in international relations, development, economics, law and more. About 85% of students are international.",
    "coverage": [
      "Master's aid of CHF 10,000 (partial) or CHF 20,000 (full) a year",
      "Every PhD admission offer comes with a four-year funding package"
    ],
    "eligibility": [
      "Open to applicants of any nationality",
      "Master's aid must be requested in the January application round"
    ],
    "howToApply": "Apply for admission and request financial aid in the same application by January 14. Recommendation letters are due January 22.",
    "applyUrl": "https://www.graduateinstitute.ch/application",
    "applyLabel": "Apply on Geneva Graduate Institute",
    "note": "PhD applicants seeking the Swiss Government Excellence Scholarship through the Institute must apply by October 15, 2026."
  },
  {
    "id": "dkfz-international-phd-2026-27-winter",
    "name": "DKFZ International PhD Program (Winter Selection)",
    "sponsor": "German Cancer Research Center (DKFZ)",
    "location": "Heidelberg, Germany",
    "level": "PhD / Postgraduate",
    "deadline": "October 19, 2026",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Heidelberg%20DKFZ%20Neuenheimer%20Feld%2020120501.jpg?width=1280",
    "summary": "Fully funded PhD positions in cancer research at Germany's largest biomedical research centre.",
    "coverage": [
      "All DKFZ PhD positions are fully funded for at least three years",
      "Structured training and mentoring"
    ],
    "eligibility": [
      "International applicants welcome",
      "A master's degree (or equivalent) in life sciences or related fields"
    ],
    "howToApply": "Apply through the DKFZ online system by October 19.",
    "applyUrl": "https://www.dkfz.de/en/career/international-phd-program",
    "applyLabel": "Apply on DKFZ"
  },
  {
    "id": "imprs-astrophysics-2027",
    "name": "International Max Planck Research School on Astrophysics",
    "sponsor": "Max Planck Society & LMU Munich",
    "location": "Garching (Munich), Germany",
    "level": "PhD / Postgraduate",
    "deadline": "November 1, 2026 (programme starts September 1, 2027)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/2009-03-17-Fehling-Gogel-Max-Planck-Institut-Astrophysik-01.jpg?width=1280",
    "summary": "A funded astrophysics PhD programme run by Max Planck institutes and LMU Munich for students from around the world.",
    "coverage": [
      "Funded doctoral fellowship or contract"
    ],
    "eligibility": [
      "No nationality restriction",
      "A master's degree (or near completion) in physics, astronomy or a related field",
      "English proficiency (TOEFL iBT 94+ or IELTS 7+ recommended)"
    ],
    "howToApply": "Submit the online form, CV, transcripts, a master's thesis or abstract and up to three recommendation letters by November 1.",
    "applyUrl": "https://www.imprs-astro.mpg.de/content/application.html",
    "applyLabel": "Apply on IMPRS Astrophysics"
  },
  {
    "id": "unil-masters-grants-2027",
    "name": "UNIL Master's Scholarships for Foreign Graduates",
    "sponsor": "University of Lausanne (UNIL)",
    "location": "Lausanne, Switzerland",
    "level": "Masters",
    "deadline": "November 1, 2026 (for 2027/2028)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/University-of-lausanne-internef.jpg?width=1280",
    "summary": "About ten excellence scholarships a year for graduates of foreign universities entering a UNIL master's programme.",
    "coverage": [
      "CHF 1,600 a month for the minimum length of the master's",
      "Exemption from course registration fees (only CHF 80 semester fees remain)"
    ],
    "eligibility": [
      "A bachelor's degree from a university outside Switzerland, with outstanding results",
      "B2 French or C1 English depending on the programme"
    ],
    "howToApply": "Complete the online scholarship application by November 1. Decisions are sent in early April 2027.",
    "applyUrl": "https://www.unil.ch/unil/en/home/menuinst/etudier/mobilite-et-echange/etudiantes-et-etudiants-internationaux/etudiantes-internationaux-reguliers/bourse-de-master.html",
    "applyLabel": "Apply on UNIL",
    "note": "The grant does not cover the full cost of living in Switzerland."
  },
  {
    "id": "francis-crick-phd-programme-2027",
    "name": "Francis Crick Institute PhD Programme",
    "sponsor": "The Francis Crick Institute",
    "location": "London, United Kingdom",
    "level": "PhD / Postgraduate",
    "deadline": "October 30, 2026, 12:00 pm GMT (references by November 6)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Francis%20Crick%20Institute%20exterior.jpg?width=1280",
    "summary": "Fully funded four-year biomedical PhD studentships at one of Europe's largest biomedical research institutes, open to all nationalities.",
    "coverage": [
      "Tuition fees",
      "Tax-free stipend of £27,715 a year for four years",
      "UK visa fees and Immigration Health Surcharge reimbursed"
    ],
    "eligibility": [
      "Candidates of all nationalities",
      "A degree that qualifies you for PhD study by the September 2027 start"
    ],
    "howToApply": "Apply online during the application window. The programme begins on September 27, 2027.",
    "applyUrl": "https://www.crick.ac.uk/careers-and-study/students/phd-students/how-to-apply-phd-programme",
    "applyLabel": "Apply on Crick"
  },
  {
    "id": "imprs-bac-molgen-2027",
    "name": "IMPRS for Biology and Computation (IMPRS-BAC)",
    "sponsor": "Max Planck Institute for Molecular Genetics",
    "location": "Berlin, Germany",
    "level": "PhD / Postgraduate",
    "deadline": "December 7, 2026, 23:59 CET",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Max%20Planck%20Institute%20for%20Molecular%20Genetics.jpg?width=1280",
    "summary": "A funded PhD programme combining molecular biology and computation, seeking exceptional graduates from around the globe.",
    "coverage": [
      "Three years of funding for your doctoral project",
      "Interview travel and accommodation covered (within limits)",
      "Support to learn German"
    ],
    "eligibility": [
      "Open to graduates from any country",
      "A master's degree in biology, computer science, physics, mathematics or a related field"
    ],
    "howToApply": "Submit the online application by December 7. Successful candidates start between May and November 2027.",
    "applyUrl": "https://www.molgen.mpg.de/IMPRS/application",
    "applyLabel": "Apply on IMPRS-BAC"
  },
  {
    "id": "wellcome-sanger-4-year-phd-2027",
    "name": "Wellcome Sanger Institute 4-Year PhD Programme",
    "sponsor": "Wellcome Sanger Institute",
    "location": "Hinxton (Cambridge), United Kingdom",
    "level": "PhD / Postgraduate",
    "deadline": "November 24, 2026, 09:00 am GMT (applications open early October)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Wellcome%20Trust%20Genome%20Campus%2C%20Hinxton%2C%20Winter%202009.png?width=1280",
    "summary": "Twelve funded genomics PhD studentships a year, with applicants from anywhere in the world judged only on merit.",
    "coverage": [
      "Tuition fees for all students regardless of nationality",
      "Stipend rising from £25,649 to £27,385 over four years",
      "Visa and Immigration Health Surcharge reimbursed for international students"
    ],
    "eligibility": [
      "Candidates worldwide",
      "A degree in a relevant scientific discipline"
    ],
    "howToApply": "Apply online once applications open in early October. Interviews are on January 25, 2027.",
    "applyUrl": "https://www.sanger.ac.uk/about/study/phd-programmes/4-year-phd-programme/",
    "applyLabel": "Apply on Sanger"
  },
  {
    "id": "epfl-edic-fellowships-2027",
    "name": "EPFL EDIC Doctoral Fellowships (Computer and Communication Sciences)",
    "sponsor": "École Polytechnique Fédérale de Lausanne (EPFL)",
    "location": "Lausanne, Switzerland",
    "level": "PhD / Postgraduate",
    "deadline": "December 1, 2026, 23:59 CET (second deadline April 15, 2027)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/EPFL%20Rolex%20Learning%20Center%20%40%20EPFL%20%40%20Lausanne%20(36749824932).jpg?width=1280",
    "summary": "55 first-year fellowships in 2027 for PhD students in computer science and communication systems at EPFL.",
    "coverage": [
      "First-year fellowship with rotations in research labs",
      "All admitted students are paid a competitive salary"
    ],
    "eligibility": [
      "No nationality restriction",
      "A four- or five-year bachelor's or a master's in computer science, communication systems, electrical engineering, mathematics, physics or related fields"
    ],
    "howToApply": "Submit the full online application by December 1 to start the following September.",
    "applyUrl": "https://www.epfl.ch/education/phd/edic-computer-and-communication-sciences/edic-computer-and-communication-sciences/edic-how-to-apply/",
    "applyLabel": "Apply on EPFL"
  },
  {
    "id": "gulbenkian-institute-advanced-study-fellowships-2027",
    "name": "Gulbenkian Institute for Advanced Study Fellowships 2027/28",
    "sponsor": "Calouste Gulbenkian Foundation",
    "location": "Lisbon, Portugal",
    "level": "Postgraduate / Fellowship / Training",
    "deadline": "October 15, 2026, 15:00 Lisbon time",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Exterior%20of%20Edif%C3%ADcio-sede%20da%20Funda%C3%A7%C3%A3o%20Calouste%20Gulbenkian%2C%20Lisbon%2C%20Portugal%20julesvernex2.jpg?width=1280",
    "summary": "Three- to eight-month residencies in Lisbon for researchers, scholars and artists working on major global challenges.",
    "coverage": [
      "Monthly stipend",
      "Travel costs and travel and health insurance",
      "Partial housing allowance"
    ],
    "eligibility": [
      "No nationality restriction and no Portuguese language requirement",
      "A PhD is not formally required"
    ],
    "howToApply": "Apply through the Gulbenkian Institute for Advanced Study online portal by October 15.",
    "applyUrl": "https://gulbenkian.pt/gias/news/2027-28-applications-open/",
    "applyLabel": "Apply on Gulbenkian"
  },
  {
    "id": "embo-postdoctoral-fellowships-2027",
    "name": "EMBO Postdoctoral Fellowships",
    "sponsor": "European Molecular Biology Organization (EMBO)",
    "location": "Any EMBC member state (mostly Europe)",
    "level": "Postgraduate / Fellowship / Training",
    "deadline": "January 22, 2027, 14:00 CET (next cutoff; applications accepted any time)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/EMBL%20in%20Heidelberg.jpg?width=1280",
    "summary": "Two-year fellowships for early-career life scientists of any nationality who move to a new country for their postdoc.",
    "coverage": [
      "Postdoctoral fellowship funding for up to two years",
      "Access to EMBO training and networking"
    ],
    "eligibility": [
      "Any nationality, but the move must be to a different country",
      "PhD obtained within the past two years (or about to be)",
      "At least one first-author research paper"
    ],
    "howToApply": "Apply through the EMBO online system. There is no application fee.",
    "applyUrl": "https://www.embo.org/funding/fellowships-grants-and-career-support/postdoctoral-fellowships/eligibility/",
    "applyLabel": "Apply on EMBO"
  },
  {
    "id": "mrc-lmb-phd-2027",
    "name": "MRC Laboratory of Molecular Biology PhD Programme",
    "sponsor": "MRC Laboratory of Molecular Biology (LMB) & University of Cambridge",
    "location": "Cambridge, United Kingdom",
    "level": "PhD / Postgraduate",
    "deadline": "December 8, 2026 (leave two weeks for references)",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/MRC%20Laboratory%20of%20Molecular%20Biology%20-%20geograph.org.uk%20-%206522144.jpg?width=1280",
    "summary": "PhD study at the lab that produced a dozen Nobel prizes, with funding available to students of all nationalities through open competition.",
    "coverage": [
      "Funding available through MRC, University of Cambridge and College studentships"
    ],
    "eligibility": [
      "Qualified students of all nationalities and backgrounds"
    ],
    "howToApply": "Apply via the University of Cambridge Applicant Portal with a CV, transcripts, two references and the LMB Statement of Interest form.",
    "applyUrl": "https://mrclmb.ac.uk/careers-and-people/phd-students/how-to-apply/",
    "applyLabel": "Apply via LMB"
  },
  {
    "id": "nyu-abu-dhabi-undergraduate-aid-2027",
    "name": "NYU Abu Dhabi Need-Based Financial Aid",
    "sponsor": "NYU Abu Dhabi",
    "location": "Abu Dhabi, United Arab Emirates",
    "level": "Undergraduate",
    "deadline": "November 1, 2026 (Early Decision I; financial aid forms by November 10) — ED II January 1, 2027",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Abu%20dhabi%20skylines%202014.jpg?width=1280",
    "summary": "NYU Abu Dhabi accepts financial aid applications from all students regardless of citizenship and offers the same aid whether you apply early or regular.",
    "coverage": [
      "Need-based institutional financial aid"
    ],
    "eligibility": [
      "Undergraduate applicants of any citizenship",
      "Submit the CSS Profile by the aid deadline"
    ],
    "howToApply": "Apply through the Common Application and submit the CSS Profile. Early Decision students are released if the aid offer does not make attending possible.",
    "applyUrl": "https://nyuad.nyu.edu/en/apply/undergraduate/scholarships-and-financial-aid/apply-for-financial-aid.html",
    "applyLabel": "Apply on NYU Abu Dhabi",
    "note": "NYU remains test-optional through the 2027–2028 admissions cycle."
  },
  {
    "id": "weizmann-feinberg-phd",
    "name": "Weizmann Institute PhD (Feinberg Graduate School)",
    "sponsor": "Weizmann Institute of Science",
    "location": "Rehovot, Israel",
    "level": "PhD / Postgraduate",
    "deadline": "Applications accepted October 1, 2026 to March 31, 2027",
    "image": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    "summary": "Research PhDs in the natural and exact sciences at the Weizmann Institute, open to international applicants.",
    "coverage": [
      "Funded PhD study (students receive a stipend and tuition support)"
    ],
    "eligibility": [
      "An MSc with thesis or an MD for the regular PhD track",
      "Agreement from a Weizmann advisor before applying"
    ],
    "howToApply": "Arrange a potential advisor, then register and apply online during the October to March window.",
    "applyUrl": "https://www.weizmann.ac.il/feinberg/admissions/how-apply-1",
    "applyLabel": "Apply on Weizmann"
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
