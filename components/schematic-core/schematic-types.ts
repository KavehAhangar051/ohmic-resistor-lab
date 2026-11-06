export type SymbolStandard = 'ieee' | 'iec';

export interface ResistorMetricBadge {
  text: string;
  color?: string; // e.g. '#fbbf24' or '#34d399'
  bgColor?: string;
  borderColor?: string;
  width?: number;
}

export interface SchematicLegendItem {
  label: string;
  color: string;
  marker?: 'circle' | 'square' | 'dash';
  textColor?: string;
}
