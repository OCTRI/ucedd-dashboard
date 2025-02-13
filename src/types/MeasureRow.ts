interface MeasureRow {
  measure: string;
  is_rate: string;
  definition: string;
  chart_all: string;
  chart_age: string;
  chart_race_and_ethnicity: string;
  chart_residency: string;
  chart_sex: string;
  description_all: string;
  description_age: string;
  description_race_and_ethnicity: string;
  description_residency: string;
  description_sex: string;
  key_terms_all: string;
  key_terms_age: string;
  key_terms_race_and_ethnicity: string;
  key_terms_residency: string;
  key_terms_sex: string;
}

function isRate(row: MeasureRow): boolean {
  return Number(row.is_rate) === 1;
}

export { isRate };
export type { MeasureRow };

