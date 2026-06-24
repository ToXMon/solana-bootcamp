# Solana Skills Ecosystem Analysis

**Date:** 2026-06-19  
**Analyst:** Agent Zero (Deep Research)  
**Project:** Encode Club 6-Week Solana Developer Bootcamp  
**Report path:** `/a0/usr/projects/solana_bootcamp/resources/solana-skills-ecosystem-analysis.md`

## 1. Executive Summary

The Solana AI/agent-skill landscape is maturing quickly. The **Solana AI Kit** (`solanabr/solana-ai-kit`) is emerging as the dominant integration layer: it bundles the official `solana-dev-skill`, SendAI's broad skill marketplace, Helius MCP tooling, and game-specific add-ons into a single installable Claude Code / Codex kit. Around it, specialized skills are forming clear clusters:

- **Core / foundation:** `solana-dev-skill`, `eth-to-sol-skill`
- **DeFi integrations:** `sendaifun/skills`, `jup-ag/agent-skills`
- **Infra / data / deployment:** `helius-labs/core-ai`, `cloudflare/skills`, `vercel-labs/agent-skills`
- **Security:** `trailofbits/skills`, `frankcastleauditor/safe-solana-builder`, `QEDGen/solana-skills`
- **Startup / GTM:** `ColosseumOrg/colosseum-copilot`, `sendaifun/solana-new`

For this bootcamp project, the best opportunity is not to duplicate the deep protocol or security skills, but to produce **beginner-to-intermediate learning artifacts** that the ecosystem currently lacks: verified exercise walkthroughs, PDA seed-debugging mini-skills, devnet verification checklists, and Token-2022 extension recipes. These artifacts map cleanly into a new skill (or PR to `solana-dev-skill`) and fit the Superteam Brasil bounty, which rewards production-grade skills that can be merged or submoduled into the Solana AI Kit.

## 2. Resource Summaries

### 2.1 AI Kit & Reference Skill

| Resource | URL | What it covers | Target audience | Key features |
|----------|-----|----------------|-----------------|--------------|
| Solana AI Kit | https://github.com/solanabr/solana-ai-kit | Production-ready Claude Code / Codex configuration for full-stack Solana development | Developers using AI coding assistants for Solana programs, frontends, games, DeFi | 15 specialized agents; 29 workflow commands; 7 MCP server integrations; progressive skill loading; external skill submodules |
| solana-game-skill | https://github.com/solanabr/solana-game-skill | Gaming-specific Claude Code skill for Unity, React Native, mobile wallets, PlaySolana, in-game payments | Game developers building Solana games in Unity / React Native | Unity / Solana.Unity-SDK; C# patterns; React Native mobile wallet adapter; PlaySolana/PSG1; Arcium rollups |

### 2.2 Core / Foundation Skills

| Resource | URL | What it covers | Target audience | Key features |
|----------|-----|----------------|-----------------|--------------|
| solana-dev-skill | https://github.com/solana-foundation/solana-dev-skill | Comprehensive Claude Code skill for modern Solana development (framework-kit, @solana/kit, Anchor, Pinocchio, LiteSVM/Mollusk, Surfpool, security, Token-2022) | dApp devs, program authors, frontend engineers, security reviewers | Opinionated stack; safety guardrails; NO_DNA=1 CLI protocol; progressive disclosure; MCP-first docs lookup |
| eth-to-sol-skill | https://github.com/solana-foundation/eth-to-sol-skill | Two-pass protocol for porting Solidity contracts to Solana programs (faithful Anchor port → Solana-native refactor) | Solidity devs migrating to Solana; cross-chain protocol teams | Hard two-pass protocol; structured diff; explanation log; pre-flight security checklist; reference examples |

### 2.3 DeFi Skills

| Resource | URL | What it covers | Target audience | Key features |
|----------|-----|----------------|-----------------|--------------|
| sendaifun/skills | https://github.com/sendaifun/skills | Marketplace of 25+ agent-ready Solana protocol skills (Jupiter, Kamino, Meteora, Pump.fun, Pyth, Squads, Solana Agent Kit) | AI agent devs and users; human devs needing quick playbooks | Agent Skills spec; `npx skills add`; protocol-specific directories; Apache 2.0 |
| jup-ag/agent-skills | https://github.com/jup-ag/agent-skills | Jupiter-focused agent skills covering Swap v2/Ultra, Lend, Perps, Trigger, Recurring, Price, Portfolio, RFQ | DeFi devs integrating Jupiter; Claude/Codex users | Intent router; endpoint-by-endpoint playbooks; rate-limit/error handling; plugin variants |

### 2.4 Infra Skills

| Resource | URL | What it covers | Target audience | Key features |
|----------|-----|----------------|-----------------|--------------|
| helius-labs/core-ai | https://github.com/helius-labs/core-ai | Helius CLI, MCP server, Claude/Cursor plugins, and standalone skills (Helius, DFlow, Jupiter, OKX, Phantom, SVM education) | Devs wanting live on-chain data and guided coding in AI IDEs | 10 public MCP tools; multi-prompt support; plugin distribution |
| cloudflare/skills | https://github.com/cloudflare/skills | Agent Skills for Cloudflare Workers, Agents SDK, Durable Objects, email, turnstile, web perf, wrangler | Cloudflare developers building edge AI agents | Multi-agent IDE support; 5 MCP servers; slash commands for agents/MCP |
| vercel-labs/agent-skills | https://github.com/vercel-labs/agent-skills | Vercel/Next.js/React skills (vercel-optimize, react-best-practices, web-design-guidelines, deployment) | Frontend engineers deploying React apps on Vercel | Metrics-first audits; 40–100+ rules; skills.sh catalog |

### 2.5 Security Skills

| Resource | URL | What it covers | Target audience | Key features |
|----------|-----|----------------|-----------------|--------------|
| trailofbits/skills | https://github.com/trailofbits/skills/tree/main/plugins/building-secure-contracts/skills/solana-vulnerability-scanner | AI-assisted static review for six Solana vulnerability classes | Security auditors; devs doing pre-audit scans | Six patterns (arbitrary CPI, PDA validation, signer/ownership checks, sysvar spoofing, account lifecycle) |
| safe-solana-builder | https://github.com/Frankcastleauditor/safe-solana-builder | Security-first AI skill for writing production-grade Solana programs | Solana devs using AI coding workflows | Framework selection; risk assessment; curated security rules; project scaffold; LiteSVM testing |
| QEDGen/solana-skills | https://github.com/QEDGen/solana-skills | Spec-driven formal verification toolkit for Solana | High-assurance protocol teams | `.qedspec` source of truth; Kani, Lean 4, proptest; Miri UB detection; deploy-safety lint |

### 2.6 Startup / GTM Skills

| Resource | URL | What it covers | Target audience | Key features |
|----------|-----|----------------|-----------------|--------------|
| Colosseum Copilot | https://github.com/ColosseumOrg/colosseum-copilot | Startup research tool with hackathon submission search, crypto archive search, idea-vetting workflow | Solana/crypto founders, hackathon participants, investors | 5,400+ hackathon submissions; 84,000+ archived docs; 8-step research workflow |
| solana-new | https://github.com/sendaifun/solana-new | End-to-end builder platform: 25 journey skills, 106 repos, 78 ecosystem skills, 36 MCP servers, 515+ ideas | Aspiring Solana founders, indie hackers, hackathon teams | Learn → Idea → Build → Launch phases; `.superstack/` context files; solana.new installer |

## 3. Gaps and Overlaps

### 3.1 Gaps in the Ecosystem

| Gap | Why it matters | Bootcamp fit |
|-----|----------------|--------------|
| Beginner onboarding skill anchored to a live 6-week curriculum | Existing skills target practitioners who already know the stack; no learning-journey skill exists | Strong — the bootcamp is literally a structured journey |
| PDA seed-debugging mini-skill | `solana-dev-skill` covers PDA theory; none provide a step-by-step debugging protocol for seed mismatches | Strong — Week 2 exercise produced seed-mismatch experience |
| Devnet verification checklist skill | All skills mention Explorer verification; none package it as a reusable agent workflow | Strong — bootcamp emphasizes verify-on-chain discipline |
| Token-2022 extension recipes | Advanced skill mentions confidential transfers; few practical extension walkthroughs exist | Strong — bootcamp has Token-2022 exercise |
| AI Ramp / progressive-independence skill | No skill teaches how to use AI assistants less over time | Strong — this is the bootcamp philosophy |
| Social-content skill for Solana builders | `social-content-strategy` exists but no Solana-specific building-in-public skill | Moderate — bootcamp generates posts/videos |
| Rust-to-Anchor mental-model bridge | `eth-to-sol-skill` addresses EVM migration; no equivalent for non-EVM beginners | Moderate — bootcamp learners often have non-Rust backgrounds |

### 3.2 Overlaps

| Overlap | Notes | Implication |
|---------|-------|-------------|
| Anchor program guidance | Covered by `solana-dev-skill`, `safe-solana-builder`, SendAI skills, Helius skills | Avoid another generic Anchor skill; specialize |
| Jupiter DeFi | Covered by `jup-ag/agent-skills` and SendAI Jupiter skill | Avoid duplicating; contribute upgrades or complementary examples |
| Security checklists | `solana-dev-skill`, `safe-solana-builder`, Trail of Bits scanner overlap on common patterns | Differentiate by focusing on learning-oriented security |
| MCP server tooling | Helius, SendAI, Solana AI Kit all ship MCP tools | Build *consumers* of MCP data for learning, not another generic MCP |

## 4. Bootcamp Augmentation Mapping

The bootcamp already produces durable artifacts. This section maps each artifact type to a skill contribution opportunity.

| Bootcamp artifact | Existing skill gap it fills | Contribution form |
|-------------------|----------------------------|-----------------|
| Week 1 notes (account model, PDAs, transactions) | No beginner mental-model skill | PR to `solana-dev-skill` adding a `LEARNING.md` or standalone `solana-learning-skill` |
| Week 2 `hello-solana` + `counter-pda` | PDA seed-debugging workflow absent | Add `pda-debugger` skill with seed-mismatch decision tree |
| Devnet Explorer screenshots / tx links | Verification is mentioned but not operationalized | Add `verify-on-devnet` skill / command checklist |
| `first-token` exercise | SPL token creation recipes scattered | Add `spl-token-recipes` skill |
| `token-2022` exercise | Few practical Token-2022 extension examples | Add `token-2022-extensions-recipes` skill |
| Social posts / viral threads | No Solana building-in-public content skill | Add `solana-build-in-public` skill or templates |
| Remotion videos | No Solana video-template skill | Add `solana-demo-video` skill (optional, lower priority) |
| Weekly learning log / reflection | No learning-journey tracking skill | Add `solana-bootcamp-journal` skill / tracker templates |
| Error/debug notes | Debugging workflows exist but not learner-focused | Contribute "common bootcamp errors" reference to `solana-errors-and-compat` |

## 5. Contribution Strategy

### 5.1 Recommended Order

Order is based on: **(a)** alignment with Superteam bounty, **(b)** reuse of existing bootcamp artifacts, **(c)** low duplication risk.

| Phase | Deliverable | Format | Primary upstream | Evidence to include | Timeline |
|-------|-------------|--------|------------------|---------------------|----------|
| 1 | `solana-verify-loop` skill | SKILL.md + command checklist + examples | PR to `solana-dev-skill` or new skill repo | Screenshots of Explorer verification; tx signatures | Week 2–3 |
| 2 | `pda-debugger` mini-skill | SKILL.md + seed-mismatch flowchart | PR to `solana-dev-skill` or Solana AI Kit submodule | counter-pda code + passing tests | Week 3–4 |
| 3 | `spl-token-recipes` skill | SKILL.md + scripts | SendAI skills or new repo | first-token deployed mint + transfer tx | Week 4–5 |
| 4 | `token-2022-extensions-recipes` skill | SKILL.md + extension decoder scripts | SendAI skills or new repo | Token-2022 mint + extension screenshots | Week 5–6 |
| 5 | `solana-learning-journey` skill | SKILL.md + weekly log templates + AI Ramp guidance | New repo / Solana AI Kit submodule | Full bootcamp notes and published posts | Week 6+ |
| 6 | `solana-build-in-public` skill | SKILL.md + post templates + Remotion storyboard templates | New repo / optional | Published posts + video assets | Week 6+ |

### 5.2 Why This Order

1. **Verify-loop skill** leverages the most distinctive bootcamp habit and is the easiest to produce from existing Explorer proofs.
2. **PDA debugger** turns a real pain point (seed mismatches) into a reusable agent workflow with minimal code.
3. **SPL token recipes** and **Token-2022 recipes** fill visible gaps in DeFi/infra skills without competing with Jupiter/Helius protocol deep-dives.
4. **Learning-journey skill** becomes the capstone: it packages the entire bootcamp as a reusable curriculum skill.
5. **Build-in-public skill** is valuable but lower priority unless the user wants to specialize in content.

### 5.3 Format Standard

Each skill should follow the Agent Skills / Solana AI Kit structure observed in the reference repos:

- `README.md` — problem, install steps, usage
- `SKILL.md` — entry-point instructions for the agent
- `agents/` or `skill/` — context files, rules, commands
- `examples/` — runnable scripts or code snippets
- `LICENSE` — MIT for Superteam compatibility
- `.mcp.json` or MCP hints only if the skill consumes live data

## 6. Superteam Skills Bounty Alignment

### 6.1 What the Bounty Rewards

| Attribute | Details |
|-----------|---------|
| Sponsor | Superteam Brasil |
| Total pool | 3,000 USDG |
| Winners | 10 (1st–5th: 400 USDG; 6th–10th: 200 USDG) |
| Core ask | Production-grade AI/agent skills (or upgrades to seeded skills) that solve real problems for Solana founders and engineers and can be merged/submoduled into the Solana AI Kit |
| Categories | Other, Content, Blockchain, Backend, Design |
| Submission | Public GitHub repo or PR link + README + SKILL.md + questionnaire |
| License | MIT |

Source: https://superteam.fun/earn/listing/skills/

### 6.2 Likely Prioritized Categories

Based on the seeded skills referenced (`crypto-legal-skill`, `position-manager-skill`, `solana-auditor-skill`) and the kit's structure:

| Priority | Category | Rationale |
|----------|----------|-----------|
| High | Blockchain | Directly expands Solana program/chain capabilities |
| High | Backend | DeFi integrations, tooling, MCP consumers |
| Medium | Content | Learning, documentation, building-in-public skills |
| Medium | Other | Cross-domain or novel skill concepts |
| Lower | Design | Less central to the Solana AI Kit's current architecture |

### 6.3 Positioning Recommendations

To maximize bounty alignment:

1. **Frame submissions as kit extensions.** Reference the Solana AI Kit submodule pattern and `solana-game-skill` structure explicitly.
2. **Solve a real builder problem.** "Bootcamp learners repeatedly deploy programs and then wonder if they're really on-chain" → `solana-verify-loop` skill.
3. **Show production readiness.** Include working scripts, tested on devnet, with Explorer links and tx signatures as evidence.
4. **Keep the skill token-efficient.** Use progressive disclosure (main `SKILL.md` + reference files) like `solana-dev-skill` does.
5. **Target Blockchain/Backend for code skills, Content for learning skills.** Submit each skill separately rather than bundling many unrelated ideas.
6. **Consider upgrading a seeded gap.** If the user wants the strongest bounty shot, an upgrade to `solana-auditor-skill` aligned with Trail of Bits / safe-solana-builder patterns is competitive — but requires deeper security work.
7. **MIT license from day one.** Non-negotiable for merging/submoduling.

### 6.4 Bounty Risk Factors

- **High competition** in security and DeFi categories; differentiation is harder.
- **Content/learning skills** may score lower on "production-grade" unless tightly tied to runnable code.
- **Novelty matters.** The sponsor explicitly says the best ideas may be ones they have not listed.

## 7. Conclusions and Next Steps

1. **The bootcamp project is well-positioned to contribute learning-oriented skills** that the Solana AI Kit ecosystem currently lacks, rather than competing with mature DeFi/security skills.
2. **Highest-value near-term contribution:** a `solana-verify-loop` skill that packages the bootcamp's on-chain verification discipline into an agent-usable checklist.
3. **Most distinctive long-term contribution:** a `solana-learning-journey` skill that encodes the 6-week AI Ramp curriculum as reusable agent guidance.
4. **Best bounty positioning:** submit each skill as a focused, MIT-licensed repo with runnable devnet examples, Explorer evidence, and explicit Solana AI Kit integration steps.
5. **Immediate action:** finalize the `solana-verify-loop` skill skeleton after the next bootcamp exercise, using existing Explorer screenshots and tx links as evidence.

## 8. References

- Solana AI Kit: https://github.com/solanabr/solana-ai-kit
- solana-game-skill: https://github.com/solanabr/solana-game-skill
- solana-dev-skill: https://github.com/solana-foundation/solana-dev-skill
- eth-to-sol-skill: https://github.com/solana-foundation/eth-to-sol-skill
- sendaifun/skills: https://github.com/sendaifun/skills
- jup-ag/agent-skills: https://github.com/jup-ag/agent-skills
- helius-labs/core-ai: https://github.com/helius-labs/core-ai
- cloudflare/skills: https://github.com/cloudflare/skills
- vercel-labs/agent-skills: https://github.com/vercel-labs/agent-skills
- trailofbits/skills: https://github.com/trailofbits/skills/tree/main/plugins/building-secure-contracts/skills/solana-vulnerability-scanner
- frankcastleauditor/safe-solana-builder: https://github.com/Frankcastleauditor/safe-solana-builder
- QEDGen/solana-skills: https://github.com/QEDGen/solana-skills
- ColosseumOrg/colosseum-copilot: https://github.com/ColosseumOrg/colosseum-copilot
- sendaifun/solana-new: https://github.com/sendaifun/solana-new
- Superteam skills bounty: https://superteam.fun/earn/listing/skills/
