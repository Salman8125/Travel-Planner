# Roost (hotels) contract

Product: **Roost** — hotel search. Backend stack: **Java + Spring Boot**. Published port: **4002**.

> Language-neutral contract. The Roost backend implements its OWN native types (records).
> NO shared code package. This backend does NOT import or call any other backend.

## Data shapes

### HotelOption
| field         | type      | notes                                       |
|---------------|-----------|---------------------------------------------|
| hotelId       | string    | unique id, e.g. `"HT-2001"`                 |
| name          | string    | e.g. `"The Thames View"`                    |
| starRating    | integer   | 1–5                                         |
| pricePerNight | number    | USD per night (BigDecimal in Java)          |
| totalPrice    | number    | USD for the requested stay                  |
| amenities     | string[]  | e.g. `["WiFi","Breakfast","Pool"]`          |

## Endpoints

### POST /search_hotels
Search hotels in a city for a number of nights.

Request body:
```json
{ "city": "London", "nights": 3 }
```
`city` optional (case-insensitive; omitted = all mock hotels). `nights` optional, default `1`;
`totalPrice = pricePerNight * nights`.

Response: `HotelOption[]`
```json
[
  {
    "hotelId": "HT-2001",
    "name": "The Thames View",
    "starRating": 4,
    "pricePerNight": 180.0,
    "totalPrice": 540.0,
    "amenities": ["WiFi", "Breakfast", "Pool"]
  }
]
```

### POST /get_hotel_details
Return the single hotel matching a `hotelId` (typed as `HotelOption[]`, 0 or 1 element).

Request body:
```json
{ "hotelId": "HT-2001" }
```

Response: `HotelOption[]` (empty array if not found).

## CORS
Permissive (dev only): allow any origin, methods `POST, OPTIONS`, header `Content-Type`.
