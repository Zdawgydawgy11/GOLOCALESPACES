# Market Space - Financial Model Generator

## Overview

This Python script generates a comprehensive 5-year financial model for Market Space (marketplace/SaaS hybrid) suitable for investor presentations. The model outputs a professional Excel workbook with detailed projections, SaaS metrics, and break-even analysis.

## Quick Start

### 1. Install Dependencies

```bash
pip install openpyxl pandas numpy
```

### 2. Run the Script

```bash
python financial-model.py
```

### 3. Output

The script generates `saas_financial_model.xlsx` in the same directory with the following sheets:

- **Executive Summary**: Key highlights and investment case
- **Assumptions**: All model inputs (BLUE colored = editable)
- **Revenue Model**: Monthly revenue projections with customer segmentation
- **Expenses**: Operating expense breakdown by category
- **Cash Flow**: Cash flow statement with funding events
- **Metrics Dashboard**: SaaS-specific KPIs and benchmarks
- **Break-Even Analysis**: Path to profitability visualization

## Model Features

### Revenue Model
- **Marketplace Commission**: 10% host fee + 5% renter fee on transactions
- **Subscription Tiers**: Free, Premium ($29.99/mo), Pro ($99.99/mo)
- **Customer Segmentation**: Hosts (free/premium/pro) and Renters
- **Growth Projections**: 15% MoM (Y1) declining to 5% MoM (Y4-5)
- **Conversion Funnels**: Free→Premium (8%), Premium→Pro (5%)
- **Expansion Revenue**: Upsells and cross-sells

### Expense Model
- **Cost of Revenue**: Hosting (8%), payment processing (2.9%), support (12%)
- **Sales & Marketing**: Channel-based CAC calculation
- **R&D**: 25% of revenue (min $20k/month)
- **G&A**: 15% of revenue (min $10k/month)
- **Headcount Planning**: Department-by-department hiring schedule

### SaaS Metrics Calculated
- **MRR/ARR**: Monthly and annual recurring revenue
- **CAC**: Customer acquisition cost by channel
- **LTV**: Lifetime value by customer segment
- **LTV:CAC Ratio**: Target of 3:1 or higher
- **Churn Rate**: By customer tier (3-10% monthly)
- **NRR**: Net revenue retention with expansion
- **Magic Number**: Sales efficiency metric
- **Rule of 40**: Growth rate + profit margin
- **CAC Payback**: Months to recover acquisition cost
- **Gross Margin**: Target 75%+

### Break-Even Analysis
1. **Cash Flow Break-Even**: When monthly revenue = operating expenses
2. **EBITDA Positive**: When EBITDA > $0
3. **Contribution Margin**: Fixed costs covered by gross profit
4. **Unit Economics**: LTV exceeds CAC by 3x
5. **Visualization**: Charts showing path to profitability

## Customization Guide

### Adjusting Assumptions

Edit the `ASSUMPTIONS` dictionary in `financial-model.py`:

```python
ASSUMPTIONS = {
    # PRICING
    'pricing_tiers': {
        'premium_listing': {
            'price_monthly': 29.99,  # ← Change price here
            'commission_rate': 0,
        }
    },

    # GROWTH
    'monthly_growth_rate_y1': 0.15,  # ← 15% per month

    # CHURN
    'churn_rate_premium': 0.05,  # ← 5% monthly churn

    # CAC
    'cac_by_channel': {
        'paid_search': 150,  # ← Cost per customer
        'content_marketing': 75,
    },

    # Starting point
    'starting_cash': 500000,  # ← Initial capital
}
```

### Creating a Business Model Canvas

Create `business-model-canvas.md` in the same directory. The script will automatically extract assumptions from it:

```markdown
# Business Model Canvas - Market Space

## Customer Segments
- Hosts: Property owners with commercial spaces
- Renters: Food trucks, pop-ups, mobile businesses

## Revenue Streams
- Transaction commission: 10-15% per booking
- Premium listings: $29.99/month
- Pro host plans: $99.99/month

## Cost Structure
- Platform hosting: AWS infrastructure
- Payment processing: Stripe fees (2.9%)
- Customer support: Chat + email
- Marketing: Paid search + content
```

### Scenario Modeling

Create multiple scenarios by copying the script and adjusting key variables:

**Conservative Case:**
- Lower growth: `monthly_growth_rate_y1 = 0.10`
- Higher churn: `churn_rate_premium = 0.08`
- Higher CAC: Increase all channels by 50%

**Aggressive Case:**
- Higher growth: `monthly_growth_rate_y1 = 0.20`
- Lower churn: `churn_rate_premium = 0.03`
- Viral growth: Increase `channel_mix['referral'] = 0.40`

## Understanding the Excel Output

### Color Coding
- **BLUE cells**: Input assumptions (you can edit these)
- **BLACK cells**: Calculated values (formulas)
- **GREEN cells**: Revenue metrics
- **RED cells**: Cost metrics
- **YELLOW cells**: Key performance indicators

### Key Formulas

**LTV Calculation:**
```
LTV = (ARPU × Gross Margin %) / Monthly Churn Rate
```

**LTV:CAC Ratio:**
```
Ratio = LTV / CAC
Target: 3.0 or higher
```

**Magic Number:**
```
Magic Number = (New ARR in Quarter) / (Sales & Marketing Spend in Previous Quarter)
Target: 0.75 or higher
```

**Rule of 40:**
```
Rule of 40 = Revenue Growth % + EBITDA Margin %
Target: 40% or higher
```

**CAC Payback Months:**
```
Payback = CAC / (ARPU × Gross Margin %)
Target: 12 months or less
```

## Investor-Ready Features

### Executive Summary
- **Headline Metrics**: ARR growth, customer growth, unit economics
- **5-Year Trajectory**: Starting point to exit
- **Break-Even Milestones**: When the business becomes sustainable

### Sensitivity Analysis
Manually test scenarios in Excel by changing assumptions:
1. What if churn increases 2%?
2. What if pricing increases 20%?
3. What if CAC doubles?

### Funding Strategy
The model includes:
- **Seed Round**: Month 6, $1M, 20% dilution
- **Series A**: Month 18, $5M, 25% dilution

Adjust timing and amounts in assumptions:
```python
'seed_round': {'timing': 'M6', 'amount': 1000000, 'dilution': 0.20},
'series_a': {'timing': 'M18', 'amount': 5000000, 'dilution': 0.25},
```

## Benchmarking

### Industry Standards (SaaS/Marketplace)

| Metric | Target | Your Model (Y5) |
|--------|--------|-----------------|
| LTV:CAC Ratio | 3:1 | Check Metrics Dashboard |
| CAC Payback | ≤ 12 months | Check Metrics Dashboard |
| Gross Margin | ≥ 70% | Check Metrics Dashboard |
| Magic Number | ≥ 0.75 | Check Metrics Dashboard |
| Rule of 40 | ≥ 40 | Check Metrics Dashboard |
| Annual Churn | ≤ 25% | Derived from monthly |
| NRR | ≥ 100% | Check Metrics Dashboard |

### Marketplace Benchmarks
- **Take Rate**: 10-20% (You: 15% blended)
- **Gross Margin**: 60-80% (You: Check model)
- **Burn Multiple**: <1.5x (ARR growth per $ burned)

## Troubleshooting

### Error: "Module not found: openpyxl"
```bash
pip install openpyxl
```

### Error: "Permission denied" when saving Excel
Close any open instances of `saas_financial_model.xlsx` and run again.

### Warning: "Break-even not achieved"
This means the model doesn't reach profitability in 5 years. Consider:
- Increasing pricing
- Reducing churn
- Lowering CAC
- Adding more aggressive growth assumptions

### Negative Cash Balance
The model shows when you'll run out of cash. Solutions:
- Adjust funding rounds (amount/timing)
- Reduce burn rate (lower opex)
- Accelerate revenue growth

## Advanced Customization

### Adding New Revenue Streams

```python
# In ASSUMPTIONS
'pricing_tiers': {
    'your_new_tier': {
        'name': 'Enterprise Plan',
        'price_monthly': 499.99,
        'commission_rate': 0,
        'description': 'White-label solution'
    }
}

# In calculate_revenue_model()
# Add logic to calculate new tier revenue
```

### Custom Metrics

Add your own KPIs in `calculate_metrics()`:

```python
# Example: Customer Concentration Risk
top_10_customers_pct = 0.30  # Top 10 represent 30% of revenue
metrics['concentration_risk'] = top_10_customers_pct
```

### Multi-Currency Support

```python
ASSUMPTIONS['currency'] = 'EUR'
ASSUMPTIONS['exchange_rate'] = 1.10  # USD to EUR

# Adjust all $ values by exchange rate
```

## Best Practices for Investor Presentations

### 1. Start Conservative
Use realistic assumptions investors will believe:
- Churn: 5-7% monthly
- CAC: Based on actual channel data
- Growth: Evidence-based (not "hockey stick")

### 2. Show Your Work
Include footnotes in Excel explaining:
- Where assumptions come from
- Market research sources
- Competitive benchmarks

### 3. Scenario Planning
Present 3 cases side-by-side:
- **Base Case**: Most likely outcome
- **Conservative**: If growth is slower
- **Aggressive**: Best-case scenario

### 4. Focus on Unit Economics
Investors care most about:
- Is LTV > 3x CAC?
- Is CAC payback < 12 months?
- Is gross margin > 70%?

### 5. Clear Path to Break-Even
Show exactly when you become:
- Cash flow positive
- EBITDA positive
- Self-sustaining

## Support & Updates

### Questions?
Review the code comments in `financial-model.py` - every function is documented.

### Extending the Model
The code is modular:
- `SaaSFinancialModel` class: All calculations
- `ExcelGenerator` class: All Excel output
- `ASSUMPTIONS` dict: All inputs

### Version History
- **v1.0** (2025): Initial release for Market Space

## License

This financial model is provided as-is for Market Space. Customize freely for your business needs.

---

**Generated by**: Claude Code
**For**: Market Space Financial Planning
**Date**: 2025-12-08
