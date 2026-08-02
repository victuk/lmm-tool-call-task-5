export function getFlightBookingSchedule({ origin, destination }) {
  return {
    origin,
    destination,
    outbound_flight_hours: 5.5,
    return_flight_hours: 5.5,
    total_flight_time_hours: 11.0,
    roundtrip_price_usd: 650.0,
    currency: "USD",
  };
}

export function getHotelBookingSchedule({ location, nights }) {
  const pricePerNight = 120.0;
  const totalPrice = pricePerNight * nights;
  return {
    location,
    nights,
    price_per_night_usd: pricePerNight,
    total_price_usd: totalPrice,
    currency: "USD",
  };
}

export function convertCurrency({ amount, fromCurrency, toCurrency }) {
  const rates = {
    USD: 1.0,
    NGN: 1500.0,
    KES: 130.0,
    EUR: 0.92,
    GBP: 0.78,
  };

  const fromRate = rates[fromCurrency.toUpperCase()] || 1.0;
  const toRate = rates[toCurrency.toUpperCase()] || 1.0;

  const amountInUsd = amount / fromRate;
  const convertedAmount = amountInUsd * toRate;

  return {
    original_amount: amount,
    from_currency: fromCurrency.toUpperCase(),
    to_currency: toCurrency.toUpperCase(),
    converted_amount: Number(convertedAmount.toFixed(2)),
    exchange_rate: Number((toRate / fromRate).toFixed(4)),
  };
}
