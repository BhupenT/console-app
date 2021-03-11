export interface Products {
  [key: string]: any;
}

export type DESC = string;
export type ASC = string;

export interface Sort {
  byField: string;
  sortOrder: DESC | ASC;
}
export interface File {
  name: string;
  type: string;
  sort: Sort;
}

export interface TargetFields {
  products: string;
  extraMeta: string;
}

export interface ExportProductsConfigSettings {
  productCatalogUrl: string;
  extraMetaUrl: string;
  file: File;
  targetFields: TargetFields;
}
