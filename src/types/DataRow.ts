export default interface DataRow {
    measure: string;
    denominator_definition: string;
    stratification: string;
    total_n: string | number;
    idd_estimate_numeric: string | number;
    idd_error: string | number;
    non_idd_estimate_numeric: string | number;
    non_idd_error: string | number;
    difference_in_estimates: string | number;
    p_value: string | number;
    outcome_count: string | number;
    p_significant: string | number;
    outcome_directionality: string | number;
    idd_estimate_string: string;
    non_idd_estimate_string: string;
    stratification_category: string;
}