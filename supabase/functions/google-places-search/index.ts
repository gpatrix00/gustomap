const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ success: true, results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Google Places API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Text Search (New) to find places
    const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.primaryType,places.primaryTypeDisplayName,places.photos,places.addressComponents';
    
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'it',
        maxResultCount: 8,
        includedType: 'restaurant',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google Places API error:', errorData);
      
      // Retry without includedType for broader search
      const retryResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fieldMask,
        },
        body: JSON.stringify({
          textQuery: query,
          languageCode: 'it',
          maxResultCount: 8,
        }),
      });

      if (!retryResponse.ok) {
        const retryError = await retryResponse.text();
        console.error('Google Places API retry error:', retryError);
        return new Response(
          JSON.stringify({ success: false, error: `Google Places API error: ${retryResponse.status}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const retryData = await retryResponse.json();
      const results = mapPlaces(retryData.places || [], apiKey);
      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const results = mapPlaces(data.places || [], apiKey);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in google-places-search:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractAddressComponent(components: any[], type: string): string | undefined {
  if (!components) return undefined;
  const comp = components.find((c: any) => c.types?.includes(type));
  return comp?.longText || comp?.shortText || undefined;
}

function getPhotoUrl(photos: any[], apiKey: string): string | undefined {
  if (!photos || photos.length === 0) return undefined;
  const photoName = photos[0].name;
  if (!photoName) return undefined;
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${apiKey}`;
}

function mapPlaces(places: any[], apiKey: string) {
  return places.map((place: any) => {
    // Determine type based on Google types
    let type = 'ristorante';
    const types = place.types || [];
    const primaryType = place.primaryType || '';
    
    if (types.includes('bar') || types.includes('night_club') || primaryType === 'bar') {
      type = 'bar';
    } else if (types.includes('cafe') || types.includes('coffee_shop') || primaryType === 'cafe') {
      type = 'caffetteria';
    }

    // Extract address components
    const addressComponents = place.addressComponents || [];
    const city = extractAddressComponent(addressComponents, 'locality') 
      || extractAddressComponent(addressComponents, 'administrative_area_level_3');
    const province = extractAddressComponent(addressComponents, 'administrative_area_level_2');
    const region = extractAddressComponent(addressComponents, 'administrative_area_level_1');

    // Get photo URL
    const photoUrl = getPhotoUrl(place.photos || [], apiKey);

    return {
      placeId: place.id,
      name: place.displayName?.text || '',
      address: place.formattedAddress || '',
      latitude: place.location?.latitude,
      longitude: place.location?.longitude,
      type,
      primaryType: place.primaryTypeDisplayName?.text || '',
      city,
      province,
      region,
      photoUrl,
    };
  });
}
