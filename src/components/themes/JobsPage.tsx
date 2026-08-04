import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Building2, CheckCircle2, ExternalLink, ChevronDown, ChevronLeft, ChevronRight, Briefcase, Search, Flame, Globe2, LayoutGrid, X } from 'lucide-react';
import { apiUrl } from '../../lib/api';

type StaticPage = 'about' | 'contact' | 'privacy' | 'terms';

interface JobsPageProps {
  onNavigateHome: () => void;
  onNavigateScholarships?: () => void;
  onNavigateStatic?: (page: StaticPage) => void;
  onNavigateWorldNews?: () => void;
  onNavigateEntertainment?: () => void;
}

const JOB_CATEGORIES = [
  'Engineering & Data',
  'Business, Finance & Consulting',
  'Policy, Government & Nonprofit',
  'Design, Marketing & Ops',
] as const;
type JobCategory = (typeof JOB_CATEGORIES)[number];

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: JobCategory;
  deadline: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  howToApply: string;
  applyUrl: string;
  applyLabel: string;
  note?: string;
}

// Same "best-effort concrete date" extraction the Scholarships page uses — dates that
// don't match "Month D, YYYY" (e.g. "Rolling", "See official listing") are treated as
// "no known deadline" rather than sorted arbitrarily.
function parseDeadlineDate(deadline: string): Date | null {
  const match = deadline.match(/([A-Z][a-z]+ \d{1,2},\s*\d{4})/);
  if (!match) return null;
  const parsed = new Date(match[1]);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function categoryColor(category: JobCategory): string {
  switch (category) {
    case 'Engineering & Data':
      return '#2563eb';
    case 'Business, Finance & Consulting':
      return '#7c3aed';
    case 'Policy, Government & Nonprofit':
      return '#ea580c';
    case 'Design, Marketing & Ops':
      return '#db2777';
  }
}

function getInitials(company: string): string {
  const clean = company.replace(/\(.*?\)/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const jobs: Job[] = [
  {
    id: 'google-data-center-technician',
    title: 'Data Center Technician, Early Career, 2026 Starts',
    company: 'Google',
    location: 'Sydney / Melbourne, Australia (also remote-eligible in Mumbai & Bengaluru, India)',
    type: 'Full-time',
    category: 'Engineering & Data',
    deadline: 'Rolling — no fixed deadline (early-career 2026 intake)',
    summary: 'An entry-level hardware operations role maintaining the physical infrastructure that keeps Google\'s data centers running — installing, testing, and troubleshooting servers, networking gear, and related systems.',
    responsibilities: [
      'Install, configure, test, troubleshoot, and maintain data center hardware and server software',
      'Configure networking components such as routers, hubs, bridges, and switches',
      'Participate in or lead small project teams on larger installations',
      'Develop project contingency plans',
    ],
    requirements: [
      'Experience with component-level repair/troubleshooting of IT equipment, or a similar background (systems admin, network deployment, help desk)',
      'Experience working in a data center or network operations environment',
      'Ability to collaborate across teams in a dynamic environment',
    ],
    howToApply: 'Apply directly through the Google Careers portal listing.',
    applyUrl: 'https://www.google.com/about/careers/applications/jobs/results/82310447310480070-data-center-technician-early-career-2026-starts',
    applyLabel: 'Apply on Google Careers',
  },
  {
    id: 'google-ux-designer-payments',
    title: 'UX Designer, Payments',
    company: 'Google',
    location: 'United States',
    type: 'Full-time',
    category: 'Design, Marketing & Ops',
    deadline: 'Rolling — reviewed on an ongoing basis',
    summary: 'A product design role focused on Google Payments, shaping simple, seamless, and secure user experiences across Google\'s payments products.',
    responsibilities: [
      'Design end-to-end user flows and interaction patterns for payments products',
      'Partner with engineering, product management, and research to define product direction',
      'Build and maintain design systems and component libraries',
      'Present design rationale to cross-functional stakeholders',
    ],
    requirements: [
      'Several years of interaction/product design experience',
      'A portfolio or work samples required as part of the application',
      'Degree in Design, HCI, Computer Science, or equivalent practical experience',
      'Proficiency with modern design tooling (e.g. Figma)',
    ],
    howToApply: 'Apply via the listing on Google Careers.',
    applyUrl: 'https://careers.google.com/jobs/results/106981133790388934-ux-designer/',
    applyLabel: 'Apply on Google Careers',
    note: 'Google\'s careers site is JS-rendered, so some detail above is paraphrased from aggregated search snippets rather than the single live page — confirm exact requirements on the listing itself.',
  },
  {
    id: 'google-associate-product-marketing-manager',
    title: 'Associate Product Marketing Manager',
    company: 'Google',
    location: 'United States',
    type: 'Full-time',
    category: 'Design, Marketing & Ops',
    deadline: 'Rolling — reviewed on an ongoing basis',
    summary: 'An early-to-mid career marketing role responsible for go-to-market strategy, positioning, and campaign execution for a Google product area.',
    responsibilities: [
      'Develop go-to-market plans and messaging for a product area',
      'Run market research and competitive analysis',
      'Partner cross-functionally with product, communications, and sales teams',
      'Analyze campaign performance and iterate',
    ],
    requirements: [
      'Bachelor\'s degree or equivalent practical experience',
      'Experience in product, brand, or growth marketing (consumer tech or subscription businesses preferred)',
      'Strong analytical and cross-functional collaboration skills',
      'Familiarity with marketing/analytics tooling',
    ],
    howToApply: 'Apply directly on the Google Careers listing.',
    applyUrl: 'https://careers.google.com/jobs/results/135770205186859718-associate-product-marketing-manager/',
    applyLabel: 'Apply on Google Careers',
  },
  {
    id: 'microsoft-cloud-solution-architect',
    title: 'Cloud Solution Architect — Azure Core',
    company: 'Microsoft',
    location: 'United States',
    type: 'Full-time',
    category: 'Engineering & Data',
    deadline: 'Rolling — reviewed on an ongoing basis',
    summary: 'A customer-facing technical role helping enterprise customers design, deploy, and optimize solutions on Microsoft Azure.',
    responsibilities: [
      'Lead technical architecture discussions with enterprise customers',
      'Design and validate Azure-based solution architectures',
      'Support customer adoption and resolve technical blockers',
      'Collaborate with account and engineering teams on customer success',
    ],
    requirements: [
      'Experience with cloud architecture and infrastructure (Azure preferred)',
      'Customer-facing technical consulting or pre-sales background',
      'Strong communication and stakeholder management skills',
      'Relevant technical certifications a plus',
    ],
    howToApply: 'Apply via the specific requisition on the Microsoft Careers site.',
    applyUrl: 'https://jobs.careers.microsoft.com/global/en/job/1661869/Cloud-Solution-Architect---Azure-Core',
    applyLabel: 'Apply on Microsoft Careers',
    note: 'Exact location and full requirements could not be confirmed via automated page fetch — verify current details directly on the listing before applying.',
  },
  {
    id: 'amazon-sde-2026-us',
    title: 'Software Development Engineer — 2026 (US)',
    company: 'Amazon',
    location: 'Multiple US locations',
    type: 'Full-time',
    category: 'Engineering & Data',
    deadline: 'Rolling — for candidates graduating October 2025 through September 2026',
    summary: 'An early-career software engineering role building and operating large-scale distributed systems across Amazon\'s businesses.',
    responsibilities: [
      'Design, build, and ship features across the software development lifecycle',
      'Write and review production code with a focus on scalability and reliability',
      'Collaborate with cross-functional engineering teams',
      'Participate in on-call rotations and operational excellence practices',
    ],
    requirements: [
      'Bachelor\'s degree (or higher) in Computer Science, Computer Engineering, Data Science, or a related STEM field',
      'Demonstrated experience with a general-purpose language (Java, Python, C++, C#, Go, Rust, or TypeScript)',
      'Experience with data structures, algorithms, or object-oriented design principles',
      'Must be 18 or older',
    ],
    howToApply: 'Apply directly through Amazon\'s careers site.',
    applyUrl: 'https://www.amazon.jobs/en/jobs/3165140/software-development-engineer-2026-us',
    applyLabel: 'Apply on Amazon.jobs',
  },
  {
    id: 'meta-data-scientist-intern',
    title: 'Data Scientist Intern, Product Analytics (Summer 2026)',
    company: 'Meta',
    location: 'Menlo Park, CA / Seattle, WA / New York, NY (multiple)',
    type: 'Internship',
    category: 'Engineering & Data',
    deadline: 'Rolling — Summer 2026 internship cycle',
    summary: 'An internship analyzing large-scale product data to generate insights that inform Meta product decisions, working closely with cross-functional product teams.',
    responsibilities: [
      'Perform large-scale data analysis to extract business and product insights',
      'Communicate findings to cross-functional partners in product, engineering, and design',
      'Build and maintain analytical models and dashboards',
      'Partner with data science and product teams on experimentation',
    ],
    requirements: [
      'Currently pursuing a degree in a quantitative field (Computer Science, Statistics, Math, etc.)',
      'Experience with SQL and a statistical/scripting language (Python or R)',
      'Strong analytical and communication skills',
      'Prior data analysis project or internship experience preferred',
    ],
    howToApply: 'Apply via the listing on Meta Careers.',
    applyUrl: 'https://www.metacareers.com/jobs/804300811922734',
    applyLabel: 'Apply on Meta Careers',
  },
  {
    id: 'apple-fullstack-swe-aiml-tools',
    title: 'Full Stack Software Engineer, AI/ML Tools',
    company: 'Apple',
    location: 'Austin, TX',
    type: 'Full-time',
    category: 'Engineering & Data',
    deadline: 'Posted — currently listed as open (confirm live status before applying)',
    summary: 'A full-stack engineering role building internal tools that support AI/ML development workflows within Apple\'s Software and Services organization.',
    responsibilities: [
      'Build full-stack tools and platforms supporting AI/ML engineering workflows',
      'Collaborate with ML engineers and researchers on tooling needs',
      'Own features from design through production deployment',
      'Contribute to code quality, testing, and technical design reviews',
    ],
    requirements: [
      'Strong full-stack engineering background (front-end and back-end)',
      'Experience supporting or building ML/AI tooling or infrastructure',
      'Solid computer science fundamentals',
      'Bachelor\'s degree in Computer Science or related field, or equivalent experience',
    ],
    howToApply: 'Apply through Apple\'s official jobs portal.',
    applyUrl: 'https://jobs.apple.com/en-us/details/200673375-0157/full-stack-software-engineer-ai-ml-tools?team=SFTWR',
    applyLabel: 'Apply on Apple Careers',
    note: 'Title, team, and location were confirmed directly on Apple\'s live job search; full responsibilities/requirements text could not be extracted via automated fetch (JS-rendered) — review the live listing for full detail.',
  },
  {
    id: 'apple-epm-ai-data-platform',
    title: 'Engineering Program Manager, AI and Data Platform',
    company: 'Apple (Services Engineering)',
    location: 'Seattle, WA',
    type: 'Full-time',
    category: 'Engineering & Data',
    deadline: 'Posted — currently listed as open (confirm live status before applying)',
    summary: 'A program management role coordinating cross-functional delivery for Apple\'s AI and data platform initiatives within Services Engineering.',
    responsibilities: [
      'Drive planning and execution across engineering teams building AI/data platform capabilities',
      'Coordinate cross-functional dependencies and timelines',
      'Identify and mitigate program risks',
      'Communicate program status to engineering leadership',
    ],
    requirements: [
      'Experience as a technical program/project manager in software engineering',
      'Familiarity with data platform or AI/ML systems',
      'Strong cross-functional communication and organizational skills',
      'Bachelor\'s degree in a technical field or equivalent experience',
    ],
    howToApply: 'Apply through Apple\'s official jobs portal.',
    applyUrl: 'https://jobs.apple.com/en-us/details/200673483-3337/engineering-program-manager-ai-and-data-platform-apple-services-engineering?team=SFTWR',
    applyLabel: 'Apply on Apple Careers',
    note: 'Title, team, and location were confirmed directly on Apple\'s live job search; detailed requirements text could not be extracted via automated fetch — review the live listing for full detail.',
  },
  {
    id: 'netflix-senior-manager-content-policy-apac',
    title: 'Senior Manager, Content Policy & Online Safety, APAC',
    company: 'Netflix',
    location: 'Singapore',
    type: 'Full-time (onsite)',
    category: 'Policy, Government & Nonprofit',
    deadline: 'Posted — currently listed as open (confirm live status before applying)',
    summary: 'A trust-and-safety/policy leadership role setting and applying Netflix\'s content policy standards and online safety practices across the APAC region.',
    responsibilities: [
      'Develop and apply content policy guidelines for the APAC region',
      'Partner with regional teams on online safety issues and escalations',
      'Advise cross-functional stakeholders on policy risk',
      'Monitor regional regulatory and cultural context affecting content standards',
    ],
    requirements: [
      'Background in content policy, trust & safety, or online safety',
      'Regional (APAC) subject-matter expertise',
      'Strong cross-functional stakeholder management',
    ],
    howToApply: 'Apply directly on Netflix\'s careers site. Note that Netflix caps applications at 2 concurrent roles per candidate.',
    applyUrl: 'https://explore.jobs.netflix.net/careers/job/790316798055',
    applyLabel: 'Apply on Netflix Careers',
    note: 'This listing\'s internal metadata showed a January 2025 "last updated" stamp despite appearing in the live July 2026 job feed — confirm it\'s still an active opening before applying.',
  },
  {
    id: 'stripe-swe-new-grad-toronto',
    title: 'Software Engineer, New Grad — Developer & End User Experience Platform',
    company: 'Stripe',
    location: 'Toronto, Canada',
    type: 'Full-time',
    category: 'Engineering & Data',
    deadline: 'Must be able to start full-time before October 1, 2026',
    summary: 'A new-grad engineering role on Stripe\'s Developer & End User Experience Platform team, building tools and systems that improve the experience of building on Stripe.',
    responsibilities: [
      'Collaborate cross-functionally with engineers on platform projects',
      'Participate in code reviews and technical design discussions',
      'Help maintain system reliability and scalability',
      'Build toward owning a project end-to-end with mentorship',
    ],
    requirements: [
      'Bachelor\'s or Master\'s in Computer Science or related field, graduating by summer 2026',
      'No more than 18 months of professional experience (excluding internships)',
      'Programming experience (Java, Ruby, JavaScript, Scala, or Go) via coursework or projects',
      'Prior internship or collaborative coding project experience',
    ],
    howToApply: 'Apply directly through Stripe\'s official jobs site.',
    applyUrl: 'https://stripe.com/jobs/listing/software-engineer-new-grad-developer-end-user-experience-platform/7991718',
    applyLabel: 'Apply on Stripe Careers',
    note: 'Posted salary range: CA$106,400–CA$159,600. Minimum 50% in-office expectation (varies by team).',
  },
  {
    id: 'wise-treasury-operations-specialist',
    title: 'Treasury Operations Specialist',
    company: 'Wise',
    location: 'Singapore',
    type: 'Full-time',
    category: 'Business, Finance & Consulting',
    deadline: 'Rolling — posted, currently live',
    summary: 'An operational role within Wise\'s Finance & Treasury Tribe focused on moving customer funds accurately and efficiently across currencies and markets.',
    responsibilities: [
      'Support daily treasury operations moving funds across currencies and markets',
      'Drive process automation and efficiency improvements',
      'Monitor and resolve operational issues in fund flows',
      'Partner with cross-functional finance and engineering teams',
    ],
    requirements: [
      'Experience in treasury, payments, or financial operations',
      'Strong analytical and process-improvement mindset',
      'Comfort working with automation/process tooling',
      'Attention to detail in high-volume operational environments',
    ],
    howToApply: 'Apply directly through Wise\'s official careers site.',
    applyUrl: 'https://wise.jobs/job/treasury-operations-specialist-in-singapore-jid-1377',
    applyLabel: 'Apply on Wise.jobs',
  },
  {
    id: 'goldman-sachs-new-analyst-program',
    title: 'New Analyst Program',
    company: 'Goldman Sachs',
    location: 'Multiple US offices (Americas)',
    type: 'Full-time / Graduate Programme',
    category: 'Business, Finance & Consulting',
    deadline: 'Applications open mid-August 2026 (for December 2026–July 2027 graduates)',
    summary: 'Goldman Sachs\' full-time entry point for recent graduates across divisions including Investment Banking, Global Markets, and Asset & Wealth Management.',
    responsibilities: [
      'Join a specific divisional team as a first-year analyst',
      'Support financial analysis, modeling, and client-facing deliverables',
      'Receive structured training in financial and technical skills',
      'Build a professional network across the firm',
    ],
    requirements: [
      'Undergraduate or graduate degree, graduating within the eligible window',
      'Strong quantitative and analytical skills',
      'Demonstrated interest in financial markets/banking',
      'Authorization to work in the relevant country',
    ],
    howToApply: 'Apply through Goldman Sachs\' official student careers portal.',
    applyUrl: 'https://www.goldmansachs.com/careers/students/programs-and-internships/americas/new-analyst-program',
    applyLabel: 'Apply on Goldman Sachs Careers',
  },
  {
    id: 'jpmorgan-markets-analyst-program-2026',
    title: '2026 Commercial & Investment Bank Markets Full-Time Analyst Program',
    company: 'JPMorgan Chase',
    location: 'Multiple US locations',
    type: 'Full-time / Graduate Programme',
    category: 'Business, Finance & Consulting',
    deadline: 'Rolling — for December 2025–June 2026 graduates',
    summary: 'JPMorgan\'s full-time analyst entry point into the Markets business within the Commercial & Investment Bank, focused on identifying, assessing, and managing risk for the firm\'s global businesses.',
    responsibilities: [
      'Join a Markets desk/team as a first-year analyst',
      'Support risk identification and management processes',
      'Build financial and market analysis skills through structured training',
      'Collaborate with senior bankers and traders on live business needs',
    ],
    requirements: [
      'Bachelor\'s or Master\'s degree, graduating December 2025–June 2026',
      'Authorization to work in the US',
      'Strong quantitative and analytical skills',
      'Completion of a recorded video interview for candidates who advance',
    ],
    howToApply: 'Apply via JPMorgan Chase\'s official student careers site.',
    applyUrl: 'https://careers.jpmorgan.com/us/en/students/programs/investment-banking-fulltime-analyst',
    applyLabel: 'Apply on JPMorgan Chase Careers',
    note: 'This links to JPMorgan\'s student Programs hub — confirm you land on the specific Markets (not Investment Banking) program page, since JPMorgan runs several parallel full-time analyst tracks.',
  },
  {
    id: 'deloitte-analyst-corporate-strategy',
    title: 'Analyst, Corporate Strategy — Fall 2026',
    company: 'Deloitte',
    location: 'United States',
    type: 'Full-time',
    category: 'Business, Finance & Consulting',
    deadline: 'Rolling — Fall 2026 start',
    summary: 'An internal strategy-team role executing corporate strategy projects for Deloitte US\'s own firm — covering growth, innovation, risk, and operations priorities.',
    responsibilities: [
      'Execute corporate strategy projects for Deloitte US firm leadership',
      'Analyze competitors, markets, and significant industry developments',
      'Support long-term strategic planning across the firm\'s businesses',
      'Contribute to internal strategic communications and frameworks',
    ],
    requirements: [
      'Bachelor\'s degree in strategy, business, or a related field',
      'Strong analytical and research skills',
      'Experience with strategic frameworks or consulting-style project work',
      'Excellent written and verbal communication skills',
    ],
    howToApply: 'Apply through Deloitte\'s official US careers portal.',
    applyUrl: 'https://apply.deloitte.com/en_US/careers/JobDetail/Analyst-Corporate-Strategy-Fall-2026/307805',
    applyLabel: 'Apply on Deloitte Careers',
  },
  {
    id: 'pwc-senior-associate-assurance-png',
    title: 'Senior Associate, Assurance',
    company: 'PwC',
    location: 'Port Moresby, Papua New Guinea',
    type: 'Full-time',
    category: 'Business, Finance & Consulting',
    deadline: 'Rolling — posted, currently live',
    summary: 'A mid-level assurance role conducting audit engagements for PwC clients in Papua New Guinea, working within PwC\'s global assurance practice.',
    responsibilities: [
      'Execute audit procedures and testing for client engagements',
      'Prepare audit documentation and findings',
      'Liaise with client personnel during fieldwork',
      'Support junior team members and quality review processes',
    ],
    requirements: [
      'Professional accounting qualification (or working toward one)',
      'Prior audit/assurance experience',
      'Strong attention to detail and analytical skills',
      'Willingness to work across client sites',
    ],
    howToApply: 'Apply via PwC\'s Workday-hosted job posting.',
    applyUrl: 'https://pwc.wd3.myworkdayjobs.com/en-US/Global_Strategyand_Careers/job/Senior-Associate--Assurance_453922WD',
    applyLabel: 'Apply on PwC Careers',
  },
  {
    id: 'ey-tax-consultant-jakarta',
    title: 'Tax Consultant',
    company: 'EY',
    location: 'Jakarta, Indonesia',
    type: 'Full-time',
    category: 'Business, Finance & Consulting',
    deadline: 'Posted July 21, 2026 — rolling review',
    summary: 'An indirect tax role within EY\'s Tax practice, supporting client engagements and building toward professional tax expertise within EY\'s global advisory network.',
    responsibilities: [
      'Support indirect tax engagements as part of a global advisory network',
      'Assist in preparing client meetings and reports',
      'Build and maintain relationships with client personnel and internal teams',
      'Contribute to recruiting and retention of tax professionals',
    ],
    requirements: [
      'Bachelor\'s degree in Accounting or Fiscal Administration (minimum 3.20 GPA) from a reputable institution',
      'Brevet tax certification advantageous',
      'Fluency in English (written and verbal) required',
      'Proficiency in MS Office; prior accounting-firm experience preferred',
    ],
    howToApply: 'Apply directly through EY\'s careers portal.',
    applyUrl: 'https://careers.ey.com/ey/job/Jakarta-Tax-Consultant-12190/703944801/',
    applyLabel: 'Apply on EY Careers',
  },
  {
    id: 'kpmg-audit-associate-2026',
    title: 'Audit Associate | Multiple Locations, Summer/Fall 2026',
    company: 'KPMG (US)',
    location: 'Multiple US locations',
    type: 'Full-time',
    category: 'Business, Finance & Consulting',
    deadline: 'Summer/Fall 2026 start — rolling review',
    summary: 'An entry-level audit role on KPMG\'s Audit Services team, supporting engagements that help ensure the accuracy and reliability of client financial information.',
    responsibilities: [
      'Perform audit procedures as part of an engagement team',
      'Test client financial statements and internal controls',
      'Document findings and support engagement leads',
      'Help validate financial reporting accuracy for capital markets',
    ],
    requirements: [
      'Bachelor\'s/Master\'s degree in Accounting (or on track for CPA eligibility)',
      'Strong analytical and communication skills',
      'Ability to travel to client sites as needed',
      'Team-oriented, detail-driven work style',
    ],
    howToApply: 'Apply directly through KPMG\'s US careers site.',
    applyUrl: 'https://www.kpmguscareers.com/jobdetail/?jobId=125871',
    applyLabel: 'Apply on KPMG US Careers',
  },
  {
    id: 'accenture-talent-organization-consultant',
    title: 'Talent and Organization Consultant',
    company: 'Accenture',
    location: 'Not specified on listing',
    type: 'Full-time',
    category: 'Business, Finance & Consulting',
    deadline: 'Rolling — posted, currently live',
    summary: 'A consulting role within Accenture\'s Talent and Organization practice, helping clients redesign workforce, talent, and organizational strategies.',
    responsibilities: [
      'Advise clients on talent strategy, org design, and workforce transformation',
      'Contribute to client deliverables and analysis',
      'Work as part of multidisciplinary consulting teams',
      'Support change management and implementation planning',
    ],
    requirements: [
      'Background in HR consulting, organizational design, or a related field',
      'Strong client-facing and communication skills',
      'Analytical/problem-solving skills typical of consulting roles',
      'Willingness to travel for client engagements',
    ],
    howToApply: 'Apply via Accenture\'s Workday-hosted careers site.',
    applyUrl: 'https://accenture.wd103.myworkdayjobs.com/en-US/AccentureCareers/job/Talent-and-Organization-Consultant_R00316997',
    applyLabel: 'Apply on Accenture Careers',
    note: 'Location and detailed requirements could not be confirmed via automated fetch — verify directly on the live listing before applying.',
  },
  {
    id: 'mckinsey-business-analyst-2026',
    title: 'Business Analyst (Undergraduate & Non-MBA Master\'s Recruiting)',
    company: 'McKinsey & Company',
    location: 'Multiple US offices (100+ offices worldwide)',
    type: 'Full-time / Graduate Programme',
    category: 'Business, Finance & Consulting',
    deadline: 'August 11, 2026 (for December 2026–August 2027 graduates)',
    summary: 'McKinsey\'s entry point for undergraduates and non-MBA master\'s students, joining consulting teams to support client problem-solving across industries.',
    responsibilities: [
      'Collaborate with senior consultants and clients across the consulting process',
      'Conduct fact-gathering, analysis, and synthesis for client engagements',
      'Contribute to client communications and recommendations',
      'Support implementation of client-facing strategic recommendations',
    ],
    requirements: [
      'Undergraduate or non-MBA master\'s degree, graduating in the eligible window',
      'Strong analytical and problem-solving skills',
      'Excellent communication and teamwork skills',
      'No specific major required',
    ],
    howToApply: 'Apply via McKinsey\'s official student recruiting portal.',
    applyUrl: 'https://www.mckinsey.com/careers/students/undergraduate-degree-candidates/other-schools',
    applyLabel: 'Apply on McKinsey Careers',
    note: 'McKinsey recruits by school/region rather than a single global requisition — the exact application path may route through your university or a region-specific page.',
  },
  {
    id: 'worldbank-operations-officer-fig',
    title: 'Operations Officer — Upstream & Advisory, Financial Institutions Group',
    company: 'World Bank Group (IFC)',
    location: 'Not specified on listing',
    type: 'Full-time',
    category: 'Policy, Government & Nonprofit',
    deadline: 'Rolling — posted, currently live (exact closing date not listed)',
    summary: 'A role within IFC\'s Financial Institutions Group supporting upstream and advisory work that helps develop financial-sector projects in emerging markets.',
    responsibilities: [
      'Support origination and structuring of financial-institution advisory engagements',
      'Conduct market and client analysis for upstream opportunities',
      'Collaborate with regional and global Financial Institutions Group teams',
      'Contribute to project design and development-impact assessment',
    ],
    requirements: [
      'Experience in financial-sector advisory, investment, or development finance',
      'Strong analytical and project-management skills',
      'Relevant graduate degree (finance, economics, or business)',
      'Willingness to work across emerging markets contexts',
    ],
    howToApply: 'Apply through the World Bank Group\'s official careers portal.',
    applyUrl: 'https://worldbankgroup.csod.com/ux/ats/careersite/1/home/requisition/37002?c=worldbankgroup',
    applyLabel: 'Apply on World Bank Group Careers',
    note: 'Location and full requirements/closing date could not be confirmed via automated fetch — verify directly on the live listing.',
  },
  {
    id: 'un-ohchr-human-rights-officer-sudan',
    title: 'Human Rights Officer, P-3',
    company: 'United Nations (OHCHR)',
    location: 'Khartoum, Sudan',
    type: 'Full-time (Fixed-term appointment)',
    category: 'Policy, Government & Nonprofit',
    deadline: 'See official listing for exact closing date (Job Opening ID 279185)',
    summary: 'A human rights officer role supporting OHCHR\'s country presence in Sudan, monitoring and reporting on human rights conditions and supporting protection work.',
    responsibilities: [
      'Monitor and report on human rights developments in-country',
      'Support protection and advocacy initiatives',
      'Liaise with national and international stakeholders',
      'Contribute to OHCHR reporting and analysis products',
    ],
    requirements: [
      'Advanced university degree in human rights, law, political science, or a related field',
      'Relevant professional experience in human rights work',
      'Field experience in conflict/post-conflict settings typically required at this level',
      'Fluency in English (French/Arabic often an asset for this duty station)',
    ],
    howToApply: 'Apply via the UN Careers portal, searching Job Opening ID 279185.',
    applyUrl: 'https://careers.un.org/jobSearchDescription/279185?language=en',
    applyLabel: 'Apply via UN Careers Portal',
    note: 'Exact closing date could not be confirmed via automated fetch (UN Careers is JS-rendered) — confirm the vacancy is still open before applying.',
  },
  {
    id: 'unicef-moldova-education-internship',
    title: 'Internship, Education Section (6 months)',
    company: 'UNICEF Moldova',
    location: 'Chișinău, Moldova',
    type: 'Internship',
    category: 'Policy, Government & Nonprofit',
    deadline: 'July 26, 2026',
    summary: 'A 6-month internship supporting UNICEF Moldova\'s Education Section, contributing to the implementation of inclusive-education activities and related section work.',
    responsibilities: [
      'Support implementation of inclusive-education activities',
      'Assist with data collection, reporting, and coordination tasks',
      'Contribute to other Education Section workstreams as needed',
      'Liaise with national education partners under staff supervision',
    ],
    requirements: [
      'Enrollment in or recent graduation from a relevant university program (education, social sciences, or related)',
      'Interest in inclusive education and child rights',
      'Strong written and communication skills',
      'Fluency in English; Romanian/Russian an asset',
    ],
    howToApply: 'Apply via UNICEF\'s careers portal. UNICEF provides a monthly stipend for interns and does not charge any recruitment fees.',
    applyUrl: 'https://jobs.unicef.org/en-us/filter/?search-keyword=&work-type=internship',
    applyLabel: 'Apply via UNICEF Careers Portal',
    note: 'The direct requisition link could not be isolated — the URL above is UNICEF\'s internship-filtered search, where this Moldova Education Section posting should currently appear; confirm the specific listing before applying.',
  },
  {
    id: 'icrc-media-analyst-kyiv',
    title: 'Media Analyst (Environmental Scanning Officer)',
    company: 'ICRC (International Committee of the Red Cross)',
    location: 'Kyiv, Ukraine',
    type: 'Fixed-term contract',
    category: 'Policy, Government & Nonprofit',
    deadline: 'August 9, 2026',
    summary: 'A media-monitoring role supporting ICRC\'s Kyiv delegation, scanning and analyzing media and information trends relevant to ICRC\'s humanitarian operations in Ukraine.',
    responsibilities: [
      'Monitor and analyze local/international media relevant to ICRC operations',
      'Produce environmental-scanning reports for delegation leadership',
      'Flag emerging risks or narratives affecting humanitarian access',
      'Coordinate with communications and protection teams',
    ],
    requirements: [
      'Background in media analysis, communications, or information management',
      'Strong analytical and report-writing skills',
      'Ukrainian/Russian and English language skills typically required for this duty station',
      'Familiarity with the humanitarian/conflict context in Ukraine',
    ],
    howToApply: 'Apply through ICRC\'s official careers portal. ICRC does not accept unsolicited applications.',
    applyUrl: 'https://careers.icrc.org/go/All-Jobs/3807301/',
    applyLabel: 'Apply via ICRC Careers Portal',
    note: 'Job reference 868637 — the direct single-posting URL could not be isolated; the link above is ICRC\'s all-jobs listing where this role should currently appear.',
  },
  {
    id: 'msf-usa-data-science-intern',
    title: 'Data Science Intern',
    company: 'Doctors Without Borders / Médecins Sans Frontières (MSF-USA)',
    location: 'New York, NY',
    type: 'Internship',
    category: 'Engineering & Data',
    deadline: 'Rolling — posted, currently live',
    summary: 'An internship supporting MSF-USA\'s Development Operations team with data visualization and analysis to inform fundraising and organizational decision-making.',
    responsibilities: [
      'Support data wrangling and analysis using Python and/or R',
      'Build data visualizations to communicate insights',
      'Assist Development Operations staff with reporting needs',
      'Contribute to ad hoc analytical projects',
    ],
    requirements: [
      'Currently pursuing a degree with coursework in data science, statistics, or a related field',
      'Hands-on experience with Python and/or R',
      'Interest in data visualization and storytelling with data',
      'Strong attention to detail',
    ],
    howToApply: 'Apply through MSF-USA\'s official careers board.',
    applyUrl: 'https://job-boards.greenhouse.io/msfcareers/jobs/4993728008',
    applyLabel: 'Apply via MSF-USA Careers',
  },
  {
    id: 'wfp-programme-policy-officer-timor-leste',
    title: 'Programme Policy Officer — Social Protection (International CST, Level I)',
    company: 'World Food Programme (WFP)',
    location: 'Dili, Timor-Leste',
    type: 'Consultancy',
    category: 'Policy, Government & Nonprofit',
    deadline: 'See official listing for exact closing date',
    summary: 'A programme policy role supporting WFP Timor-Leste\'s social protection portfolio under its 2026–2030 Country Strategic Plan.',
    responsibilities: [
      'Support design and implementation of social protection programming',
      'Contribute technical analysis to inform programme strategy',
      'Liaise with government counterparts and partner agencies',
      'Support monitoring and reporting against the Country Strategic Plan',
    ],
    requirements: [
      'Advanced university degree in social sciences, economics, or a related field',
      'Experience in social protection or humanitarian programme work',
      'Strong report-writing and stakeholder-liaison skills',
      'Fluency in English; Tetum/Portuguese an asset',
    ],
    howToApply: 'Apply through WFP\'s official recruiting site.',
    applyUrl: 'https://wd3.myworkdaysite.com/fr-FR/recruiting/wfp/job_openings/job/Dili-Timor-Leste/Programme-Policy-Officer---Social-Protection--International-CST--Level-I-_JR118001',
    applyLabel: 'Apply via WFP Careers Portal',
    note: 'Confirm the specific requisition (JR118001) is still open before applying — exact closing date wasn\'t extractable via automated fetch.',
  },
  {
    id: 'usajobs-hr-specialist-dha',
    title: 'Human Resources Specialist (entry-level, developmental)',
    company: 'U.S. Department of Defense — Defense Health Agency',
    location: 'Not specified on listing',
    type: 'Full-time (Federal)',
    category: 'Policy, Government & Nonprofit',
    deadline: 'See official USAJOBS listing for exact closing date',
    summary: 'An entry-level federal HR role within the Defense Health Agency, designed to build HR program skills through a structured training and development track.',
    responsibilities: [
      'Perform conventional HR program duties across multiple functional areas',
      'Complete developmental assignments per a formal training program',
      'Support HR case work and information analysis',
      'Occasional travel as required',
    ],
    requirements: [
      'US citizenship and eligibility for federal employment',
      'Eligibility for a Secret security clearance (Noncritical-Sensitive/Moderate Risk position)',
      'Entry-level HR knowledge/coursework or equivalent experience',
      'Ability to complete formal HR training program requirements',
    ],
    howToApply: 'Apply through USAJOBS using your USAJOBS account.',
    applyUrl: 'https://hrmanagement.usajobs.gov/job/846781200',
    applyLabel: 'Apply on USAJOBS',
    note: 'Exact location and closing date weren\'t extractable via automated fetch — confirm both directly on the live posting (announcement U-26-SEP-DHA-12805726-JLE).',
  },
  {
    id: 'usajobs-financial-analyst-early-career',
    title: 'Financial Analyst (Early Career)',
    company: 'U.S. federal agency (via USAJOBS)',
    location: 'Not specified in listing',
    type: 'Full-time (Federal)',
    category: 'Policy, Government & Nonprofit',
    deadline: 'July 22, 2026, 11:59 PM ET',
    summary: 'An entry-level federal financial-analyst role supporting agency financial planning, budget analysis, and reporting functions.',
    responsibilities: [
      'Support financial planning and analysis for the agency',
      'Assist with budget development and tracking',
      'Review financial data for accuracy and compliance',
      'Support reporting and process-improvement initiatives',
    ],
    requirements: [
      'US citizenship and eligibility for federal employment',
      'Bachelor\'s degree in finance, accounting, or a related field',
      'Entry-level analytical and financial-systems skills',
      'Ability to meet federal suitability requirements',
    ],
    howToApply: 'Apply through USAJOBS before the stated closing time.',
    applyUrl: 'https://www.usajobs.gov/job/871949900',
    applyLabel: 'Apply on USAJOBS',
    note: 'This listing\'s stated closing date is today — confirm it\'s still accepting applications, or search USAJOBS for a newer opening if it has closed.',
  },
  {
    id: 'automattic-happiness-engineer',
    title: 'Happiness Engineer — Customer Support & Success',
    company: 'Automattic (WordPress.com / WooCommerce)',
    location: 'Remote — no geographic restriction',
    type: 'Full-time, fully remote',
    category: 'Design, Marketing & Ops',
    deadline: 'Rolling — Automattic hires on an ongoing basis',
    summary: 'A customer-support role at Automattic supporting WordPress/WooCommerce customers via email and live chat, treated internally as a long-term career track rather than a stepping-stone.',
    responsibilities: [
      'Spend roughly 6 self-scheduled hours a day helping customers via email and live chat',
      'Diagnose and resolve WordPress/WooCommerce technical issues',
      'Collaborate with peers via Slack for support',
      'Use AI tools to build workflows and automations that improve support quality',
    ],
    requirements: [
      'WordPress and/or WooCommerce experience',
      'Strong written communication skills for async, text-based support',
      'Active, hands-on use of AI tools beyond basic search',
      'Comfort with a fully remote, asynchronous work culture',
    ],
    howToApply: 'Apply directly through Automattic\'s official careers page.',
    applyUrl: 'https://automattic.com/work-with-us/job/happiness-engineer-customer-support-success/',
    applyLabel: 'Apply on Automattic Careers',
    note: 'Posted salary range: $40,000–$68,000 USD, paid in local currency regardless of location.',
  },
  {
    id: 'zapier-senior-manager-marketing-operations',
    title: 'Senior Manager, Marketing Operations',
    company: 'Zapier',
    location: 'Remote — North America',
    type: 'Full-time, fully remote',
    category: 'Design, Marketing & Ops',
    deadline: 'Posted June 2, 2026 — rolling review',
    summary: 'A marketing-operations leadership role rebuilding Zapier\'s go-to-market operating systems, architecting scalable, AI-forward processes across marketing, sales, and revenue operations.',
    responsibilities: [
      'Own and optimize Zapier\'s marketing operations infrastructure (campaigns, lead management, attribution, automation, reporting)',
      'Partner with Demand Gen, Product Marketing, Sales, and RevOps on lead flow and funnel management',
      'Architect scalable, AI-forward systems and processes',
      'Ensure accurate data capture and reporting across the funnel',
    ],
    requirements: [
      'Experience leading marketing operations at scale',
      'Strong background in marketing automation, attribution, and RevOps tooling',
      'Experience partnering cross-functionally with sales and marketing leadership',
      'Comfort operating in a fully remote, fast-moving environment',
    ],
    howToApply: 'Apply through Zapier\'s official application portal.',
    applyUrl: 'https://jobs.ashbyhq.com/zapier/09eb1ac8-2a49-44e0-8463-bfa6e72000cf',
    applyLabel: 'Apply on Zapier Careers',
    note: 'Posted salary range: USD $192,000–$287,000/year.',
  },
  {
    id: 'msf-usa-multimedia-graphic-designer',
    title: 'Multimedia Graphic Designer',
    company: 'Doctors Without Borders / Médecins Sans Frontières (MSF-USA)',
    location: 'New York, NY',
    type: 'Full-time',
    category: 'Design, Marketing & Ops',
    deadline: 'Rolling — posted, currently live',
    summary: 'A design role producing visual content and creative strategies to raise the profile of MSF-USA\'s humanitarian work across digital and print channels.',
    responsibilities: [
      'Produce visual and multimedia content for MSF-USA communications',
      'Develop creative strategies to expand audience reach',
      'Collaborate with communications and development teams on campaigns',
      'Maintain brand consistency across materials',
    ],
    requirements: [
      'Portfolio demonstrating multimedia/graphic design work',
      'Proficiency with design tools (Adobe Creative Suite or equivalent)',
      'Experience producing content for nonprofit or advocacy communications a plus',
      'Strong collaboration and project-management skills',
    ],
    howToApply: 'Apply through MSF-USA\'s official careers board.',
    applyUrl: 'https://job-boards.greenhouse.io/msfcareers/jobs/5326148008',
    applyLabel: 'Apply via MSF-USA Careers',
  },
];

function JobCard({ item, isOpen, onToggle }: { item: Job; isOpen: boolean; onToggle: () => void }) {
  const accent = categoryColor(item.category);
  return (
    <motion.div
      layout
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="grid md:grid-cols-[280px_1fr]">
        <div className="relative h-40 md:h-full min-h-[160px] overflow-hidden flex items-center justify-center" style={{ backgroundColor: `${accent}0d` }}>
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-sm"
            style={{ backgroundColor: accent }}
          >
            {getInitials(item.company)}
          </div>
          <span className="absolute top-3 left-3 bg-[#2563eb] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
            {item.type}
          </span>
        </div>

        <div className="p-5 md:p-6 flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <Building2 size={12} />
                {item.company}
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 leading-snug">
                {item.title}
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
                  <Briefcase size={13} className="text-[#68A108]" /> What You'll Do
                </h4>
                <ul className="space-y-1.5">
                  {item.responsibilities.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px] text-slate-600">
                      <CheckCircle2 size={13} className="text-[#68A108] shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-900 mb-2">
                  What You'll Need
                </h4>
                <ul className="space-y-1.5">
                  {item.requirements.map((e, i) => (
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
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function JobsPage({ onNavigateHome, onNavigateScholarships, onNavigateStatic, onNavigateWorldNews, onNavigateEntertainment }: JobsPageProps) {
  const [openId, setOpenId] = useState<string | null>(jobs[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | JobCategory>('All');
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const skipNextUrlSync = useRef(true);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const jumpToSearch = () => {
    searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    const idFromPath = (path: string) => {
      const match = path.match(/^\/jobs\/(.+)$/);
      if (!match) return null;
      const id = decodeURIComponent(match[1]);
      return jobs.some((j) => j.id === id) ? id : null;
    };

    const initial = idFromPath(window.location.pathname);
    if (initial) {
      setOpenId(initial);
      const idx = jobs.findIndex((j) => j.id === initial);
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
    const targetPath = openId ? `/jobs/${encodeURIComponent(openId)}` : '/jobs';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  }, [openId]);

  const enriched = useMemo(
    () => jobs.map((j) => ({ ...j, deadlineDate: parseDeadlineDate(j.deadline) })),
    []
  );

  const categoryCounts = useMemo(() => {
    const counts = {} as Record<JobCategory, number>;
    for (const cat of JOB_CATEGORIES) {
      counts[cat] = jobs.filter((j) => j.category === cat).length;
    }
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enriched.filter((j) => {
      const matchesQuery =
        !q || [j.title, j.company, j.location, j.summary].some((field) => field.toLowerCase().includes(q));
      const matchesCat = selectedCategory === 'All' || j.category === selectedCategory;
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
      .filter((j): j is typeof j & { deadlineDate: Date } => !!j.deadlineDate && j.deadlineDate.getTime() >= startOfToday.getTime())
      .sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime())
      .slice(0, 5);
  }, [enriched]);

  const regionCount = useMemo(() => {
    const set = new Set(jobs.map((j) => j.location.split(/[,/]/)[0].trim()));
    return set.size;
  }, []);

  const jumpToCard = (id: string) => {
    const idx = filtered.findIndex((j) => j.id === id);
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
    { name: 'JOBS', active: true, onClick: () => {} },
    { name: 'SCHOLARSHIPS', active: false, onClick: () => onNavigateScholarships?.() },
  ];

  return (
    <div className="relative overflow-x-hidden bg-slate-50 min-h-screen">
      {/* Header — matches the homepage layout: logo left */}
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
              <span>Simplify Daily</span>
              <span className="w-3.5 h-3.5 bg-[#68A108] rounded-full ml-2 self-end mb-2"></span>
            </h1>
            <p className="text-[10px] uppercase font-black tracking-[0.25em] text-[#68A108] font-mono leading-none mt-2">
              Real News. Real Jobs. Real Opportunities.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end text-right gap-1.5 select-none shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-white">
              <CheckCircle2 size={13} className="text-[#68A108]" />
              Verified Openings Only
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono max-w-[260px] leading-relaxed">
              Sourced from official employer &amp; institutional career pages
            </div>
            <div className="text-[10px] font-bold text-[#68A108] font-mono uppercase tracking-wider">
              {jobs.length} Openings · Updated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
            Search Openings
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        {/* Page hero */}
        <div className="mb-8 text-center">
          <span className="inline-block bg-[#2563eb]/10 text-[#2563eb] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
            Verified Openings
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Jobs & Career Opportunities
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
            A hand-picked selection of real, currently open roles across tech, finance, consulting, and international development — sourced only from official employer and institutional career pages.
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
              placeholder="Search by title, company, or location…"
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
            {(['All', ...JOB_CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10.5px] font-black uppercase tracking-wider px-3.5 py-2 rounded-full border transition-colors whitespace-nowrap
                  ${selectedCategory === cat
                    ? 'bg-[#68A108] border-[#68A108] text-white'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-[#68A108]/50 hover:text-[#68A108]'
                  }`}
              >
                {cat} ({cat === 'All' ? jobs.length : categoryCounts[cat]})
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11.5px] font-bold text-slate-400 mb-5">
          {filtered.length === 0
            ? 'Showing 0 openings'
            : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of ${filtered.length} openings`}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
          {/* Job cards */}
          <div className="space-y-5 min-w-0">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center"
                >
                  <p className="text-sm font-bold text-slate-500">No openings match your filters.</p>
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
                    <JobCard
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
                <div className="text-3xl font-black leading-none">{jobs.length}</div>
                <div className="text-[11px] font-bold text-neutral-400 mt-1">Verified openings</div>
                <div className="h-px bg-white/10 my-3" />
                <div className="text-2xl font-black leading-none">{regionCount}+</div>
                <div className="text-[11px] font-bold text-neutral-400 mt-1">Countries &amp; regions represented</div>
              </div>
            </div>

            {/* Browse by category */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-900 mb-3">
                <LayoutGrid size={14} className="text-[#68A108]" /> Browse by Category
              </h3>
              <ul className="space-y-1">
                {JOB_CATEGORIES.map((cat) => (
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
                {closingSoon.map((j, i) => (
                  <li key={j.id}>
                    <button
                      onClick={() => jumpToCard(j.id)}
                      className="w-full flex items-start gap-2.5 text-left group"
                    >
                      <span className="shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black flex items-center justify-center mt-0.5 group-hover:bg-[#68A108] group-hover:text-white transition-colors">
                        {i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[12px] font-bold text-slate-700 leading-snug group-hover:text-[#68A108] transition-colors truncate">
                          {j.title}
                        </span>
                        <span className="block text-[10.5px] font-semibold text-slate-400 mt-0.5">
                          {j.deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
          Every "Apply" link above goes directly to the employer's official careers page or a trusted institutional job board — never a third-party listing site. Postings can close quickly — always confirm the role is still open before applying.
        </p>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          <h2
            className="text-3xl font-black flex items-center grayscale opacity-10 select-none cursor-pointer"
            onClick={onNavigateHome}
          >
            Simplify Daily
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
            <a href={apiUrl('/rss.xml')} className="hover:text-[#68A108] transition-colors cursor-pointer">RSS</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
