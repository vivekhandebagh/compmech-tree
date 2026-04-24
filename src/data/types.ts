export type RowId = number;

export interface TaxonomyRow {
  id: RowId;
  name: string;
  short: string;
  blurb: string;
  color: string;
}

export interface Taxonomy {
  rows: TaxonomyRow[];
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue?: string;
  arxiv_id?: string;
  doi?: string;
  abstract?: string;
  url?: string;
  primary_row: RowId;
  secondary_rows: RowId[];
  cites_in_corpus: string[];
  landmark?: boolean;
}

export interface Corpus {
  papers: Paper[];
  taxonomy: Taxonomy;
}
