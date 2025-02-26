# UCEDD Dashboard

This Vue application displays the 2022 summary data for Medicaid members provided by CHSE. The source data provided by CHSE was transformed using an R-script available [here](https://source.ohsu.edu/OCTRI-Apps/ucedd-data-transformation/tree/main).

This application is hosted as a Github Page: [https://octri.github.io/ucedd-dashboard/](https://octri.github.io/ucedd-dashboard/). See the Actions tab for the automated deployment configuration.

## Dependencies

The application is built using [Vite](https://vite.dev/), which depends on [Node.js](https://nodejs.org/en).

A good way to install multiple, isolated versions of Node.js is [nvm](https://github.com/nvm-sh/nvm). On Macs, you can install nvm using Homebrew.

```
brew install nvm
```

Install Node.js 22 and use it.

```
nvm install v22
nvm use
```

Finally, install the dependencies using `npm`.

```
npm install
```

## Running Locally

The Vite dev server can be used to run the application locally.

```
npm run dev
```

This will serve the application at https://localhost:8000/ucedd-dashboard/. Vite performs hot module replacement, so your changes will immediately be reflected in the browser.

## Data Overview

The data.csv file included contains the following columns:

|Column|Purpose|
|------|-------|
|measure|The measure of interest (e.g., 30-Day All-Cause Readmissions)|
|denominator_definition|Definition of the subcategory being measured|
|stratification|Shortened definition of the subcategory being measured|
|total_n|The count of people in the subcategory being measured|
|idd_estimate_numeric|The numeric portion of the estimate for the IDD population|
|idd_error|The error portion of the estimate for the IDD population for measures reported as a rate|
|non_idd_estimate_numeric|The numeric portion of the estimate for the Non-IDD population|
|non_idd_error|The error portion of the estimate for the non-IDD population for measures reported as a rate|
|difference_in_estimates|The raw difference between the two numeric estimates|
|p_value|The statistical measurement used to determine whether the differences are significant|
|outcome_count|1 if the outcome is reported as a rate (mean(sd) per 1000 member years) and 0 if the outcome is binary (percent).|
|p_significant|1 if the p-value is significant (p<0.05), 0 if not (p>0.05)|
|outcome_directionality|1 if the results indicate poorer outcomes for the non-IDD community and 0 if the results indicate poorer outcomes for the IDD community. NA signifies either missing data or insignificant outcomes.|
|idd_estimate_string|The original estimate for the IDD population which may be a single number or a mean with standard deviation depending on the measure.|
|non_idd_estimate_string|The original estimate for the non-IDD population which may be a single number or a mean with standard deviation depending on the measure.|
|stratification_category|The overall category the stratification falls into (i.e., Age, Sex, etc.)|

The measures.csv file provides information about each measure, including a summary and text that will display on charts and the Description section based on the slice of data selected. All columns except "measure" and "description" are optional.

|Column|Purpose|
|------|-------|
|measure|The measure of interest (e.g., 30-Day All-Cause Readmissions)|
|is_rate|Whether the measure is reported as a rate (1) or as a percent (0)|
|definition|Definition of the measure for display on the Description page|
|chart_all|A short key finding for the overall measure to display as a chart subtitle|
|chart_age|A short key finding for the measure by age to display as a chart subtitle|
|chart_race_and_ethnicity|A short key finding for the measure by race and ethnicity to display as a chart subtitle|
|chart_residency|A short key finding for the measure by residency to display as a chart subtitle|
|chart_sex|A short key finding for the measure by sex to display as a chart subtitle|
|description_all|HTML text for the overall measure to summarize key findings|
|description_age|HTML text for the measure by age to summarize key findings|
|description_race_and_ethnicity|HTML text for the measure by race_and_ethnicity to summarize key findings|
|description_residency|HTML text for the measure by residency to summarize key findings|
|description_sex|HTML text for the measure by sex to summarize key findings|
|key_terms_all|HTML text for the key terms related to the overall measure|
|key_terms_age|HTML text for the key terms related to the measure by age|
|key_terms_race_and_ethnicity|HTML text for the key terms related to the measure by race_and_ethnicity|
|key_terms_residency|HTML text for the key terms related to the measure by residency|
|key_terms_sex|HTML text for the key terms related to the measure by sex|
