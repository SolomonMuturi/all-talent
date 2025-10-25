import { teamMembers } from "./data";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  imageHint: string;
  authorId: number;
  publishedAt: string;
};

export const blogPosts: BlogPost[] = [
  {
    id: 'post-001',
    slug: 'academy-signs-new-sponsorship-deal',
    title: 'Academy Signs Major Sponsorship Deal with Safaricom',
    excerpt: 'A landmark partnership set to revolutionize youth football development in Kenya, providing new kits, equipment, and opportunities for our players.',
    content: `
<p>We are thrilled to announce a landmark partnership with Safaricom, a collaboration set to revolutionize youth football development in Kenya. This sponsorship will provide our academy with new state-of-the-art kits, modern training equipment, and unparalleled opportunities for our talented young players.</p>
<p>The partnership was officially unveiled at a press conference held at the academy grounds, attended by key figures from both TalantaTrack and Safaricom. "This is a game-changer for us," said Head Coach John Omondi. "With Safaricom's support, we can elevate our training programs and provide our players with the resources they need to compete at the highest level."</p>
<p>Under the terms of the deal, Safaricom will become the academy's official kit sponsor. The new jerseys, featuring the iconic Safaricom green, were modeled by our team captains to widespread applause. Furthermore, the sponsorship includes a significant investment in training equipment, from GPS trackers to professional-grade footballs, ensuring our players have access to the best tools for their development.</p>
<p>Perhaps most excitingly, the partnership will also fund a new scouting initiative, "Safaricom Future Stars," aimed at discovering and nurturing talent from grassroots levels across the country. This initiative aligns perfectly with our mission to provide a pathway for every aspiring footballer in Kenya.</p>
<p>We look forward to a successful partnership with Safaricom and a bright future for our academy and its players.</p>
    `,
    imageUrl: 'https://picsum.photos/seed/blog1/1200/800',
    imageHint: 'football sponsorship handshake',
    authorId: 1, // Esther Chepkoech
    publishedAt: '2024-07-25',
  },
  {
    id: 'post-002',
    slug: 'u17-team-wins-regional-championship',
    title: 'Our U-17 Team Crowned Regional Champions!',
    excerpt: 'A stunning victory in the regional finals after a hard-fought tournament. Read the full match report and celebrate with our young heroes.',
    content: `
<p>Our U-17 team has brought home the Regional Championship trophy after a stunning performance in a nail-biting final. The team showcased immense skill, determination, and teamwork throughout the tournament, culminating in a well-deserved 2-1 victory.</p>
<p>The final match was a tactical masterclass, with our players executing their game plan to perfection. Leo Wanjala opened the scoring in the first half with a clinical finish, but the opposition quickly equalized, setting the stage for a tense second half.</p>
<p>With minutes to spare, it was midfielder Aisha Akinyi who delivered the decisive blow, a spectacular long-range strike that found the top corner of the net, sealing the championship for TalantaTrack. The victory is a testament to the hard work of the players and the guidance of our coaching staff.</p>
<p>"I couldn't be prouder of this group," said a jubilant Coach John Omondi after the match. "They left everything on the pitch. This win is not just for them, but for the entire academy and our supporters."</p>
<p>The team will be welcomed back with a celebration at the academy grounds tomorrow. Join us in congratulating our champions!</p>
    `,
    imageUrl: 'https://picsum.photos/seed/blog2/1200/800',
    imageHint: 'youth football team celebrating',
    authorId: 2, // John Omondi
    publishedAt: '2024-07-22',
  },
  {
    id: 'post-003',
    slug: 'scouting-combine-a-huge-success',
    title: 'Annual Scouting Combine Attracts International Attention',
    excerpt: 'Our annual scouting combine was a massive success, with scouts from several European clubs in attendance to witness the next generation of talent.',
    content: `
<p>The TalantaTrack Annual Scouting Combine has once again proven to be a premier event for identifying the next generation of football talent. This year's event was our biggest yet, attracting a record number of participants and drawing the attention of scouts from several prominent European clubs.</p>
<p>Over two days, young athletes were put through a series of rigorous drills, performance tests, and match simulations, all under the watchful eyes of our own scouting team, led by Peter Kamau, and international representatives.</p>
<p>"The level of talent on display was exceptional," noted a scout from a top-tier Portuguese club. "TalantaTrack is clearly doing something right. We've identified several players with the potential to make it at the professional level."</p>
<p>The combine measured everything from raw speed and agility using our GPS tracking technology to tactical awareness and in-game decision-making. The objective, data-driven approach impressed the visiting scouts, who were given access to comprehensive player profiles through our Scouting Portal.</p>
<p>Several of our players have already been invited for trials abroad as a direct result of the combine. This event is a cornerstone of our commitment to creating real pathways to professional careers for our athletes.</p>
    `,
    imageUrl: 'https://picsum.photos/seed/blog3/1200/800',
    imageHint: 'football scout stopwatch',
    authorId: 4, // Peter Kamau
    publishedAt: '2024-07-18',
  },
];
