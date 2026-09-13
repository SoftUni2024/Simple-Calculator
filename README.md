# LeadPredictor

A responsive campaign calculator inspired by the provided screenshot.

## Open the website (no installation needed)

Double-click **index.html** in the project root to open the working calculator in your browser. Keep `styles.css` and `scripts.js` alongside it. The page works offline, including the calculations, chart, date controls, sliders, language selector, and currency labels. No server or Node.js installation is required for this version.

The root website files are:

- `index.html` — calculator page
- `styles.css` — responsive dark layout
- `scripts.js` — calculations, validation, chart, and interactions

## Run the React development version (optional)

    cd calculator
    npm install
    npm run dev

Open the local URL printed by the server.

## Calculations

- Customers = revenue / average order value
- Leads = customers × 100 / lead response rate
- Prospects = leads × 100 / prospect response rate

Calculations retain full precision; displayed people counts round up. The chart shows cumulative targets distributed evenly over the campaign, using approximately 30.44 days per month (up to 24 sampled points). Card percentages represent each stage as a share of prospects. Response rates range from 1% to 100% to avoid division by zero. Currency selects the display unit without conversion. English and Bulgarian labels are supported.

## Verify

    cd calculator
    npx tsc --noEmit
    npm test
    npm run build

The optional read-only WebMCP tool is feature-detected; no supported WebMCP validation context was available during development.

## Git and pull request exercise

The calculator is developed through five retained feature branches targeting `main`. Each change reaches `main` through a GitHub pull request using a merge commit, preserving the individual commits and the explicit revert.

| Branch | Meaningful change |
| --- | --- |
| `feature/calculator-dashboard` | Complete responsive calculator and screenshot-inspired design. |
| `refactor/forecast-calculations` | Shared formula validation and six automated regression tests. |
| `fix/accessible-form-feedback` | Accessible validation messages and document language synchronization. |
| `feature/reset-campaign` | Optional localized control to restore campaign defaults. |
| `revert/reset-and-document-workflow` | Explicitly revert the optional control and document setup, formulas, tests, and repository workflow. |

The reset control is a deliberate, documented revert exercise. Commit `395f6d783cda7a97f98eb3e04de1d57c8d12ddaf` adds a functioning control; `d12a75538c10f8c6a252d24a82cc5c395deb8391` reverts it with `git revert`, restoring the reference layout without rewriting history. The final calculator retains the formula and accessibility improvements.

See the [pull requests](https://github.com/SoftUni2024/Simple-Calculator/pulls?q=is%3Apr) and [branches](https://github.com/SoftUni2024/Simple-Calculator/branches) for the review history. Keep the feature branches after merging so the branch requirement remains verifiable.

To inspect the history locally:

    git fetch origin
    git branch -r
    git log --graph --oneline --all
    git log main --grep=Revert

The test suite covers the screenshot values, fractional precision, zero revenue, full response rates, invalid inputs, and overflow. Additional tests check that the standalone website matches the React calculator and that campaign chart dates and totals are correct.

The follow-up `fix/standalone-calculator-entry` branch adds the directly openable root website through another pull request. The original five branches and revert history remain intact.
