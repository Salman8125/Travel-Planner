create table users (
    id            uuid primary key,
    email         varchar(255) not null unique,
    password_hash varchar(100) not null,
    role          varchar(16)  not null,
    created_at    timestamptz  not null,
    updated_at    timestamptz  not null,
    constraint users_role_chk check (role in ('USER', 'ADMIN'))
);

create table hotels (
    id          uuid primary key,
    name        varchar(160) not null,
    description varchar(2000),
    city        varchar(120) not null,
    country     varchar(2)   not null,
    address     varchar(255),
    star_rating integer      not null,
    latitude    double precision not null,
    longitude   double precision not null,
    timezone    varchar(64)  not null,
    created_at  timestamptz  not null,
    updated_at  timestamptz  not null,
    constraint hotels_star_chk check (star_rating between 1 and 5),
    constraint hotels_city_name_uq unique (city, name)
);
create index hotels_city_idx on hotels (city);

create table hotel_amenities (
    hotel_id uuid not null references hotels (id) on delete cascade,
    amenity  varchar(40) not null,
    primary key (hotel_id, amenity)
);

create table room_types (
    id                   uuid primary key,
    hotel_id             uuid not null references hotels (id) on delete cascade,
    name                 varchar(120) not null,
    description          varchar(2000),
    capacity             integer not null,
    base_price_per_night numeric(12, 2) not null,
    currency             varchar(3) not null,
    created_at           timestamptz not null,
    updated_at           timestamptz not null,
    constraint room_types_capacity_chk check (capacity >= 1),
    constraint room_types_price_chk check (base_price_per_night >= 0),
    constraint room_types_hotel_name_uq unique (hotel_id, name)
);
create index room_types_hotel_idx on room_types (hotel_id);

create table room_type_amenities (
    room_type_id uuid not null references room_types (id) on delete cascade,
    amenity      varchar(40) not null,
    primary key (room_type_id, amenity)
);

create table room_type_availability (
    id              uuid primary key,
    room_type_id    uuid not null references room_types (id) on delete cascade,
    date            date not null,
    total_rooms     integer not null,
    available_rooms integer not null,
    price_override  numeric(12, 2),
    constraint rta_total_chk check (total_rooms >= 0),
    constraint rta_available_chk check (available_rooms >= 0 and available_rooms <= total_rooms),
    constraint rta_price_chk check (price_override is null or price_override >= 0),
    constraint rta_room_date_uq unique (room_type_id, date)
);
create index rta_room_date_idx on room_type_availability (room_type_id, date);

create table bookings (
    id               uuid primary key,
    reference        varchar(6) not null unique,
    user_id          uuid not null references users (id),
    hotel_id         uuid not null references hotels (id),
    room_type_id     uuid not null references room_types (id),
    check_in_date    date not null,
    check_out_date   date not null,
    number_of_rooms  integer not null,
    number_of_guests integer not null,
    status           varchar(16) not null,
    total_price      numeric(12, 2) not null,
    currency         varchar(3) not null,
    contact_email    varchar(255) not null,
    idempotency_key  varchar(120) unique,
    created_at       timestamptz not null,
    updated_at       timestamptz not null,
    cancelled_at     timestamptz,
    constraint bookings_status_chk check (status in ('PENDING', 'CONFIRMED', 'CANCELLED')),
    constraint bookings_dates_chk check (check_out_date > check_in_date),
    constraint bookings_rooms_chk check (number_of_rooms >= 1),
    constraint bookings_guests_chk check (number_of_guests >= 1)
);
create index bookings_user_idx on bookings (user_id);
create index bookings_room_idx on bookings (room_type_id);

create table guests (
    id            uuid primary key,
    booking_id    uuid not null references bookings (id) on delete cascade,
    first_name    varchar(80) not null,
    last_name     varchar(80) not null,
    date_of_birth date
);
create index guests_booking_idx on guests (booking_id);
