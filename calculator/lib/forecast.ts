export interface ForecastInput {
  revenue: number;
  averageOrderValue: number;
  leadResponseRate: number;
  prospectResponseRate: number;
}

/** Keep full precision between stages; round only when displaying people. */
export function calculateForecast(input: ForecastInput) {
  const { revenue, averageOrderValue, leadResponseRate, prospectResponseRate } = input;
  if (
    !Object.values(input).every(Number.isFinite) ||
    revenue < 0 || averageOrderValue <= 0 ||
    leadResponseRate <= 0 || leadResponseRate > 100 ||
    prospectResponseRate <= 0 || prospectResponseRate > 100
  ) return null;

  const customers = revenue / averageOrderValue;
  const leads = customers * 100 / leadResponseRate;
  const prospects = leads * 100 / prospectResponseRate;
  if (![customers, leads, prospects].every(Number.isFinite)) return null;
  return { customers, leads, prospects };
}
