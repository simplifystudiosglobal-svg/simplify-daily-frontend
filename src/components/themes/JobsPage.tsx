import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Building2, CheckCircle2, ExternalLink, ChevronDown, ChevronLeft, ChevronRight, Briefcase, Search, Flame, Globe2, LayoutGrid, X } from 'lucide-react';
import { AdsterraNativeBanner } from '../ads/AdsterraUnits';

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

// Date this list was last audited against official sources. Bump it whenever the
// entries below are re-verified - it is shown to visitors as "Updated".
const LAST_UPDATED = 'Sep 22, 2026';

const jobs: Job[] = [
  {
    "id": "google-software-engineer-early-career",
    "title": "Software Engineer, Early Career (2026/2027 Intakes)",
    "company": "Google",
    "location": "Mountain View, CA / New York, NY / Remote (US)",
    "type": "Full-time",
    "category": "Engineering & Data",
    "deadline": "Rolling — 2026/2027 Campus Intake",
    "summary": "Build large-scale distributed systems, search infra, and cutting-edge Gemini AI services alongside world-class engineering teams.",
    "responsibilities": [
      "Write scalable, robust, and clean code in C++, Java, Python, or Go",
      "Collaborate with product management, UX, and QA teams to design user-facing features",
      "Optimize backend pipelines, distributed storage layers, and system throughput",
      "Participate in design reviews, automated testing, and production deployment"
    ],
    "requirements": [
      "BS, MS, or PhD in Computer Science or related technical field graduating in 2026 or 2027",
      "Experience with data structures, algorithms, and software development in one or more languages",
      "Solid foundations in operating systems, networks, and concurrent programming"
    ],
    "howToApply": "Apply directly via the Google Careers portal. Submit an updated resume including your anticipated graduation date, GitHub projects, and relevant coursework.",
    "applyUrl": "https://www.google.com/about/careers/applications/jobs/results/?q=Software%20Engineer%20Early%20Career",
    "applyLabel": "Apply on Google Careers"
  },
  {
    "id": "microsoft-software-engineer-university-grad",
    "title": "Software Engineer, University Graduate (Full-Time)",
    "company": "Microsoft",
    "location": "Redmond, WA / Atlanta, GA / Remote (US)",
    "type": "Full-time",
    "category": "Engineering & Data",
    "deadline": "Rolling — Fall 2026 & Spring 2027 Cycles",
    "summary": "Design and deliver scalable cloud solutions across Azure, Office 365, Copilot AI integrations, and developer tool ecosystems.",
    "responsibilities": [
      "Develop cloud-native microservices and intelligent agents powered by Azure OpenAI",
      "Architect highly available APIs with automated CI/CD pipelines",
      "Analyze telemetry and telemetry logs to improve reliability and user experience",
      "Collaborate across disciplines with architects, program managers, and researchers"
    ],
    "requirements": [
      "Bachelor's or Master's degree in Computer Science, Software Engineering, or related discipline",
      "Proficiency in C#, Java, Python, TypeScript, or C++",
      "Understanding of software lifecycle fundamentals, unit testing, and agile principles"
    ],
    "howToApply": "Submit your profile on the Microsoft Students and Graduates portal. Qualified candidates will be invited to complete an initial technical assessment.",
    "applyUrl": "https://careers.microsoft.com/v2/global/en/students-and-graduates",
    "applyLabel": "Apply on Microsoft Careers"
  },
  {
    "id": "amazon-sde-graduate-program",
    "title": "Software Development Engineer (SDE I), Graduate Hire",
    "company": "Amazon",
    "location": "Seattle, WA / Arlington, VA / Austin, TX",
    "type": "Full-time",
    "category": "Engineering & Data",
    "deadline": "Rolling — for 2026/2027 Graduates",
    "summary": "Deliver high-volume, low-latency microservices for AWS Cloud infrastructure, global e-commerce logistics, and Alexa automated intelligence.",
    "responsibilities": [
      "Design, build, and maintain core services handling millions of operations per second",
      "Implement data persistence strategies with DynamoDB, S3, and Amazon Aurora",
      "Participate in on-call rotation for operational excellence and automated failure recovery",
      "Write modular code covered by end-to-end integration test suites"
    ],
    "requirements": [
      "BS or MS in Computer Science, Computer Engineering, or related technical field",
      "Strong knowledge of algorithms, object-oriented design, and complexity analysis",
      "Familiarity with Java, C++, Python, or equivalent object-oriented language"
    ],
    "howToApply": "Create an account on Amazon Jobs, search for SDE University Opportunities, and submit your resume and transcript.",
    "applyUrl": "https://www.amazon.jobs/en/job_categories/software-development",
    "applyLabel": "Apply on Amazon Jobs"
  },
  {
    "id": "apple-software-engineer-early-career",
    "title": "Software Engineer, Early Career (Core OS & AI Infrastructure)",
    "company": "Apple",
    "location": "Cupertino, CA / Austin, TX",
    "type": "Full-time",
    "category": "Engineering & Data",
    "deadline": "Rolling — 2026/2027 Hiring Cycle",
    "summary": "Innovate on the foundation of Apple Intelligence, iOS, macOS, and high-performance kernel subsystems used by billions of devices worldwide.",
    "responsibilities": [
      "Develop system-level software and low-latency frameworks for Apple platforms",
      "Interface with hardware engineering teams to optimize silicon neural engine efficiency",
      "Write resilient Swift, Objective-C, C, or C++ code with rigorous memory safety",
      "Profile performance and battery efficiency across real hardware testbeds"
    ],
    "requirements": [
      "Degree in Computer Science, Electrical Engineering, or related quantitative field",
      "Hands-on experience with systems programming, memory management, and Unix/POSIX internals",
      "Passion for elegant software architecture and end-user privacy protection"
    ],
    "howToApply": "Apply via the official Apple Jobs portal. Filter by Software and Services team to select your focus area.",
    "applyUrl": "https://jobs.apple.com/en-us/search?team=SFTWR",
    "applyLabel": "Apply on Apple Jobs"
  },
  {
    "id": "meta-software-engineer-university-grad",
    "title": "Software Engineer, University Graduate",
    "company": "Meta",
    "location": "Menlo Park, CA / Seattle, WA / New York, NY",
    "type": "Full-time",
    "category": "Engineering & Data",
    "deadline": "Rolling — Class of 2026/2027",
    "summary": "Work on cutting-edge platforms including Llama open-source models, PyTorch, Instagram, WhatsApp, and virtual reality infrastructure.",
    "responsibilities": [
      "Build performant web and mobile experiences connecting over 3 billion people",
      "Train, fine-tune, and deploy inference pipelines for generative AI applications",
      "Optimize network transport protocols and real-time distributed databases",
      "Engage in peer code reviews and sprint planning within engineering pods"
    ],
    "requirements": [
      "Graduating with a BS, MS, or PhD in Computer Science or related degree in 2026/2027",
      "Experience in Python, C++, Hack/PHP, Rust, or JavaScript/TypeScript",
      "Strong analytical reasoning and problem-solving abilities"
    ],
    "howToApply": "Submit your resume through Meta Careers Students & Grads section. Selected applicants complete online coding screenings.",
    "applyUrl": "https://www.metacareers.com/careerprograms/students/",
    "applyLabel": "Apply on Meta Careers"
  },
  {
    "id": "nvidia-ai-systems-software-engineer",
    "title": "AI & Systems Software Engineer, New College Graduate",
    "company": "NVIDIA",
    "location": "Santa Clara, CA / Austin, TX / Remote (US)",
    "type": "Full-time",
    "category": "Engineering & Data",
    "deadline": "Rolling — 2026/2027 University Recruiting",
    "summary": "Shape the next generation of accelerated computing, CUDA libraries, TensorRT inference engines, and DGX SuperPOD cloud clusters.",
    "responsibilities": [
      "Accelerate deep learning workloads across Hopper, Blackwell, and next-gen GPU architectures",
      "Write optimized CUDA kernels and multi-GPU distributed collective communication protocols",
      "Benchmark and profile high-performance computing (HPC) scientific pipelines",
      "Collaborate with AI researchers to optimize frontier LLM training runs"
    ],
    "requirements": [
      "BS, MS, or PhD in Computer Science, Computer Engineering, or Electrical Engineering",
      "Excellent modern C++ programming skills and experience with parallel programming / CUDA",
      "Understanding of GPU hardware architectures and numerical linear algebra"
    ],
    "howToApply": "Apply through NVIDIA University Relations portal, selecting University Recruiting roles matching your graduation semester.",
    "applyUrl": "https://www.nvidia.com/en-us/about-nvidia/careers/university-recruiting/",
    "applyLabel": "Apply on NVIDIA Careers"
  },
  {
    "id": "stripe-software-engineer-new-grad",
    "title": "Software Engineer, New Grad (Infrastructure & Payments Core)",
    "company": "Stripe",
    "location": "San Francisco, CA / Seattle, WA / Remote (US, CA, UK)",
    "type": "Full-time",
    "category": "Engineering & Data",
    "deadline": "Rolling — 2026/2027 New Grad Intake",
    "summary": "Build the economic infrastructure for the internet, processing hundreds of billions in financial transactions with five-nines uptime.",
    "responsibilities": [
      "Architect idempotent financial ledgers and distributed payment gateways",
      "Build clean, developer-friendly public APIs and developer documentation",
      "Enhance real-time machine learning fraud detection engines (Radar)",
      "Partner with financial network partners across 50+ countries to expand local payment rails"
    ],
    "requirements": [
      "Graduating with a degree in Computer Science or equivalent practical software experience in 2026/2027",
      "Strong programming experience in Ruby, Java, Go, Python, or TypeScript",
      "Empathy for developers and passion for building high-reliability distributed systems"
    ],
    "howToApply": "Submit your application on Stripe University portal with a resume and links to any open source contributions or project portfolios.",
    "applyUrl": "https://stripe.com/jobs/university",
    "applyLabel": "Apply on Stripe Jobs"
  },
  {
    "id": "databricks-software-engineer-university",
    "title": "Software Engineer, New College Graduate (Data & AI Platforms)",
    "company": "Databricks",
    "location": "San Francisco, CA / Mountain View, CA / Seattle, WA",
    "type": "Full-time",
    "category": "Engineering & Data",
    "deadline": "Rolling — 2026/2027 University Cycle",
    "summary": "Contribute to the Lakehouse architecture, Apache Spark, Delta Lake, and MLflow powering generative AI and massive-scale data analytics.",
    "responsibilities": [
      "Design distributed query engines that query petabytes of structured and semi-structured data",
      "Develop real-time vector search and retrieval-augmented generation (RAG) platforms",
      "Enhance cloud security, role-based governance (Unity Catalog), and multi-tenant isolation",
      "Write clean, highly performant Scala, Java, C++, or Python code"
    ],
    "requirements": [
      "Graduating with a BS, MS, or PhD in Computer Science or related quantitative field in 2026/2027",
      "Deep understanding of distributed systems, databases, or compilers",
      "Proven track record through research publications, internships, or competitive programming"
    ],
    "howToApply": "Submit your resume on the Databricks University Recruiting portal and complete the initial code signal challenge.",
    "applyUrl": "https://www.databricks.com/company/careers/university-recruiting",
    "applyLabel": "Apply on Databricks Careers"
  },
  {
    "id": "palantir-forward-deployed-engineer",
    "title": "Forward Deployed Software Engineer (New Grad)",
    "company": "Palantir Technologies",
    "location": "New York, NY / Washington, DC / London, UK",
    "type": "Full-time",
    "category": "Engineering & Data",
    "deadline": "Rolling — 2026/2027 Early Career Intake",
    "summary": "Embed directly with top defense, healthcare, and commercial organizations to deploy mission-critical software and AI platforms.",
    "responsibilities": [
      "Design custom ontology data pipelines integrating dozens of legacy databases",
      "Develop customer-facing applications and operational workflows in TypeScript, React, and Java",
      "Work alongside field operators and executives to translate high-stakes problems into technical solutions",
      "Optimize secure data ingestion pipelines and complex graph algorithms"
    ],
    "requirements": [
      "Undergraduate or graduate degree in Computer Science, Math, or Engineering completing by 2026/2027",
      "Proficiency in Java, Python, TypeScript, or Go",
      "Strong communication skills and desire to work at the intersection of technology and client mission"
    ],
    "howToApply": "Apply via the Palantir Students and New Grads career portal. Highlight engineering projects and complex problem-solving examples.",
    "applyUrl": "https://www.palantir.com/careers/students/",
    "applyLabel": "Apply on Palantir Careers"
  },
  {
    "id": "cern-entry-level-university-graduates",
    "title": "Entry-Level University Graduates Programme",
    "company": "CERN",
    "location": "Geneva, Switzerland",
    "type": "Fixed-term graduate programme (6–24 months, extendable up to 36)",
    "category": "Engineering & Data",
    "deadline": "Rolling — no fixed deadline listed; apply through the CERN careers portal",
    "summary": "CERN's programme for recent bachelor's and master's graduates with limited work experience, offering a time-limited contract at the European Organization for Nuclear Research.",
    "responsibilities": [
      "Contribute to the work of your assigned CERN group or department under supervision",
      "Build professional experience in an international research environment"
    ],
    "requirements": [
      "National of a CERN Member State or Associate Member State (some exceptions apply because of national ceilings)",
      "Bachelor's or master's degree as your highest qualification (PhD holders are not eligible)",
      "No more than 2 years of professional experience since graduation in the relevant field",
      "Never held a previous CERN fellow or graduate contract"
    ],
    "howToApply": "Apply through CERN's careers portal with your CV (in English or French) and your diploma or certificate of achievement.",
    "applyUrl": "https://careers.cern/programmes/entry-level-university-graduates/",
    "applyLabel": "Apply on CERN Careers",
    "note": "Per CERN's programme page: a monthly net stipend of CHF 5,266 or CHF 5,793 depending on qualification, plus health insurance and 30 days of paid leave. Nationality restrictions apply."
  },
  {
    "id": "salesforce-software-engineering-new-grad",
    "title": "Software Engineering, AMTS (College Grad)",
    "company": "Salesforce",
    "location": "Multiple US locations (San Francisco, Seattle, Palo Alto, Bellevue, Dallas, Indianapolis)",
    "type": "Full-time / Graduate program",
    "category": "Engineering & Data",
    "deadline": "Rolling — new-grad openings are posted throughout the recruiting cycle",
    "summary": "Salesforce's new-grad software engineering track, pairing incoming engineers with mentors and structured onboarding as they join product teams.",
    "responsibilities": [
      "Design, build, and ship features on Salesforce's product and platform teams",
      "Collaborate with senior engineers through code review",
      "Take part in Salesforce's mentorship and new-grad learning program"
    ],
    "requirements": [
      "Recent or upcoming graduate in Computer Science or a related technical field",
      "Solid foundation in data structures, algorithms, and at least one programming language",
      "Strong collaboration and communication skills"
    ],
    "howToApply": "Apply directly through Salesforce's university / new-grad careers page.",
    "applyUrl": "https://www.salesforce.com/company/careers/university/new-grads/",
    "applyLabel": "Apply on Salesforce Careers"
  },
  {
    "id": "ibm-entry-level-software-developer",
    "title": "Entry-Level Software Developer",
    "company": "IBM",
    "location": "Multiple US locations (also posted internationally)",
    "type": "Full-time",
    "category": "Engineering & Data",
    "deadline": "Rolling — IBM posts new entry-level openings on an ongoing basis",
    "summary": "A ground-floor engineering role for early-career developers (0–1 year of experience) joining an Agile team to design, build, and deploy applications alongside experienced mentors.",
    "responsibilities": [
      "Contribute across the development cycle: design, build, test, and deploy applications",
      "Work with APIs, databases, and cloud services to build scalable solutions",
      "Apply Agile and DevOps practices as part of a collaborative team",
      "Learn from senior engineers through mentorship and code review"
    ],
    "requirements": [
      "Early in your software career: recent graduate, bootcamp completer, or self-taught with 0–1 year of professional experience",
      "Working knowledge of at least one modern programming language",
      "Strong problem-solving ability and willingness to learn"
    ],
    "howToApply": "Browse and apply through IBM's careers site; search \"entry level\" or your target location.",
    "applyUrl": "https://www.ibm.com/careers/career-opportunities",
    "applyLabel": "Apply on IBM Careers",
    "note": "IBM posts specific entry-level roles continuously rather than one standing requisition, so this links to the general listings page."
  },
  {
    "id": "goldman-sachs-new-analyst-program",
    "title": "2027 New Analyst Programme (Global Markets & Investment Banking)",
    "company": "Goldman Sachs",
    "location": "New York, NY / London, UK / Singapore",
    "type": "Full-time",
    "category": "Business, Finance & Consulting",
    "deadline": "Rolling — applications open and reviewed on a rolling basis; deadlines vary by business, so apply early",
    "summary": "The premier launching pad for graduates in investment banking, global investment research, asset management, and quantitative finance.",
    "responsibilities": [
      "Build comprehensive financial valuation models (DCF, LBO, merger consequence analysis)",
      "Draft pitch presentations, investment committee memos, and market risk briefings",
      "Execute client transactions across debt, equity, and strategic M&A advisories",
      "Conduct rigorous macroeconomic research and industry competitive benchmarking"
    ],
    "requirements": [
      "Graduating with a Bachelor's or Master's degree between December 2026 and July 2027",
      "Outstanding academic track record across any major discipline (finance, STEM, humanities)",
      "Exceptional quantitative acumen, attention to detail, and team collaboration skills"
    ],
    "howToApply": "Submit your profile on the Goldman Sachs Student Programs portal. You can select up to three division/location preferences.",
    "applyUrl": "https://www.goldmansachs.com/careers/students/programs-and-internships/americas/new-analyst-program",
    "applyLabel": "Apply on Goldman Sachs"
  },
  {
    "id": "jpmorgan-fulltime-analyst-program",
    "title": "Full-Time Global Analyst Program (Commercial & Investment Banking)",
    "company": "JPMorgan Chase",
    "location": "New York, NY / Chicago, IL / London, UK",
    "type": "Full-time",
    "category": "Business, Finance & Consulting",
    "deadline": "Rolling — 2026/2027 Campus Cycle",
    "summary": "Join the world's leading financial services firm to structure capital raises, syndicate loans, and deliver strategic financial advice.",
    "responsibilities": [
      "Perform detailed company valuations, credit analysis, and financial forecasting",
      "Prepare confidential client prospectuses, roadshow presentations, and term sheets",
      "Monitor market trends and synthesize economic indicators for senior managing directors",
      "Collaborate with syndication desks and compliance teams to ensure transaction integrity"
    ],
    "requirements": [
      "Expected graduation between December 2026 and June 2027 with minimum GPA 3.2/4.0",
      "Strong financial accounting knowledge, analytical prowess, and Excel modeling skills",
      "Proven leadership experience through campus organizations or internships"
    ],
    "howToApply": "Apply online through JPMorgan Careers Student Programs page and complete the Pymetrics and HireVue digital video assessment.",
    "applyUrl": "https://careers.jpmorgan.com/us/en/students/programs",
    "applyLabel": "Apply on JPMorgan Careers"
  },
  {
    "id": "pwc-graduate-associate-deals",
    "title": "Graduate Associate, Deals Strategy & Financial Advisory",
    "company": "PwC",
    "location": "London, UK / New York, NY / Toronto, Canada",
    "type": "Full-time",
    "category": "Business, Finance & Consulting",
    "deadline": "Rolling — 2026/2027 Intake",
    "summary": "Support high-profile mergers, carve-outs, financial restructurings, and strategic capital allocations for corporate and institutional investors.",
    "responsibilities": [
      "Analyze financial statements to uncover quality of earnings and working capital adjustments",
      "Assist in commercial diligence assessing market growth drivers and competitive moats",
      "Prepare vendor due diligence reports for transaction counterparties",
      "Work towards recognized professional certifications (e.g. ACA, CPA, or CFA)"
    ],
    "requirements": [
      "Undergraduate or Master's degree completed by 2026 or 2027",
      "Solid command of financial accounting principles and analytical curiosity",
      "Ability to thrive in fast-paced deal environments with tight deadlines"
    ],
    "howToApply": "Submit your profile on PwC Careers, complete the online interactive behavioral assessment, and proceed to the virtual interview stage.",
    "applyUrl": "https://www.pwc.com/gx/en/careers.html",
    "applyLabel": "Apply on PwC Careers"
  },
  {
    "id": "blackrock-fulltime-analyst-program",
    "title": "Full-Time Analyst Program (Portfolio Management & Analytics)",
    "company": "BlackRock",
    "location": "New York, NY / London, UK / San Francisco, CA",
    "type": "Full-time",
    "category": "Business, Finance & Consulting",
    "deadline": "Rolling — varies by region; APAC postings have closed, so check the EMEA and Americas listings",
    "summary": "Manage risk and optimize multi-asset portfolios utilizing Aladdin, the global gold standard in asset management and risk technology.",
    "responsibilities": [
      "Analyze portfolio exposures, factor sensitivities, and liquidity metrics across asset classes",
      "Assist portfolio managers in rebalancing index funds, active equities, and fixed income strategies",
      "Develop automated reporting tools in Python, SQL, and Aladdin API frameworks",
      "Prepare market commentary on central bank rate decisions and macroeconomic trends"
    ],
    "requirements": [
      "Graduating senior or recent graduate (December 2026 – June 2027)",
      "Degree in Finance, Economics, Computer Science, Math, or related field",
      "High intellectual curiosity regarding capital markets and macroeconomic dynamics"
    ],
    "howToApply": "Submit an application through the BlackRock Early Careers portal and select your preferred track (Analytics & Risk or Portfolio Management).",
    "applyUrl": "https://careers.blackrock.com/early-careers",
    "applyLabel": "Apply on BlackRock Careers"
  },
  {
    "id": "bloomberg-global-data-analyst",
    "title": "Global Data Analyst (Early Career Program)",
    "company": "Bloomberg LP",
    "location": "New York, NY / London, UK / Tokyo, Japan",
    "type": "Full-time",
    "category": "Business, Finance & Consulting",
    "deadline": "Rolling — 2026/2027 Cohort",
    "summary": "Power the Bloomberg Professional Terminal by procuring, verifying, and modeling real-time market data consumed by global decision-makers.",
    "responsibilities": [
      "Extract and standardize complex financial disclosures, ESG metrics, and commodity data",
      "Write Python scripts and SQL queries to automate data validation pipelines",
      "Collaborate with Bloomberg News and Core R&D to launch innovative analytical terminal functions",
      "Provide expert terminal client support to institutional traders and analysts"
    ],
    "requirements": [
      "Bachelor's degree in Finance, Economics, Business Analytics, or STEM discipline",
      "Strong attention to detail and proficiency in data manipulation (Python, Excel VBA, SQL)",
      "Excellent verbal communication and problem-solving skills"
    ],
    "howToApply": "Apply via Bloomberg Careers Early Career portal. Candidates complete an online logic assessment followed by virtual panel interviews.",
    "applyUrl": "https://www.bloomberg.com/company/careers/early-career/",
    "applyLabel": "Apply on Bloomberg Careers"
  },
  {
    "id": "morgan-stanley-fulltime-analyst-programs",
    "title": "2027 Full-Time Analyst Programs (Investment Banking, Wealth Management and more)",
    "company": "Morgan Stanley",
    "location": "New York, NY / Paris / other global offices (varies by program)",
    "type": "Full-time",
    "category": "Business, Finance & Consulting",
    "deadline": "October 9, 2026 (Wealth Management Branch Analyst, New York) — other programs vary, e.g. Investment Banking Analyst, Paris closes October 25, 2026",
    "summary": "Morgan Stanley recruits its 2027 full-time analysts through separate programs by division and location, including Investment Banking and Wealth Management's Branch Analyst Program.",
    "responsibilities": [
      "Join a specific division as a full-time analyst under senior guidance",
      "Support live client and internal work in your division",
      "Complete the structured onboarding and training for your program"
    ],
    "requirements": [
      "Final-year student or recent graduate; degree requirements vary by division",
      "Strong analytical and communication skills",
      "Some programs include a video interview stage after the application, with its own short deadline"
    ],
    "howToApply": "Pick your division and location on Morgan Stanley's Students & Graduates portal; each program lists its own application deadline.",
    "applyUrl": "https://www.morganstanley.com/people-opportunities/students-graduates",
    "applyLabel": "Apply on Morgan Stanley",
    "note": "Morgan Stanley recruits on a rolling basis, so programs can close early — apply as soon as your target program opens."
  },
  {
    "id": "standard-chartered-graduate-programme",
    "title": "Graduate Programme (2027 Intake)",
    "company": "Standard Chartered",
    "location": "Multiple markets (varies by country)",
    "type": "Full-time / 18-month graduate programme",
    "category": "Business, Finance & Consulting",
    "deadline": "Rolling — applications opened in early September 2026 and are reviewed on a rolling basis",
    "summary": "An 18-month graduate programme of business-aligned rotations, starting each September, open to students from any degree discipline.",
    "responsibilities": [
      "Complete business-aligned rotations over the 18-month programme",
      "Work on live projects within each rotation"
    ],
    "requirements": [
      "In your penultimate or final year of a bachelor’s or postgraduate degree",
      "Open to all degree disciplines"
    ],
    "howToApply": "Select your market on Standard Chartered's early-careers pages and apply online; selection includes a Workplace Scenarios assessment followed by assessment centres.",
    "applyUrl": "https://www.sc.com/en/global-careers/early-careers/",
    "applyLabel": "Apply on Standard Chartered Careers",
    "note": "Programmes and timelines differ by country, so check the page for your market."
  },
  {
    "id": "mastercard-launch-program",
    "title": "Launch Program (Global Graduate Program)",
    "company": "Mastercard",
    "location": "Multiple countries (50+ countries, 80+ offices)",
    "type": "Full-time / 18-month graduate program",
    "category": "Business, Finance & Consulting",
    "deadline": "Rolling — no fixed dates listed; browse open opportunities on the Launch page",
    "summary": "Mastercard's 18-month flagship global graduate program, combining full-time work with structured development across technology, consulting, product, and sales.",
    "responsibilities": [
      "Start with onboarding and a virtual bootcamp, then take on hands-on work in your role",
      "Attend quarterly Skill Boost sessions during the program",
      "Take part in social impact projects through nonprofit partnerships"
    ],
    "requirements": [
      "Recent or upcoming graduate with a bachelor's or master's degree",
      "Innovative thinking and strong problem-solving skills",
      "Specific qualifications vary by role"
    ],
    "howToApply": "Open the Launch program page and use 'View open opportunities' to apply to a role that matches your background.",
    "applyUrl": "https://careers.mastercard.com/us/en/early-careers/launch",
    "applyLabel": "Apply on Mastercard Careers"
  },
  {
    "id": "ey-early-careers-programmes",
    "title": "Graduate & Student Entry-Level Programmes",
    "company": "EY",
    "location": "Global (select your country)",
    "type": "Full-time / Graduate programme",
    "category": "Business, Finance & Consulting",
    "deadline": "Rolling — varies by country and service line; roles may fill early",
    "summary": "EY's graduate and student entry-level programmes run across service lines such as assurance, consulting, and tax, depending on the country you apply in.",
    "responsibilities": [
      "Work on client-facing engagements in your service line",
      "Complete the training and professional-qualification pathway attached to your programme"
    ],
    "requirements": [
      "Final-year student or recent graduate (rules vary by country)",
      "Requirements and eligible degrees differ by service line and country"
    ],
    "howToApply": "Select your country on EY's global careers site, choose a programme, and apply online.",
    "applyUrl": "https://www.ey.com/en_gl/careers/student-entry-level-programs",
    "applyLabel": "Apply on EY Careers",
    "note": "In some countries, programmes last two to three years and lead to an industry-recognised qualification; check your country’s page for details."
  },
  {
    "id": "visa-early-careers",
    "title": "Early Careers Programs (Leadership Associate Program & Graduate Roles)",
    "company": "Visa",
    "location": "Multiple global locations",
    "type": "Full-time / Rotational graduate program",
    "category": "Business, Finance & Consulting",
    "deadline": "Rolling — openings are listed by program and location; confirm current dates on the site",
    "summary": "Visa's early-career programs, including the Leadership Associate Program (VLA), a two-year rotational program building broad experience in the payments industry.",
    "responsibilities": [
      "Rotate across distinct assignments over the two-year VLA program",
      "Build foundational knowledge of Visa's payments business",
      "Take on real project ownership within each rotation"
    ],
    "requirements": [
      "Recent graduate or final-year student from a range of academic disciplines",
      "Demonstrated leadership potential and strong analytical skills"
    ],
    "howToApply": "Apply through Visa's Early Careers hub, which lists current openings by program and location.",
    "applyUrl": "https://corporate.visa.com/en/careers/early-careers.html",
    "applyLabel": "Apply on Visa Careers",
    "note": "Visa recruits for many early-career programs on an annual calendar, so check current-cycle dates before applying."
  },
  {
    "id": "world-bank-treasury-summer-internship-2027",
    "title": "Treasury Summer Internship (Summer 2027)",
    "company": "World Bank Group (Treasury)",
    "location": "Washington, DC",
    "type": "Internship (June 1 – August 9, 2027)",
    "category": "Business, Finance & Consulting",
    "deadline": "September 30, 2026 (closing date reported by listings; confirm in the World Bank Group careers portal)",
    "summary": "A paid summer internship in the World Bank Group's Treasury, with an onboarding week, three rotations of three weeks each, and a capstone presentation. Up to 17 interns are hired.",
    "responsibilities": [
      "Complete three three-week rotations across Treasury teams",
      "Deliver a capstone presentation at the end of the internship"
    ],
    "requirements": [
      "Enrolled in the second-to-final year of a four-year degree program",
      "Interest in finance, business, economics, or related fields",
      "Graduating between December 2027 and September 2028",
      "Available full-time for the whole internship, in person in Washington, DC"
    ],
    "howToApply": "Apply through the World Bank Group careers portal with a one-page PDF cover letter and a one-page PDF resume (a half-page personal statement is optional).",
    "applyUrl": "https://treasury.worldbank.org/en/about/unit/treasury/about/student-and-graduate-careers",
    "applyLabel": "Apply via World Bank Treasury",
    "note": "Per the Treasury page, the internship is paid ($22.70–$27.70 per hour depending on citizenship) and the World Bank sponsors the appropriate visa for an incoming intern."
  },
  {
    "id": "world-bank-group-ypp",
    "title": "Young Professionals Program (WBG YPP)",
    "company": "World Bank Group",
    "location": "Washington, DC (with global field missions)",
    "type": "Full-time 5-Year Renewable Staff Contract",
    "category": "Policy, Government & Nonprofit",
    "deadline": "September 30, 2026 (11:59 PM UTC)",
    "summary": "The flagship leadership pipeline for future global leaders at the World Bank, IFC, and MIGA dedicated to eradicating poverty and boosting shared prosperity.",
    "responsibilities": [
      "Lead economic sector studies and structure sovereign development loans",
      "Work on project finance, equity investments, and political risk guarantees in emerging markets",
      "Advise national ministries of finance on fiscal governance, renewable infrastructure, and health systems",
      "Deploy to client countries for on-the-ground technical missions"
    ],
    "requirements": [
      "Master's or Doctorate degree in economics, finance, public policy, engineering, or international development",
      "Born on or after October 1, 1994 (under 32 years of age at intake)",
      "Minimum of 3 years of relevant professional development experience or continued doctoral study",
      "Fluency in English; working knowledge of French, Spanish, Arabic, Russian, or Portuguese preferred"
    ],
    "howToApply": "Submit your application via the World Bank Group YPP portal, including CV, statement of interest, academic credentials, and policy essay.",
    "applyUrl": "https://www.worldbank.org/ext/en/careers/talent-programs/young-professionals-program",
    "applyLabel": "Apply on World Bank Careers"
  },
  {
    "id": "who-global-internship-jpo",
    "title": "Global Internship & Junior Professional Programme",
    "company": "World Health Organization (WHO)",
    "location": "Geneva, Switzerland & Regional Offices Worldwide",
    "type": "Full-time Traineeship / Contract",
    "category": "Policy, Government & Nonprofit",
    "deadline": "Rolling — Seasonal Windows (Winter/Spring 2027)",
    "summary": "Contribute to international public health policy, epidemic preparedness, universal healthcare access, and technical guidelines at the WHO headquarters and regional hubs.",
    "responsibilities": [
      "Synthesize peer-reviewed epidemiological research and clinical trial outcome data",
      "Assist in drafting technical disease prevention guidelines and public health advisories",
      "Coordinate vaccine distribution logistics and disease surveillance networks",
      "Support health emergency communications and cross-agency taskforces"
    ],
    "requirements": [
      "Enrolled in or graduated within 6 months from a graduate degree in Public Health, Medicine, Epidemiology, or International Relations",
      "At least 20 years of age with excellent drafting ability in English or French",
      "Passion for health equity and multilateral cooperation"
    ],
    "howToApply": "Apply via the WHO Stellis recruitment portal. Ensure that all academic qualifications and language certifications are up to date.",
    "applyUrl": "https://www.who.int/careers/internship-programme",
    "applyLabel": "Apply on WHO Careers"
  },
  {
    "id": "unicef-junior-professional-officer",
    "title": "Junior Professional Officer (JPO) & Global Talent Initiative",
    "company": "UNICEF",
    "location": "New York, NY / Copenhagen, Denmark / Field Duty Stations",
    "type": "Full-time Fixed-Term Staff",
    "category": "Policy, Government & Nonprofit",
    "deadline": "Varies — JPO calls are run by sponsoring governments; UNICEF posts other vacancies continuously",
    "summary": "Advocate for child survival, nutrition, basic education, and protection from violence across humanitarian emergencies and long-term development programs.",
    "responsibilities": [
      "Monitor community health, child protection, and primary education initiatives in target districts",
      "Manage supply chain fulfillment for emergency relief kits, water purification, and vaccines",
      "Prepare donor reporting documentation and programmatic performance dashboards",
      "Engage local civil society partners and government welfare ministries"
    ],
    "requirements": [
      "Advanced university degree (Master's) in Social Sciences, Development Economics, Education, or Public Health",
      "Minimum of 2 to 4 years of professional field experience in development or humanitarian response",
      "Fluency in English and another UN language (Arabic, Chinese, French, Russian, Spanish)"
    ],
    "howToApply": "Apply through your home country government's sponsoring JPO department or through UNICEF's official global e-recruitment system.",
    "applyUrl": "https://www.unicef.org/careers/junior-professional-officer-programme",
    "applyLabel": "Apply on UNICEF Careers"
  },
  {
    "id": "msf-global-humanitarian-specialist",
    "title": "Global Humanitarian Logistics & Operations Specialist",
    "company": "Doctors Without Borders (MSF)",
    "location": "New York, NY / Geneva, Switzerland / Field Missions",
    "type": "Full-time",
    "category": "Policy, Government & Nonprofit",
    "deadline": "Rolling — 2026/2027 Recruitment",
    "summary": "Manage medical supply chains, cold-chain transport, communications technology, and emergency field hospital facilities in crisis zones.",
    "responsibilities": [
      "Coordinate the rapid procurement, customs clearance, and delivery of surgical supplies and medication",
      "Set up clean water, sanitation, and electrical power systems in emergency treatment centers",
      "Ensure strict adherence to humanitarian safety protocols and local operating agreements",
      "Manage local logistical teams and budget expenditures with total transparency"
    ],
    "requirements": [
      "Degree in Logistics, Supply Chain, Engineering, Humanitarian Logistics, or equivalent practical experience",
      "Demonstrated resilience and ability to work in remote, resource-constrained environments",
      "Fluency in English; conversational French or Arabic strongly preferred"
    ],
    "howToApply": "Submit your CV and humanitarian motivation letter on the MSF International Careers website.",
    "applyUrl": "https://www.doctorswithoutborders.org/careers",
    "applyLabel": "Apply on MSF Careers"
  },
  {
    "id": "adb-young-professionals-program",
    "title": "Young Professionals Program (YPP)",
    "company": "Asian Development Bank (ADB)",
    "location": "Manila, Philippines (with regional missions)",
    "type": "Full-time 3-Year Fixed Term",
    "category": "Policy, Government & Nonprofit",
    "deadline": "September 30, 2026 (11:59 PM Manila time)",
    "summary": "Embark on an international career in sovereign lending, private sector operations, climate transition finance, and economic analysis across Asia and the Pacific.",
    "responsibilities": [
      "Structure infrastructure loans and blended finance vehicles for green energy and clean water projects",
      "Conduct macroeconomic policy dialogues with national central banks and development ministries",
      "Participate in project appraisal missions, environmental safeguards audits, and disbursements",
      "Rotate across operational departments and resident country missions"
    ],
    "requirements": [
      "Citizen of an ADB member economy, aged 32 or younger",
      "Master's degree or PhD in Economics, Finance, Engineering, Environmental Science, or a related field",
      "At least 3 years of relevant professional experience"
    ],
    "howToApply": "Apply online through the ADB Career Portal. Include a comprehensive summary of your development projects and research papers.",
    "applyUrl": "https://www.adb.org/work-with-us/careers/adb-young-professionals-program",
    "applyLabel": "Apply on ADB Careers"
  },
  {
    "id": "undp-digital-ai-innovation-internship-2026",
    "title": "Digital, AI and Innovation Internship (Global Call for 2026)",
    "company": "UNDP",
    "location": "Varies by posting",
    "type": "Internship",
    "category": "Policy, Government & Nonprofit",
    "deadline": "September 30, 2026",
    "summary": "UNDP's global call for a Digital, AI and Innovation internship, part of an internship programme that places students on development work across UNDP country, regional, and headquarters offices.",
    "responsibilities": [
      "Support UNDP's digital, AI, and innovation work under the guidance of staff",
      "Contribute to projects within the office or team you are placed in"
    ],
    "requirements": [
      "Enrolled in the final year of a bachelor's degree, or in a graduate programme (master's or higher)",
      "Fluent English"
    ],
    "howToApply": "Apply through the UNDP careers portal via the posting. UNDP internships are advertised on jobs.undp.org, each with its own deadline.",
    "applyUrl": "https://estm.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/job/33001",
    "applyLabel": "Apply via UNDP Careers",
    "note": "Other UNDP internship vacancies are listed at jobs.undp.org and close on their own dates."
  },
  {
    "id": "unhcr-internship-programme",
    "title": "UNHCR Internship Programme",
    "company": "UNHCR (UN Refugee Agency)",
    "location": "Global (headquarters and field offices)",
    "type": "Internship",
    "category": "Policy, Government & Nonprofit",
    "deadline": "Rolling — each posting carries its own closing date",
    "summary": "A structured internship for students and recent graduates to gain hands-on experience in the humanitarian and refugee-protection sector.",
    "responsibilities": [
      "Support the work of your assigned team, such as legal protection, community services, public affairs, or health",
      "Contribute to operational or policy work under staff supervision"
    ],
    "requirements": [
      "Currently pursuing, or recently completed, an undergraduate or graduate degree",
      "Strong written and spoken English; other languages are an asset depending on the duty station"
    ],
    "howToApply": "Create a profile on UNHCR's recruitment platform (Workday) and apply to open internship postings. UNHCR does not charge fees at any stage of recruitment.",
    "applyUrl": "https://www.unhcr.org/us/get-involved/work-us/careers-unhcr/how-apply",
    "applyLabel": "Apply via UNHCR Careers",
    "note": "Highly competitive, so apply early once a relevant posting opens."
  },
  {
    "id": "un-women-internship-programme",
    "title": "UN Women Internship Programme",
    "company": "UN Women",
    "location": "Global (headquarters and regional / country offices)",
    "type": "Internship (typically 2–6 months)",
    "category": "Policy, Government & Nonprofit",
    "deadline": "Rolling — vacancies are posted throughout the year, each with its own closing date",
    "summary": "Internships across UN Women offices, giving students and recent graduates experience in gender equality and women’s empowerment work.",
    "responsibilities": [
      "Support the work of your assigned team on real projects under expert guidance",
      "Contribute to research, programme, or communications work relevant to your placement"
    ],
    "requirements": [
      "Typically enrolled in a master's, post-master's, or PhD program, or in the final year of an undergraduate degree, or a recent graduate (within about two years)",
      "Check each posting for exact eligibility, language, and stipend details"
    ],
    "howToApply": "View current internship openings on UN Women's careers portal and apply to the posting that matches your background.",
    "applyUrl": "https://www.unwomen.org/en/about-us/employment/internship-programme",
    "applyLabel": "Apply via UN Women"
  },
  {
    "id": "spotify-early-career-product-designer",
    "title": "Global Early Career Product Designer (Web & Mobile Experience)",
    "company": "Spotify",
    "location": "Stockholm, Sweden / New York, NY / London, UK",
    "type": "Full-time",
    "category": "Design, Marketing & Ops",
    "deadline": "Rolling — 2026/2027 Cohort",
    "summary": "Design intuitive audio and video interfaces, playlist exploration mechanics, and creator studio tools loved by 600M+ active listeners.",
    "responsibilities": [
      "Design user flows, wireframes, and production-ready high-fidelity Figma components",
      "Partner closely with engineers to ensure pixel-perfect implementation across iOS, Android, and Web",
      "Conduct user testing sessions, synthesize qualitative feedback, and iterate quickly",
      "Contribute to Spotify's Encore design system with accessible and responsive patterns"
    ],
    "requirements": [
      "Bachelor's or Master's degree in Interaction Design, HCI, Graphic Design, or related field",
      "Portfolio showcasing end-to-end design thinking, user-centered design, and elegant visual aesthetics",
      "High proficiency in Figma, design systems, and rapid prototyping tools"
    ],
    "howToApply": "Apply on Life at Spotify Students portal. Make sure your portfolio URL is clearly linked in your resume.",
    "applyUrl": "https://www.lifeatspotify.com/students",
    "applyLabel": "Apply on Life at Spotify"
  },
  {
    "id": "adobe-experience-design-specialist",
    "title": "Experience Design (XD) Specialist, University Graduate",
    "company": "Adobe",
    "location": "San Jose, CA / San Francisco, CA / Seattle, WA",
    "type": "Full-time",
    "category": "Design, Marketing & Ops",
    "deadline": "Rolling — 2026/2027 University Cycle",
    "summary": "Work at the heart of creative technology, designing interfaces for Photoshop, Illustrator, Firefly AI, and Adobe Creative Cloud web services.",
    "responsibilities": [
      "Design cutting-edge creative tooling workflows powered by generative AI and neural models",
      "Create interactive clickable prototypes to validate emerging interaction modalities",
      "Partner with product managers to define roadmaps based on qualitative designer feedback",
      "Contribute to Adobe's Spectrum design system components and specifications"
    ],
    "requirements": [
      "Bachelor's or Master's degree in HCI, Graphic Design, Digital Media, or equivalent",
      "Outstanding portfolio displaying UX discovery, wireframing, and visual craft",
      "Mastery of Figma and modern interactive prototyping frameworks"
    ],
    "howToApply": "Submit your application via the Adobe University Recruiting portal with your resume and portfolio URL.",
    "applyUrl": "https://careers.adobe.com/us/en/graduates",
    "applyLabel": "Apply on Adobe Careers"
  },
  {
    "id": "figma-early-career-product-designer",
    "title": "Early Career Product Designer (Core Tools & Design Systems)",
    "company": "Figma",
    "location": "San Francisco, CA / New York, NY / Remote (US)",
    "type": "Full-time",
    "category": "Design, Marketing & Ops",
    "deadline": "Rolling — 2026/2027 New Grad Intake",
    "summary": "Design the tools that the entire world's designers use to collaborate, prototype, build design systems, and ship modern software.",
    "responsibilities": [
      "Design deep, versatile software features for canvas manipulation, multiplayer editing, and component variants",
      "Write clear design specifications and stress-test edge cases for complex vector workflows",
      "Interview community creators and agency designers to understand workflow bottlenecks",
      "Iterate closely with systems engineers on performance and real-time collaboration UX"
    ],
    "requirements": [
      "Graduating senior or recent graduate in Design, Computer Science, or related field",
      "Strong eye for detail, typographic hierarchy, and system-level abstraction",
      "A portfolio of digital design work that clearly demonstrates design rationale"
    ],
    "howToApply": "Submit your application through Figma's careers page, including a portfolio link and a brief note on your favorite Figma feature.",
    "applyUrl": "https://www.figma.com/careers/",
    "applyLabel": "Apply on Figma Careers"
  },
  {
    "id": "hubspot-emerging-talent-growth",
    "title": "Emerging Talent Associate, Growth Marketing & Operations",
    "company": "HubSpot",
    "location": "Cambridge, MA / Dublin, Ireland / Remote",
    "type": "Full-time",
    "category": "Design, Marketing & Ops",
    "deadline": "Rolling — Spring/Fall 2027 Intake",
    "summary": "Drive inbound marketing initiatives, marketing automation pipelines, and customer acquisition campaigns across global SaaS markets.",
    "responsibilities": [
      "Develop omnichannel email nurture workflows and customer lifecycle segmentations",
      "Analyze conversion funnel metrics, lead scoring, and customer acquisition costs (CAC)",
      "A/B test landing page copy, visual assets, and call-to-action designs to boost conversion",
      "Collaborate with sales operations to streamline CRM pipeline tracking"
    ],
    "requirements": [
      "Graduating with a degree in Marketing, Communications, Business, or related discipline",
      "Familiarity with inbound marketing concepts, SEO principles, and analytics tools",
      "Creative copywriting abilities paired with strong numerical reasoning"
    ],
    "howToApply": "Apply online via HubSpot's Emerging Talent careers page and submit a brief writing or campaign sample.",
    "applyUrl": "https://www.hubspot.com/careers/emerging-talent",
    "applyLabel": "Apply on HubSpot Careers"
  },
  {
    "id": "unilever-future-leaders-programme",
    "title": "Unilever Future Leaders Programme (UFLP) in Brand Marketing",
    "company": "Unilever",
    "location": "London, UK / Englewood Cliffs, NJ / Singapore / Worldwide",
    "type": "Full-time Graduate Trainee (3-Year Fast Track)",
    "category": "Design, Marketing & Ops",
    "deadline": "Rolling — varies by country (Singapore closes September 30, 2026); roles can close early once filled",
    "summary": "A world-famous fast-track management trainee scheme developing managers who build iconic FMCG brands (Dove, Ben & Jerry's, Knorr, Hellmann's).",
    "responsibilities": [
      "Lead national and regional brand campaigns across digital, retail, and experiential channels",
      "Analyze consumer trend data to develop brand purpose strategies and packaging redesigns",
      "Manage multi-million dollar marketing budgets and media agency partnerships",
      "Rotate across customer development, e-commerce, and brand development departments"
    ],
    "requirements": [
      "Graduating with a Bachelor's or Master's degree in any field by Summer 2027",
      "Demonstrated passion for consumer brands, sustainable living, and business leadership",
      "Curiosity, emotional intelligence, and resilience in fast-moving commercial markets"
    ],
    "howToApply": "Complete the online application and profile assessment on the Unilever UFLP website, followed by a digital discovery centre assessment.",
    "applyUrl": "https://careers.unilever.com/en/early-careers",
    "applyLabel": "Apply on Unilever Careers"
  },
  {
    "id": "automattic-happiness-engineer",
    "title": "Happiness Engineer (Customer Experience & Platform Operations)",
    "company": "Automattic",
    "location": "100% Remote Worldwide",
    "type": "Full-time Distributed",
    "category": "Design, Marketing & Ops",
    "deadline": "Rolling — Continuous Global Recruitment",
    "summary": "Deliver world-class support, technical guidance, and operational onboarding for WordPress.com, WooCommerce, and Tumblr users worldwide.",
    "responsibilities": [
      "Troubleshoot HTML, CSS, PHP, and plugin issues directly with site owners and creators",
      "Guide small business owners in setting up e-commerce stores, payments, and custom domains",
      "Document user feedback and synthesize product bugs for the engineering team",
      "Help build a more democratic, open web from anywhere in the world"
    ],
    "requirements": [
      "Solid experience with WordPress, site building, CSS, and web fundamentals",
      "Superb written communication skills and deep empathy for users of all technical levels",
      "Self-motivated, disciplined remote worker comfortable managing their own schedule"
    ],
    "howToApply": "Apply on the Automattic Work With Us page. The selection process includes a paid, part-time trial project before a full-time offer.",
    "applyUrl": "https://automattic.com/work-with-us/",
    "applyLabel": "Apply on Automattic Careers"
  },
  {
    "id": "zapier-marketing-operations-associate",
    "title": "Marketing Operations & Automation Associate",
    "company": "Zapier",
    "location": "100% Remote Worldwide",
    "type": "Full-time Distributed",
    "category": "Design, Marketing & Ops",
    "deadline": "Rolling — 2026/2027 Intake",
    "summary": "Harness the power of no-code automation, AI triggers, and integration workflows to scale Zapier's global growth engine.",
    "responsibilities": [
      "Build automated Zaps and webhooks routing lead data between marketing, sales, and analytics tools",
      "Maintain data hygiene and tracking schemas in customer data platforms (Segment, Mixpanel)",
      "Optimize referral marketing loops and partner co-marketing landing pages",
      "Conduct regular operational audits of campaign automation performance"
    ],
    "requirements": [
      "Experience in marketing ops, automation tools, or technical marketing",
      "Comfortable working with APIs, webhooks, spreadsheets, and basic JavaScript or Python",
      "Strong problem-solving instincts and asynchronous written communication skills"
    ],
    "howToApply": "Submit your resume and cover letter answering Zapier's specific prompt questions on the Zapier Jobs portal.",
    "applyUrl": "https://zapier.com/jobs",
    "applyLabel": "Apply on Zapier Careers"
  },
  {
    "id": "airbnb-early-careers",
    "title": "Early Careers & Internship Programs",
    "company": "Airbnb",
    "location": "Multiple locations (varies by role)",
    "type": "Internship / Early career",
    "category": "Design, Marketing & Ops",
    "deadline": "Rolling — apply as early as possible after a role posts",
    "summary": "Airbnb's internship and early-career programs put students and graduates on high-exposure projects from day one, with the goal of converting strong interns into full-time hires.",
    "responsibilities": [
      "Own meaningful project work within your assigned team",
      "Partner with cross-functional teams such as product, design, marketing, or operations, depending on the role"
    ],
    "requirements": [
      "Currently enrolled student or early-career candidate, depending on the role",
      "Relevant coursework or prior internship experience for the track you apply to"
    ],
    "howToApply": "Browse open early-career roles on Airbnb's careers site and apply directly.",
    "applyUrl": "https://careers.airbnb.com/internship-programs/",
    "applyLabel": "Apply on Airbnb Careers"
  },
  {
    "id": "shopify-early-career-programs",
    "title": "Early-Career Programs: Engineering Internship, APM & Design Apprentice",
    "company": "Shopify",
    "location": "Varies by program",
    "type": "Internship / Apprenticeship",
    "category": "Design, Marketing & Ops",
    "deadline": "Rolling — Shopify's page lists no fixed dates; check each program's site",
    "summary": "Shopify runs structured early-career programs across engineering, product management, and design, plus a work-and-study route into computer science.",
    "responsibilities": [
      "Internship: a paid 4-month engineering internship for students, recent graduates, and early-career candidates",
      "APM Program: a 12-month Apprentice Product Manager program building foundational product management skills",
      "Design Apprentice Program: a 6-month program pairing early-career designers with senior mentors across two rotations",
      "Dev Degree: a 3–4-year program for earning a computer science degree while working"
    ],
    "requirements": [
      "Open to students, recent graduates, career switchers, and early-career candidates (varies by program)",
      "Program-specific criteria are listed on each program's own page"
    ],
    "howToApply": "Choose the program that fits your discipline on Shopify's early-career page, then apply on its dedicated site (internships.shopify.com, apm.shopify.com, shopify.design/dap, or devdegree.ca).",
    "applyUrl": "https://www.shopify.com/careers/interns",
    "applyLabel": "Explore Shopify Programs"
  }
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
              Verified Openings Only
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono max-w-[260px] leading-relaxed">
              Sourced from official employer &amp; institutional career pages
            </div>
            <div className="text-[10px] font-bold text-[#68A108] font-mono uppercase tracking-wider">
              {jobs.length} Openings · Updated {LAST_UPDATED}
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

            {/* Advertisement */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <AdsterraNativeBanner />
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
