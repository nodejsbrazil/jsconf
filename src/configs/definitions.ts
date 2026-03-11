export const link = {
  tickets:
    'https://www.sympla.com.br/preview/70b7073f5188ef1c79a98890c746ac38?_gl=1*1rg1w4*_gcl_au*MTIzMTI4MTc0Ni4xNzcyNTg1MzQwLjI1NTM4NDg5MS4xNzcyNTg1OTQzLjE3NzI1ODU5NDM.*_ga*NjUyODY1MTU0LjE3NzI1ODUzNDA.*_ga_KXH10SQTZF*czE3NzI1ODUzNDAkbzEkZzEkdDE3NzI1ODU5ODkkajQwJGwwJGg3NDMwMzIxNDE.',
  sponsors: 'https://forms.gle/SPyyD3SsuurVpvCNA',
} as const;

/**
 * URL of the Cloudflare Worker. Points to the local wrangler dev server in
 * development and to the deployed worker in production.
 */
export const waitlistApiUrl =
  'https://jsconf-br-waitlist.jsconf-br.workers.dev';
