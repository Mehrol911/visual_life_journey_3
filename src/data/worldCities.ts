export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
  population?: number;
}

export interface Country {
  name: string;
  code: string;
  cities: City[];
}

export const WORLD_CITIES: Country[] = [
  {
    name: "United States",
    code: "US",
    cities: [
      { name: "New York", country: "United States", lat: 40.7128, lng: -74.0060 },
      { name: "Los Angeles", country: "United States", lat: 34.0522, lng: -118.2437 },
      { name: "Chicago", country: "United States", lat: 41.8781, lng: -87.6298 },
      { name: "Houston", country: "United States", lat: 29.7604, lng: -95.3698 },
      { name: "Miami", country: "United States", lat: 25.7617, lng: -80.1918 },
      { name: "San Francisco", country: "United States", lat: 37.7749, lng: -122.4194 },
      { name: "Las Vegas", country: "United States", lat: 36.1699, lng: -115.1398 },
      { name: "Seattle", country: "United States", lat: 47.6062, lng: -122.3321 }
    ]
  },
  {
    name: "United Kingdom",
    code: "GB",
    cities: [
      { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
      { name: "Manchester", country: "United Kingdom", lat: 53.4808, lng: -2.2426 },
      { name: "Birmingham", country: "United Kingdom", lat: 52.4862, lng: -1.8904 },
      { name: "Edinburgh", country: "United Kingdom", lat: 55.9533, lng: -3.1883 },
      { name: "Liverpool", country: "United Kingdom", lat: 53.4084, lng: -2.9916 }
    ]
  },
  {
    name: "France",
    code: "FR",
    cities: [
      { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
      { name: "Lyon", country: "France", lat: 45.7640, lng: 4.8357 },
      { name: "Marseille", country: "France", lat: 43.2965, lng: 5.3698 },
      { name: "Nice", country: "France", lat: 43.7102, lng: 7.2620 },
      { name: "Toulouse", country: "France", lat: 43.6047, lng: 1.4442 }
    ]
  },
  {
    name: "Germany",
    code: "DE",
    cities: [
      { name: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050 },
      { name: "Munich", country: "Germany", lat: 48.1351, lng: 11.5820 },
      { name: "Hamburg", country: "Germany", lat: 53.5511, lng: 9.9937 },
      { name: "Frankfurt", country: "Germany", lat: 50.1109, lng: 8.6821 },
      { name: "Cologne", country: "Germany", lat: 50.9375, lng: 6.9603 }
    ]
  },
  {
    name: "Italy",
    code: "IT",
    cities: [
      { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
      { name: "Milan", country: "Italy", lat: 45.4642, lng: 9.1900 },
      { name: "Venice", country: "Italy", lat: 45.4408, lng: 12.3155 },
      { name: "Florence", country: "Italy", lat: 43.7696, lng: 11.2558 },
      { name: "Naples", country: "Italy", lat: 40.8518, lng: 14.2681 }
    ]
  },
  {
    name: "Spain",
    code: "ES",
    cities: [
      { name: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038 },
      { name: "Barcelona", country: "Spain", lat: 41.3851, lng: 2.1734 },
      { name: "Seville", country: "Spain", lat: 37.3891, lng: -5.9845 },
      { name: "Valencia", country: "Spain", lat: 39.4699, lng: -0.3763 },
      { name: "Bilbao", country: "Spain", lat: 43.2627, lng: -2.9253 }
    ]
  },
  {
    name: "Japan",
    code: "JP",
    cities: [
      { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
      { name: "Osaka", country: "Japan", lat: 34.6937, lng: 135.5023 },
      { name: "Kyoto", country: "Japan", lat: 35.0116, lng: 135.7681 },
      { name: "Hiroshima", country: "Japan", lat: 34.3853, lng: 132.4553 },
      { name: "Yokohama", country: "Japan", lat: 35.4437, lng: 139.6380 }
    ]
  },
  {
    name: "China",
    code: "CN",
    cities: [
      { name: "Beijing", country: "China", lat: 39.9042, lng: 116.4074 },
      { name: "Shanghai", country: "China", lat: 31.2304, lng: 121.4737 },
      { name: "Guangzhou", country: "China", lat: 23.1291, lng: 113.2644 },
      { name: "Shenzhen", country: "China", lat: 22.5431, lng: 114.0579 },
      { name: "Hong Kong", country: "China", lat: 22.3193, lng: 114.1694 }
    ]
  },
  {
    name: "India",
    code: "IN",
    cities: [
      { name: "Mumbai", country: "India", lat: 19.0760, lng: 72.8777 },
      { name: "Delhi", country: "India", lat: 28.7041, lng: 77.1025 },
      { name: "Bangalore", country: "India", lat: 12.9716, lng: 77.5946 },
      { name: "Chennai", country: "India", lat: 13.0827, lng: 80.2707 },
      { name: "Kolkata", country: "India", lat: 22.5726, lng: 88.3639 }
    ]
  },
  {
    name: "Australia",
    code: "AU",
    cities: [
      { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
      { name: "Melbourne", country: "Australia", lat: -37.8136, lng: 144.9631 },
      { name: "Brisbane", country: "Australia", lat: -27.4698, lng: 153.0251 },
      { name: "Perth", country: "Australia", lat: -31.9505, lng: 115.8605 },
      { name: "Adelaide", country: "Australia", lat: -34.9285, lng: 138.6007 }
    ]
  },
  {
    name: "Brazil",
    code: "BR",
    cities: [
      { name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
      { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lng: -43.1729 },
      { name: "Brasília", country: "Brazil", lat: -15.8267, lng: -47.9218 },
      { name: "Salvador", country: "Brazil", lat: -12.9714, lng: -38.5014 },
      { name: "Fortaleza", country: "Brazil", lat: -3.7319, lng: -38.5267 }
    ]
  },
  {
    name: "Canada",
    code: "CA",
    cities: [
      { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
      { name: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207 },
      { name: "Montreal", country: "Canada", lat: 45.5017, lng: -73.5673 },
      { name: "Calgary", country: "Canada", lat: 51.0447, lng: -114.0719 },
      { name: "Ottawa", country: "Canada", lat: 45.4215, lng: -75.6972 }
    ]
  },
  {
    name: "Russia",
    code: "RU",
    cities: [
      { name: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
      { name: "St. Petersburg", country: "Russia", lat: 59.9311, lng: 30.3609 },
      { name: "Novosibirsk", country: "Russia", lat: 55.0084, lng: 82.9357 },
      { name: "Yekaterinburg", country: "Russia", lat: 56.8431, lng: 60.6454 },
      { name: "Kazan", country: "Russia", lat: 55.8304, lng: 49.0661 }
    ]
  },
  {
    name: "South Korea",
    code: "KR",
    cities: [
      { name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780 },
      { name: "Busan", country: "South Korea", lat: 35.1796, lng: 129.0756 },
      { name: "Incheon", country: "South Korea", lat: 37.4563, lng: 126.7052 },
      { name: "Daegu", country: "South Korea", lat: 35.8714, lng: 128.6014 },
      { name: "Daejeon", country: "South Korea", lat: 36.3504, lng: 127.3845 }
    ]
  },
  {
    name: "Mexico",
    code: "MX",
    cities: [
      { name: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332 },
      { name: "Guadalajara", country: "Mexico", lat: 20.6597, lng: -103.3496 },
      { name: "Monterrey", country: "Mexico", lat: 25.6866, lng: -100.3161 },
      { name: "Cancún", country: "Mexico", lat: 21.1619, lng: -86.8515 },
      { name: "Tijuana", country: "Mexico", lat: 32.5149, lng: -117.0382 }
    ]
  },
  {
    name: "Turkey",
    code: "TR",
    cities: [
      { name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784 },
      { name: "Ankara", country: "Turkey", lat: 39.9334, lng: 32.8597 },
      { name: "Izmir", country: "Turkey", lat: 38.4192, lng: 27.1287 },
      { name: "Antalya", country: "Turkey", lat: 36.8969, lng: 30.7133 },
      { name: "Bursa", country: "Turkey", lat: 40.1826, lng: 29.0665 }
    ]
  },
  {
    name: "Thailand",
    code: "TH",
    cities: [
      { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
      { name: "Chiang Mai", country: "Thailand", lat: 18.7883, lng: 98.9853 },
      { name: "Phuket", country: "Thailand", lat: 7.8804, lng: 98.3923 },
      { name: "Pattaya", country: "Thailand", lat: 12.9236, lng: 100.8825 },
      { name: "Krabi", country: "Thailand", lat: 8.0863, lng: 98.9063 }
    ]
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    cities: [
      { name: "Dubai", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708 },
      { name: "Abu Dhabi", country: "United Arab Emirates", lat: 24.2992, lng: 54.6972 },
      { name: "Sharjah", country: "United Arab Emirates", lat: 25.3463, lng: 55.4209 },
      { name: "Al Ain", country: "United Arab Emirates", lat: 24.2075, lng: 55.7447 },
      { name: "Fujairah", country: "United Arab Emirates", lat: 25.1164, lng: 56.3264 }
    ]
  },
  {
    name: "Singapore",
    code: "SG",
    cities: [
      { name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 }
    ]
  },
  {
    name: "Egypt",
    code: "EG",
    cities: [
      { name: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357 },
      { name: "Alexandria", country: "Egypt", lat: 31.2001, lng: 29.9187 },
      { name: "Luxor", country: "Egypt", lat: 25.6872, lng: 32.6396 },
      { name: "Aswan", country: "Egypt", lat: 24.0889, lng: 32.8998 },
      { name: "Sharm El Sheikh", country: "Egypt", lat: 27.9158, lng: 34.3300 }
    ]
  },
  {
    name: "South Africa",
    code: "ZA",
    cities: [
      { name: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241 },
      { name: "Johannesburg", country: "South Africa", lat: -26.2041, lng: 28.0473 },
      { name: "Durban", country: "South Africa", lat: -29.8587, lng: 31.0218 },
      { name: "Pretoria", country: "South Africa", lat: -25.7479, lng: 28.2293 },
      { name: "Port Elizabeth", country: "South Africa", lat: -33.9608, lng: 25.6022 }
    ]
  },
  {
    name: "Argentina",
    code: "AR",
    cities: [
      { name: "Buenos Aires", country: "Argentina", lat: -34.6118, lng: -58.3960 },
      { name: "Córdoba", country: "Argentina", lat: -31.4201, lng: -64.1888 },
      { name: "Rosario", country: "Argentina", lat: -32.9442, lng: -60.6505 },
      { name: "Mendoza", country: "Argentina", lat: -32.8895, lng: -68.8458 },
      { name: "La Plata", country: "Argentina", lat: -34.9215, lng: -57.9545 }
    ]
  },
  {
    name: "Chile",
    code: "CL",
    cities: [
      { name: "Santiago", country: "Chile", lat: -33.4489, lng: -70.6693 },
      { name: "Valparaíso", country: "Chile", lat: -33.0472, lng: -71.6127 },
      { name: "Concepción", country: "Chile", lat: -36.8201, lng: -73.0444 },
      { name: "La Serena", country: "Chile", lat: -29.9027, lng: -71.2519 },
      { name: "Antofagasta", country: "Chile", lat: -23.6509, lng: -70.3975 }
    ]
  },
  {
    name: "Peru",
    code: "PE",
    cities: [
      { name: "Lima", country: "Peru", lat: -12.0464, lng: -77.0428 },
      { name: "Cusco", country: "Peru", lat: -13.5319, lng: -71.9675 },
      { name: "Arequipa", country: "Peru", lat: -16.4090, lng: -71.5375 },
      { name: "Trujillo", country: "Peru", lat: -8.1116, lng: -79.0287 },
      { name: "Iquitos", country: "Peru", lat: -3.7437, lng: -73.2516 }
    ]
  },
  {
    name: "Colombia",
    code: "CO",
    cities: [
      { name: "Bogotá", country: "Colombia", lat: 4.7110, lng: -74.0721 },
      { name: "Medellín", country: "Colombia", lat: 6.2442, lng: -75.5812 },
      { name: "Cali", country: "Colombia", lat: 3.4516, lng: -76.5320 },
      { name: "Cartagena", country: "Colombia", lat: 10.3910, lng: -75.4794 },
      { name: "Barranquilla", country: "Colombia", lat: 10.9685, lng: -74.7813 }
    ]
  },
  {
    name: "Uzbekistan",
    code: "UZ",
    cities: [
      { name: "Tashkent", country: "Uzbekistan", lat: 41.2995, lng: 69.2401 },
      { name: "Samarkand", country: "Uzbekistan", lat: 39.6270, lng: 66.9750 },
      { name: "Bukhara", country: "Uzbekistan", lat: 39.7747, lng: 64.4286 },
      { name: "Khiva", country: "Uzbekistan", lat: 41.3775, lng: 60.3619 },
      { name: "Nukus", country: "Uzbekistan", lat: 42.4731, lng: 59.6103 }
    ]
  },
  {
    name: "Kazakhstan",
    code: "KZ",
    cities: [
      { name: "Almaty", country: "Kazakhstan", lat: 43.2220, lng: 76.8512 },
      { name: "Nur-Sultan", country: "Kazakhstan", lat: 51.1694, lng: 71.4491 },
      { name: "Shymkent", country: "Kazakhstan", lat: 42.3000, lng: 69.5900 },
      { name: "Aktobe", country: "Kazakhstan", lat: 50.2839, lng: 57.1670 },
      { name: "Taraz", country: "Kazakhstan", lat: 42.9000, lng: 71.3667 }
    ]
  },
  {
    name: "Morocco",
    code: "MA",
    cities: [
      { name: "Casablanca", country: "Morocco", lat: 33.5731, lng: -7.5898 },
      { name: "Marrakech", country: "Morocco", lat: 31.6295, lng: -7.9811 },
      { name: "Rabat", country: "Morocco", lat: 34.0209, lng: -6.8416 },
      { name: "Fez", country: "Morocco", lat: 34.0181, lng: -5.0078 },
      { name: "Tangier", country: "Morocco", lat: 35.7595, lng: -5.8340 }
    ]
  },
  {
    name: "Kenya",
    code: "KE",
    cities: [
      { name: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219 },
      { name: "Mombasa", country: "Kenya", lat: -4.0435, lng: 39.6682 },
      { name: "Kisumu", country: "Kenya", lat: -0.1022, lng: 34.7617 },
      { name: "Nakuru", country: "Kenya", lat: -0.3031, lng: 36.0800 },
      { name: "Eldoret", country: "Kenya", lat: 0.5143, lng: 35.2698 }
    ]
  },
  {
    name: "Nigeria",
    code: "NG",
    cities: [
      { name: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792 },
      { name: "Abuja", country: "Nigeria", lat: 9.0765, lng: 7.3986 },
      { name: "Kano", country: "Nigeria", lat: 12.0022, lng: 8.5920 },
      { name: "Ibadan", country: "Nigeria", lat: 7.3775, lng: 3.9470 },
      { name: "Port Harcourt", country: "Nigeria", lat: 4.8156, lng: 7.0498 }
    ]
  },
  {
    name: "Indonesia",
    code: "ID",
    cities: [
      { name: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456 },
      { name: "Bali", country: "Indonesia", lat: -8.4095, lng: 115.1889 },
      { name: "Yogyakarta", country: "Indonesia", lat: -7.7956, lng: 110.3695 },
      { name: "Surabaya", country: "Indonesia", lat: -7.2575, lng: 112.7521 },
      { name: "Bandung", country: "Indonesia", lat: -6.9175, lng: 107.6191 }
    ]
  },
  {
    name: "Malaysia",
    code: "MY",
    cities: [
      { name: "Kuala Lumpur", country: "Malaysia", lat: 3.1390, lng: 101.6869 },
      { name: "George Town", country: "Malaysia", lat: 5.4164, lng: 100.3327 },
      { name: "Johor Bahru", country: "Malaysia", lat: 1.4927, lng: 103.7414 },
      { name: "Malacca", country: "Malaysia", lat: 2.1896, lng: 102.2501 },
      { name: "Kota Kinabalu", country: "Malaysia", lat: 5.9804, lng: 116.0735 }
    ]
  },
  {
    name: "Philippines",
    code: "PH",
    cities: [
      { name: "Manila", country: "Philippines", lat: 14.5995, lng: 120.9842 },
      { name: "Cebu City", country: "Philippines", lat: 10.3157, lng: 123.8854 },
      { name: "Davao", country: "Philippines", lat: 7.1907, lng: 125.4553 },
      { name: "Quezon City", country: "Philippines", lat: 14.6760, lng: 121.0437 },
      { name: "Makati", country: "Philippines", lat: 14.5547, lng: 121.0244 }
    ]
  },
  {
    name: "Vietnam",
    code: "VN",
    cities: [
      { name: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lng: 106.6297 },
      { name: "Hanoi", country: "Vietnam", lat: 21.0285, lng: 105.8542 },
      { name: "Da Nang", country: "Vietnam", lat: 16.0544, lng: 108.2022 },
      { name: "Hoi An", country: "Vietnam", lat: 15.8801, lng: 108.3380 },
      { name: "Nha Trang", country: "Vietnam", lat: 12.2388, lng: 109.1967 }
    ]
  }
];

export const getCitiesByCountry = (countryName: string): City[] => {
  const country = WORLD_CITIES.find(c => c.name === countryName);
  return country ? country.cities : [];
};

export const getAllCountries = (): string[] => {
  return WORLD_CITIES.map(country => country.name).sort();
};

export const findCityCoordinates = (cityName: string, countryName: string): { lat: number; lng: number } | null => {
  const country = WORLD_CITIES.find(c => c.name === countryName);
  if (!country) return null;
  
  const city = country.cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
  return city ? { lat: city.lat, lng: city.lng } : null;
};