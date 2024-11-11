import DataRow from "./DataRow";

export default interface DisplayRow extends DataRow {
    index: number;
    stratification_display: string;
}