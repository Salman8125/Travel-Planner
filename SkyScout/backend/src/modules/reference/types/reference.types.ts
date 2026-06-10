export interface AirportDTO {
  id: string;
  iataCode: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
}

export interface AirlineDTO {
  id: string;
  iataCode: string;
  name: string;
}

export interface CreateAirportInput {
  iataCode: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
}

export type UpdateAirportInput = Partial<CreateAirportInput>;

export interface CreateAirlineInput {
  iataCode: string;
  name: string;
}

export type UpdateAirlineInput = Partial<CreateAirlineInput>;
