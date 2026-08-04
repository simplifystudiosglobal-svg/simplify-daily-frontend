import { Mail, MapPin } from 'lucide-react';

export type StaticPageId = 'about' | 'contact' | 'privacy' | 'terms';

interface StaticPageProps {
  page: StaticPageId;
  onNavigateHome: () => void;
  onNavigateScholarships: () => void;
  onNavigateJobs?: () => void;
  onNavigateStatic: (page: StaticPageId) => void;
  onNavigateWorldNews?: () => void;
  onNavigateEntertainment?: () => void;
}

const navConfig: { id: StaticPageId; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'terms', label: 'Terms of Use' },
];

function AboutContent() {
  return (
    <>
      <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-6">About Simplify Daily</h2>
      <div className="prose-like space-y-5 text-[14.5px] leading-relaxed text-slate-600">
        <p>
          Simplify Daily is a magazine-style news portal covering world news, entertainment, and the labor market —
          alongside two curated directories: real, currently open jobs at trusted employers, and verified scholarship
          and fellowship opportunities from around the world.
        </p>
        <p>
          Our news coverage focuses on trend and analysis reporting sourced from established outlets and primary
          data — think Federal Reserve decisions, labor-market shifts, and industry trends explained in plain
          language, not recycled headlines.
        </p>
        <p>
          Our Jobs and Scholarships sections are hand-compiled and cross-checked against each employer's or
          program's own official careers page or application portal — every "Apply" link takes you directly to the
          official source, never a third-party listing.
        </p>
        <p>
          We're a small, independently run publication and are always working to improve accuracy and coverage.
        </p>
      </div>
    </>
  );
}

function ContactContent() {
  return (
    <>
      <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-6">Contact Us</h2>
      <div className="space-y-5 text-[14.5px] leading-relaxed text-slate-600">
        <p>Have a correction, a job or scholarship to suggest, or a general question? We'd like to hear from you.</p>
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 w-fit">
          <Mail size={16} className="text-[#68A108]" />
          <a href="mailto:simplifystudiosglobal@gmail.com" className="font-bold text-slate-800 hover:text-[#68A108] transition-colors">
            simplifystudiosglobal@gmail.com
          </a>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 w-fit">
          <MapPin size={16} className="text-[#68A108]" />
          <span className="font-bold text-slate-800">Remote-first newsroom</span>
        </div>
      </div>
    </>
  );
}

function PrivacyContent() {
  return (
    <>
      <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Privacy Policy</h2>
      <p className="text-[12px] text-slate-400 mb-6">Last updated: July 2026</p>
      <div className="space-y-5 text-[14.5px] leading-relaxed text-slate-600">
        <p>This policy explains, in plain terms, what happens when you use Simplify Daily.</p>
        <div>
          <h3 className="font-black text-slate-900 text-[13px] uppercase tracking-wide mb-1.5">Information we collect</h3>
          <p>
            If you use our newsletter subscribe form or contact us directly, we collect the email address and any
            other information you choose to provide. We do not knowingly collect sensitive personal information
            through this site, and we do not sell your personal information to third parties.
          </p>
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-[13px] uppercase tracking-wide mb-1.5">How we use it</h3>
          <p>
            We use the information you provide to respond to inquiries, send newsletter updates you've opted into,
            and improve our coverage. We do not share your email address with employers, scholarship sponsors, or
            other third parties for marketing purposes.
          </p>
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-[13px] uppercase tracking-wide mb-1.5">Third-party links</h3>
          <p>
            Our Jobs and Scholarships sections link directly to external, official employer and institution sites.
            Once you leave Simplify Daily, that site's own privacy policy applies — we don't control or vouch for
            their data practices, and we encourage you to review each site's policy before submitting an
            application.
          </p>
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-[13px] uppercase tracking-wide mb-1.5">Cookies</h3>
          <p>
            This site does not set tracking or advertising cookies. Any cookies present are strictly limited to
            essential site functionality.
          </p>
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-[13px] uppercase tracking-wide mb-1.5">Your choices</h3>
          <p>
            You can unsubscribe from newsletter emails at any time using the link included in each message, or by
            contacting us directly to request that we delete information you've provided.
          </p>
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-[13px] uppercase tracking-wide mb-1.5">Changes to this policy</h3>
          <p>
            We may update this policy from time to time. Material changes will be reflected in the "Last updated"
            date above.
          </p>
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-[13px] uppercase tracking-wide mb-1.5">Contact</h3>
          <p>
            Questions about this policy or your information can be sent through the Contact page linked in the
            navigation above.
          </p>
        </div>
      </div>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Terms of Use</h2>
      <p className="text-[12px] text-slate-400 mb-6">Last updated: July 2026</p>
      <div className="space-y-5 text-[14.5px] leading-relaxed text-slate-600">
        <div>
          <h3 className="font-black text-slate-900 text-[13px] uppercase tracking-wide mb-1.5">Acceptance of terms</h3>
          <p>
            By accessing or using Simplify Daily, you agree to these Terms of Use. If you do not agree, please
            discontinue use of the site.
          </p>
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-[13px] uppercase tracking-wide mb-1.5">Content</h3>
          <p>
            Simplify Daily provides news, job listing, and scholarship information for general informational
            purposes. Content is written and curated by our editorial team and is not a substitute for professional
            legal, financial, immigration, or career advice.
          </p>
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-[13px] uppercase tracking-wide mb-1.5">Job and scholarship listings</h3>
          <p>
            We do our best to keep deadlines, eligibility, compensation, and funding details accurate and up to
            date, but employers and programs change requirements without notice. Always confirm current terms on
            the official application page linked from each listing before applying or making decisions. Simplify
            Daily is not a party to, and assumes no responsibility for, any application, hiring, or funding decision
            made by a listed employer or institution.
          </p>
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-[13px] uppercase tracking-wide mb-1.5">External links</h3>
          <p>
            Our site links to third-party employer, institutional, and government websites. We are not responsible
            for the content, accuracy, or practices of external sites, and linking to them does not imply
            endorsement.
          </p>
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-[13px] uppercase tracking-wide mb-1.5">No warranty</h3>
          <p>
            This site and its content are provided "as is" and "as available," without warranties of any kind,
            express or implied, including as to accuracy, completeness, or fitness for a particular purpose.
          </p>
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-[13px] uppercase tracking-wide mb-1.5">Limitation of liability</h3>
          <p>
            To the fullest extent permitted by law, Simplify Daily is not liable for any indirect, incidental, or
            consequential damages arising from your use of this site or reliance on its content.
          </p>
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-[13px] uppercase tracking-wide mb-1.5">Changes to these terms</h3>
          <p>
            We may revise these terms from time to time. Continued use of the site after changes are posted
            constitutes acceptance of the revised terms.
          </p>
        </div>
      </div>
    </>
  );
}

const contentByPage: Record<StaticPageId, typeof AboutContent> = {
  about: AboutContent,
  contact: ContactContent,
  privacy: PrivacyContent,
  terms: TermsContent,
};

export default function StaticPage({ page, onNavigateHome, onNavigateScholarships, onNavigateJobs, onNavigateStatic, onNavigateWorldNews, onNavigateEntertainment }: StaticPageProps) {
  const Content = contentByPage[page];

  const navItems = [
    { name: 'HOME', active: false, onClick: onNavigateHome },
    { name: 'WORLD NEWS', active: false, onClick: () => (onNavigateWorldNews ? onNavigateWorldNews() : onNavigateHome()) },
    { name: 'ENTERTAINMENT', active: false, onClick: () => (onNavigateEntertainment ? onNavigateEntertainment() : onNavigateHome()) },
    { name: 'JOBS', active: false, onClick: () => onNavigateJobs?.() },
    { name: 'SCHOLARSHIPS', active: false, onClick: onNavigateScholarships },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header
        className="bg-neutral-950 border-b border-neutral-900 relative overflow-hidden py-8"
        style={{ backgroundImage: 'radial-gradient(#1e293b 1.2px, transparent 1.2px)', backgroundColor: '#090d16', backgroundSize: '16px 16px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/40 to-neutral-950/80 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 flex justify-start items-center relative z-10">
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
        </div>
      </header>

      <nav className="bg-[#68A108] sticky top-0 z-50 shadow-md border-b border-[#528005]">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center flex-wrap gap-y-2">
          <ul className="flex items-center flex-wrap">
            {navItems.map((item) => (
              <li
                key={item.name}
                onClick={item.onClick}
                className="flex items-center gap-1.5 px-5 py-4.5 text-[13px] font-sans font-bold tracking-tight border-r border-[#528005] cursor-pointer transition-colors group relative text-white hover:bg-[#528005]"
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-14">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 md:p-12">
          <Content />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-10 text-[11px] font-black uppercase tracking-wider">
          {navConfig.filter((n) => n.id !== page).map((n) => (
            <button
              key={n.id}
              onClick={() => onNavigateStatic(n.id)}
              className="text-slate-400 hover:text-[#68A108] transition-colors cursor-pointer"
            >
              {n.label}
            </button>
          ))}
        </div>
      </main>

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
        </div>
      </footer>
    </div>
  );
}
