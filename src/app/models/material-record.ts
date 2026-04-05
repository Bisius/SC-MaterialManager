export interface MaterialRecord {
  id: string;
  material: string; // short code (e.g. 'AGC')
  quality: number;  // purity percentage 0-100
  quantity: number; // amount in cSCU
  location: string; // location name
}
