export type MapPoint = {
  latitude: number;
  longitude: number;
  label: string;
  neighbourhood: string;
  city: string;
};

export type MapVariant = "pickup" | "trip";
