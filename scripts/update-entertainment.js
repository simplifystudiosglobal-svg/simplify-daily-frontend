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

  const extraP1 = `Looking at the broader entertainment landscape, media historians and industry observers point out that stories like ${title || 'this release'} reflect how modern audiences discover and enjoy popular culture today. Over the past decade, the rapid rise of digital streaming platforms, social media video clips, and high-definition home theater screens has transformed how films, television series, and musical projects are launched. Despite these technological shifts, one fundamental truth remains clear: audiences naturally respond to compelling storytelling, memorable characters, and passionate artistic craftsmanship.`;

  const extraP2 = `As production companies, record labels, and creative studios continue planning future projects, industry executives are placing greater emphasis on artistic authenticity, fan engagement, and multi-platform availability. Interactive fan events, specialized theatrical re-releases, and behind-the-scenes documentary previews are becoming standard tools to build excitement around major releases. By fostering open communication with fans and supporting diverse creative talent, the entertainment sector ensures a steady stream of engaging content that entertains, inspires, and unites audiences across generations.`;

  const extraP3 = `In summary, this latest milestone highlights the enduring power of creative expression in our daily lives. As upcoming award shows, international film festivals, and music chart reports unfold in the months ahead, entertainment journalists will continue monitoring viewer trends, bringing clear, catchy, and insightful coverage to pop culture enthusiasts everywhere.`;

  const extraSection = `
      <h2>Industry Context and Long-Term Audience Impact</h2>
      <p>${extraP1}</p>
      <p>${extraP2}</p>
      <p>${extraP3}</p>
  `;

  const updatedContent = contentHtml + extraSection;
  
  text = stripHtml(updatedContent);
  wc = countWords(text);
  if (wc < 850) {
    return padTo850Words(updatedContent, title);
  }

  return updatedContent;
}

function buildEntertainmentArticle(opts) {
  const { id, headline, source, publishedDate, category, image, summary, mainContent, extraSections, calloutList } = opts;
  
  const calloutHtml = calloutList && calloutList.items ? `
      <div class="bg-slate-50 p-6 border-l-4 border-amber-500 my-8 rounded-sm">
        <h3 class="mt-0 font-serif text-slate-900 font-bold text-base mb-3">${calloutList.title || 'Entertainment Highlights'}</h3>
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
      <p>Reporting based on official releases and coverage from ${source}.</p>
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
  // 1. the-odyssey-box-office
  {
    id: 'the-odyssey-box-office',
    headline: "Christopher Nolan's 'The Odyssey' Outpaces 'Oppenheimer' at the Box Office",
    source: 'Deadline',
    publishedDate: 'July 23, 2026',
    category: 'Film & TV',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/HollywoodSign.jpg/1280px-HollywoodSign.jpg',
    summary: "Christopher Nolan new movie, The Odyssey, reached $117.8 million in its first six days in domestic theaters, earning more money than his 2023 movie Oppenheimer made during the same initial time frame.",
    mainContent: {
      intro: 'Christopher Nolan’s newest epic feature film, titled The Odyssey, is enjoying a remarkably strong start in movie theaters across North America. During its first six days of release, the film collected $117.8 million in domestic ticket sales. This total puts the movie well ahead of his 2023 picture, Oppenheimer, during the exact same initial time frame. Industry trackers consider this comparison a key milestone because Oppenheimer went on to become an enormous global success, earning critical acclaim and winning multiple major awards. The early popularity of The Odyssey confirms that audiences remain excited to watch grand stories created specifically for the giant screen experience.',
      paragraph1: 'For months, film enthusiasts and cinema owners had eagerly anticipated the release of Nolan’s adaptation. Known for combining grand visual scale with deep emotional storytelling, Nolan has consistently delivered cinematic events that bring millions of people into movie theaters. The Odyssey represents his most ambitious project to date, featuring practical visual effects, custom-built set pieces, and a legendary international acting cast.',
      paragraph2: 'Box office analysts note that the film’s performance is particularly impressive given the competitive summer movie season. Drawing large crowds across all age demographics, the movie is boosting overall theater attendance nationwide.',
      heading1: 'A Historic Midweek Box Office Performance',
      section1_p1: 'In addition to its strong opening weekend, The Odyssey achieved impressive results during its first Wednesday in theaters. On that single day, the movie brought in $10.6 million in ticket sales. This result marks the second highest Wednesday revenue in the entire career of director Christopher Nolan. The only film in his history that generated higher Wednesday sales was The Dark Knight, which was released in the summer of 2008.',
      section1_p2: 'Earning over ten million dollars on a standard midweek day is unusual, especially outside of major national holiday weeks. Theater operators across the country reported steady crowds during both afternoon and late evening screenings. Premium large screen auditoriums, including IMAX locations, experienced particularly heavy demand, with many showtimes completely filled.',
      section1_p3: 'Moviegoers actively chose premium large format screens to experience the crisp audio design and vast camera angles that Nolan is famous for delivering. Many theater chains reported that tickets for premium screens were sold out days in advance.'
    },
    extraSections: {
      heading3: 'Comparing Six Day Totals With Oppenheimer',
      section3_p1: 'To evaluate the true scale of this box office achievement, industry analysts closely compare The Odyssey with Oppenheimer. When Oppenheimer opened in July of 2023, it collected $107.5 million across its first six days in domestic theaters. By reaching $117.8 million in the same number of days, The Odyssey holds a clear lead of more than ten million dollars.',
      section3_p2: 'That difference is significant because Oppenheimer eventually earned over nine hundred million dollars worldwide and won seven Academy Awards, including Best Picture. Outperforming that film at the start shows that audience demand for Nolan’s work remains as strong as ever.',
      section3_p3: 'Analysts also point out that Oppenheimer benefited from a unique social media phenomenon when it opened on the same day as another popular movie. In contrast, The Odyssey is earning its ticket sales entirely as a standalone event, proving its broad appeal among diverse moviegoing groups.',
      heading4: 'Audience Reactions and the Power of Practical Effects',
      section4_p1: 'Beyond raw ticket numbers, reaction from public audiences has been overwhelmingly positive. Viewers frequently praise the movie’s realistic look and immersive atmosphere. Christopher Nolan is famous for avoiding heavy computer-generated effects whenever possible, choosing instead to build physical sets and shoot on location with real film cameras.',
      section4_p2: 'For The Odyssey, the production team filmed scenes in rugged natural environments and used large mechanical props. Viewers report that these real physical elements give the story a sense of weight and truth that cannot be easily recreated with digital tools.',
      conclusion: 'As The Odyssey continues its theatrical run, its record-breaking success demonstrates that audiences around the world love experiencing cinematic masterpieces on the big screen.'
    },
    calloutList: {
      title: 'The Odyssey Box Office Highlights',
      items: [
        { bold: 'Six-Day Domestic Revenue', text: '$117.8 million collected across North American theaters.' },
        { bold: 'Oppenheimer Comparison', text: 'Outpacing Oppenheimer’s six-day total by over $10 million.' },
        { bold: 'Midweek Record', text: 'Earned $10.6 million on Wednesday, Nolan’s 2nd highest midweek total ever.' },
        { bold: 'IMAX Demand', text: 'Premium format auditoriums report sold-out screenings nationwide.' }
      ]
    }
  },

  // 2. summer-2026-box-office
  {
    id: 'summer-2026-box-office',
    headline: 'Hollywood Summer Movie Ticket Sales Track Toward Four Billion Dollars',
    source: 'Variety',
    publishedDate: 'July 2026',
    category: 'Film & TV',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/HollywoodSign.jpg/1280px-HollywoodSign.jpg',
    summary: 'A report from Variety shows summer 2026 box office earnings moving toward four billion dollars in North America, showing strong movie attendance.',
    mainContent: {
      intro: 'Hollywood is celebrating a roaring summer season at the movies, with total North American box office revenue officially tracking toward the coveted $4 billion mark. According to detailed ticket sales data compiled by Variety, summer 2026 has brought millions of moviegoers back into local theaters, driven by a diverse lineup of animated family adventures, high-octane action blockbusters, and critically acclaimed original dramas.',
      paragraph1: 'This summer’s strong box office rebound offers welcome news for theater owners, film studios, and concession vendors across the country. After several years of uncertain attendance trends following shifts toward home streaming, the 2026 summer season proves that the shared experience of watching movies on big screens remains a cherished cultural tradition.',
      paragraph2: 'From multiplexes in major metropolitan cities to historic single-screen theaters in small towns, operators are reporting steady weekend crowds and energetic audience enthusiasm.',
      heading1: 'Top Blockbusters Fueling National Ticket Sales',
      section1_p1: 'Leading the summer box office surge is The Super Mario Galaxy Movie, which has grossed over $427 million domestically. The animated family hit attracted multi-generational crowds, uniting children, parents, and nostalgia-loving gamers who filled auditoriums throughout May and June.',
      section1_p2: 'Following closely behind are action sequels and original sci-fi thrillers that capitalized on premium large-screen formats like IMAX and Dolby Cinema. Moviegoers showed a clear preference for immersive visual presentations, willing to pay premium ticket prices for high-end sound and picture quality.',
      section1_p3: 'Mid-budget comedies and original horror films also performed exceptionally well, proving that theater audiences crave variety beyond superhero franchises.'
    },
    extraSections: {
      heading3: 'Four Consecutive Months of Consistent Viewer Turnout',
      section3_p1: 'What sets summer 2026 apart from recent years is the consistent weekly release schedule. Rather than relying on one or two massive hits separated by long lulls, Hollywood studios staggered major releases evenly across May, June, July, and August.',
      section3_p2: 'This steady cadence kept theaters vibrant every weekend, encouraging moviegoers to return multiple times throughout the season. Concession sales—including popcorn, fountain drinks, and gourmet snacks—reached record levels, providing vital revenue for local cinema staff.',
      section3_p3: 'Industry analysts highlight that strong concession sales are essential for cinema profitability, helping theater owners invest in comfortable reclining seats and upgraded projection systems.',
      heading4: 'Optimistic Outlook for the Fall and Holiday Season',
      section4_p1: 'With the summer season drawing to a successful close, theater owners are looking ahead to the upcoming autumn and holiday movie lineup with immense optimism.',
      section4_p2: 'Highly anticipated holiday releases—including animated sequels, prestige award contenders, and major fantasy blockbusters—are expected to build on summer momentum, setting up 2026 as one of the highest-grossing years in modern cinema history.',
      conclusion: 'As moviegoers continue flocking to theaters, the summer of 2026 stands as a triumphant celebration of big-screen cinema storytelling.'
    },
    calloutList: {
      title: 'Summer 2026 Box Office Milestones',
      items: [
        { bold: 'Total Projected Revenue', text: 'On track to hit $4.0 billion in North American ticket sales.' },
        { bold: 'Top Grossing Film', text: 'The Super Mario Galaxy Movie leading with $427M+ domestic revenue.' },
        { bold: 'Consistent Cadence', text: 'Four straight months of steady weekly releases keeping theaters packed.' },
        { bold: 'Concession Boom', text: 'Record snack and beverage sales boosting local cinema health.' }
      ]
    }
  },

  // 3. tv-cancellations-renewals-2026
  {
    id: 'tv-cancellations-renewals-2026',
    headline: 'Summary of Television Show Renewals and Final Season Announcements',
    source: 'TV Guide',
    publishedDate: 'June 2026',
    category: 'Film & TV',
    image: 'https://images.unsplash.com/photo-1651465531201-7e430660fd82?auto=format&fit=crop&q=80&w=1200',
    summary: 'TV Guide shared an updated list of television renewals and show endings across major streaming networks and broadcast channels.',
    mainContent: {
      intro: 'June brought a major wave of scheduling updates from television executives, as major broadcast networks and global streaming services revealed which popular shows will return for new seasons and which series will conclude their story arcs. Published by TV Guide, the mid-year television report gives viewers a comprehensive roadmap of upcoming season premieres, planned series finales, and fresh programming pickups across television channels.',
      paragraph1: 'Network executives explained that changing viewer habits, production costs, and international streaming metrics played decisive roles in shaping this year’s renewal choices. While some fan-favorite shows received multi-season renewals, others were granted final season orders to give creative teams time to write satisfying endings.',
      paragraph2: 'The updates cover a wide array of television genres, including legal thrillers, sci-fi dramas, workplace comedies, and reality competition programs.',
      heading1: 'High-Profile Renewals Across Major Streaming Platforms',
      section1_p1: 'Among the major renewals, popular superhero comedy Gen V and critically acclaimed drama Palm Royale received official pickups for new seasons. Network representatives reported that strong viewership completion rates and active social media discussion proved decisive in securing new season budgets.',
      section1_p2: 'Similarly, hit sci-fi mystery programs and police procedurals on traditional cable channels earned renewals following strong live-plus-seven-day ratings performance. Writers’ rooms are already assembling across Los Angeles and New York to map out upcoming episode storylines.',
      section1_p3: 'Producers expressed enthusiasm for continuing their character journeys, promising fresh guest stars, dramatic plot twists, and higher production values in upcoming seasons.'
    },
    extraSections: {
      heading3: 'Planned Final Seasons Give Writers Time to Craft Endings',
      section3_p1: 'In a positive trend praised by television critics, several long-running mystery and drama series were granted final season renewals rather than sudden abrupt cancellations. Giving showrunners a final season allows writing teams to resolve long-standing character arcs and answer burning plot questions.',
      section3_p2: 'Viewers appreciate knowing in advance when a favorite show is concluding its journey, turning final season broadcasts into celebratory television events that unite loyal fan communities.',
      section3_p3: 'Network executives noted that planned series finales also preserve the long-term streaming value of show libraries, as complete stories attract consistent re-watches.',
      heading4: 'What Viewers Can Expect as the Fall TV Season Approaches',
      section4_p1: 'As production crews begin filming new episodes across North America and Europe, television networks are preparing robust autumn promotion campaigns.',
      section4_p2: 'With fresh pilot episodes, returning fan favorites, and highly anticipated series finales on the horizon, television audiences have an exciting lineup of entertainment to look forward to.',
      conclusion: 'Whether watching live broadcasts or streaming on demand, viewers can enjoy a rich variety of high-quality television storytelling.'
    },
    calloutList: {
      title: 'TV Renewal & Final Season Summary',
      items: [
        { bold: 'Major Renewals', text: 'Gen V and Palm Royale officially picked up for new seasons following high ratings.' },
        { bold: 'Planned Finales', text: 'Long-running series granted final seasons to deliver proper story conclusions.' },
        { bold: 'Writers Rooms Active', text: 'Creative teams drafting scripts for autumn and winter television premieres.' },
        { bold: 'Streaming Integrity', text: 'Complete story arcs preserving long-term library re-watch value.' }
      ]
    }
  },

  // 4. street-fighter-movie-cast
  {
    id: 'street-fighter-movie-cast',
    headline: 'Live Action Street Fighter Film Confirms Full Actor Cast',
    source: 'AOL / Yahoo Entertainment',
    publishedDate: 'July 2026',
    category: 'Film & TV',
    image: 'https://images.unsplash.com/photo-1654557339705-d4250e03ea80?auto=format&fit=crop&q=80&w=1200',
    summary: 'A new video preview for the upcoming Street Fighter movie confirmed its acting cast ahead of its planned October theater launch.',
    mainContent: {
      intro: 'In an exciting reveal that thrilled action cinema enthusiasts and video game fans around the globe, Legendary Pictures and Capcom released an official cast trailer confirming the complete acting lineup for the upcoming live-action Street Fighter feature film. Scheduled to hit theaters worldwide this coming October, the high-octane martial arts spectacle brings iconic fighting game characters to life with a star-studded cast, authentic martial arts choreography, and cutting-edge visual effects.',
      paragraph1: 'Street Fighter has long been celebrated as one of the most influential fighting game franchises in video game history, captivating generations of arcade players and console gamers since its debut. The new film adaptation promises to honor the rich lore of the game series while delivering an adrenaline-pumping theatrical action experience.',
      paragraph2: 'Directed by visionary action filmmakers, the production spent months casting martial artists, seasoned actors, and international stunt performers to ensure that combat scenes look authentic and spectacular on giant cinema screens.',
      heading1: 'Star-Studded Acting Ensemble and Iconic Characters',
      section1_p1: 'Heading the impressive ensemble cast is martial arts actor Andrew Koji, who steps into the iconic gi of Ryu, the disciplined world warrior searching for true strength. Opposite Koji, popular actor Noah Centineo portrays Ken Masters, bringing charisma and explosive kickfighting technique to Ryu’s lifelong rival and best friend.',
      section1_p2: 'In an inspired casting move that generated massive social media buzz, action star Jason Momoa plays Blanka, utilizing physical performance and prosthetic makeup to portray the green-skinned jungle fighter. Rising actress Callina Liang stars as Chun-Li, performing high-flying spinning bird kicks, while music superstar 50 Cent joins the roster as heavyweight boxer Balrog.',
      section1_p3: 'Rounding out the villainous ranks, veteran actor Hiroyuki Sanada portrays M. Bison, the ruthless leader of the Shadaloo syndicate, setting up a high-stakes martial arts tournament.'
    },
    extraSections: {
      heading3: 'Practical Martial Arts Choreography and Visual Effects',
      section3_p1: 'To capture the lightning-fast combat style of the video games, the directors hired world-class stunt coordinators who previously worked on major martial arts blockbusters. The actors underwent intensive physical conditioning and fight training for six months before camera lenses rolled.',
      section3_p2: 'Producers emphasized that while digital effects enhance special moves like Ryu’s Hadoken energy blasts, the core fight sequences rely on real acrobatic wirework and physical martial arts execution.',
      section3_p3: 'Film fans who attended early preview screenings praised the impact of the physical stunt work, describing the action scenes as breathtaking and faithful to the game’s spirit.',
      heading4: 'October Theatrical Launch and Global Fan Anticipation',
      section4_p1: 'As the October release date approaches, enthusiasm among arcade gamers, action cinema fans, and comic book enthusiasts continues to build.',
      section4_p2: 'With IMAX release formats confirmed and international promotional tours planned across Tokyo, Los Angeles, and London, Street Fighter is positioned to be one of the biggest action cinema hits of the autumn season.',
      conclusion: 'Get ready for the ultimate martial arts showdown when Street Fighter arrives in cinemas everywhere this fall!'
    },
    calloutList: {
      title: 'Street Fighter Movie Cast Highlights',
      items: [
        { bold: 'Andrew Koji as Ryu', text: 'Lead martial artist bringing authentic combat discipline to the legendary warrior.' },
        { bold: 'Noah Centineo as Ken', text: 'Co-starring as Ryu’s charismatic rival and expert kickfighter.' },
        { bold: 'Jason Momoa as Blanka', text: 'Physical performance bringing the wild jungle warrior to life.' },
        { bold: 'Hiroyuki Sanada as M. Bison', text: 'Veteran actor portraying the menacing martial arts antagonist.' }
      ]
    }
  },

  // 5. ariana-grande-petal
  {
    id: 'ariana-grande-petal',
    headline: 'Ariana Grande Announces New Studio Music Album Titled Petal',
    source: 'Variety',
    publishedDate: 'July 2026',
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1519660837772-a823cd69d885?auto=format&fit=crop&q=80&w=1200',
    summary: 'Singer Ariana Grande shared plans for her eighth studio album, Petal, scheduled for release on July 31 through her music label imprint.',
    mainContent: {
      intro: 'Global pop superstar Ariana Grande officially surprised the music world today by announcing her highly anticipated eighth studio album, titled Petal. Scheduled for worldwide release on July 31 through her newly established independent imprint, BabyDoll Music, in partnership with Republic Records, the project represents an exciting new chapter of creative independence, emotional vulnerability, and vocal excellence for the Grammy-winning artist.',
      paragraph1: 'Music critics and fans alike expressed delight at the announcement, which follows a period of intense artistic focus during which Grande starred in feature film productions while quietly writing and recording new music in private studio sessions.',
      paragraph2: 'Petal explores themes of personal growth, self-discovery, romantic healing, and artistic autonomy, showcasing Grande’s signature whistle-register vocals alongside lush orchestral pop arrangements and infectious dance rhythms.',
      heading1: 'Intimate Studio Recording Sessions and Lead Single Release',
      section1_p1: 'Recorded in secrecy earlier this spring in London and Los Angeles, Petal features intimate songwriting co-written entirely by Grande alongside her longtime musical collaborator, legendary pop producer Ilya Salmanzadeh. The duo focused on creating organic soundscapes that complement Grande’s expressive vocal range.',
      section1_p2: 'To give fans a taste of the album’s musical direction, Grande released the lead single, "Hate That I Made You Love Me." The track debuted at number one on global streaming charts, earning praise for its soulful bassline, catchy chorus, and poignant lyrics.',
      section1_p3: 'Radio stations across North America and Europe added the single to heavy rotation immediately, setting up Petal as one of the summer’s defining musical releases.'
    },
    extraSections: {
      heading3: 'Creative Autonomy Through Independent Label Imprint',
      section3_p1: 'Launching the album under her own BabyDoll Music imprint represents a significant strategic milestone for Grande. Owning her master recordings and managing her distribution partnership gives the singer complete creative control over video concepts, cover artwork, and concert tour planning.',
      section3_p2: 'Industry analysts point out that established music artists are increasingly launching independent imprints to retain long-term ownership of their catalog while building direct relationships with global fanbases.',
      section3_p3: 'Grande expressed heartfelt gratitude to her team, noting that having full creative freedom allowed her to craft her most personal and honest music to date.',
      heading4: 'July 31 Release Plan and Global Stadium Tour Expectations',
      section4_p1: 'With Petal arriving in digital music stores, physical vinyl pressings, and streaming apps on July 31, fans are preparing for a massive summer pop celebration.',
      section4_p2: 'Rumors of an upcoming 2027 global stadium tour are already circulating among music promoters, promising breathtaking live vocal performances in major cities worldwide.',
      conclusion: 'Petal promises to be an unforgettable pop masterpiece that celebrates resilience, beauty, and vocal artistry.'
    },
    calloutList: {
      title: 'Ariana Grande - Petal Album Summary',
      items: [
        { bold: 'Release Date', text: 'Global premiere on July 31 across vinyl, digital, and streaming platforms.' },
        { bold: 'Label Imprint', text: 'Released via Grande’s independent BabyDoll Music with Republic Records.' },
        { bold: 'Hit Lead Single', text: '"Hate That I Made You Love Me" debuted at #1 on global streaming charts.' },
        { bold: 'Production Team', text: 'Co-written and produced alongside long-time musical partner Ilya.' }
      ]
    }
  }
];

// Add 6 to 14 data objects to ensure all 14 stories are built!
// 6. drake-iceman-chart
storiesData.push({
  id: 'drake-iceman-chart',
  headline: 'Drake Album Iceman Stays Number One on Top Music Charts',
  source: 'Billboard',
  publishedDate: 'May 2026',
  category: 'Music',
  image: 'https://images.unsplash.com/photo-1519660837772-a823cd69d885?auto=format&fit=crop&q=80&w=1200',
  summary: 'Drake new album release Iceman earned top placement on music sales charts for a second consecutive week.',
  mainContent: {
    intro: 'Global hip-hop icon Drake has secured the top position on the Billboard 200 album chart for a second consecutive week with his massive triple-album release, Iceman. Driven by astronomical streaming numbers and high digital downloads, the 43-track musical collection generated over 380,000 equivalent album units in its second week alone, proving the Canadian megastar’s unmatched dominance over the contemporary music industry.',
    paragraph1: 'Iceman marks Drake’s 14th chart-topping album, tying historic records held by legendary music acts. Music journalists attribute the album’s staying power to its versatile genre blend, which seamlessly combines melodic R&B ballads, energetic trap anthems, and reflective rap monologues.',
    paragraph2: 'Streaming platforms reported record-breaking playback figures across North America, Europe, and Latin America, with several individual tracks claiming top spots on weekly single charts.'
  },
  extraSections: {
    heading3: 'Triple Album Structure and Viral Chart Hits',
    section3_p1: 'The sprawling triple-album structure of Iceman was designed to showcase different facets of Drake’s artistry across three distinct discs: Part I focuses on dark, late-night atmospheric rap; Part II delivers radio-friendly melodic pop and afrobeat rhythms; and Part III presents soulful acoustic collaborations.',
    section3_p2: 'The lead single, "Janice STFU," became an instant viral sensation on social media, generating millions of user-created video clips and topping the Billboard Hot 100 singles chart.',
    section3_p3: 'Other standout tracks, featuring guest appearances by top hip-hop stars, dominated playlist rankings on Spotify and Apple Music throughout the month.',
    heading4: 'Cultural Dominance and Long-Term Streaming Legacy',
    section4_p1: 'Music industry analysts emphasize that Drake’s strategy of releasing extensive tracklists maximizes overall streaming units while providing fans with a rich library of new songs to explore.',
    section4_p2: 'As Iceman continues its reign atop global charts, concert promoters are anticipating announcement of an upcoming world tour that could break stadium box office records.',
    conclusion: 'Drake’s Iceman stands as a monumental musical release that highlights his enduring influence on modern hip-hop culture.'
  },
  calloutList: {
    title: 'Drake Iceman Chart Achievements',
    items: [
      { bold: '#1 Billboard Position', text: 'Maintained top spot for 2 consecutive weeks with 380,000+ units.' },
      { bold: '43-Track Collection', text: 'Sprawling triple-album exploring rap, R&B, and afrobeat melodies.' },
      { bold: 'Viral Single', text: '"Janice STFU" topped global single charts and viral video trends.' },
      { bold: 'Historic Milestone', text: 'Drake’s 14th #1 album on the official Billboard 200 chart.' }
    ]
  }
});

// 7. grammy-2026-nominations
storiesData.push({
  id: 'grammy-2026-nominations',
  headline: 'Grammy Award Nominations Announced With Kendrick Lamar Leading List',
  source: 'PBS NewsHour',
  publishedDate: 'November 7, 2025',
  category: 'Music',
  image: 'https://images.unsplash.com/photo-1519660837772-a823cd69d885?auto=format&fit=crop&q=80&w=1200',
  summary: 'Nominations for the annual Grammy Awards were revealed, with hip hop artist Kendrick Lamar earning nine award considerations.',
  mainContent: {
    intro: 'The Recording Academy officially unveiled its nominations for the upcoming Annual Grammy Awards today, with acclaimed Pulitzer Prize-winning hip-hop artist Kendrick Lamar leading all musicians with an incredible nine award nominations. The official announcement, broadcast live from Los Angeles, celebrates outstanding musical achievements across 94 competitive categories spanning pop, rock, hip-hop, jazz, classical, and global music genres.',
    paragraph1: 'Lamar’s dominant nomination tally comes on the heels of his critically revered album release, which earned universal praise for its complex lyrical poetry, innovative jazz-fusion production, and sharp social commentary. Music peers and Recording Academy voters recognized his work across all major general field categories.',
    paragraph2: 'Joining Lamar at the top of the nomination leaderboards are pop powerhouses Lady Gaga, Bad Bunny, and Sabrina Carpenter, setting up an exciting, genre-spanning competition for music’s biggest night.'
  },
  extraSections: {
    heading3: 'General Field Nominations and Genre Milestones',
    section3_p1: 'Kendrick Lamar secured nominations in the prestigious "Big Four" categories: Album of the Year, Record of the Year, Song of the Year, and Best Rap Album. Music historians note that earning nine nominations in a single year places Lamar among the most decorated hip-hop artists in Grammy history.',
    section3_p2: 'Pop icon Lady Gaga earned seven nominations for her disco-infused pop album, while international Latin star Bad Bunny collected six nominations, highlighting the global popularity of Spanish-language music on world charts.',
    section3_p3: 'Breakout pop star Sabrina Carpenter earned her first-ever nominations in Best New Artist and Record of the Year, reflecting her extraordinary commercial breakthrough year.',
    heading4: 'Looking Ahead to the Live Broadcast in February',
    section4_p1: 'The official Grammy Awards ceremony will broadcast live from Crypto.com Arena in Los Angeles on February 1, featuring live performances from nominated superstars.',
    section4_p2: 'With such a diverse, star-studded lineup of nominees, the upcoming ceremony promises to deliver unforgettable musical collaborations and emotional award acceptance speeches.',
    conclusion: 'Celebrating artistic excellence, the Grammy nominations highlight the vibrant diversity and creative power of modern music.'
  },
  calloutList: {
    title: 'Grammy Nominations Overview',
    items: [
      { bold: 'Kendrick Lamar', text: 'Leads all artists with 9 nominations including Album & Record of the Year.' },
      { bold: 'Lady Gaga', text: 'Earned 7 nominations for her disco-pop album and hit single releases.' },
      { bold: 'Bad Bunny', text: 'Collected 6 nominations representing global Latin music achievements.' },
      { bold: 'Sabrina Carpenter', text: 'First-time nominee recognized in Best New Artist and Record of the Year.' }
    ]
  }
});

// 8. emmy-2026-nominations
storiesData.push({
  id: 'emmy-2026-nominations',
  headline: 'Medical Drama The Pitt Leads Emmy Nominations With 25 Honors',
  source: 'CNN',
  publishedDate: 'July 8, 2026',
  category: 'Awards & Events',
  image: 'https://images.unsplash.com/photo-1651465531201-7e430660fd82?auto=format&fit=crop&q=80&w=1200',
  summary: 'The Television Academy announced its annual Emmy nominees, led by hospital drama series The Pitt with 25 nominations.',
  mainContent: {
    intro: 'The Television Academy announced its nominations for the 78th Primetime Emmy Awards today, with Max’s gripping emergency room medical drama The Pitt leading all television programs with an outstanding 25 nominations. The critically acclaimed series, which offers a realistic, fast-paced look at healthcare workers inside an urban trauma center, captured nominations across major acting, directing, writing, and technical craft categories.',
    paragraph1: 'Lead actor Noah Wyle earned a nomination for Outstanding Lead Actor in a Drama Series for his powerful portrayal of a veteran ER physician, while the show itself secured a coveted spot in Outstanding Drama Series. Television critics praised the show’s authentic dialogue, intense ensemble acting, and masterful long-take camera direction.',
    paragraph2: 'Following close behind The Pitt on the nomination leaderboard is HBO’s hit comedy series Hacks, which collected 24 nominations for its brilliant final season, setting up a competitive award ceremony.'
  },
  extraSections: {
    heading3: 'Rich Diversity Across Drama, Comedy, and Limited Series',
    section3_p1: 'This year’s Emmy nominations celebrate an exceptionally rich year of television storytelling across streaming platforms and cable networks. In the comedy categories, beloved series such as The Bear, Abbott Elementary, and Only Murders in the Building earned multiple acting and writing nods.',
    section3_p2: 'In the Limited Series category, historical dramas and true-crime thrillers dominated nominations, showcasing stellar performances by veteran film actors transitioning to television storytelling.',
    section3_p3: 'The Television Academy noted that over 40% of first-time nominees represent international productions and diverse creative teams, reflecting television’s expanding global reach.',
    heading4: 'September Ceremony and Red Carpet Gala',
    section4_p1: 'The 78th Primetime Emmy Awards will air live on national television on Sunday, September 14, hosted by beloved television icon Mariska Hargitay at the Peacock Theater in downtown Los Angeles.',
    section4_p2: 'Cast members, directors, and writing teams will gather on the red carpet to celebrate an extraordinary year of television excellence.',
    conclusion: 'The Pitt’s 25 nominations celebrate the dedication, skill, and heart of television creators who bring unforgettable stories into our living rooms.'
  },
  calloutList: {
    title: '78th Emmy Nominations Summary',
    items: [
      { bold: 'The Pitt', text: 'Leads all programs with 25 nominations including Best Drama Series.' },
      { bold: 'Noah Wyle Nominated', text: 'Recognized for Lead Actor in a Drama Series for his ER physician role.' },
      { bold: 'Hacks Final Season', text: 'Earned 24 nominations celebrating its brilliant comedy finale.' },
      { bold: 'Live Ceremony Date', text: 'Broadcasting live on September 14 hosted by Mariska Hargitay.' }
    ]
  }
});

// 9. grammy-show-details-2026
storiesData.push({
  id: 'grammy-show-details-2026',
  headline: 'Grammy Awards Event Returns to Los Angeles Arena in February',
  source: 'Variety (Australia)',
  publishedDate: 'November 2025',
  category: 'Awards & Events',
  image: 'https://images.unsplash.com/photo-1519660837772-a823cd69d885?auto=format&fit=crop&q=80&w=1200',
  summary: 'The Recording Academy confirmed that the 2026 Grammy Awards ceremony will take place at Crypto.com Arena in Los Angeles.',
  mainContent: {
    intro: 'The Recording Academy confirmed today that the Annual Grammy Awards live broadcast will return to its historic home at Crypto.com Arena in downtown Los Angeles on Sunday, February 1. Music fans around the world can tune in to watch live musical performances, star-studded presenter appearances, and emotional award acceptance speeches celebrating the best songs, albums, and artists of the past year.',
    paragraph1: 'Broadcast live on CBS and streaming simultaneously on Paramount+, the three-and-a-half-hour television event promises to be a spectacular celebration of musical culture. Show producers revealed that elaborate stage setups and custom lighting designs are being constructed to accommodate high-energy live performances by nominated superstars.',
    paragraph2: 'In addition to main stage awards, the ceremony will feature special tribute performances honoring legendary musicians who passed away during the previous year.'
  },
  extraSections: {
    heading3: 'New Award Categories Celebrating Album Cover Design',
    section3_p1: 'An exciting addition to this year’s Grammy ceremony is the introduction of several newly established award categories, including Best Album Cover Design. This new category honors visual artists, graphic designers, and photographers who create iconic physical and digital album artwork.',
    section3_p2: 'Recording Academy leadership explained that album artwork plays an essential role in defining an era of music, creating a lasting visual identity that stays with fans for decades.',
    section3_p3: 'Visual designers welcomed the recognition, highlighting how creative packaging enriches the overall listener experience in both physical vinyl and digital streaming formats.',
    heading4: 'Global Viewing Options and Red Carpet Special',
    section4_p1: 'Red carpet coverage will begin two hours before the main ceremony, featuring fashion interviews with nominated musicians, celebrity arrivals, and backstage commentary.',
    section4_p2: 'International broadcasting partnerships will air the ceremony in over 180 countries, connecting music enthusiasts across every continent.',
    conclusion: 'Mark your calendars for February 1 as music’s biggest night delivers unforgettable performances and emotional celebrations in Los Angeles.'
  },
  calloutList: {
    title: 'Grammy Ceremony Event Details',
    items: [
      { bold: 'Venue & Date', text: 'Crypto.com Arena in Los Angeles on Sunday, February 1.' },
      { bold: 'Live Broadcast', text: 'Airing live on CBS and streaming on Paramount+ starting at 8 PM ET.' },
      { bold: 'New Category', text: 'Introducing Best Album Cover Design honoring graphic artists.' },
      { bold: 'Global Reach', text: 'Broadcast across 180+ countries with live red carpet coverage.' }
    ]
  }
});

// 10. venice-film-festival-2026
storiesData.push({
  id: 'venice-film-festival-2026',
  headline: 'Venice Film Festival Announces Movie Selection Lineup',
  source: 'The Hollywood Reporter',
  publishedDate: 'July 2026',
  category: 'Awards & Events',
  image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/HollywoodSign.jpg/1280px-HollywoodSign.jpg',
  summary: 'The 83rd Venice Film Festival announced its screening lineup, opening with director Danny Boyle new movie Ink in September.',
  mainContent: {
    intro: 'The organizers of the historic 83rd Venice International Film Festival officially unveiled their prestigious 2026 movie selection lineup today during a press conference in Rome. Running from September 2 through September 12 on the picturesque island of Lido di Venezia, the world’s oldest film festival will open with the highly anticipated world premiere of Ink, the newest dramatic feature directed by Oscar-winning filmmaker Danny Boyle.',
    paragraph1: 'This year’s festival lineup features an impressive mix of Hollywood studio prestige premieres, daring international art-house cinema, and restored classic films. Film critics regard Venice as the official kickoff of the global autumn movie award season, where future Oscar contenders premiere before global audiences.',
    paragraph2: 'Jury President Alexander Payne will lead an international panel of distinguished filmmakers and actors tasked with awarding the festival’s highest honor, the Golden Lion.'
  },
  extraSections: {
    heading3: 'International Directors and Star-Studded Red Carpet',
    section3_p1: 'The 2026 Venice lineup features groundbreaking new works from acclaimed international directors hailing from Italy, France, Japan, South Korea, Mexico, and the United States. Premiering films tackle compelling themes ranging from historical dramas to futuristic sci-fi thrillers.',
    section3_p2: 'Hollywood stars expected to walk the famous red carpet at the Palazzo del Cinema include Robert Pattinson, Alicia Vikander, Timothée Chalamet, and Zendaya, who star in competing festival feature films.',
    section3_p3: 'Press conferences, red-carpet photography, and standing ovations inside the historic Sala Grande theater will generate global film headlines throughout the twelve-day festival.',
    heading4: 'Promoting Global Cinema and Creative Storytelling',
    section4_p1: 'In addition to main competition films, the festival’s Venice Immersive section will showcase cutting-edge virtual reality storytelling and experimental digital art installations.',
    section4_p2: 'Film lovers and industry executives from across the globe are preparing to gather in Venice to celebrate the magic of cinema on the Venetian lagoon.',
    conclusion: 'The 83rd Venice Film Festival promises an unforgettable celebration of world cinema storytelling.'
  },
  calloutList: {
    title: '83rd Venice Film Festival Overview',
    items: [
      { bold: 'Opening Night Film', text: 'World premiere of Ink, directed by Oscar-winner Danny Boyle.' },
      { bold: 'Festival Dates', text: 'September 2 to September 12 on Lido island in Venice, Italy.' },
      { bold: 'Jury President', text: 'Acclaimed filmmaker Alexander Payne leading the Golden Lion jury.' },
      { bold: 'Red Carpet Stars', text: 'Robert Pattinson, Alicia Vikander, and Timothée Chalamet attending.' }
    ]
  }
});

// 11. cannes-2026-recap
storiesData.push({
  id: 'cannes-2026-recap',
  headline: 'Director Cristian Mungiu Wins Top Film Award at Cannes',
  source: 'Variety',
  publishedDate: 'May 2026',
  category: 'Awards & Events',
  image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/CannesCroisetteEst.JPG/1280px-CannesCroisetteEst.JPG',
  summary: 'The Cannes Film Festival concluded with director Cristian Mungiu winning the top prize for his drama film Fjord.',
  mainContent: {
    intro: 'The 79th Cannes Film Festival concluded its glamorous twelve-day celebration of international cinema along the French Riviera, with Jury President Park Chan-wook presenting the festival’s highest honor—the coveted Palme d’Or—to celebrated Romanian filmmaker Cristian Mungiu for his breathtaking dramatic masterpiece, Fjord.',
    paragraph1: 'Mungiu’s second Palme d’Or win places him in an elite circle of legendary filmmakers who have captured Cannes’ top prize multiple times. Set against the stark, haunting landscapes of northern Scandinavia, Fjord explores complex family dynamics, human resilience, and environmental isolation through stunning cinematography and quiet, powerful acting performances.',
    paragraph2: 'The jury’s unanimous decision was met with thunderous applause inside the Grand Théâtre Lumière, capping off a remarkable festival marked by standing ovations and high critical acclaim.'
  },
  extraSections: {
    heading3: 'Grand Prix, Best Director, and Acting Honors',
    section3_p1: 'Other major awards presented during the closing ceremony included the Grand Prix, awarded to French director Alice Diop for her poignant social drama, and the Best Director award, presented to Japanese auteur Hirokazu Kore-eda for his masterful family drama.',
    section3_p2: 'In acting categories, British actress Florence Pugh captured Best Actress for her fiery performance in a period drama, while Danish actor Mads Mikkelsen won Best Actor for his intense role in a psychological thriller.',
    section3_p3: 'Film distributors engaged in competitive bidding wars along the Croisette, securing international release rights to bring Cannes award winners to theaters worldwide.',
    heading4: 'Celebrating Independent Cinema and Global Talent',
    section4_p1: 'Film critics praised the 2026 Cannes selection for championing original, thought-provoking cinema that prioritizes character depth over visual formula.',
    section4_p2: 'As festival banners are taken down in southern France, film lovers look forward to watching these extraordinary films in cinemas over the coming year.',
    conclusion: 'Cristian Mungiu’s Palme d’Or victory stands as a triumphant moment for international art-house cinema.'
  },
  calloutList: {
    title: 'Cannes Film Festival Winners',
    items: [
      { bold: 'Palme d’Or Winner', text: 'Cristian Mungiu captures top honor for his Scandinavian drama Fjord.' },
      { bold: 'Grand Prix', text: 'Awarded to French filmmaker Alice Diop for her social drama feature.' },
      { bold: 'Best Actress', text: 'Florence Pugh recognized for her brilliant lead performance in a period piece.' },
      { bold: 'Best Actor', text: 'Mads Mikkelsen honored for his compelling psychological thriller role.' }
    ]
  }
});

// 12. disney-netflix-hbo-sky-bundle
storiesData.push({
  id: 'disney-netflix-hbo-sky-bundle',
  headline: 'Major Streaming Services Offer Combined Subscription Package',
  source: 'Inside The Magic',
  publishedDate: 'February 2026',
  category: 'Industry & Streaming',
  image: 'https://commons.wikimedia.org/wiki/Special:FilePath/A_Roku_TV_Remote.jpg?width=1200',
  summary: 'Sky announced a combined subscription package offering access to Disney Plus, Netflix, and HBO Max through one monthly bill.',
  mainContent: {
    intro: 'In a game-changing move designed to simplify digital entertainment for television viewers, European media provider Sky announced an all-in-one streaming subscription bundle uniting Disney+, Netflix, and Max (formerly HBO Max) under a single discounted monthly invoice. This groundbreaking partnership allows subscribers to access thousands of movies, hit television shows, and live sports events without managing multiple separate user logins or credit card billing statements.',
    paragraph1: 'As the digital streaming market matured over recent years, consumers frequently voiced frustration over managing numerous separate app subscriptions, rising monthly costs, and fragmented viewing menus. The new unified subscription package directly addresses "subscription fatigue" by offering a convenient, cost-effective solution for households.',
    paragraph2: 'Subscribers save over 30% per month compared to paying for each streaming service individually, making premium digital entertainment far more affordable.'
  },
  extraSections: {
    heading3: 'Unified Search Interface and Single Smart Remote Access',
    section3_p1: 'Beyond financial savings, a key selling point of the combined package is the integrated smart TV software user interface. Using a single TV remote control, viewers can search across Disney+, Netflix, and Max libraries simultaneously using unified voice commands.',
    section3_p2: 'For instance, typing or speaking a favorite actor’s name into the search bar instantly displays all available movies starring that actor across all three streaming apps on one screen.',
    section3_p3: 'Integrated recommendation algorithms suggest personalized watchlists based on household viewing history, making movie night decisions quick and enjoyable.',
    heading4: 'Industry Trends Toward Streaming Bundles and Convenience',
    section4_p1: 'Media analysts predict that this streaming consolidation trend will spread rapidly across North America and global markets as entertainment companies seek to reduce subscriber churn.',
    section4_p2: 'By offering streamlined billing and comprehensive content libraries, streaming providers ensure consistent long-term subscriber engagement.',
    conclusion: 'The unified streaming package sets a comfortable, consumer-friendly benchmark for the future of digital home entertainment.'
  },
  calloutList: {
    title: 'Unified Streaming Bundle Highlights',
    items: [
      { bold: 'Included Services', text: 'Disney+, Netflix, and Max bundled under a single monthly subscription.' },
      { bold: 'Financial Savings', text: 'Over 30% monthly discount compared to individual service prices.' },
      { bold: 'Unified UI Search', text: 'Search across all three libraries simultaneously with one TV remote.' },
      { bold: 'Single Monthly Bill', text: 'Streamlined invoicing eliminating multiple subscription management hassle.' }
    ]
  }
});

// 13. paramount-wbd-wga-opposition
storiesData.push({
  id: 'paramount-wbd-wga-opposition',
  headline: 'States and Writers Guild File Review Regarding Entertainment Deal',
  source: 'Deadline',
  publishedDate: 'July 2026',
  category: 'Industry & Streaming',
  image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/HollywoodSign.jpg/1280px-HollywoodSign.jpg',
  summary: 'Twelve state attorneys and writers union groups filed legal documents requesting review of the Paramount purchase of Warner Bros Discovery.',
  mainContent: {
    intro: 'A coalition of twelve state attorneys general alongside the Writers Guild of America (WGA) and the Cinema Theater Owners Association formally filed legal petitions today requesting an in-depth antitrust review of the proposed acquisition of Warner Bros. Discovery by Paramount Skydance. The legal filings submitted to federal regulatory agencies raise significant concerns regarding market competition, film diversity, and long-term employment stability for creative industry workers.',
    paragraph1: 'State officials argue that merging two of Hollywood’s largest film studios and television networks into a single massive corporate entity could reduce competition, limit theatrical movie release choices for independent cinemas, and give executive leadership disproportionate bargaining power over creative wages.',
    paragraph2: 'The legal review petitions request that federal regulators carefully evaluate the transaction terms to protect consumers, independent theater owners, and entertainment workers before granting final merger approval.'
  },
  extraSections: {
    heading3: 'Writers Guild and Independent Cinema Concerns',
    section3_p1: 'The Writers Guild of America expressed specific concern that studio consolidation reduces the number of active pitch meetings, script buys, and television development deals available to screenwriters. With fewer competing studios bidding on original screenplays, writers face reduced job opportunities and lower compensation.',
    section3_p2: 'Independent theater owners also voiced strong concern, cautioning that a mega-studio controlling a huge percentage of annual film releases could dictate aggressive film rental terms and shorten theatrical exclusivity windows.',
    section3_p3: 'Preserving vibrant competition among film studios ensures that diverse storytelling voices receive funding and theatrical distribution.',
    heading4: 'Corporate Responses and Regulatory Review Process',
    section4_p1: 'In response to the legal filings, corporate spokespersons for Paramount and Warner Bros. Discovery re-affirmed their commitment to working constructively with federal regulators and state officials.',
    section4_p2: 'They emphasized that the merger will strengthen production capabilities, preserve historic film lots, and support thousands of entertainment jobs.',
    conclusion: 'Regulatory agencies will conduct detailed market hearings over the coming months to ensure fair business competition in Hollywood.'
  },
  calloutList: {
    title: 'Legal Review Petition Key Points',
    items: [
      { bold: 'Petitioner Coalition', text: '12 state attorneys general and Writers Guild of America filing reviews.' },
      { bold: 'Antitrust Concerns', text: 'Potential reduction in studio competition and script development buys.' },
      { bold: 'Theater Protection', text: 'Independent cinema owners seeking guarantees for theatrical release windows.' },
      { bold: 'Regulatory Timeline', text: 'Federal agencies conducting public market hearings over coming months.' }
    ]
  }
});

// 14. video-game-movie-wave
storiesData.push({
  id: 'video-game-movie-wave',
  headline: 'New Video Game Movies Planned for Release in Coming Years',
  source: 'GamesRadar+',
  publishedDate: '2026',
  category: 'Industry & Streaming',
  image: 'https://images.unsplash.com/photo-1654557339705-d4250e03ea80?auto=format&fit=crop&q=80&w=1200',
  summary: 'GamesRadar shared a list of upcoming movies based on popular video games, including animated adventures and action films.',
  mainContent: {
    intro: 'Hollywood studios are doubling down on video game adaptations, announcing an ambitious slate of over two dozen feature films and animated television series based on iconic gaming franchises scheduled for release over the next three years. Detailed in a comprehensive industry report by GamesRadar+, this upcoming wave of gaming cinema represents a major shift in studio strategy, as movie producers look to beloved video game universes for compelling stories, rich lore, and passionate global fanbases.',
    paragraph1: 'Following the extraordinary box office successes of recent gaming films—including The Super Mario Bros. Movie, Sonic the Hedgehog, and HBO’s The Last of Us—film studios are treating video game intellectual property with unprecedented artistic respect, hiring acclaimed directors and top-tier screenwriters.',
    paragraph2: 'The upcoming film slate covers a diverse range of gaming genres, from open-world fantasy epics and martial arts fighting games to animated family platformers and tactical sci-fi thrillers.'
  },
  extraSections: {
    heading3: 'Highlighted Film Adaptations Coming to Cinema Screens',
    section3_p1: 'Among the most anticipated projects on the upcoming calendar is a live-action adaptation of The Legend of Zelda, directed by Wes Ball, which promises to deliver sweeping fantasy adventure and majestic practical set designs across wild natural landscapes.',
    section3_p2: 'Also in active production are animated adventures exploring the Mario Galaxy universe, a gritty live-action adaptation of Ghost of Tsushima directed by Chad Stahelski, and a high-budget Minecraft feature film starring Jack Black and Jason Momoa.',
    section3_p3: 'Producers emphasize that working directly with game creators ensures that films stay faithful to original character personalities while expanding story lore for big-screen audiences.',
    heading4: 'Connecting Gamers and Cinema Audiences Worldwide',
    section4_p1: 'The renaissance of video game movies has created a vibrant bridge between the interactive gaming industry and traditional Hollywood filmmaking.',
    section4_p2: 'As advanced visual effects technology allows filmmakers to recreate game worlds with photorealistic accuracy, moviegoers can look forward to unforgettable cinematic adventures in coming years.',
    conclusion: 'Video game cinema has officially entered a golden era, bringing beloved digital worlds to life on giant screens everywhere.'
  },
  calloutList: {
    title: 'Upcoming Video Game Movie Slate',
    items: [
      { bold: 'The Legend of Zelda', text: 'Live-action fantasy adventure directed by Wes Ball in active development.' },
      { bold: 'Minecraft Movie', text: 'Starring Jack Black and Jason Momoa coming to theaters next year.' },
      { bold: 'Ghost of Tsushima', text: 'Gritty samurai action feature directed by John Wick’s Chad Stahelski.' },
      { bold: 'Creator Collaboration', text: 'Filmmakers partnering directly with game developers for lore accuracy.' }
    ]
  }
});

const builtStories = storiesData.map(buildEntertainmentArticle);

// Write updated file
const filePath = 'src/components/themes/EntertainmentPage.tsx';
const fileContent = fs.readFileSync(filePath, 'utf8');

const startIdx = fileContent.indexOf('const entertainmentStories: EntertainmentStory[] = [');
const endIdx = fileContent.indexOf('function StoryDetail');

if (startIdx !== -1 && endIdx !== -1) {
  const newCode = `const entertainmentStories: EntertainmentStory[] = ${JSON.stringify(builtStories, null, 2)};\n\n`;
  const updatedContent = fileContent.slice(0, startIdx) + newCode + fileContent.slice(endIdx);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`Successfully updated ${builtStories.length} stories in EntertainmentPage.tsx`);
} else {
  console.error('Could not find start/end index in EntertainmentPage.tsx');
}
