import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface HotelOption {
  hotelId: string;
  name: string;
  starRating: number;
  pricePerNight: number;
  totalPrice: number;
  amenities: string[];
}

@Injectable({ providedIn: 'root' })
export class HotelService {
  readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  searchHotels(city: string, nights: number): Observable<HotelOption[]> {
    return this.http.post<HotelOption[]>(`${this.apiUrl}/search_hotels`, { city, nights });
  }
}
