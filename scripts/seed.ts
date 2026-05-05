import { execSync } from 'node:child_process';

const SERVER = process.argv.includes('--server')
  ? process.argv[process.argv.indexOf('--server') + 1]
  : 'http://localhost:8787';
const ADMIN_KEY = process.env['ADMIN_KEY'] || 'minha-chave-admin';

type UsersResult = {
  results: Array<{ email: string; code: string }>;
};

async function main() {
  // Step 1: Create users
  console.log('Creating users...');
  const userRes = await fetch(`${SERVER}/api/users/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ADMIN_KEY: ADMIN_KEY,
    },
    body: JSON.stringify({
      users: [
        { email: 'alice@example.com', ticket_type: 1, votes_allowed: 5 },
        { email: 'bob@example.com', ticket_type: 1, votes_allowed: 5 },
      ],
    }),
  });

  if (!userRes.ok) {
    const err = await userRes.text();
    throw new Error(`Failed to create users: ${userRes.status} ${err}`);
  }

  const userData = (await userRes.json()) as UsersResult;
  console.log('Users created:', JSON.stringify(userData.results, null, 2));

  // Step 2: Create C4P talks (3 different speakers/talks)
  const talks = [
    {
      name: 'Ana Silva',
      email: 'ana@example.com',
      phone: '11999999999',
      city: 'São Paulo',
      state: 'SP',
      travelPreference: 0,
      experienceLevel: 2,
      bio: 'Software engineer passionate about web performance.',
      duration: 0,
      talkTitle: 'Web Performance Optimizations That Actually Matter',
      talkDescription:
        'A practical guide to web performance optimizations that make a real difference in production.',
      audienceLevel: 1,
      talkReason:
        'Sharing real-world experience from optimizing large-scale applications.',
    },
    {
      name: 'Carlos Oliveira',
      email: 'carlos@example.com',
      phone: '21988888888',
      city: 'Rio de Janeiro',
      state: 'RJ',
      travelPreference: 1,
      experienceLevel: 2,
      bio: 'Full-stack developer and open source contributor.',
      duration: 1,
      talkTitle: 'Building Resilient APIs with TypeScript',
      talkDescription:
        'How to build APIs that handle failure gracefully in production.',
      audienceLevel: 2,
      talkReason: 'Lessons learned from migrating a monolith to microservices.',
    },
    {
      name: 'Julia Santos',
      email: 'julia@example.com',
      phone: '31977777777',
      city: 'Belo Horizonte',
      state: 'MG',
      travelPreference: 0,
      experienceLevel: 1,
      bio: 'UX engineer focused on accessibility and inclusive design.',
      duration: 0,
      talkTitle: 'Accessibility-First Development: A Practical Approach',
      talkDescription:
        'How to build accessible web applications from the ground up.',
      audienceLevel: 0,
      talkReason:
        'Accessibility is often treated as an afterthought — it should be foundational.',
    },
  ];

  for (const talk of talks) {
    console.log(`Creating talk: "${talk.talkTitle}"...`);
    const talkRes = await fetch(`${SERVER}/api/c4p`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(talk),
    });

    if (!talkRes.ok) {
      const err = await talkRes.text();
      console.error(`Talk creation failed (${talkRes.status}): ${err}`);
    } else {
      console.log('  Done.');
    }
  }

  // Step 3: Update talk statuses to appear in voting
  console.log('Updating talk statuses to 2 (voting)...');
  execSync(
    `wrangler d1 execute jsconf-br --command="UPDATE talks SET status = 2"`,
    { cwd: process.cwd(), stdio: 'inherit' }
  );

  console.log('\n--- Seed complete ---');
  console.log('Auth codes (use to log in):');
  for (const u of userData.results) {
    console.log(`  ${u.email} → code: ${u.code}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
