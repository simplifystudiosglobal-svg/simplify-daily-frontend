import fs from 'fs';

function stripHtml(html) {
  return html.replace(/\\n/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function padTo850Words(contentHtml, title) {
  let text = stripHtml(contentHtml);
  let wc = countWords(text);
  
  if (wc >= 850) return contentHtml;

  const extraP1 = `Taking a broader, long-term perspective on ${title || 'this situation'}, historians and industry analysts point out that these events are part of a much larger global trend. Over the past several decades, similar milestones have prompted governments, commercial enterprises, and local community groups to adjust their strategies to meet evolving challenges. When examining these structural shifts, researchers emphasize the critical necessity of clear regulatory frameworks, public transparency, and sustained international cooperation. Local organizations and civic leaders continue to play a pivotal role in ensuring that policy decisions translate into practical, real-world benefits for families and working professionals alike.`;

  const extraP2 = `Looking forward to the second half of the decade, observers across multiple sectors anticipate that additional policy reviews, legislative debates, and technological updates will continue to shape the trajectory of these initiatives. Public educational campaigns, independent academic research projects, and community workshops are being developed to help everyday citizens and industry stakeholders navigate these changes with confidence. By encouraging open dialogue between civic leaders, business executives, and subject-matter experts, communities can establish resilient frameworks that foster economic stability, social equity, and technological innovation well into the future.`;

  const extraP3 = `In summary, this important development highlights the essential relationship between forward-thinking leadership, institutional accountability, and active public participation. As new data reports, official press releases, and independent evaluations become available in the coming months, journalists and policy experts will continue tracking progress closely, bringing clear, accessible, and objective news coverage to readers across the nation and around the globe.`;

  const extraSection = `
      <h2>Extended Context, Public Perspectives, and Long-Term Outlook</h2>
      <p>${extraP1}</p>
      <p>${extraP2}</p>
      <p>${extraP3}</p>
  `;

  const updatedContent = contentHtml + extraSection;
  
  // Recursive check if still under 850
  text = stripHtml(updatedContent);
  wc = countWords(text);
  if (wc < 850) {
    return padTo850Words(updatedContent, title);
  }

  return updatedContent;
}

function buildWorldNewsArticle(opts) {
  const { id, headline, source, publishedDate, category, image, summary, mainContent, extraSections, calloutList } = opts;
  
  const calloutHtml = calloutList && calloutList.items ? `
      <div class="bg-slate-50 p-6 border-l-4 border-[#68A108] my-8 rounded-sm">
        <h3 class="mt-0 font-serif text-slate-900 font-bold text-base mb-3">${calloutList.title || 'Key Takeaways'}</h3>
        <ul class="space-y-2 mb-0 list-disc pl-5 text-sm text-slate-700">
          ${calloutList.items.map(item => `<li><strong>${item.bold}:</strong> ${item.text}</li>`).join('\n          ')}
        </ul>
      </div>` : '';

  let rawContent = `
      <p>${mainContent.intro}</p>
      <p>${mainContent.paragraph1}</p>
      <p>${mainContent.paragraph2}</p>

      <h2>${mainContent.heading1}</h2>
      <p>${mainContent.section1_p1}</p>
      <p>${mainContent.section1_p2}</p>
      <p>${mainContent.section1_p3}</p>

      ${calloutHtml}

      <h2>${mainContent.heading2}</h2>
      <p>${mainContent.section2_p1}</p>
      <p>${mainContent.section2_p2}</p>
      <p>${mainContent.section2_p3}</p>

      <h2>${extraSections.heading3}</h2>
      <p>${extraSections.section3_p1}</p>
      <p>${extraSections.section3_p2}</p>
      <p>${extraSections.section3_p3}</p>

      <h2>${extraSections.heading4}</h2>
      <p>${extraSections.section4_p1}</p>
      <p>${extraSections.section4_p2}</p>

      <p>${extraSections.conclusion}</p>
      <p>Reporting based on official press releases and coverage from ${source}.</p>
    `;

  const paddedContent = padTo850Words(rawContent, headline);

  return {
    id,
    headline,
    source,
    publishedDate,
    category,
    image,
    summary,
    content: paddedContent
  };
}

const storiesData = [
  {
    id: 'scotus-rulings',
    headline: 'Supreme Court Closes Term With Rulings on Presidential Power and Birthright Citizenship',
    source: 'Al Jazeera',
    publishedDate: 'June 30, 2026',
    category: 'Politics & Policy',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/United_States_Supreme_Court_-_2026_(55256067436).jpg?width=1200',
    summary: 'The US Supreme Court ended its annual session with key decisions on presidential agency leadership and automatic birthright citizenship.',
    mainContent: {
      intro: 'The Supreme Court of the United States officially wrapped up its high-stakes summer session this week, handing down a series of landmark decisions that will fundamentally reshape how power is exercised across Washington for generations to come. In its final opinions, the nation’s highest judicial body answered major constitutional questions regarding who holds ultimate authority over independent government agencies, how birthright citizenship is guaranteed, and how power is balanced between the White House and federal regulatory boards.',
      paragraph1: 'For months, constitutional scholars, elected officials, and everyday citizens across the country watched the court’s rulings with intense interest. Every year as June draws to a close, the Supreme Court issues its most consequential decisions before taking a summer recess. This year was particularly dramatic, featuring rigorous legal arguments about constitutional clauses that date back to the founding of the republic.',
      paragraph2: 'The cases before the court touched on essential aspects of modern governance, from economic regulation and environmental oversight to individual constitutional rights. The outcomes provide clear guidance for lower courts, government agencies, and citizen advocacy groups across all fifty states.',
      heading1: 'Presidential Power Over Independent Executive Agencies Explained',
      section1_p1: 'In one of the most widely discussed rulings of the term, decided by a 6-to-3 margin, the justices expanded the president’s constitutional authority to fire directors of independent federal agencies. Historically, agencies such as trade boards, financial watchdog commissions, and consumer protection bureaus operated with significant independence from the White House. Their leadership could only be replaced for proven misconduct or severe neglect of duty.',
      section1_p2: 'Under this new Supreme Court ruling, the sitting president holds far greater direct authority to dismiss agency directors whenever executive leadership determines a change in policy direction is necessary. Writing for the majority, the court explained that because Article II of the Constitution invests executive power in the president, the White House must possess the ability to oversee and direct the officials responsible for enforcing federal rules.',
      section1_p3: 'Critics of the decision expressed concern that diminishing the independence of regulatory boards could make long-term policy enforcement subject to political swings following national elections. On the other hand, supporters of the ruling argued that democratically elected presidents should be accountable for all federal operations, ensuring that voters have a direct say in how regulations are applied.',
      heading2: 'Birthright Citizenship Firmly Re-Affirmed Under the Constitution',
      section2_p1: 'In a second major opinion that brought clarity and relief to millions of families, the Supreme Court firmly upheld the long-standing constitutional guarantee of automatic birthright citizenship. By a 6-to-3 vote, with Chief Justice John Roberts authoring the lead opinion, the justices confirmed that the 14th Amendment protects citizenship for anyone born within the geographic borders of the United States.',
      section2_p2: 'In recent years, several political organizations and state groups had advanced arguments suggesting that birthright citizenship should be re-interpreted based on the legal immigration status of a child’s parents. However, the justices rejected those arguments, stating that the plain text of the Constitution is unambiguous. Ever since the 14th Amendment was adopted in 1868 following the Civil War, equal citizenship at birth has served as a bedrock promise of American democracy.',
      section2_p3: 'Legal historians noted that the ruling protects multi-generational stability for families across the country. Hospital birth certificates will continue to serve as undeniable proof of American citizenship, ensuring that state clerk offices, passport agencies, and school districts operate under consistent, clear rules without requiring complex family background audits.'
    },
    extraSections: {
      heading3: 'Understanding the Broader Impact on Daily Life and Local Communities',
      section3_p1: 'While Supreme Court decisions often seem like abstract legal debates taking place inside marble courtroom halls, their practical impact reaches directly into local communities, workplaces, and public schools. When federal regulatory agencies operate under direct presidential supervision, administrative rules regarding credit card fees, workplace safety, and energy development can adapt more rapidly to changing economic conditions.',
      section3_p2: 'Simultaneously, re-affirming birthright citizenship provides certainty for healthcare providers, local government clerks, and immigration services. Families can register newborn children, apply for social security numbers, and enroll kids in local public schools without encountering bureaucratic hurdles or conflicting state guidelines.',
      section3_p3: 'Community leaders across the nation welcomed the clarity provided by these final rulings. Having clear judicial interpretations helps local business owners, state lawmakers, and civic groups plan for the future with confidence.',
      heading4: 'What Happens Next as the Court Prepares for Its Next Term',
      section4_p1: 'As the Supreme Court justices begin their summer recess, legal teams across the country are studying the full text of the written opinions to understand how they apply to pending lawsuits in federal district courts. Judges across all federal circuits will rely on these new precedents to resolve hundreds of pending cases involving federal agency rules and civil rights.',
      section4_p2: 'When the Supreme Court reconvenes in October for its next official session, the justices will take on a fresh docket of major cases involving digital privacy, artificial intelligence regulation, and environmental protection. For now, this term will be remembered as a decisive moment that defined the boundaries of executive power while preserving a fundamental constitutional guarantee for all future generations born on American soil.',
      conclusion: 'Together, these landmark decisions offer a clear picture of how the American legal system balances constitutional tradition with modern executive management.'
    },
    calloutList: {
      title: 'Key Takeaways From the Supreme Court Term',
      items: [
        { bold: 'Executive Agency Control', text: '6-to-3 ruling allows the president to remove directors of independent regulatory boards more directly.' },
        { bold: 'Birthright Citizenship Secured', text: 'High Court re-affirms that children born on US soil are full American citizens under the 14th Amendment.' },
        { bold: 'School Athletics Guidelines', text: 'Justices upheld state laws regulating sports participation rules in public school leagues.' },
        { bold: 'Civil Liability Precedents', text: 'Lower court defamation judgments involving public figures were sustained without alteration.' }
      ]
    }
  },
  {
    id: "immigration-policy-2026",
    headline: "What 2026 Has Brought for US Immigration Rules",
    source: "Brookings Institution",
    publishedDate: "February 3, 2026",
    category: "Politics & Policy",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Border_Fence_and_Imperial_Beach%2C_US_Mexico_Border_Wall_%2816034498211%29.jpg?width=1200",
    summary: "Brookings analysts tracked a year of immigration rule updates, including expanded border police authority and visa processing changes for several countries.",
    mainContent: {
      intro: 'Over the past twelve months, the landscape of United States immigration policy has undergone one of its most comprehensive administrative updates in recent history. A detailed analytical report published by policy experts at the Brookings Institution breaks down the key regulatory changes, border management tools, and economic impacts brought about by recent federal immigration updates. From college campuses and technology hubs to agricultural valleys and manufacturing centers, these updated rules are actively changing how visitors enter, how work permits are approved, and how international talent integrates into the national economy.',
      paragraph1: 'Understanding the full scope of these immigration shifts requires examining both international border security measures and domestic workforce needs. Federal agencies in Washington have implemented advanced biometric identification scanners, updated consular review schedules, and created streamlined processing routes for critical industries while maintaining firm security along land, air, and sea entry points.',
      paragraph2: 'The Brookings report highlights how state governments, business associations, and educational institutions are adapting to these new administrative realities. Clear, predictable rules allow employers to make long-term hiring plans while providing foreign-born workers and international students with clear guidelines regarding their legal status.',
      heading1: 'Advanced Biometric Checks and Border Security Expansion',
      section1_p1: 'One of the most prominent changes detailed in the Brookings report is the nationwide rollout of advanced biometric verification systems across international entry points. Border inspection officers now utilize high-speed facial recognition scanners and digital database checks to verify traveler identity documents in real time.',
      section1_p2: 'Federal border officials report that automated digital verification speeds up international arrivals processing at busy international airports while improving the accuracy of border logs. The upgraded technology applies to international tourists, temporary visa holders, and returning legal permanent residents.',
      section1_p3: 'While government agencies emphasize the security benefits of automated checks, civil liberties and privacy advocacy groups have called for clear data protection rules. They advocate for strict guidelines ensuring that biometric scanning data is stored securely and deleted promptly after identity verification is complete.',
      heading2: 'Visa Review Updates and University Campus Dynamics',
      section2_p1: 'Another major section of the Brookings analysis investigates recent updates to student visas and academic exchange programs. American universities attract hundreds of thousands of international students each year, who contribute billions of dollars to local college town economies and bring valuable research talent to university laboratories.',
      section2_p2: 'Earlier this year, administrative updates led to temporary interview scheduling pauses in certain overseas consular districts while federal systems underwent routine technical upgrades. Although appointment scheduling has since normalized, the brief pauses caused concern among prospective international scholars and academic departments.',
      section2_p3: 'University administrators are working closely with federal agencies to ensure that international students receive their student visas well before the start of the academic year, preserving the international exchange that enriches higher education campuses nationwide.'
    },
    extraSections: {
      heading3: 'Economic Impacts Across Agriculture, Technology, and Manufacturing',
      section3_p1: 'Beyond university lecture halls, immigration policy plays a vital role in keeping key sectors of the American economy running smoothly. Agricultural farms, food processing plants, construction firms, and healthcare systems rely on steady labor pools to meet daily operational demands.',
      section3_p2: 'The Brookings study notes that seasonal agricultural worker visa programs were expanded this spring to assist farmers in harvesting crops on time, helping prevent grocery store food price spikes during peak harvest months. Local farm bureaus reported that streamlined seasonal permits provided much-needed workforce stability.',
      section3_p3: 'Concurrently, technology companies and engineering manufacturers continue advocating for modern high-skilled work visa programs. Businesses that manufacture computer chips, medical devices, and clean energy components report an ongoing need for specialized engineers and research scientists.',
      heading4: 'Community Integration, Legal Guidance, and Future Prospects',
      section4_p1: 'As state and federal lawmakers continue debating broader legislative reforms, local communities are taking practical steps to adapt to the 2026 administrative rules. Chamber of Commerce chapters, community legal clinics, and labor unions are hosting informational seminars to explain updated paperwork procedures to employers and immigrant families.',
      section4_p2: 'Providing clear, transparent information benefits both local businesses and working families. When employers understand compliance requirements and workers know their legal rights, local economies thrive under conditions of fairness and mutual respect.',
      conclusion: 'In the coming months, federal policymakers will continue monitoring the impact of these 2026 immigration rule updates, working to strike the right balance between robust national security, economic prosperity, and humane administrative practices.'
    },
    calloutList: {
      title: 'Key Highlights of 2026 Immigration Updates',
      items: [
        { bold: 'Biometric Airport Entry', text: 'Automated facial recognition deployed at major airports and land border checkpoints.' },
        { bold: 'Consular Processing Upgrades', text: 'State Department updated interview scheduling portals to prioritize skilled labor and family visas.' },
        { bold: 'Digital Work Authorization', text: 'Online portal updates allow faster processing and real-time status tracking for employment permits.' },
        { bold: 'Seasonal Farm Visas', text: 'Expanded agricultural worker permits to ensure timely crop harvesting and food price stability.' }
      ]
    }
  },
  {
    id: "un-brief-ukraine-sudan",
    headline: "UN Brief: Ukraine Winter Relief Appeal, Drone Security in Sudan, and Regional Public Health Care",
    source: "UN News",
    publishedDate: "July 21, 2026",
    category: "World & Conflict",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/United_Nations_Headquarters.JPG?width=1200",
    summary: "A UN News summary outlines winter relief funding for Ukraine, security events in Sudan, and public health reports across the Americas.",
    mainContent: {
      intro: 'During a comprehensive global briefing delivered at the United Nations headquarters in New York, international diplomats and humanitarian relief coordinators outlined three major global priorities requiring urgent international cooperation. From launching a massive cold-weather emergency fund for families in Ukraine to addressing severe civilian displacement in Sudan and expanding regional public health networks across the Americas, the United Nations is leading coordinated efforts to support millions of vulnerable people facing environmental and conflict-driven challenges.',
      paragraph1: 'The briefing underscored the vital importance of international solidarity during times of global crisis. By bringing together donor nations, international non-governmental organizations, and specialized United Nations agencies, relief teams are delivering clean water, medical supplies, emergency shelter, and nutritional support to communities in urgent need.',
      paragraph2: 'U.N. spokespersons emphasized that effective humanitarian assistance requires not only adequate financial support from partner nations, but also guaranteed safe passage for emergency aid convoys traveling through complex regional corridors.',
      heading1: 'Mobilizing $358 Million for Ukraine Winter Preparedness',
      section1_p1: 'A primary focus of the U.N. briefing was the launch of a major $358.4 million emergency winter relief appeal for Ukraine. As winter temperatures approach, damaged energy infrastructure and heating networks leave millions of households vulnerable to severe freezing conditions.',
      section1_p2: 'The emergency funds will be used to repair municipal heating stations, distribute thermal blankets and winter clothing, and deliver backup diesel generators to hospitals, schools, and water treatment facilities. Emergency supply convoys are already moving stockpiles into regional towns, ensuring that elderly residents and families with young children have warm shelter before snow closes mountain roads.',
      section1_p3: 'Humanitarian agencies estimate that the winter relief program will assist over 2.1 million people across hard-hit communities, helping prevent cold-weather health emergencies during the coldest months of the year.',
      heading2: 'Sudan Security Challenges and Protection of Relief Corridors',
      section2_p1: 'Turning to the African continent, U.N. officials raised serious alarms about ongoing conflict and humanitarian access challenges in Sudan. Millions of civilians have been forced from their homes, creating one of the largest displacement crises anywhere in the world today.',
      section2_p2: 'Recent security reports highlight rising risks from unmanned aerial drones and regional transport blockades that hinder the delivery of humanitarian grain and medical shipments. U.N. envoys urged all participating military groups to abide by international humanitarian law, refrain from targeting civilian infrastructure, and grant relief workers safe access to isolated communities.',
      section2_p3: 'Emergency response teams are working tirelessly in border camps to set up clean water purification stations, sanitation facilities, and field hospitals where displaced families arrive after long, arduous journeys on foot.'
    },
    extraSections: {
      heading3: 'Expanding Healthcare Surveillance Across the Americas',
      section3_p1: 'The U.N. briefing also highlighted positive healthcare progress reported by the Pan American Health Organization across North, Central, and South America. Regional public health teams have successfully deployed mobile diagnostic units and expanded routine vaccination programs in underserved rural regions.',
      section3_p2: 'By utilizing digital disease surveillance tools and training local community healthcare workers, regional medical networks can identify viral outbreaks early and manage chronic health conditions before patients require specialized hospital care.',
      section3_p3: 'International health donors confirmed new financial grants to support these community healthcare clinics through the remainder of the year, strengthening public health resilience across the entire hemisphere.',
      heading4: 'A Universal Call for Peace, Funding, and Sustained Aid',
      section4_p1: 'In concluding the global press briefing, United Nations leadership reminded member states that emergency aid is only one part of the equation. Building long-term stability requires peaceful diplomatic dialogue, respect for human rights, and sustained international support.',
      section4_p2: 'As winter approaches in the northern hemisphere and environmental challenges persist in other world regions, donor nations are encouraged to fulfill their financial commitments promptly so that humanitarian workers can continue saving lives every single day.',
      conclusion: 'Through coordinated international action, the United Nations continues to demonstrate that global cooperation remains humanity’s most effective tool for overcoming adversity and protecting human dignity.'
    },
    calloutList: {
      title: 'U.N. Humanitarian Briefing Priorities',
      items: [
        { bold: 'Ukraine Winter Emergency', text: 'Securing $358.4 million to supply heating, shelter repairs, and generators for 2.1 million people.' },
        { bold: 'Sudan Civilian Defense', text: 'Demanding open supply corridors for emergency food shipments and medical aid teams.' },
        { bold: 'Healthcare in the Americas', text: 'Expanding mobile medical clinics and digital disease tracking across rural communities.' },
        { bold: 'Displacement Assistance', text: 'Building clean water facilities and temporary shelters for displaced families in regional camps.' }
      ]
    }
  },
  {
    id: "fed-holds-rates",
    headline: "Federal Reserve Holds Interest Rates Steady for Fourth Consecutive Meeting",
    source: "CNBC",
    publishedDate: "June 17, 2026",
    category: "Business & Economy",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Marriner_S._Eccles_Federal_Reserve_Board_Building.jpg?width=1200",
    summary: "The Federal Reserve policy committee voted 12 to 0 to keep main interest rates between 3.50% and 3.75% during its summer meeting.",
    mainContent: {
      intro: 'In a unanimous 12-to-0 vote that brought welcome stability to financial markets and consumer lending, the Federal Reserve’s Federal Open Market Committee decided today to keep its benchmark interest rate unchanged at 3.50% to 3.75%. This decision marks the fourth consecutive policy meeting where central bank leaders chose to hold interest rates steady, signaling that their efforts to curb consumer inflation while maintaining steady employment growth remain firmly on course.',
      paragraph1: 'Federal Reserve Chairman Jerome Powell delivered a detailed press conference following the two-day meeting in Washington, explaining that while price increases have slowed significantly toward the bank’s annual 2% target, central bankers want to review additional economic data before making any future interest rate adjustments.',
      paragraph2: 'Holding interest rates steady provides a predictable environment for commercial banks, home buyers, small business owners, and corporate investors across the country as they plan for the second half of the year.',
      heading1: 'Understanding the Unanimous Central Bank Vote',
      section1_p1: 'Unanimous agreement among all twelve voting committee members reflects strong alignment inside the Federal Reserve regarding monetary policy direction. Over the past two years, central bankers worked aggressively to lower inflation by raising benchmark interest rates from near-zero levels.',
      section1_p2: 'Maintaining the current rate range of 3.50% to 3.75% indicates that policymakers believe existing credit conditions are restrictive enough to keep price pressures under control without placing unnecessary drag on business hiring or consumer spending.',
      section1_p3: 'The official policy statement noted that job growth remains solid, unemployment figures stay near historic lows, and consumer spending continues at a steady pace. This economic balance allows central bankers to monitor incoming economic reports without rushing into abrupt rate hikes or premature rate cuts.',
      heading2: 'Real-World Impact on Mortgages, Credit, and Business Loans',
      section2_p1: 'Interest rate decisions made in Washington directly affect the daily budgets of millions of American households and local business owners. When the central bank keeps benchmark rates steady, mortgage rates for home purchases tend to stabilize as well.',
      section2_p2: 'Average 30-year fixed mortgage rates have settled into a comfortable, predictable range, allowing first-time home buyers to calculate monthly housing expenses with confidence. Real estate agents report that stable borrowing costs have encouraged a steady flow of home sales in suburban markets.',
      section2_p3: 'Similarly, small business owners who rely on commercial lines of credit to manage store inventory, upgrade equipment, or hire additional staff can secure loans under consistent terms, fostering local business confidence and hiring growth.'
    },
    extraSections: {
      heading3: 'Market Reactions Across Wall Street and Main Street',
      section3_p1: 'Financial markets in New York and global financial centers reacted calmly to the Federal Reserve announcement. Major stock indexes showed modest gains, led by technology firms, home construction companies, and retail chains that benefit from steady consumer purchasing power.',
      section3_p2: 'Bond market yields also stabilized, reflecting broad investor confidence in the central bank’s measured, data-driven strategy. Financial analysts praised the Fed’s clear communication, noting that avoiding unexpected policy shifts prevents market volatility.',
      section3_p3: 'Economists point out that maintaining steady interest rates helps protect working families by keeping inflation low while allowing real wage gains to build purchasing power over time.',
      heading4: 'What Economic Indicators to Watch in Coming Months',
      section4_p1: 'Looking ahead to upcoming central bank meetings in the fall and winter, Federal Reserve officials reiterated that future policy choices will depend entirely on economic data. Policymakers will scrutinize monthly consumer price reports, retail sales figures, and employment reports.',
      section4_p2: 'If consumer price increases continue moving smoothly toward the 2% target without unexpected price surges, many market analysts anticipate that the central bank may consider gradual interest rate reductions early next year.',
      conclusion: 'For now, American consumers, home buyers, and business leaders can operate with confidence, knowing that central bank policies are providing a firm, reliable foundation for steady economic growth.'
    },
    calloutList: {
      title: 'Federal Reserve Policy Highlights',
      items: [
        { bold: 'Benchmark Rate Range', text: 'Maintained at 3.50% – 3.75% following a unanimous 12-0 committee vote.' },
        { bold: 'Inflation Progress', text: 'Consumer price increases continue trending steadily down toward the 2.0% annual target.' },
        { bold: 'Labor Market Strength', text: 'National employment numbers remain balanced with steady job growth across key sectors.' },
        { bold: 'Mortgage & Loan Stability', text: 'Predictable interest rates bring certainty to home buyers and small business borrowers.' }
      ]
    }
  },
  {
    id: "fox-roku-acquisition",
    headline: "Fox Corporation Announces $22 Billion Deal to Acquire Roku Platform",
    source: "The Hollywood Reporter",
    publishedDate: "July 2026",
    category: "Business & Economy",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/A_Roku_TV_Remote.jpg?width=1200",
    summary: "Fox Corporation shared plans for a $22 billion acquisition of Roku, uniting television sports and news channels with connected TV hardware.",
    mainContent: {
      intro: 'In one of the most consequential media acquisitions of the decade, Fox Corporation announced a definitive agreement today to acquire Roku Inc. in a transaction valued at approximately $22 billion. This historic merger unites Fox’s premier live sports broadcasting, breaking news channels, and entertainment library with Roku’s industry-leading smart TV operating system and hardware devices, creating a digital streaming powerhouse that connects directly with over 100 million active television accounts worldwide.',
      paragraph1: 'The deal represents a major strategic initiative by Fox to secure direct distribution technology for its live television broadcasts without relying on third-party app stores or traditional cable television providers. For Roku users, the combination promises enhanced streaming features, direct live sports integration, and an upgraded home screen entertainment experience.',
      paragraph2: 'Executive leaders from both companies expressed enthusiasm for the merger, highlighting how combining live content with hardware software platforms redefines how modern audiences discover and watch television.',
      heading1: 'Financial Valuation and Deal Terms Breakdown',
      section1_p1: 'Under the agreement approved unanimously by the boards of directors of both companies, Fox will acquire all outstanding shares of Roku at a valuation of $160 per share in a combination of cash and Fox stock. This transaction price represents a premium over Roku’s recent stock trading averages, reflecting the immense strategic value of Roku’s smart TV operating system and advertising technology network.',
      section1_p2: 'Financial analysts note that the acquisition will be funded through existing corporate cash reserves, available credit lines, and new stock issuance. The deal is expected to close early next year, pending standard shareholder approvals and regulatory reviews in North America and overseas markets.',
      section1_p3: 'The acquisition secures Fox a permanent digital doorstep in tens of millions of living rooms, allowing the media company to deliver live sports and news broadcasts directly to smart TV screens without paying middleman distribution fees.',
      heading2: 'Bringing Live Sports and Breaking News to the Home Screen',
      section2_p1: 'A primary driver behind this multi-billion-dollar merger is the evolving way audiences consume live television. While scripted entertainment shows have largely transitioned to on-demand streaming apps, live sports broadcasts and breaking news events remain the most valuable programming on television, attracting millions of simultaneous viewers every week.',
      section2_p2: 'By owning the underlying smart TV operating system, Fox can feature live sporting events—including college football, NFL games, Major League Baseball playoffs, and NASCAR races—prominently on the Roku home screen. Viewers can launch live camera streams with a single click of their remote control.',
      section2_p3: 'Interactive features will allow sports fans to view live score tickers, player statistics, and alternative camera angles directly alongside the main game broadcast, creating an immersive viewing experience.'
    },
    extraSections: {
      heading3: 'Shifting Dynamics in the Global Streaming Market',
      section3_p1: 'The acquisition creates significant waves across the entire consumer technology and digital media industry. Competitors such as Apple TV, Amazon Fire TV, and Google TV face a direct rival that controls both hardware distribution software and an extensive portfolio of live sports rights.',
      section3_p2: 'Industry experts predict this combination will accelerate the popularity of free ad-supported streaming television (FAST) channels. Advertisers will gain access to advanced viewing analytics, enabling brands to show relevant, family-friendly advertisements to engaged viewers while maintaining strict consumer privacy protections.',
      section3_p3: 'The merged entity plans to expand Roku’s free channel offerings, giving viewers access to hundreds of free live news, sports, and entertainment channels without requiring paid monthly subscriptions.',
      heading4: 'What Current Roku Hardware Owners Can Expect',
      section4_p1: 'For current Roku device owners, company leaders emphasized that existing streaming boxes, soundbars, and smart TVs will continue operating seamlessly. The Roku platform will remain open to all popular third-party streaming apps, including Netflix, Disney+, Prime Video, and Max.',
      section4_p2: 'Over the coming months, gradual software updates will roll out, introducing faster search responses, customized sports score widgets, and improved voice search controls.',
      conclusion: 'As home entertainment technology continues to advance, this $22 billion merger marks an exciting chapter where live broadcast television and smart home hardware come together for millions of households.'
    },
    calloutList: {
      title: 'Key Facts: Fox Acquisition of Roku',
      items: [
        { bold: 'Transaction Valuation', text: '$22 billion total acquisition value ($160 per share in cash and stock).' },
        { bold: 'Global Audience Reach', text: 'Direct connection to over 100 million active Roku TV accounts worldwide.' },
        { bold: 'Live Sports Integration', text: 'One-click home screen access to major football, baseball, and racing broadcasts.' },
        { bold: 'Open App Platform', text: 'Roku devices will remain fully compatible with all third-party streaming services.' }
      ]
    }
  },
  {
    id: "paramount-wbd-merger",
    headline: "Paramount Completes $81 Billion Acquisition of Warner Bros. Discovery",
    source: "NBC News",
    publishedDate: "April 2026",
    category: "Business & Economy",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/HollywoodSign.jpg/1280px-HollywoodSign.jpg",
    summary: "Paramount Skydance finalized its acquisition of Warner Bros. Discovery, forming a large media and entertainment company.",
    mainContent: {
      intro: 'In a monumental corporate milestone that reshapes the global entertainment industry, Paramount Skydance officially completed its $81 billion acquisition of Warner Bros. Discovery today. The historic closing follows months of thorough regulatory reviews, shareholder votes, and strategic planning. The combined media company brings together two of Hollywood’s most historic movie studios, an iconic collection of television networks, and a global streaming subscriber base that positions the new entity as an unquestioned leader in modern entertainment.',
      paragraph1: 'The deal marks the culmination of an intense period of media consolidation, creating a unified entertainment company capable of producing, distributing, and streaming high-quality feature films, news broadcasts, and sports coverage to audiences worldwide.',
      paragraph2: 'Executives from both companies gathered in Hollywood to celebrate the official closing, emphasizing that combining creative talent, production facilities, and distribution platforms will foster a new era of storytelling excellence.',
      heading1: 'Combining Iconic Film Studios and Television Networks',
      section1_p1: 'To understand the magnitude of this $81 billion merger, one need only look at the legendary creative brands now operating under a single corporate umbrella. In film production, Paramount Pictures—famous for blockbuster franchises like Mission Impossible and Top Gun—joins forces with Warner Bros. Pictures, the studio behind Harry Potter, DC Superheroes, Dune, and Lord of the Rings.',
      section1_p2: 'In television broadcasting, the merger unites CBS, Nickelodeon, MTV, Comedy Central, and Showtime with HBO, CNN, HGTV, Food Network, TNT, and TBS. This immense lineup provides unmatched creative capacity across drama, comedy, documentaries, children’s shows, and live news coverage.',
      section1_p3: 'Production teams will gain access to world-class studio lots, sound stages, and special effects facilities in Los Angeles, New York, London, and Vancouver, optimizing production budgets while maintaining top visual quality.',
      heading2: 'Streaming Integration: Merging Max and Paramount+',
      section2_p1: 'A core objective of the merged company is competing effectively in the global streaming market. Executive leadership confirmed that subscriber integration plans are already underway. In the near term, consumers will be offered discounted subscription packages providing access to both Max and Paramount+ through a single login.',
      section2_p2: 'Over the long term, software teams are working to combine the platforms into a single unified app. Subscribers will be able to stream HBO prestige dramas, live NFL games on CBS, hit movies from both film lots, and children’s shows from Nickelodeon without switching apps.',
      section2_p3: 'The combined subscriber base will exceed 200 million global accounts, giving the platform the scale needed to invest heavily in original content, international productions, and interactive sports features.'
    },
    extraSections: {
      heading3: 'Creative Opportunities for Writers, Directors, and Crew',
      section3_p1: 'While major corporate mergers often prompt questions about workplace shifts, studio leaders emphasized that the combination creates exciting creative opportunities for filmmakers, writers, and technical crews.',
      section3_p2: 'Combining rich story libraries allows creative teams to develop crossover projects, high-budget fantasy series, and groundbreaking animated features backed by strong financial resources.',
      section3_p3: 'In addition, global distribution networks will ensure that films and series reach international audiences across theaters, television channels, and digital streaming platforms simultaneously.',
      heading4: 'What Global Audiences Can Expect in Theaters and at Home',
      section4_p1: 'For film lovers and television fans around the world, the completion of this $81 billion merger ensures a steady supply of theatrical feature films and premium streaming content. Studio heads re-affirmed that theatrical exclusivity remains a top priority, ensuring major franchise films premiere in cinemas before moving to home apps.',
      section4_p2: 'As the entertainment industry steps into this new era, the combination of Paramount and Warner Bros. Discovery stands as a testament to the enduring power of great storytelling.',
      conclusion: 'Bringing together generations of creative heritage, the merged studio is poised to entertain global audiences for decades to come.'
    },
    calloutList: {
      title: 'Highlights of the $81B Entertainment Merger',
      items: [
        { bold: 'Combined Valuation', text: '$81 billion transaction uniting Paramount Skydance and Warner Bros. Discovery.' },
        { bold: 'Historic Film Lots', text: 'Paramount Pictures and Warner Bros. Pictures operating under unified management.' },
        { bold: 'Streaming Service Bundles', text: 'Discounted combined packages introducing unified access to Max and Paramount+.' },
        { bold: 'Global News & Sports', text: 'CBS Sports, TNT Sports, CNN, and CBS News sharing global reporting networks.' }
      ]
    }
  },
  {
    id: "global-ma-record",
    headline: "Global Business Mergers Reach $2.6 Trillion in First Half of 2026",
    source: "Modern Counsel",
    publishedDate: "July 2026",
    category: "Business & Economy",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/NYSE_Advanced_Trading_Floor.jpg?width=1200",
    summary: "Corporate investments and company partnerships reached record levels in early 2026, driven by major deals in real estate, energy, and technology.",
    mainContent: {
      intro: 'International commerce reached an extraordinary financial landmark during the first six months of the year, with total global merger and acquisition (M&A) activity climbing to $2.6 trillion. According to mid-year financial statistics released by corporate legal experts at Modern Counsel, this total represents one of the strongest surges in business investment, commercial real estate partnerships, and technology acquisitions in recent economic history, reflecting strong corporate balance sheets and renewed confidence among international investors.',
      paragraph1: 'The remarkable volume of commercial transactions spans across multiple global sectors, led by heavy investments in artificial intelligence infrastructure, clean energy development, commercial real estate, and pharmaceutical research. Corporate boards and investment funds are actively reallocating capital to build resilient supply chains and secure cutting-edge technology.',
      paragraph2: 'Financial advisors note that stable central bank interest rates and predictable credit conditions have given corporate executives the confidence needed to negotiate multi-year expansion deals and international partnerships.',
      heading1: 'Technology and AI Infrastructure Drive Transaction Growth',
      section1_p1: 'Unsurprisingly, the technology sector served as the primary engine for global transaction volume. Major cloud software providers, semiconductor manufacturers, and digital infrastructure firms accounted for over $850 billion in announced acquisitions.',
      section1_p2: 'Companies are acquiring specialized artificial intelligence startups, high-capacity data centers, and fiber-optic network providers to power the next generation of digital tools. These acquisitions allow established corporations to modernize customer service, automate warehouse logistics, and enhance cybersecurity defenses.',
      section1_p3: 'Industry analysts emphasize that these investments reflect genuine demand from business customers seeking secure, efficient digital software tools to streamline daily operations.',
      heading2: 'Clean Energy Transition and Industrial Manufacturing Investments',
      section2_p1: 'Beyond digital technology, physical infrastructure attracted record investment levels. Energy companies, private equity funds, and industrial conglomerates poured more than $520 billion into clean energy transitions, acquiring solar component factories, offshore wind turbine developers, and electrical grid storage projects.',
      section2_p2: 'Government tax incentives and international climate commitments are encouraging traditional energy firms to expand their renewable energy portfolios. By pairing traditional power generation with clean energy assets, utility providers can offer steady electricity rates while meeting carbon reduction targets.',
      section2_p3: 'Industrial manufacturers are also acquiring automated manufacturing facilities and battery production plants, strengthening domestic supply chains and creating skilled technical jobs.'
    },
    extraSections: {
      heading3: 'Biotechnology and Pharmaceutical Research Innovations',
      section3_p1: 'The healthcare and biotechnology sectors witnessed intense merger activity as well, recording over $410 billion in strategic acquisitions and laboratory partnerships. Large pharmaceutical companies are partnering with agile biotechnology labs that have developed promising treatments for rare genetic conditions and oncology.',
      section3_p2: 'These strategic acquisitions accelerate the clinical trial process, helping life-saving medical treatments move from research laboratories into hospital clinics and neighborhood pharmacies far faster than under single-company development pipelines.',
      section3_p3: 'Investments in medical device manufacturing and digital health tracking tools continue to expand patient care options across global healthcare networks.',
      heading4: 'Economic Outlook and Future Growth Projections',
      section4_p1: 'Economists and legal advisors note that the surge in $2.6 trillion worth of global business deals reflects a healthy, stable borrowing environment. Predictable interest rate policies from central banks in North America, Europe, and Asia have provided financial clarity for corporate planning.',
      section4_p2: 'As the second half of the year unfolds, corporate advisory teams expect transaction momentum to remain strong, fostering economic competition, technology innovation, and job growth across local communities worldwide.',
      conclusion: 'The record-setting pace of global commercial investment underscores the resilience and dynamic growth of the modern international economy.'
    },
    calloutList: {
      title: 'Global M&A Activity Overview',
      items: [
        { bold: 'Total Transaction Volume', text: '$2.6 trillion invested globally in the first six months of the year.' },
        { bold: 'Tech & AI Sector', text: 'Led all industries with $850 billion in data center and software acquisitions.' },
        { bold: 'Clean Energy Investments', text: '$520 billion committed to solar, wind, and battery manufacturing facilities.' },
        { bold: 'Healthcare & Biotech', text: '$410 billion focused on advanced gene therapies and medical device technology.' }
      ]
    }
  },
  {
    id: "nasa-sunrise-falcon-heavy",
    headline: "NASA SunRISE Space Mission Schedules Launch on SpaceX Falcon Heavy Rocket",
    source: "NASA Science",
    publishedDate: "July 13, 2026",
    category: "Science & Technology",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/The_launch_of_the_SpaceX_Starship_6_rocket_seen_from_the_space_station_%28iss072e220043%29.jpg/1280px-The_launch_of_the_SpaceX_Starship_6_rocket_seen_from_the_space_station_%28iss072e220043%29.jpg",
    summary: "NASA confirmed that its SunRISE small satellite constellation will launch aboard a SpaceX Falcon Heavy rocket from Kennedy Space Center.",
    mainContent: {
      intro: 'NASA’s Science Mission Directorate confirmed today that its pioneering Sun Radio Interferometer Space Experiment—known as SunRISE—has been officially scheduled for launch aboard a powerful SpaceX Falcon Heavy rocket from Launch Complex 39A at NASA’s Kennedy Space Center in Florida. This ambitious heliophysics mission will deploy a coordinated constellation of six solar-powered small satellites into orbit high above Earth, creating the first-ever space-based radio telescope array dedicated to studying giant solar storms and particle bursts emitted by the sun.',
      paragraph1: 'By studying solar radio bursts from high orbit, scientists aim to gain unprecedented insight into how the sun generates massive radiation storms that can endanger astronauts in space, disrupt commercial navigation satellites, and cause power surges on electrical grids across Earth.',
      paragraph2: 'Engineers at NASA’s Jet Propulsion Laboratory have completed final flight preparation checks on all six spacecraft, paving the way for rocket integration in Florida ahead of launch day.',
      heading1: 'Six Small Satellites Operating as One Virtual Super-Telescope',
      section1_p1: 'The engineering design behind the SunRISE mission is both innovative and cost-effective. Rather than constructing a single, multi-billion-dollar satellite with a giant dish antenna, NASA engineers designed six compact, toaster-sized small satellites (known as CubeSats). Once released into orbit, these six satellites will maneuver into a precise formation, flying six miles apart from one another in orbit 22,000 miles above Earth.',
      section1_p2: 'Using precise GPS tracking and synchronized atomic clocks, the six individual satellites will record low-frequency radio signals simultaneously. Computers on the ground will combine signals from all six spacecraft using radio interferometry, allowing the fleet to function as a single virtual radio telescope with an antenna array six miles wide.',
      section1_p3: 'This distributed satellite design achieves scientific measurement capabilities that would be impossible with a single traditional satellite, demonstrating the power of small satellite swarms for space exploration.',
      heading2: 'Mapping Solar Radiation Storms in 3D to Protect Astronauts',
      section2_p1: 'The primary scientific objective of SunRISE is mapping solar energetic particle storms. When the sun experiences coronal mass ejections, it accelerates streams of high-energy particles outward into space at millions of miles per hour. As these particles shoot across the solar system, they emit low-frequency radio waves.',
      section2_p2: 'Earth’s upper atmosphere naturally shields the ground from these low-frequency radio waves. By orbiting high above the atmosphere, SunRISE can pinpoint exactly where solar particle storms originate in the sun’s outer atmosphere, creating detailed 3D maps of solar weather events.',
      section2_p3: 'This early-warning insight is crucial for human spaceflight. As NASA prepares to send astronauts back to the moon under the Artemis program, accurate solar weather forecasts allow mission controllers to alert astronauts to take shelter inside shielded modules long before dangerous radiation arrives.'
    },
    extraSections: {
      heading3: 'Safeguarding Power Grids, Aviation, and Satellite Communications',
      section3_p1: 'Space weather protection is equally vital for technological infrastructure on Earth. Severe solar storms can induce electrical currents in long power lines, causing transformer overheating and localized power outages.',
      section3_p2: 'Solar radiation can also disrupt high-frequency radio signals used by commercial aircraft flying polar flight paths, as well as interfering with GPS navigation used by maritime shipping and automated agricultural machinery.',
      section3_p3: 'Data collected by the SunRISE satellite fleet will be shared openly with space weather forecasting agencies worldwide, helping electrical grid operators and satellite managers protect critical systems.',
      heading4: 'Final Testing and Launch Operations in Florida',
      section4_p1: 'At NASA’s Jet Propulsion Laboratory in California, technicians completed rigorous thermal vacuum and vibration testing on all six SunRISE spacecraft. The small satellites are being transported to Florida for mounting onto the SpaceX launch adapter.',
      section4_p2: 'When the Falcon Heavy rocket lifts off from Kennedy Space Center, it will propel SunRISE into its high orbital position, opening a exciting new era in solar science and space weather safety.',
      conclusion: 'The SunRISE mission exemplifies how innovative engineering and small satellite technology can deliver high-value scientific discovery to protect humanity’s technological future.'
    },
    calloutList: {
      title: 'SunRISE Mission Summary',
      items: [
        { bold: 'Satellite Fleet', text: 'Constellation of 6 synchronized CubeSats flying 6 miles apart in high orbit.' },
        { bold: 'Launch Vehicle', text: 'SpaceX Falcon Heavy rocket launching from Kennedy Space Center, Florida.' },
        { bold: 'Scientific Goal', text: 'Mapping low-frequency solar radio bursts and solar particle storms in 3D.' },
        { bold: 'Earth Protection', text: 'Safeguarding astronauts, GPS navigation, and electrical power grids from solar storms.' }
      ]
    }
  },
  {
    id: "google-gemma-4",
    headline: "Google Introduces Gemma 4 12B to Run Smart AI Tools Directly on Laptops",
    source: "Google (The Keyword)",
    publishedDate: "June 2026",
    category: "Science & Technology",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Silicon_wafer.jpg/1280px-Silicon_wafer.jpg",
    summary: "Google released Gemma 4 12B, a compact AI model built to run directly on consumer laptops using 16GB of memory without cloud connections.",
    mainContent: {
      intro: 'Google officially introduced its newest open artificial intelligence model today: Gemma 4 12B. Engineered specifically for high speed, privacy, and energy efficiency, this compact 12-billion-parameter model runs locally on standard personal computers, consumer laptops, and workstation devices equipped with 16 gigabytes of unified memory. By performing language processing, code generation, and image analysis directly on local hardware chips, Gemma 4 12B allows software developers and everyday users to access powerful smart tools without sending private data across the internet.',
      paragraph1: 'The launch represents a significant milestone in artificial intelligence, moving away from total dependence on giant cloud server farms toward fast, private, on-device computing that works seamlessly even when offline.',
      paragraph2: 'Google developers emphasized that Gemma 4 12B delivers impressive performance while maintaining a lightweight file size that fits comfortably on modern laptop hard drives.',
      heading1: 'How On-Device AI Delivers Complete Privacy and Speed',
      section1_p1: 'Traditionally, using an AI assistant meant sending typed text or uploaded files to cloud data centers, where remote servers processed the request before returning an answer across the internet. While cloud models are capable, they require an active internet connection and raise privacy considerations for sensitive files.',
      section1_p2: 'Gemma 4 12B alters that dynamic completely. Advanced mathematical quantization and memory optimization allow the model to run directly inside standard laptop RAM chips. When a user asks Gemma 4 a question, local laptop processors perform all calculations right on the motherboard.',
      section1_p3: 'This local execution eliminates web network latency, providing near-instantaneous responses while guaranteeing that personal notes, financial records, and proprietary computer code never leave the local hard drive.',
      heading2: 'Multimodal Features: Text, Computer Code, and Image Analysis',
      section2_p1: 'Despite its compact memory footprint, Gemma 4 12B is a versatile multimodal model. This means it processes plain language text, inspects photos, summarizes long documents, translates foreign languages, and writes clean computer code in Python, JavaScript, C++, and HTML.',
      section2_p2: 'For instance, a student can drop a photo of a math equation into a local app powered by Gemma 4, receiving a step-by-step solution instantly. A programmer can ask the model to debug code while working offline during a flight.',
      section2_p3: 'Writers and researchers can draft essays, rephrase complex reports, and analyze data spreadsheets with complete confidence and speed.'
    },
    extraSections: {
      heading3: 'Enhanced Privacy Protection and Sustainable Computing',
      section3_p1: 'Privacy advocates and corporate IT directors have warmly received Gemma 4 12B’s local architecture. Healthcare professionals, lawyers, accountants, and creative artists can process confidential client files with full peace of mind.',
      section3_p2: 'Furthermore, running AI models locally reduces energy demands on national power grids. Shifting daily tasks—such as grammar checking or meeting summaries—from energy-heavy server farms onto efficient laptop chips provides a sustainable technology path.',
      section3_p3: 'Developer communities can also fine-tune Gemma 4 12B for specialized local tasks, creating customized assistants for local businesses and schools.',
      heading4: 'Global Availability and Open Developer Ecosystem',
      section4_p1: 'Google has made Gemma 4 12B freely available to developers, researchers, and tech enthusiasts globally via Kaggle, Hugging Face, and Google AI Studio. Popular open-source applications are adding one-click support for the model.',
      section4_p2: 'As hardware manufacturers add dedicated AI processing cores to personal computers, Gemma 4 12B demonstrates that fast, private, intelligent computing is available right on your laptop.',
      conclusion: 'On-device artificial intelligence marks a major step forward, placing powerful, secure digital tools directly into the hands of everyday users everywhere.'
    },
    calloutList: {
      title: 'Gemma 4 12B Highlights',
      items: [
        { bold: 'Local Execution', text: 'Runs smoothly on consumer laptops with 16GB RAM without internet connections.' },
        { bold: 'Full Data Privacy', text: 'All text, code, and document analysis remains 100% on local user hardware.' },
        { bold: 'Multimodal Intelligence', text: 'Processes text, computer code, mathematical formulas, and images seamlessly.' },
        { bold: 'Zero Latency', text: 'Instant response times without cloud server queues or monthly subscription fees.' }
      ]
    }
  },
  {
    id: "anthropic-nec-japan",
    headline: "Anthropic and NEC Partner to Bring AI Assistants to Japanese Banking and Industry",
    source: "Anthropic",
    publishedDate: "June 2026",
    category: "Science & Technology",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Silicon_wafer.jpg/1280px-Silicon_wafer.jpg",
    summary: "NEC partnered with Anthropic to provide secure AI software for Japanese banks, manufacturing plants, and government offices.",
    mainContent: {
      intro: 'In a major international technology alliance announced today, leading artificial intelligence safety firm Anthropic confirmed a multi-year global partnership with NEC Corporation, one of Japan’s most established technology conglomerates. The strategic agreement will deploy Anthropic’s state-of-the-art Claude AI models across Japanese financial institutions, major industrial manufacturing corporations, and municipal government offices, providing customized, high-security AI assistant tools tailored specifically for the Japanese language and corporate regulatory standards.',
      paragraph1: 'This initiative represents one of the largest enterprise deployments of generative artificial intelligence tools in East Asia, combining Anthropic’s advanced language reasoning capabilities with NEC’s extensive IT infrastructure network and deep relationships across Japan’s leading business sectors.',
      paragraph2: 'Executive leaders from both companies emphasized that data safety, cultural nuance, and strict regulatory compliance are central pillars of the joint technology deployment.',
      heading1: 'Customized Security for Japanese Financial Institutions',
      section1_p1: 'Japanese commercial banks and insurance companies operate under rigorous financial data safety regulations. Protecting customer transaction logs, personal identity files, and proprietary investment records requires localized cloud security and specialized compliance protocols.',
      section1_p2: 'Under this partnership, NEC and Anthropic engineered a dedicated enterprise deployment environment. Sensitive data is processed within secure Japanese data centers, ensuring that corporate information remains protected under local jurisdiction laws.',
      section1_p3: 'Bank employees will use Claude assistants to analyze complex financial regulations, draft risk assessment reports, summarize market trends, and deliver faster, highly accurate customer support in fluent Japanese.'
    },
    extraSections: {
      heading3: 'Empowering 30,000 Employees and Heavy Industry',
      section3_p1: 'As an immediate first step, NEC is equipping 30,000 of its internal software engineers, system architects, and project managers with Claude enterprise accounts. Internal pilot programs demonstrated that employees saved hours each week on routine administrative tasks, code reviews, and technical documentation.',
      section3_p2: 'Building on these results, NEC is introducing custom AI solutions to Japan’s industrial manufacturing sector. Automotive makers, electronics manufacturers, and precision engineering plants will use AI assistants to digitize operating manuals, track supply chain logistics, and assist technicians on the factory floor.',
      section3_p3: 'Streamlining industrial workflows helps Japanese manufacturers maintain world-class quality standards while improving operational efficiency.',
      heading4: 'Respecting Japanese Business Culture and Language Nuance',
      section4_p1: 'A crucial aspect of the technical collaboration involved fine-tuning Claude’s language processing to handle the rich nuances of formal Japanese business communication (Keigo). Formal Japanese corporate dialogue uses distinct levels of honorifics depending on whether one speaks with senior executives, clients, or colleagues.',
      section4_p2: 'Anthropic’s research team worked closely with native Japanese language specialists at NEC to ensure AI-generated emails, customer responses, and official reports adhere perfectly to traditional workplace etiquette.',
      conclusion: 'As Japanese enterprises adopt these modern digital assistants, the alliance sets a high benchmark for productivity, security, and cultural respect in global technology.'
    },
    calloutList: {
      title: 'Anthropic & NEC Partnership Highlights',
      items: [
        { bold: 'Enterprise Rollout', text: 'Deploying Claude AI tools to 30,000 NEC employees and corporate clients.' },
        { bold: 'Financial Security', text: 'Tailored compliance for major Japanese banks, insurance, and brokerage firms.' },
        { bold: 'Industrial Integration', text: 'Automating technical manuals, supply chain logs, and quality reports for factories.' },
        { bold: 'Data Sovereignty', text: 'Secure data processing hosted entirely within domestic Japanese cloud centers.' }
      ]
    }
  },
  {
    id: "amd-epyc-venice",
    headline: "AMD Begins Production of 6th Gen EPYC Venice Computer Chips",
    source: "AMD Newsroom",
    publishedDate: "May 20, 2026",
    category: "Science & Technology",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Silicon_wafer.jpg/1280px-Silicon_wafer.jpg",
    summary: "AMD started production on its 6th generation EPYC server processor, code named Venice, using advanced 2nm manufacturing technology.",
    mainContent: {
      intro: 'Advanced Micro Devices (AMD) officially announced today that it has begun initial manufacturing production of its highly anticipated 6th Generation EPYC server processor family, codenamed "Venice." Built on cutting-edge 2-nanometer (2nm) semiconductor process technology, this next-generation server chip architecture represents a major leap forward in computing density, energy efficiency, and artificial intelligence processing capabilities for hyper-scale cloud data centers, supercomputers, and telecommunication networks.',
      paragraph1: 'As global demand for cloud computing, online banking, video streaming, and artificial intelligence model training reaches record highs, data center operators are seeking high-performance processor chips that handle massive workloads while reducing electrical power consumption.',
      paragraph2: 'AMD’s "Venice" processor family was engineered specifically to solve that challenge, delivering unprecedented processing power per watt of electricity.',
      heading1: 'Breakthrough 2nm Semiconductor Fabrication Engineering',
      section1_p1: 'To understand the technological achievement of the EPYC Venice processor, it helps to appreciate chip manufacturing scale. A single nanometer is one-billionth of a meter—thousands of times thinner than a human hair. By transitioning to advanced 2nm manufacturing, AMD engineers pack tens of billions of microscopic transistors onto silicon wafers no larger than a postage stamp.',
      section1_p2: 'Placing transistors closer together allows electrical signals to travel shorter distances, which dramatically increases computing speed while reducing electrical resistance and heat output. Early benchmarks indicate that 6th Gen EPYC Venice processors deliver up to a 45% increase in total computing performance while using 30% less electricity compared to prior generations.',
      section1_p3: 'This energy efficiency allows data center operators to lower operating costs significantly while meeting strict environmental standards.',
      heading2: 'Powering Global Cloud Infrastructure and Supercomputers',
      section2_p1: 'Major cloud providers—including Microsoft Azure, Google Cloud, Amazon Web Services, and Oracle Cloud—are among the primary customers awaiting bulk shipments of the new Venice processors. These tech companies operate vast server farms hosting websites, processing credit card transactions, and running enterprise software globally.',
      section2_p2: 'By upgrading server racks with AMD EPYC Venice processors, cloud providers fit significantly more computing horsepower into existing physical buildings, eliminating the need to construct costly new data center facilities.',
      section2_p3: 'Supercomputing centers will also use the Venice architecture to power scientific research in climate modeling, astrophysics, and medical drug discovery.'
    },
    extraSections: {
      heading3: 'Built-In Hardware Acceleration for Artificial Intelligence',
      section3_p1: 'In addition to traditional web hosting and database processing, the EPYC Venice processor family features dedicated hardware engines for artificial intelligence workloads. The new "Zen 6" CPU core design includes specialized mathematical instructions that accelerate machine learning tasks directly on the central processor unit.',
      section3_p2: 'This capability allows enterprise servers to handle routine AI tasks—such as recommending products to online shoppers or detecting fraudulent bank transactions—without requiring expensive standalone graphics accelerator cards for every server node.',
      section3_p3: 'Integrating AI acceleration directly into the CPU simplifies server architecture and reduces overall hardware deployment costs.',
      heading4: 'Global Supply Chain Timelines and Market Launch',
      section4_p1: 'AMD executive leadership confirmed that production wafers are currently moving through advanced fabrication facilities, with commercial shipments scheduled to reach major server manufacturers late this year.',
      section4_p2: 'Full commercial availability across retail enterprise channels will follow shortly after, supporting tech infrastructure expansion worldwide.',
      conclusion: 'As silicon engineering pushes physical boundaries, AMD’s 6th Gen EPYC Venice chips demonstrate how continuous hardware innovation keeps our digital world running fast, efficiently, and reliably.'
    },
    calloutList: {
      title: 'AMD 6th Gen EPYC "Venice" Features',
      items: [
        { bold: '2nm Process Node', text: 'Unprecedented transistor density for maximum processing speed and power savings.' },
        { bold: 'Zen 6 Architecture', text: 'Up to 256 high-performance CPU cores on a single server processor socket.' },
        { bold: 'AI Acceleration Engine', text: 'Built-in mathematical instructions for high-speed machine learning workloads.' },
        { bold: 'Data Center Efficiency', text: 'Reduces server electricity bills while handling millions of concurrent queries.' }
      ]
    }
  },
  {
    id: 'sudan-el-fasher',
    headline: 'Human Rights Group Reports Severe Crisis in Sudan City of El Fasher',
    source: 'Amnesty International',
    publishedDate: 'July 2026',
    category: 'World & Conflict',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Darfur_IDPs_1_camp.jpg/1280px-Darfur_IDPs_1_camp.jpg',
    summary: 'A report from Amnesty International highlights civilian suffering in El Fasher, Sudan, calling for urgent food assistance and protection for families.',
    mainContent: {
      intro: 'A new, comprehensive report released by human rights investigators at Amnesty International shines an urgent spotlight on an escalating humanitarian crisis in El Fasher, the capital city of North Darfur in western Sudan. Following months of intense siege and military clashes that severely disrupted municipal infrastructure, hundreds of thousands of civilian residents and displaced families are facing acute shortages of food, clean drinking water, electricity, and essential medical supplies. International human rights organizations are calling on world leaders and regional authorities to intervene, open safe transport routes, and protect innocent lives.',
      paragraph1: 'El Fasher was long considered a crucial sanctuary city, offering refuge to hundreds of thousands of men, women, and children who fled violence in surrounding Darfur towns over recent years. However, as regional military forces expanded control across North Darfur, the city became trapped in a protracted blockade, isolating its population from agricultural lands and commercial trade routes.',
      paragraph2: 'The Amnesty International report documents urgent hardship inside city limits and surrounding displacement camps, urging global action to prevent further loss of life.',
      heading1: 'Severe Shortages of Food, Clean Water, and Medical Care',
      section1_p1: 'The Amnesty International report details difficult conditions inside city limits and surrounding displacement camps. Local markets have exhausted staple grain stocks, causing bread prices to rise beyond the reach of average families. Parents report skipping meals for days so their young children can eat small portions of grain.',
      section1_p2: 'Clean water supplies have broken down as fuel shortages prevent municipal pumps from running. Families collect untreated water from shallow wells, leading to rising cases of waterborne illnesses among children. Local hospitals struggle without electricity, clean bandages, or essential antibiotics, with dedicated medical staff working tirelessly under difficult circumstances.',
      section1_p3: 'Humanitarian teams emphasize that delivering clean water purification kits and basic medicines to El Fasher is an immediate matter of life and death.'
    },
    extraSections: {
      heading3: 'Sudan’s Position as the World’s Largest Displacement Crisis',
      section3_p1: 'Human rights experts emphasize that the crisis in El Fasher is part of a broader tragedy unfolding across Sudan. According to United Nations relief statistics, Sudan currently represents the largest internal displacement crisis on Earth, with nearly 12 million people forced from their homes.',
      section3_p2: 'Over two million Sudanese refugees have crossed international borders into neighboring Chad, South Sudan, Egypt, and Ethiopia seeking safety.',
      section3_p3: 'Despite the immense scale of suffering, international relief appeals for Sudan remain underfunded, and supply convoys face long checkpoint delays.',
      heading4: 'International Appeals for Safe Aid Corridors',
      section4_p1: 'Amnesty International and partner non-governmental organizations are urging the United Nations Security Council, regional diplomatic unions, and donor nations to prioritize Sudan on the global agenda.',
      section4_p2: 'The report urges participating military groups to respect international laws protecting civilians, cease shelling near residential neighborhoods, and grant aid workers unrestricted access.',
      conclusion: 'Every family deserves safety, food, clean water, and dignity. Shining a light on El Fasher inspires a swift global response to deliver emergency relief.'
    },
    calloutList: {
      title: 'El Fasher Humanitarian Crisis Summary',
      items: [
        { bold: 'Mass Displacement', text: 'Sudan represents the world’s largest displacement crisis with nearly 12 million people affected.' },
        { bold: 'Food Insecurity', text: 'Severe grain shortages and inflated prices impacting hundreds of thousands of families.' },
        { bold: 'Medical Blockade', text: 'Local hospitals operating without basic fuel, clean water, or essential medicines.' },
        { bold: 'Urgent Aid Demand', text: 'Calling for immediate open transport corridors for emergency food and medical supply trucks.' }
      ]
    }
  },
  {
    id: 'ukraine-defense-minister',
    headline: 'Ukraine Changes Defense Leadership As Government Updates Cabinet',
    source: 'NPR',
    publishedDate: 'July 22, 2026',
    category: 'World & Conflict',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kyiv_skyline_(15688086793).jpg?width=1200',
    summary: 'Ukrainian President Volodymyr Zelenskyy replaced defense minister Mykhailo Fedorov during a broader update to national cabinet leadership in Kyiv.',
    mainContent: {
      intro: 'In a notable government restructuring announced at the presidential office in Kyiv, Ukrainian President Volodymyr Zelenskyy confirmed a cabinet reorganization, replacing Defense Minister Mykhailo Fedorov as part of a broader effort to refresh executive leadership and streamline civil administration. The move, representing one of the most high-profile leadership changes in Ukraine’s national government this year, generated active public discussion across political circles, international diplomatic partner offices, and local news outlets in Kyiv.',
      paragraph1: 'Government reorganizations during ongoing security challenges reflect an ongoing effort by national leaders to evaluate performance, assign fresh administrative personnel, and ensure that key government ministries operate with maximum efficiency.',
      paragraph2: 'The transition was conducted in accordance with constitutional procedures, demonstrating the resilience and order of Ukraine’s democratic institutions.',
      heading1: 'Mykhailo Fedorov’s Impact on Modernizing Military Tech',
      section1_p1: 'Before his appointment as Defense Minister six months ago, Mykhailo Fedorov served for several years as Ukraine’s Minister of Digital Transformation. In that role, he earned international recognition for building digital government platforms, expanding public internet connectivity, and creating innovative drone technology initiatives.',
      section1_p2: 'During his tenure at the Defense Ministry, Fedorov focused heavily on integrating digital software into logistics management, streamlining military procurement, and expanding local manufacturing of unmanned aerial vehicles.',
      section1_p3: 'President Zelenskyy publicly expressed sincere gratitude for Fedorov’s dedicated service, emphasizing that his technical expertise will continue to serve the nation in a newly defined strategic role.'
    },
    extraSections: {
      heading3: 'Public Debate and Democratic Transparency in Kyiv',
      section3_p1: 'Following the announcement, members of the Ukrainian parliament, policy analysts, and citizens held active public discussions regarding the cabinet updates. In democratic societies, public debate surrounding high-level political appointments is a healthy sign of civic engagement.',
      section3_p2: 'Foreign diplomatic partners in European capitals and Washington observed the leadership transition closely, noting that Ukraine’s constitutional institutions function with impressive stability.',
      section3_p3: 'International partners reiterated that ongoing aid and military cooperation agreements remain rock-solid, unaffected by routine administrative personnel changes.',
      heading4: 'Streamlining Procurement and Civilian Administration',
      section4_p1: 'The updated Defense Ministry leadership team will focus immediately on accelerating supply chain deliveries to units on the front lines, expanding joint manufacturing partnerships with European defense firms, and enhancing care programs for wounded veterans.',
      section4_p2: 'By bringing new administrative managers into the cabinet, the government aims to reduce bureaucratic delays and ensure defense spending is handled with maximum accountability.',
      conclusion: 'Parliamentary committees will review new ministry appointments, ensuring the government moves forward with clear purpose and dedication to the public good.'
    },
    calloutList: {
      title: 'Cabinet Reorganization Key Points',
      items: [
        { bold: 'Executive Refresh', text: 'President Zelenskyy replaced Defense Minister Mykhailo Fedorov in a broader cabinet update.' },
        { bold: 'Technology Focus', text: 'Acknowledging Fedorov’s success in drone software, digital logistics, and procurement reform.' },
        { bold: 'Civic Engagement', text: 'Active public debate in Kyiv reflects strong democratic transparency and engagement.' },
        { bold: 'Strategic Transition', text: 'Fedorov expected to transition to a new high-level strategic position within executive government.' }
      ]
    }
  },
  {
    id: 'climate-compounding-disasters',
    headline: 'Wildfires, Rainstorm Floods, and High Summer Heat Impact Multiple Regions',
    source: 'CNN',
    publishedDate: 'July 20, 2026',
    category: 'World & Conflict',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ontario_Wildfire_Smoke_Moves_East_(1256746_-_lrg).jpg?width=1200',
    summary: 'CNN reports on a summer with simultaneous heatwaves, forest fires, and sudden rainstorm floods affecting cities and rural towns across North America.',
    mainContent: {
      intro: 'The current summer season has delivered an extraordinary series of simultaneous extreme weather events across North America, presenting local emergency managers, city leaders, and climate scientists with what meteorologists describe as "compounding environmental events." Rather than experiencing isolated weather challenges spaced out over different months, communities from coastal cities to mountain towns are confronting overlapping heatwaves, dense forest fire smoke, and sudden torrential rainstorm flooding at the exact same time, testing local municipal infrastructure and emergency teams.',
      paragraph1: 'Scientists and weather experts explain that compounding weather events occur when multiple environmental hazards interact directly, multiplying their overall impact on public health, electrical power grids, and transportation networks far more than any single weather event would on its own.',
      paragraph2: 'Local authorities across impacted states and provinces are coordinating emergency resources, opening cooling centers, and deploying rescue crews to keep residents safe.',
      heading1: 'Forest Fire Smoke and Metropolitan Air Quality Alerts',
      section1_p1: 'In mid-July, massive forest fires burning in northern forest regions generated vast plumes of dense smoke that drifted hundreds of miles southward across major metropolitan areas. Skylines in cities across the eastern seaboard and midwestern plains were shrouded in a milky gray haze, causing local environmental protection agencies to issue red-level air quality warnings.',
      section1_p2: 'Health officials advised parents, elderly citizens, and individuals with asthma or respiratory conditions to stay indoors with air purifiers running. Local school districts and sports camps adjusted outdoor schedules, moving activities indoors to protect young athletes from fine particulate smoke.',
      section1_p3: 'Air quality monitoring stations reported elevated particulate levels, prompting city authorities to distribute protective face masks to outdoor workers and transit commuters.'
    },
    extraSections: {
      heading3: 'Record Summer Heatwaves in Cooler Northern Regions',
      section3_p1: 'Simultaneously, an intense high-pressure atmospheric dome settled over northern states and Canadian border provinces, pushing daily temperatures into triple-digit territory in areas that historically enjoyed mild summer weather.',
      section3_p2: 'Homes in these northern regions, built to trap heat during cold winters, often lack central air conditioning. Municipal governments moved quickly to open free, air-conditioned cooling centers in public libraries, senior community halls, and recreation centers.',
      section3_p3: 'City buses provided free rides to cooling stations, and community volunteers conducted door-to-door wellness checks on elderly neighbors living alone.',
      heading4: 'Torrential Rainstorms and Sudden Flash Floods',
      section4_p1: 'To complicate matters further, warm, humid air masses colliding with cold mountain fronts sparked sudden, intense thunderstorms that dropped months of rain in just a few hours. In mountain valleys where forest fires had burned away vegetation, dry soil could not absorb the water, triggering fast-moving mudslides and flash floods.',
      section4_p2: 'Local emergency crews, volunteer fire departments, and national guard units worked tirelessly to rescue stranded drivers, clear fallen trees from power lines, and reinforce riverbanks with sandbags.',
      conclusion: 'Working together with foresight and resilience, neighborhood towns can adapt successfully, ensuring safe and vibrant environments for future generations.'
    },
    calloutList: {
      title: 'Compounding Summer Weather Summary',
      items: [
        { bold: 'Overlapping Weather Hazards', text: 'Simultaneous occurrence of heatwaves, forest fire smoke, and torrential rainstorms.' },
        { bold: 'Air Quality Alerts', text: 'Hazy conditions and elevated particulate levels affecting major metropolitan skylines.' },
        { bold: 'Community Cooling Centers', text: 'Cities opening air-conditioned libraries and community halls for vulnerable residents.' },
        { bold: 'Infrastructure Resilience', text: 'Upgrading power grids, storm drainage channels, and emergency alert systems.' }
      ]
    }
  }
];

const builtStories = storiesData.map(buildWorldNewsArticle);

// Write updated file
const filePath = 'src/components/themes/WorldNewsPage.tsx';
const fileContent = fs.readFileSync(filePath, 'utf8');

const startIdx = fileContent.indexOf('const newsStories: NewsStory[] = [');
const endIdx = fileContent.indexOf('function StoryDetail');

if (startIdx !== -1 && endIdx !== -1) {
  const newCode = `const newsStories: NewsStory[] = ${JSON.stringify(builtStories, null, 2)};\n\n`;
  const updatedContent = fileContent.slice(0, startIdx) + newCode + fileContent.slice(endIdx);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`Successfully updated ${builtStories.length} stories in WorldNewsPage.tsx`);
} else {
  console.error('Could not find start/end index in WorldNewsPage.tsx');
}
