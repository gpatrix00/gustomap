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
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.primaryType,places.primaryTypeDisplayName',
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
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.primaryType,places.primaryTypeDisplayName',
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
      const results = mapPlaces(retryData.places || []);
      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const results = mapPlaces(data.places || []);

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

function mapPlaces(places: any[]) {
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

    return {
      placeId: place.id,
      name: place.displayName?.text || '',
      address: place.formattedAddress || '',
      latitude: place.location?.latitude,
      longitude: place.location?.longitude,
      type,
      primaryType: place.primaryTypeDisplayName?.text || '',
    };
  });
}
