#!/usr/bin/env node
/**
 * One-shot provisioning for the GPF portal Supabase project.
 *
 * It performs the two server-side steps that cannot be done from the browser:
 *   1. Applies `supabase/schema.sql` (tables, RLS policies, triggers, RPCs).
 *   2. Creates or updates the `sign-in-by-upazila` edge function.
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_ACCESS_TOKEN = "sbp_..."
 *   npm run supabase:setup
 *
 * Usage (bash):
 *   SUPABASE_ACCESS_TOKEN=sbp_... npm run supabase:setup
 *
 * The personal access token only needs the `database:write` and
 * `edge_functions:write` scopes and is never written to disk.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Load whichever .env.local holds the project credentials.
dotenv.config({ path: path.join(projectRoot, '.env.local'), quiet: true });
dotenv.config({ path: path.resolve(projectRoot, '..', '.env.local'), quiet: true });

const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const projectUrl = (
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_SUPABASE_URL ||
  ''
).trim();

const fail = (message) => {
  console.error(`\n[setup-supabase] ${message}\n`);
  process.exit(1);
};

if (!accessToken) {
  fail('SUPABASE_ACCESS_TOKEN is not set. Create one at https://supabase.com/dashboard/account/tokens');
}
if (!projectUrl) {
  fail('Supabase project URL not found. Set VITE_SUPABASE_URL in .env.local.');
}

let projectRef = '';
try {
  projectRef = new URL(projectUrl).hostname.split('.')[0];
} catch {
  fail(`Invalid Supabase project URL: ${projectUrl}`);
}

const apiBase = 'https://api.supabase.com/v1';
const request = async (route, options = {}) => {
  const response = await fetch(`${apiBase}${route}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  return { response, payload };
};

// 1. Apply the SQL schema ---------------------------------------------------
const schemaSql = readFileSync(path.join(projectRoot, 'supabase', 'schema.sql'), 'utf8');
process.stdout.write(`[setup-supabase] Applying schema to project ${projectRef} ... `);
const { response: sqlResponse, payload: sqlPayload } = await request(
  `/projects/${projectRef}/database/query`,
  { method: 'POST', body: JSON.stringify({ query: schemaSql }) },
);
if (!sqlResponse.ok) {
  console.error('failed');
  fail(`Schema failed (${sqlResponse.status}): ${JSON.stringify(sqlPayload)}`);
}
console.log('ok');

// 2. Deploy the sign-in edge function ---------------------------------------
const functionSlug = 'sign-in-by-upazila';
const functionSource = readFileSync(
  path.join(projectRoot, 'supabase', 'functions', functionSlug, 'index.ts'),
  'utf8',
);
const functionBody = JSON.stringify({
  slug: functionSlug,
  name: functionSlug,
  verify_jwt: false,
  body: functionSource,
});

process.stdout.write(`[setup-supabase] Deploying ${functionSlug} ... `);
const create = await request(`/projects/${projectRef}/functions`, {
  method: 'POST',
  body: functionBody,
});
if (create.response.ok) {
  console.log('ok');
} else if (create.response.status === 409 || /exist/i.test(JSON.stringify(create.payload))) {
  const update = await request(`/projects/${projectRef}/functions/${functionSlug}`, {
    method: 'PUT',
    body: functionBody,
  });
  if (!update.response.ok) {
    console.error('failed');
    fail(`Function update failed (${update.response.status}): ${JSON.stringify(update.payload)}`);
  }
  console.log('updated');
} else {
  console.error('failed');
  fail(`Function deploy failed (${create.response.status}): ${JSON.stringify(create.payload)}`);
}

console.log('\n[setup-supabase] Done. The portal can now sign in with a upazila ID or email.\n');
