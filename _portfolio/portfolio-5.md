---
title: "ChainLancer"
excerpt: "Group project for NUS IS4302 Blockchain and Distributed Ledger Technologies. A decentralized freelance escrow platform built on Ethereum smart contracts, with milestone-based escrow, on-chain dispute resolution, soulbound reputation scoring, and a React/Vite frontend. Available [on GitHub](https://github.com/Michael-wzl/ChainLancer)."
collection: portfolio
---

ChainLancer (also named **GigSecure** as the website display name) is a **decentralized freelance escrow platform** built on Ethereum smart contracts. Clients post milestone-based jobs with funds locked in escrow; freelancers apply, deliver work, and get paid automatically when milestones are approved. A built-in dispute resolution system and on-chain reputation scoring keep both sides accountable.

See the [GitHub repo](https://github.com/Michael-wzl/ChainLancer) and [live app](https://www.cyng268.app) for more details.

**Tech stack:** Solidity 0.8.24 · Hardhat · OpenZeppelin (UUPS upgradeable) · React 18 · Vite · Tailwind CSS · ethers.js v6 · Redux Toolkit · IPFS (Pinata)

## Smart Contract Architecture

All core contracts are deployed behind **UUPS proxies** for upgradeability and use OpenZeppelin `AccessControlDefaultAdminRulesUpgradeable` for time-delayed admin transfers.

| Contract | Responsibility |
| --- | --- |
| **JobEscrow.sol** | Job lifecycle, milestone management, escrow locking/release, configurable timeouts, cancellation. Single authoritative source of fund and milestone state. |
| **Dispute.sol** | Dispute creation, evidence submission, platform judge ruling. Does not hold funds — calls back into `JobEscrow` to redistribute. |
| **Reputation.sol** | Soulbound (non-transferable) on-chain reputation scores for clients and freelancers. Updated synchronously by `JobEscrow` on milestone completion or dispute conclusion. |
| **DataAvailability.sol** | On-chain CID registry, pinning confirmation records, retention period enforcement. Emits `CIDRegistered` events consumed by the platform's IPFS pinning node. |
| **PlatformRoles.sol** | Library defining role constants (`ESCROW_ROLE`, `DISPUTE_ROLE`, `PLATFORM_ADMIN`, `PLATFORM_JUDGE`, etc.) used across all contracts. |

## Job Lifecycle (Happy Path)

1. **Client** calls `postJob()` — locks 100% of job value (USDC) in escrow, chooses review timeout $T_{\text{review}} \in \{1d, 3d, 7d, 14d, 21d, 30d\}$, posts behavior bond (graduated by reputation tier: 7.5% / 5% / 2.5% / 1%), and uploads encrypted agreement to IPFS.
2. **Freelancers** call `applyForJob()` — no deposit required to apply.
3. **Client** calls `selectFreelancer()` — starts a 3-day stake window.
4. **Freelancer** calls `confirmAndStake()` — locks a graduated deposit; job becomes **Active**.
5. **Freelancer** calls `submitMilestone()` — uploads encrypted deliverable to IPFS; review timer starts.
6. **Client** calls `approveMilestone()`, or the timer auto-approves after $T_{\text{review}}$.
7. Milestone USDC (minus 2% protocol fee) is credited to the freelancer's withdrawable balance via a **pull-over-push** pattern.
8. After the final milestone, deposits and behavior bonds are refunded and reputation is updated for both parties.

## Dispute Resolution

When a milestone is under review, either party can call `raiseDispute()` (paying a scaled fee: $\max(50\text{ USDC},\; 10\% \times V_{\text{milestone}})$). This freezes the milestone funds and pauses the auto-approve timer. The dispute flow:

1. **Evidence phase** (5 days) — both parties submit encrypted evidence to IPFS.
2. **Judge assignment** — a `PLATFORM_ADMIN` assigns a judge with an ephemeral keypair.
3. **Key distribution** (2 days) — both parties encrypt the job symmetric key $K_{job}$ for the judge.
4. **Review & ruling** (14 days) — judge decrypts content and submits a ruling on-chain.
5. **Execution** — `executeRuling()` atomically redistributes funds, updates reputation, and revokes the judge's role.

Rulings support **parameterized fund splits** (`freelancerShareBps`) for proportional rather than all-or-nothing decisions.

## Security & Privacy Model

- **Pull-over-push payments** — all payouts are credited to `withdrawableBalances[address]`; recipients call `withdraw()` to claim.
- **State mutex** — every state-mutating function enforces `require(milestone.status == EXPECTED_STATUS)` before updating, preventing race conditions between competing calls in the same block.
- **Idempotent terminal operations** — guarded by a `fundsProcessed` flag; repeated calls are no-ops.
- **Per-job symmetric key** ($K_{job}$) — all content (agreement, deliverables, evidence) is AES-256 encrypted before IPFS upload; no plaintext on-chain.
- **Ephemeral per-dispute judge keypair** — each dispute uses a fresh ephemeral keypair so compromising a judge's long-term key does not expose historical disputes.
- **Tamper-proof verification** — `agreementHash = keccak256(salt ‖ plaintext)` on-chain, with a random 256-bit salt embedded in the encrypted IPFS payload to prevent confirmation attacks.
- **ReentrancyGuard** on all fund-transferring functions.

## Reputation & Incentive Design

**Freelancer score:**
$$\text{score} = \sum_{i} \left( V_i \times m_i \right) \div \left(1 + L \times 0.3 + C \times 0.1 \right)$$

**Client score:**
$$\text{score} = \text{totalValueCompleted} \times \frac{\text{jobsCompleted}}{\text{jobsPosted}} \div \left(1 + L \times 0.3 + C \times 0.1 + A \times 0.05 \right)$$

Scores are **soulbound** (non-transferable) and determine a user's trust tier (New / Bronze / Silver / Gold), which in turn sets their required deposit/bond rate (7.5% → 1%). Higher trust means lower capital requirements.

## Frontend

The React 18 + Vite frontend connects to the smart contracts via ethers.js v6. It supports:

- MetaMask wallet connection and network switching
- Job posting, browsing, and application flows
- Milestone submission and approval UI
- Dispute evidence submission and ruling display
- On-chain reputation and tier display
- IPFS file uploads via Pinata

The app is deployed via **Azure Static Web Apps** with a GitHub Actions CI/CD pipeline.
