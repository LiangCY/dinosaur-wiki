export interface DinosaurImage {
  url: string;
  description: string;
}

export interface Dinosaur {
  id: string;
  name: string;
  scientific_name: string;
  era: string;
  period: string;
  start_mya: number;
  end_mya: number;
  diet: string;
  length_min_meters?: number;
  length_max_meters?: number;
  weight_min_tons?: number;
  weight_max_tons?: number;
  habitat?: string;
  region?: string;
  description?: string;
  taxonomy_kingdom?: string;
  taxonomy_phylum?: string;
  taxonomy_class?: string;
  taxonomy_order?: string;
  taxonomy_suborder?: string;
  taxonomy_family?: string;
  taxonomy_subfamily?: string;
  taxonomy_genus?: string;
  taxonomy_species?: string;
  images?: DinosaurImage[];
  created_at: string;
  updated_at: string;
}

export interface DinosaurCharacteristic {
  id: string;
  dinosaur_id: string;
  feature_type: string;
  description: string;
  created_at: string;
}

export interface DinosaurFossil {
  id: string;
  dinosaur_id: string;
  discovery_location: string;
  discovery_date?: string;
  fossil_type: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface DinosaurDetail extends Dinosaur {
  characteristics: DinosaurCharacteristic[];
  fossils: DinosaurFossil[];
}