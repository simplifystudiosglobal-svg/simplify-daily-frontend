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
    "deadline": "October 1, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Radcliffe_Camera%2C_Oxford_-_Oct_2006.jpg/1280px-Radcliffe_Camera%2C_Oxford_-_Oct_2006.jpg",
    "summary": "The world's oldest and most prestigious international postgraduate award, enabling outstanding young leaders from around the globe to study at the University of Oxford.",
    "coverage": [
      "All Oxford University and College tuition fees",
      "Annual living stipend of £19,092 paid in quarterly installments",
      "Two economy class flights (arrival in Oxford and return upon completion)",
      "Tier 4 student visa fee and International Health Surcharge (IHS)"
    ],
    "eligibility": [
      "Undergraduate degree with First Class Honours or GPA of at least 3.7/4.0",
      "Aged 18 to 24 (or up to 27 for candidates completing second degree)",
      "Demonstrated academic excellence, energy to use talents to the full, and moral character",
      "Citizen or resident of an eligible Rhodes constituency or Global Rhodes candidate"
    ],
    "howToApply": "Submit your application online through the official Rhodes Trust portal for your national constituency, including academic transcripts, personal statement, and reference letters.",
    "applyUrl": "https://www.rhodeshouse.ox.ac.uk/scholarships/applications/",
    "applyLabel": "Apply on Rhodes Trust",
    "infoUrl": "https://www.rhodeshouse.ox.ac.uk/"
  },
  {
    "id": "gates-cambridge",
    "name": "Gates Cambridge Scholarships",
    "sponsor": "Bill & Melinda Gates Foundation & University of Cambridge",
    "location": "Cambridge, United Kingdom",
    "level": "Masters / PhD / Postgraduate",
    "deadline": "December 3, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Kings_College_Chapel%2C_Cambridge%2C_UK_-_Diliff.jpg/1280px-Kings_College_Chapel%2C_Cambridge%2C_UK_-_Diliff.jpg",
    "summary": "Full-cost awards for outstanding applicants outside the UK to pursue a full-time postgraduate degree in any subject available at the University of Cambridge.",
    "coverage": [
      "University Composition Fee at the appropriate international rate",
      "Maintenance allowance of £20,000 per annum for a single student",
      "One economy single airfare at both the beginning and end of the course",
      "Inbound visa costs & Immigration Health Surcharge (IHS)",
      "Discretionary funding for academic development and family allowance"
    ],
    "eligibility": [
      "Citizen of any country outside the United Kingdom",
      "Applying to pursue a full-time residential course of study (PhD, MSc, MLitt, or one-year postgraduate)",
      "Demonstrated intellectual capacity, leadership potential, and commitment to improving others' lives"
    ],
    "howToApply": "Apply for admission to a Cambridge course and a College place, and submit the Gates Cambridge part of the funding section via the Cambridge Graduate Admissions Portal.",
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
    "deadline": "November 5, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Palace_of_Westminster_from_the_dome_of_Methodist_Central_Hall.jpg/1280px-Palace_of_Westminster_from_the_dome_of_Methodist_Central_Hall.jpg",
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
    "infoUrl": "https://www.chevening.org/scholarships/"
  },
  {
    "id": "daad-helmut-schmidt",
    "name": "DAAD Helmut-Schmidt-Programme (Public Policy & Good Governance)",
    "sponsor": "German Academic Exchange Service (DAAD)",
    "location": "Bonn, Berlin, Erfurt & Multiple Cities, Germany",
    "level": "Masters",
    "deadline": "October 31, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Brandenburger_Tor_abends.jpg/1280px-Brandenburger_Tor_abends.jpg",
    "summary": "Supports future leaders from developing and emerging countries who want to promote democracy, good governance, and social justice in their home regions through specialized master's programs.",
    "coverage": [
      "Full exemption from tuition fees at participating German higher education institutions",
      "Monthly scholarship allowance of €934",
      "Contributions towards health, accident, and personal liability insurance in Germany",
      "Appropriate travel allowances between Germany and country of origin",
      "Pre-master German language course (up to 6 months) fully funded"
    ],
    "eligibility": [
      "Graduates with a first university degree in social sciences, political science, law, economics, or public administration",
      "Degree completed with above-average grades within the last six years",
      "Citizens of developing and emerging countries listed on the DAC list",
      "Demonstrated professional commitment to public welfare and civic society"
    ],
    "howToApply": "Submit application directly to the selected master courses at participating German universities along with the DAAD application form and required documentation.",
    "applyUrl": "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=50026397",
    "applyLabel": "DAAD Official Portal",
    "infoUrl": "https://www.daad.de/"
  },
  {
    "id": "eth-zurich-excellence",
    "name": "ETH Zurich Excellence Scholarship & Opportunity Programme (ESOP)",
    "sponsor": "ETH Zurich",
    "location": "Zurich, Switzerland",
    "level": "Masters",
    "deadline": "November 30, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/ETH_Z%C3%BCrich_Hauptgeb%C3%A4ude_2009.jpg/1280px-ETH_Z%C3%BCrich_Hauptgeb%C3%A4ude_2009.jpg",
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
    "deadline": "October 14, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Stanford_Oval_May_2011_panoramic.jpg/1280px-Stanford_Oval_May_2011_panoramic.jpg",
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
    "id": "schwarzman-scholars",
    "name": "Schwarzman Scholars at Tsinghua University",
    "sponsor": "Schwarzman Scholars & Tsinghua University",
    "location": "Beijing, China",
    "level": "Masters / Fellowship / Training",
    "deadline": "October 20, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Skyline_of_Beijing_CBD_with_B-5906_approaching_%2820211016171955%29_%281%29.jpg/1280px-Skyline_of_Beijing_CBD_with_B-5906_approaching_%2820211016171955%29_%281%29.jpg",
    "summary": "An elite one-year Master of Global Affairs program at Tsinghua University designed to prepare future leaders to understand China's role in global trends.",
    "coverage": [
      "Full tuition and comprehensive fees",
      "Room and board at Schwarzman College residential campus",
      "Round-trip airfare to and from Beijing at the beginning and end of the program",
      "Monthly stipend of $4,000 for personal and study expenses",
      "Required in-country study tour travel and health insurance"
    ],
    "eligibility": [
      "Completed undergraduate degree prior to enrollment",
      "Between 18 and 28 years of age as of August 1 of the enrollment year",
      "Demonstrated leadership capacity, exemplary character, and intellectual acuity",
      "High English language proficiency (TOEFL or IELTS required for non-native speakers)"
    ],
    "howToApply": "Complete the online application through the Schwarzman Scholars admissions portal, submitting essays, resume, letters of recommendation, and a video introduction.",
    "applyUrl": "https://www.schwarzmanscholars.org/admissions/",
    "applyLabel": "Apply on Schwarzman Portal",
    "infoUrl": "https://www.schwarzmanscholars.org/"
  },
  {
    "id": "erasmus-mundus-joint-masters",
    "name": "Erasmus Mundus Joint Masters Scholarships (EMJM)",
    "sponsor": "European Commission (European Union)",
    "location": "Multiple European & International Partner Universities",
    "level": "Masters",
    "deadline": "January 15, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/960px-Flag_of_Europe.svg.png",
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
    "infoUrl": "https://ec.europa.eu/"
  },
  {
    "id": "swiss-government-excellence",
    "name": "Swiss Government Excellence Scholarships for Foreign Scholars",
    "sponsor": "Federal Commission for Scholarships for Foreign Students (FCS)",
    "location": "All Swiss Cantonal Universities & Federal Institutes (ETH & EPFL), Switzerland",
    "level": "PhD / Postgraduate / Fellowship / Training",
    "deadline": "December 1, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Flag_of_Switzerland_%28Pantone%29.svg/1024px-Flag_of_Switzerland_%28Pantone%29.svg.png",
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
    "deadline": "January 10, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/1024px-Flag_of_France.svg.png",
    "summary": "Established by the French Ministry to enable French higher education institutions to attract top foreign students for master's and doctoral degree programs.",
    "coverage": [
      "Monthly allowance of €1,181 for Master's level and €1,800 for Doctoral level",
      "International round-trip airfare and internal French transit",
      "French social security coverage and supplementary health insurance",
      "Assistance in finding student accommodation and cultural activity discounts"
    ],
    "eligibility": [
      "Foreign nationality candidates up to 27 years old (Master's) or 32 years old (PhD)",
      "Fields of study: Science & Tech, Economics & Management, Law, and Political Science",
      "Direct application by the student is not permitted: must be nominated by a French institution"
    ],
    "howToApply": "Apply for admission to a French university or Grande École and express interest in the Eiffel scholarship. The French institution submits the dossier on your behalf to Campus France.",
    "applyUrl": "https://www.campusfrance.org/en/france-excellence-eiffel-scholarship-program",
    "applyLabel": "Campus France Portal",
    "infoUrl": "https://www.diplomatie.gouv.fr/"
  },
  {
    "id": "mext-japan-scholarship",
    "name": "Japanese Government (MEXT) University Recommendation Scholarship",
    "sponsor": "Ministry of Education, Culture, Sports, Science and Technology (MEXT)",
    "location": "National Universities Across Japan",
    "level": "Undergraduate / Masters / PhD / Postgraduate",
    "deadline": "January 30, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/1024px-Flag_of_Japan.svg.png",
    "summary": "Full government scholarship enabling international scholars to pursue undergraduate or graduate degree studies across premier Japanese research universities.",
    "coverage": [
      "100% exemption from entrance examination, matriculation, and tuition fees",
      "Monthly stipend: ¥117,000 for undergrad, ¥144,000 for Master's, ¥145,000 for PhD",
      "Round-trip economy class international airfare between home country and Japan",
      "Intensive preparatory Japanese language courses provided free of charge"
    ],
    "eligibility": [
      "Foreign national under 35 years of age at time of enrollment",
      "Demonstrated high academic standing (GPA 2.30/3.00 minimum on MEXT scale)",
      "Clear commitment to studying Japanese society, language, or relevant scientific field"
    ],
    "howToApply": "Apply either through the Embassy Recommendation track via your local Japanese Embassy, or through the University Recommendation track via a participating Japanese host university.",
    "applyUrl": "https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/",
    "applyLabel": "Study in Japan (MEXT)",
    "infoUrl": "https://www.mext.go.jp/en/"
  },
  {
    "id": "australia-awards-scholarships",
    "name": "Australia Awards Scholarships",
    "sponsor": "Department of Foreign Affairs and Trade (DFAT), Australian Government",
    "location": "Australian Universities, Australia",
    "level": "Undergraduate / Masters / PhD / Postgraduate",
    "deadline": "April 30, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Flag_of_Australia.svg/1024px-Flag_of_Australia.svg.png",
    "summary": "Long-term development awards administered by the Department of Foreign Affairs and Trade to contribute to the development needs of Australia's partner countries.",
    "coverage": [
      "Full tuition fees for the entire duration of the course",
      "Return air travel (economy class) to and from Australia",
      "Establishment allowance of AUD 5,000 towards accommodation, books, and study materials",
      "Contribution to Living Expenses (CLE) paid fortnightly to cover basic living costs",
      "Overseas Student Health Cover (OSHC) for the duration of the award"
    ],
    "eligibility": [
      "Citizen of an eligible participating country in Asia, Pacific, Middle East, or Africa",
      "Minimum age of 18 at commencement of study",
      "Fulfill Australian university academic entry and English language proficiency requirements",
      "Agree to return home for at least two years after completing the scholarship"
    ],
    "howToApply": "Check country-specific eligibility criteria on the DFAT website, then register and apply online via the OASIS (Online Australia Awards Scholarships Information System) portal.",
    "applyUrl": "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships",
    "applyLabel": "DFAT Australia Awards Portal",
    "infoUrl": "https://www.dfat.gov.au/"
  },
  {
    "id": "singa-singapore-award",
    "name": "Singapore International Graduate Award (SINGA)",
    "sponsor": "A*STAR, NTU, NUS & SUTD",
    "location": "Singapore",
    "level": "PhD / Postgraduate",
    "deadline": "December 1, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Singapore.svg/1024px-Flag_of_Singapore.svg.png",
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
    "deadline": "October 15, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Flag_of_the_United_Kingdom.svg/1024px-Flag_of_the_United_Kingdom.svg.png",
    "summary": "Funded by the UK FCDO, enabling talented and motivated individuals from low and middle income Commonwealth countries to gain the skills needed for sustainable development.",
    "coverage": [
      "Approved airfare from your home country to the UK and return at the end of award",
      "Full tuition fees paid directly to the host university",
      "Stipend (living allowance) at the rate of £1,347 per month, or £1,652 per month in London",
      "Warm clothing allowance, study travel grant, and family allowances where eligible"
    ],
    "eligibility": [
      "Citizen of or granted refugee status by an eligible Commonwealth country",
      "Hold a first degree of at least upper second class (2:1) honours standard",
      "Unable to afford to study in the UK without this scholarship"
    ],
    "howToApply": "Apply through the CSC's online application system in addition to applying through a national nominating agency or invited university.",
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
    "deadline": "February 20, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/1024px-Flag_of_Turkey.svg.png",
    "summary": "A government-funded competitive scholarship program awarded to outstanding students and researchers to pursue full-time degree studies in Turkey.",
    "coverage": [
      "Full university tuition fees and university placement included",
      "Monthly stipend: 1,700 TL for Bachelor, 2,400 TL for Master, 3,000 TL for PhD",
      "Free university dormitory accommodation",
      "One-year free Turkish Language Course prior to academic studies",
      "One-off return flight ticket and general health insurance"
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
    "deadline": "January 15, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/1024px-Flag_of_Saudi_Arabia.svg.png",
    "summary": "A premier award supporting all admitted Master's and PhD students at KAUST, providing comprehensive funding in advanced scientific and engineering research.",
    "coverage": [
      "Full tuition support for MS and PhD degree programs",
      "Substantial monthly living allowance ($20,000 to $30,000 annually)",
      "On-campus housing at a state-of-the-art Red Sea research community",
      "Medical and dental insurance coverage",
      "Relocation allowances and annual round-trip flight tickets"
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
    "deadline": "January 8, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Radcliffe_Camera%2C_Oxford_-_Oct_2006.jpg/1280px-Radcliffe_Camera%2C_Oxford_-_Oct_2006.jpg",
    "summary": "Oxford's largest graduate scholarship scheme, offering around 140 fully-funded awards each year to outstanding graduate scholars from all around the world.",
    "coverage": [
      "Full coverage of all Oxford course tuition and college fees",
      "Generous annual grant for living expenses (exceeding £19,000 per year)",
      "Access to Clarendon Scholars' Council networking, symposia, and cultural events"
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
    "deadline": "January 8, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Radcliffe_Camera%2C_Oxford_-_Oct_2006.jpg/1280px-Radcliffe_Camera%2C_Oxford_-_Oct_2006.jpg",
    "summary": "Cultivates the leaders of tomorrow by providing outstanding university graduates from emerging economies with full funding and comprehensive leadership training.",
    "coverage": [
      "100% of Oxford University tuition and college fees",
      "Living stipend of at least £19,237 to cover accommodation and meals",
      "Comprehensive Leadership Programme including professional skills seminars and retreats"
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
    "deadline": "February 1, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Flag_of_the_Netherlands.svg/1024px-Flag_of_the_Netherlands.svg.png",
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
    "infoUrl": "https://www.studyinnl.org/"
  },
  {
    "id": "vanier-cgs-canada",
    "name": "Vanier Canada Graduate Scholarships",
    "sponsor": "Government of Canada (CIHR, NSERC, SSHRC)",
    "location": "Canadian Research Universities, Canada",
    "level": "PhD / Postgraduate",
    "deadline": "November 1, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Canada_%28Pantone%29.svg/1024px-Flag_of_Canada_%28Pantone%29.svg.png",
    "summary": "Strengthens Canada's ability to attract and retain world-class doctoral students by providing prestigious research funding to top Canadian and international doctoral candidates.",
    "coverage": [
      "$50,000 CAD per year for three years during doctoral studies",
      "Independent research funding recognized worldwide"
    ],
    "eligibility": [
      "Canadian citizens, permanent residents of Canada, and international students",
      "Pursuing their first doctoral degree in health research, natural sciences, engineering, or social sciences",
      "Nominated by only one Canadian institution which must hold a Vanier CGS quota"
    ],
    "howToApply": "Contact the graduate studies office of the Canadian university where you intend to study to be nominated, and prepare your application on ResearchNet.",
    "applyUrl": "https://vanier.gc.ca/en/home-accueil.html",
    "applyLabel": "Vanier CGS Official Page",
    "infoUrl": "https://vanier.gc.ca/"
  },
  {
    "id": "banting-postdoctoral-fellowship",
    "name": "Banting Postdoctoral Fellowships",
    "sponsor": "Government of Canada",
    "location": "Host Universities Across Canada & Abroad",
    "level": "Postgraduate / Fellowship / Training",
    "deadline": "October 28, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Canada_%28Pantone%29.svg/1024px-Flag_of_Canada_%28Pantone%29.svg.png",
    "summary": "Provides elite funding to the very best postdoctoral applicants, both nationally and internationally, who will positively contribute to the country's economic, social, and research growth.",
    "coverage": [
      "$70,000 CAD per year (taxable) for two consecutive years",
      "Comprehensive institutional mentorship and advanced lab resources"
    ],
    "eligibility": [
      "Canadian and international researchers who have fulfilled all degree requirements for a PhD within the last three years",
      "Must be formally endorsed and hosted by an eligible Canadian or international university"
    ],
    "howToApply": "Secure institutional support from a prospective faculty mentor, then develop a joint research proposal and submit through ResearchNet.",
    "applyUrl": "https://banting.fellowships-bourses.gc.ca/en/home-accueil.html",
    "applyLabel": "Banting Fellowships Portal",
    "infoUrl": "https://banting.fellowships-bourses.gc.ca/"
  },
  {
    "id": "rotary-peace-fellowships",
    "name": "Rotary Peace Fellowships",
    "sponsor": "The Rotary Foundation",
    "location": "Rotary Peace Centers Across 6 Continents (UK, USA, Japan, Australia, Sweden, Uganda)",
    "level": "Masters / Fellowship / Training",
    "deadline": "May 15, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Rotary_International_emblem.svg/1024px-Rotary_International_emblem.svg.png",
    "summary": "Fully funded academic fellowships for dedicated leaders to obtain Master's degrees or professional development certificates in peace, conflict resolution, and development studies.",
    "coverage": [
      "Full tuition and academic course fees",
      "Round-trip international transportation",
      "Room and board accommodation for the entire program",
      "Internship, applied field study, and conference travel funding"
    ],
    "eligibility": [
      "Proficiency in English with relevant Bachelor's degree",
      "Minimum of three years of full-time related work experience for Master's programs, or five years for Certificate",
      "Demonstrated commitment to community service and international peace"
    ],
    "howToApply": "Submit an online application through the Rotary Peace Fellowship portal, and request an endorsement from your local Rotary district.",
    "applyUrl": "https://www.rotary.org/en/our-programs/peace-fellowships",
    "applyLabel": "Rotary Peace Portal",
    "infoUrl": "https://www.rotary.org/"
  },
  {
    "id": "fulbright-foreign-student",
    "name": "Fulbright Foreign Student Program",
    "sponsor": "U.S. Department of State (Bureau of Educational and Cultural Affairs)",
    "location": "Accredited Universities Across the United States",
    "level": "Masters / PhD / Postgraduate / Fellowship / Training",
    "deadline": "October 15, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/1024px-Flag_of_the_United_States.svg.png",
    "summary": "The U.S. government's flagship international educational exchange program, bringing graduate students and artists from over 160 countries to study in the United States.",
    "coverage": [
      "Full tuition and fee waivers at host American universities",
      "Monthly living stipend matching local cost of living standards",
      "Round-trip economy international air travel",
      "Accident and sickness coverage in accordance with U.S. government regulations (ASPE)",
      "Pre-academic orientation and gateway enrichment seminars"
    ],
    "eligibility": [
      "Citizens of participating countries who hold a Bachelor's degree or equivalent",
      "Strong academic background and English proficiency (TOEFL/IELTS)",
      "Program eligibility and selection criteria vary by home country commission"
    ],
    "howToApply": "Apply through the Fulbright Commission or Public Affairs Section of the U.S. Embassy in your home country.",
    "applyUrl": "https://foreign.fulbrightonline.org/about/foreign-student-program",
    "applyLabel": "Fulbright Foreign Portal",
    "infoUrl": "https://foreign.fulbrightonline.org/"
  },
  {
    "id": "hubert-humphrey-fellowship",
    "name": "Hubert H. Humphrey Fellowship Program",
    "sponsor": "U.S. Department of State",
    "location": "Designated Host Universities Across the United States",
    "level": "Fellowship / Training",
    "deadline": "November 1, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/1024px-Flag_of_the_United_States.svg.png",
    "summary": "A 10-month non-degree fellowship for experienced mid-career professionals from designated countries who demonstrate potential for leadership in public service.",
    "coverage": [
      "Payment of tuition and academic fees at assigned host university",
      "Pre-academic English language training if required",
      "Monthly maintenance allowance, settling-in allowance, and book allowance",
      "Round-trip international travel and internal program travel",
      "Professional development allowance for field trips and conferences"
    ],
    "eligibility": [
      "Undergraduate degree with a minimum of five years of professional experience",
      "Demonstrated commitment to public service in government or non-profit sector",
      "Demonstrated leadership qualities and record of public achievement"
    ],
    "howToApply": "Contact the U.S. Embassy or Binational Fulbright Commission in your country to submit the official Humphrey application.",
    "applyUrl": "https://www.humphreyfellowship.org/",
    "applyLabel": "Humphrey Official Portal",
    "infoUrl": "https://eca.state.gov/humphrey-fellowship"
  },
  {
    "id": "yenching-academy-fellowship",
    "name": "Yenching Academy Fellowship at Peking University",
    "sponsor": "Peking University",
    "location": "Beijing, China",
    "level": "Masters / Fellowship / Training",
    "deadline": "December 1, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1024px-Flag_of_the_People%27s_Republic_of_China.svg.png",
    "summary": "A fully funded master's program in China Studies designed to cultivate students who will serve as bridges between China and the rest of the world.",
    "coverage": [
      "Full tuition coverage for the Master of China Studies program",
      "Accommodation in the Yenching Academy residential building on Peking University campus",
      "Monthly living stipend of 3,500 RMB for daily living expenses",
      "Round-trip travel stipend between home country and Beijing",
      "Field study trips and excursions across diverse Chinese provinces"
    ],
    "eligibility": [
      "Minimum of a Bachelor's degree in any field, awarded no later than August 31 of enrollment year",
      "Outstanding academic record, strong English proficiency, and intercultural readiness",
      "Record of extracurricular leadership, community engagement, and social responsibility"
    ],
    "howToApply": "Submit an online application via the Yenching Academy Admissions Portal with transcripts, personal statement, study plan, CV, and two academic recommendation letters.",
    "applyUrl": "https://yenchingacademy.pku.edu.cn/ADMISSIONS.htm",
    "applyLabel": "Yenching Admissions Page",
    "infoUrl": "https://yenchingacademy.pku.edu.cn/"
  },
  {
    "id": "mastercard-foundation-scholars",
    "name": "Mastercard Foundation Scholars Program",
    "sponsor": "Mastercard Foundation",
    "location": "Partner Universities in Africa, Europe, North America & Global",
    "level": "Undergraduate / Masters",
    "deadline": "January 15, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/1024px-Mastercard_2019_logo.svg.png",
    "summary": "Enables bright, leadership-minded young Africans facing financial barriers to pursue undergraduate and graduate degrees at world-class partner institutions.",
    "coverage": [
      "Comprehensive tuition fees and university registration costs",
      "Books, learning materials, and computer technology allowance",
      "Housing, meals, and monthly living stipend",
      "Comprehensive medical insurance and visa costs",
      "Leadership training, career mentoring, and entrepreneurship seed grants"
    ],
    "eligibility": [
      "Academically talented young individuals who are citizens of African countries",
      "Demonstrated commitment to giving back to their home communities",
      "Facing significant socio-economic barriers to higher education"
    ],
    "howToApply": "Apply directly through a Mastercard Foundation partner university (e.g. McGill, Edinburgh, Oxford, UCT, KNUST, Makerere) of your choice.",
    "applyUrl": "https://mastercardfdn.org/all/scholars/becoming-a-scholar/",
    "applyLabel": "Mastercard Foundation Portal",
    "infoUrl": "https://mastercardfdn.org/"
  },
  {
    "id": "world-bank-scholarship-program",
    "name": "Joint Japan/World Bank Graduate Scholarship Program (JJ/WBGSP)",
    "sponsor": "World Bank Group & Government of Japan",
    "location": "Participating Universities in US, Europe, Africa & Japan",
    "level": "Masters",
    "deadline": "March 31, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/The_World_Bank_logo.svg/1024px-The_World_Bank_logo.svg.png",
    "summary": "Provides scholarships to students from developing countries with relevant professional experience to pursue development-focused master's degrees.",
    "coverage": [
      "Full tuition fees for the approved Master's program",
      "Economy class air travel between home country and host university",
      "Monthly living allowance to cover housing, meals, and books",
      "Basic medical insurance obtained through the host university"
    ],
    "eligibility": [
      "National of a World Bank member developing country",
      "Hold a Bachelor's degree with at least 3 years of development-related work experience",
      "Unconditional admission offer to one of the JJ/WBGSP participating master's programs"
    ],
    "howToApply": "Secure an admission letter from an eligible participating university master's program, then complete the online JJ/WBGSP scholarship application.",
    "applyUrl": "https://www.worldbank.org/en/programs/scholarships#3",
    "applyLabel": "World Bank Scholarships",
    "infoUrl": "https://www.worldbank.org/"
  },
  {
    "id": "adb-japan-scholarship",
    "name": "Asian Development Bank–Japan Scholarship Program (ADB-JSP)",
    "sponsor": "Asian Development Bank & Government of Japan",
    "location": "Designated Institutions in Asia & Pacific (Japan, Singapore, Australia, etc.)",
    "level": "Masters",
    "deadline": "March 15, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Flag_of_the_Asian_Development_Bank.svg/1024px-Flag_of_the_Asian_Development_Bank.svg.png",
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
    "infoUrl": "https://www.adb.org/"
  },
  {
    "id": "skoll-scholarship-oxford",
    "name": "Skoll Scholarship for MBA at Saïd Business School",
    "sponsor": "Skoll Centre for Social Entrepreneurship, University of Oxford",
    "location": "Oxford, United Kingdom",
    "level": "Masters",
    "deadline": "January 8, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Radcliffe_Camera%2C_Oxford_-_Oct_2006.jpg/1280px-Radcliffe_Camera%2C_Oxford_-_Oct_2006.jpg",
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
    "howToApply": "Apply to the Oxford MBA programme during Stage 1 or Stage 2, and tick the box for the Skoll Scholarship in the MBA application form.",
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
    "deadline": "February 12, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Flag_of_the_United_Kingdom.svg/1024px-Flag_of_the_United_Kingdom.svg.png",
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
    "deadline": "March 31, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Aga_Khan_Development_Network_logo.svg/1024px-Aga_Khan_Development_Network_logo.svg.png",
    "summary": "Supports outstanding students from developing countries who have no other means of financing their postgraduate education to build future leaders.",
    "coverage": [
      "Full tuition fees and living expenses (50% grant and 50% loan combination)",
      "Annual review and renewal for the full course duration",
      "Favorable low-interest repayment terms starting six months after graduation"
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
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/1024px-Flag_of_the_United_States.svg.png",
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
    "id": "aauw-international-fellowships",
    "name": "AAUW International Fellowships for Women",
    "sponsor": "American Association of University Women (AAUW)",
    "location": "United States Universities & Research Centers",
    "level": "Masters / PhD / Postgraduate / Fellowship / Training",
    "deadline": "November 15, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/1024px-Flag_of_the_United_States.svg.png",
    "summary": "Supports women pursuing full-time graduate or postdoctoral study in the United States who are not U.S. citizens or permanent residents.",
    "coverage": [
      "Master's/First Professional Degree Fellowship: $20,000",
      "Doctoral Fellowship: $25,000",
      "Postdoctoral Fellowship: $50,000",
      "Funds support living expenses, educational expenses, and dependent child care"
    ],
    "eligibility": [
      "Women who are citizens of a country other than the United States",
      "Hold an academic degree equivalent to a U.S. bachelor's degree",
      "Intend to devote themselves to full-time academic study or research"
    ],
    "howToApply": "Complete the online application through the AAUW application portal, submitting proof of degree, transcripts, project description, and letters of recommendation.",
    "applyUrl": "https://www.aauw.org/resources/programs/fellowships-grants/current-opportunities/international/",
    "applyLabel": "AAUW Fellowships Portal",
    "infoUrl": "https://www.aauw.org/"
  },
  {
    "id": "humboldt-research-fellowship",
    "name": "Alexander von Humboldt Research Fellowships",
    "sponsor": "Alexander von Humboldt Foundation",
    "location": "German Universities & Research Institutes, Germany",
    "level": "Postgraduate / Fellowship / Training",
    "deadline": "November 1, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Germany.svg/1024px-Flag_of_Germany.svg.png",
    "summary": "Enables excellent post-doctoral and experienced scientists and scholars of all nationalities and disciplines to conduct research in Germany.",
    "coverage": [
      "Monthly fellowship allowance of €2,700 for postdoctoral researchers, or €3,200 for experienced researchers",
      "Comprehensive travel expenses, language course subsidies, and family allowances",
      "Extensive lifelong alumni sponsorship and international network support"
    ],
    "eligibility": [
      "Doctorate completed within the last four years (for postdocs) or twelve years (for experienced researchers)",
      "Academic publications in peer-reviewed journals or publishing houses",
      "Host research agreement from an academic host at a research institution in Germany"
    ],
    "howToApply": "Submit application online to the Humboldt Foundation together with research plan, host agreement, and references.",
    "applyUrl": "https://www.humboldt-foundation.de/en/apply/sponsorship-programmes/humboldt-research-fellowship",
    "applyLabel": "Humboldt Portal",
    "infoUrl": "https://www.humboldt-foundation.de/"
  },
  {
    "id": "jsps-postdoctoral-fellowship",
    "name": "JSPS Postdoctoral Fellowship for Research in Japan",
    "sponsor": "Japan Society for the Promotion of Science (JSPS)",
    "location": "Japanese Universities and National Research Institutes, Japan",
    "level": "PhD / Postgraduate / Fellowship / Training",
    "deadline": "December 4, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/1024px-Flag_of_Japan.svg.png",
    "summary": "Provides opportunities for young foreign postdoctoral researchers to conduct collaborative research with leading research groups in universities across Japan.",
    "coverage": [
      "Round-trip international flight airfare",
      "Monthly maintenance allowance of ¥362,000",
      "Settling-in allowance of ¥200,000",
      "Overseas travel insurance coverage and Grant-in-Aid for Scientific Research"
    ],
    "eligibility": [
      "Citizen of a country that has diplomatic relations with Japan",
      "Hold a doctorate degree obtained within six years prior to start date",
      "Arranged a research plan with a prospective host researcher in Japan"
    ],
    "howToApply": "The prospective host researcher in Japan submits the application on the candidate's behalf through the JSPS electronic application system.",
    "applyUrl": "https://www.jsps.go.jp/english/e-fellow/postdoctoral.html",
    "applyLabel": "JSPS Fellowship Portal",
    "infoUrl": "https://www.jsps.go.jp/"
  },
  {
    "id": "vlir-uos-scholarships",
    "name": "VLIR-UOS ICP Connect Master Scholarships",
    "sponsor": "Flemish Government & VLIR-UOS",
    "location": "Flemish Universities in Flanders & Brussels, Belgium",
    "level": "Masters",
    "deadline": "March 1, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Flag_of_Belgium.svg/1024px-Flag_of_Belgium.svg.png",
    "summary": "Funds full scholarships for students from 29 eligible partner countries in the Global South to follow English-taught master's programs in Belgium.",
    "coverage": [
      "Full tuition fee payment and comprehensive study costs",
      "Monthly living allowance of €1,400",
      "Accommodation support and university housing coordination",
      "Worldwide health, travel, and accident insurance",
      "Direct round-trip international flight tickets"
    ],
    "eligibility": [
      "Resident and national of one of the 29 eligible developing countries",
      "Age maximum of 35 years for initial master's, or 45 years for advanced master's",
      "Demonstrated professional background relevant to international development"
    ],
    "howToApply": "Check the list of eligible ICP Connect master programmes on the VLIR-UOS site, apply for program admission, and indicate that you wish to apply for the scholarship.",
    "applyUrl": "https://www.vliruos.be/en/scholarships/6",
    "applyLabel": "VLIR-UOS Official Portal",
    "infoUrl": "https://www.vliruos.be/"
  },
  {
    "id": "global-korea-scholarship",
    "name": "Global Korea Scholarship (GKS Graduate)",
    "sponsor": "National Institute for International Education (NIIED), South Korea",
    "location": "Participating Universities Across South Korea",
    "level": "Undergraduate / Masters / PhD / Postgraduate",
    "deadline": "March 20, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/1024px-Flag_of_South_Korea.svg.png",
    "summary": "A governmental scholarship designed to promote international educational exchange and mutual friendship by offering foreign students higher education opportunities in South Korea.",
    "coverage": [
      "Full university admission fees and tuition for entire degree program",
      "Monthly living allowance: 1,000,000 KRW for Master's/PhD and 1,500,000 KRW for research",
      "1-year intensive Korean language training fees fully covered",
      "Return economy flight ticket, settlement allowance, and medical insurance"
    ],
    "eligibility": [
      "Candidate and candidate's parents must not hold Korean citizenship",
      "Under 40 years of age on date of entrance",
      "Hold a Bachelor's (for Master's) or Master's (for PhD) with GPA above 80% on 100-point scale"
    ],
    "howToApply": "Apply via Embassy Track through the Korean Embassy in your home country, or via University Track directly through a designated Korean university.",
    "applyUrl": "https://www.studyinkorea.go.kr/en/scholarship/gks_notice_list.do",
    "applyLabel": "Study in Korea GKS Page",
    "infoUrl": "https://www.studyinkorea.go.kr/"
  },
  {
    "id": "manaaki-nz-scholarships",
    "name": "Manaaki New Zealand Scholarships",
    "sponsor": "Ministry of Foreign Affairs and Trade (MFAT), New Zealand",
    "location": "Universities in New Zealand & Pacific Islands",
    "level": "Undergraduate / Masters / PhD / Postgraduate",
    "deadline": "April 10, 2027",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Flag_of_New_Zealand.svg/1024px-Flag_of_New_Zealand.svg.png",
    "summary": "Government-funded scholarships for international students from eligible developing countries to study in New Zealand and build lasting global relationships.",
    "coverage": [
      "Full tuition fees for the duration of the qualification",
      "Living allowance (stipend) of NZD 531 per week to cover basic living expenses",
      "Establishment allowance of NZD 3,000 to assist with setup and study costs",
      "Medical and travel insurance and return economy airfare",
      "Reintegration allowance of NZD 1,000 upon return to home country"
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
    "id": "mccall-macbain-scholarship",
    "name": "McCall MacBain Scholarships at McGill University",
    "sponsor": "McCall MacBain Foundation & McGill University",
    "location": "Montreal, Quebec, Canada",
    "level": "Masters / Fellowship / Training",
    "deadline": "October 15, 2026",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/McGill_Arts_Building.JPG/1280px-McGill_Arts_Building.JPG",
    "summary": "A comprehensive graduate leadership scholarship that provides mentorship, leadership development, and full funding for master's or professional degrees at McGill.",
    "coverage": [
      "Full tuition and fees for the normal duration of the master's or professional degree",
      "Living stipend of $2,000 CAD per month during academic terms",
      "One-time relocation grant for moving to Montreal",
      "Dedicated mentorship, leadership coaching, and interdisciplinary retreats"
    ],
    "eligibility": [
      "Graduates holding or expecting to hold an undergraduate degree by August 2027",
      "International, Canadian, and U.S. applicants with exceptional character and leadership",
      "Concurrently applying for an eligible Master's degree program at McGill University"
    ],
    "howToApply": "Submit an online application for the McCall MacBain Scholarship via their dedicated portal, and submit an application for admission to McGill University.",
    "applyUrl": "https://apply.mccallmacbainscholars.org/apply",
    "applyLabel": "Apply on McCall MacBain",
    "infoUrl": "https://mccallmacbainscholars.org/"
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
