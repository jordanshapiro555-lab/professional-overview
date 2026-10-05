import { query } from "@anthropic-ai/claude-agent-sdk";
import { Resend } from "resend";
import { execSync } from "child_process";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import Replicate from "replicate";

const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const BRANCH = `blog/auto-${TIMESTAMP}`;
const TEMPLATE_URL = "https://jordanshapiro555-lab.github.io/professional-overview/blog/";

// Ensure research archive exists
if (!existsSync("research-archive")) mkdirSync("research-archive", { recursive: true });
if (!existsSync("blog/images")) mkdirSync("blog/images", { recursive: true });

execSync(`git config user.name "CRO Bot"`);
execSync(`git config user.email "bot@cro-studio.dev"`);
execSync(`git checkout -b ${BRANCH}`);

const systemPrompt = `You are an orchestrator running a 9-stage CRO blog pipeline for Jordan's CRO Studio.

REPO LAYOUT:
- Blog posts: /blog/*.html (use the most recent as a structural template)
- Research archive: /research-archive/*.md (notes from past 3 posts — DO NOT REPEAT THESE TOPICS)
- Hero images: /blog/images/
- Style guide: /STYLE.md (MANDATORY reading for Writer + QA)

STAGES (run sequentially, each as a discrete subagent task):

1. RESEARCHER:
   - First, list /research-archive/ and read the 3 most recent files. Extract topics already covered.
   - Then use WebSearch for 5–8 recent CRO trends/studies/news from the last 30 days.
   - EXCLUDE any topic substantially overlapping with archived research.
   - Cite sources (Baymard, NNG, CXL, GoodUI, ConversionXL, etc.).
   - Output: research-notes.md (also save copy to research-archive/${TIMESTAMP}-research.md)

2. COMPETITOR SCAN:
   - WebFetch recent posts (last 14 days) from: cxl.com/blog, baymard.com/blog, goodui.org/leaks
   - List their topics and angles.
   - Identify ONE specific gap: a topic they haven't covered, a take they're missing, or a synthesis across sources nobody has done.
   - Output: competitor-gap.md with the gap explicitly stated and why it's defensible.

3. OUTLINER:
   - Read research-notes.md + competitor-gap.md.
   - Produce outline aimed at the gap. Include H2/H3 structure, target keyword, angle, reader takeaway.
   - Output: outline-v1.md

4. CRITIC:
   - Review outline-v1.md against: novelty (vs competitor scan), SEO opportunity, demonstration of Jordan's CRO+SEO+content+strategy expertise, reader engagement.
   - Output: critique.md with specific improvements.

5. REVISER:
   - Apply critique. Output: outline-v2.md

6. WRITER:
   - READ /STYLE.md FIRST. Internalize voice, banned jargon, required elements per post.
   - Write 1200–1700 words (HARD CAP 1800). Strong hook, scannable sections, data citations, concrete examples, clear CTA.
   - Every H2 must contain a cited data point. Include 1 specific test example. Include 1 internal link to existing /blog/ post.
   - Output: post-draft.md

7. DEVELOPER:
   - List /blog/. Pick most recent post HTML as structural template.
   - Create new HTML file in /blog/ matching same structure, classes, styling.
   - Inject post content. Update /blog/index.html with new post card as first entry.
   - Reference hero image at /blog/images/${TIMESTAMP}-hero.png (will be generated separately).

8. SEO OPTIMIZER:
   - Audit new HTML for: title (50–60 chars), meta description (150–160), H1, semantic headings, alt text, 2+ internal links, schema.org Article JSON-LD, keyword in URL/title/H1/first paragraph, OpenGraph tags.
   - Fix issues directly in HTML.

9. QA:
   - RE-READ /STYLE.md. Verify every rule (banned jargon, sentence length, required elements).
   - Verify HTML validates, links work, no Lorem, word count 1200–1800, alt text on all images, meta tags present.
   - Output: qa-report.md. If any check fails, FIX it directly.
   - Also output a 1-sentence "image prompt" for the hero image based on the post topic. Save to: hero-image-prompt.txt

After all stages: list final files in <output> tags.`;

let finalOutput = "";
for await (const msg of query({
  prompt: `Run the full 9-stage pipeline. Today: ${new Date().toDateString()}. Template: ${TEMPLATE_URL}. Run timestamp for file naming: ${TIMESTAMP}`,
  options: {
    systemPrompt,
    allowedTools: ["Read", "Write", "Edit", "Glob", "Grep", "WebSearch", "WebFetch", "Bash"],
    permissionMode: "bypassPermissions",
    maxTurns: 120,
  },
})) {
  if (msg.type === "assistant") {
    for (const block of msg.message.content) {
      if (block.type === "text") {
        finalOutput += block.text;
        console.log(block.text);
      }
    }
  }
}

// === HERO IMAGE GENERATION (Replicate Flux Schnell) ===
let heroImagePath = null;
try {
  const fs = await import("fs");
  const prompt = fs.readFileSync("hero-image-prompt.txt", "utf-8").trim();
  console.log(`🎨 Generating hero image with prompt: ${prompt}`);
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  const output = await replicate.run("black-forest-labs/flux-schnell", {
    input: {
      prompt: `${prompt}. Editorial blog hero image, modern, professional, minimal, high contrast, no text, 16:9 aspect ratio.`,
      aspect_ratio: "16:9",
      output_format: "png",
      num_outputs: 1,
    },
  });
  // output is an array of file streams in newer versions
  const imageUrl = Array.isArray(output) ? output[0] : output;
  const response = await fetch(typeof imageUrl === "string" ? imageUrl : imageUrl.url());
  const buffer = Buffer.from(await response.arrayBuffer());
  heroImagePath = `blog/images/${TIMESTAMP}-hero.png`;
  writeFileSync(heroImagePath, buffer);
  console.log(`✅ Hero image saved: ${heroImagePath}`);
} catch (e) {
  console.warn(`⚠️ Hero image generation failed (continuing without): ${e.message}`);
}

// === LIGHTHOUSE CHECK ===
let lighthouseReport = "Lighthouse skipped";
try {
  console.log("🔦 Running Lighthouse...");
  // Find the newest blog HTML file (the one just created)
  const newPost = execSync(`ls -t blog/*.html | head -1`).toString().trim();
  execSync(`npx --yes lighthouse "file://$(pwd)/${newPost}" --only-categories=performance,accessibility,seo --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless --no-sandbox" --quiet`, { stdio: "inherit" });
  const report = JSON.parse(execSync(`cat lighthouse-report.json`).toString());
  const seo = Math.round(report.categories.seo.score * 100);
  const a11y = Math.round(report.categories.accessibility.score * 100);
  const perf = Math.round(report.categories.performance.score * 100);
  lighthouseReport = `SEO: ${seo} | A11y: ${a11y} | Perf: ${perf}`;
  console.log(`📊 Lighthouse: ${lighthouseReport}`);
  if (seo < 95) {
    console.error(`❌ SEO score ${seo} < 95 threshold. Failing build.`);
    process.exit(1);
  }
} catch (e) {
  console.warn(`⚠️ Lighthouse failed (continuing): ${e.message}`);
}

// === COMMIT + PUSH + PR ===
execSync(`git add -A`);
try {
  execSync(`git diff --staged --quiet`);
  console.log("⚠️ No file changes — agent didn't write anything. Aborting.");
  process.exit(1);
} catch {
  execSync(`git commit -m "New CRO blog post (auto-generated draft) [${TIMESTAMP}]"`);
}
execSync(`git push origin ${BRANCH}`);

let prUrl = `https://github.com/${process.env.REPO}/pull/new/${BRANCH}`;
try {
  prUrl = execSync(
    `gh pr create --title "Auto blog draft: ${BRANCH}" --body "Generated by CRO Blog Pipeline.\\n\\n**Lighthouse:** ${lighthouseReport}\\n**Hero image:** ${heroImagePath || "none"}" --base main --head ${BRANCH}`
  ).toString().trim();
} catch (e) {
  console.warn("PR auto-create failed, using compare URL:", e.message);
}

// === EMAIL ===
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({
  from: "onboarding@resend.dev",
  to: process.env.NOTIFY_EMAIL,
  subject: `📝 New CRO blog draft ready — ${BRANCH}`,
  html: `
    <h2>Your CRO blog draft is ready</h2>
    <p><strong>Branch:</strong> ${BRANCH}</p>
    <p><strong>PR:</strong> <a href="${prUrl}">${prUrl}</a></p>
    <p><strong>Lighthouse:</strong> ${lighthouseReport}</p>
    <p><strong>Hero image:</strong> ${heroImagePath || "Generation failed — post will use template default"}</p>
    <p>Stages: Research (cached) → Competitor Gap → Outline → Critique → Revise → Write (style-guarded) → Develop → SEO → QA</p>
    <hr>
    <pre style="font-size:12px;white-space:pre-wrap">${finalOutput.slice(-2500)}</pre>
  `,
});

console.log(`✅ Done. PR: ${prUrl}`);
