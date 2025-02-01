export const haversineDistance = (coords1: { lat: number; lng: number }, coords2: { lat: number; lng: number }) => {
  const toRad = (value: number) => (value * Math.PI) / 180

  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(coords2.lat - coords1.lat)
  const dLng = toRad(coords2.lng - coords1.lng)
  const lat1 = toRad(coords1.lat)
  const lat2 = toRad(coords2.lat)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in kilometers
}

export const calculateCostPerDistance = (
  fixed_price: number,
  per_kilometer: number,
  steps: {
    latitude?: number
    longitude?: number
  }[]
): number => {
  if (steps.length !== 2) return 0

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]

    if (!step?.latitude || !step?.longitude) return 0
  }

  const deliveryCenterLocation = {
    lat: steps[0].latitude || 0,
    lng: steps[0].longitude || 0
  }
  const customerLocation = {
    lat: steps[1].latitude || 0,
    lng: steps[1].longitude || 0
  }

  const distanceInKilometer = Math.ceil(haversineDistance({ ...deliveryCenterLocation }, { ...customerLocation }))

  let finalCost = +fixed_price + +per_kilometer * distanceInKilometer
  finalCost = +finalCost.toFixed(0)

  return finalCost
}
