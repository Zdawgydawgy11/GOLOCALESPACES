// lib/zoning/lookup.ts
// Zoning lookup utilities for Market Space

import { supabase } from '@/lib/supabase/client';
import type { ZoningLookup } from '@/types';

/**
 * Zoning data source providers
 */
export type ZoningSource =
  | 'regrid'        // Regrid API (parcel data)
  | 'zoneomics'     // Zoneomics API
  | 'municipal'     // Direct city/county API
  | 'manual'        // Manually entered by host
  | 'ai_extracted'; // Extracted from documents via AI

/**
 * Zoning lookup response
 */
export interface ZoningLookupResult {
  success: boolean;
  zoning_code?: string;
  zoning_description?: string;
  permitted_uses?: string[];
  conditional_uses?: string[];
  confidence: number; // 0-100
  source: ZoningSource;
  raw_data?: Record<string, any>;
  error?: string;
}

/**
 * Look up zoning information for an address
 *
 * Priority order:
 * 1. Check cache (zoning_lookups table)
 * 2. Try Regrid API (if configured)
 * 3. Try municipal API (if available)
 * 4. Return null (require manual entry)
 */
export async function lookupZoning(
  address: string,
  city: string,
  state: string,
  zipCode: string,
  spaceId?: string
): Promise<ZoningLookupResult> {

  // Format full address
  const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;

  try {
    // Step 1: Check cache (recent lookups for same address)
    const cached = await checkZoningCache(fullAddress);
    if (cached) {
      return cached;
    }

    // Step 2: Try Regrid API (if API key is configured)
    if (process.env.NEXT_PUBLIC_REGRID_API_KEY) {
      const regridResult = await lookupZoningRegrid(fullAddress);
      if (regridResult.success) {
        // Save to cache
        await saveZoningLookup(spaceId, fullAddress, regridResult);
        return regridResult;
      }
    }

    // Step 3: Try municipal API (city-specific)
    const municipalResult = await lookupZoningMunicipal(city, state, fullAddress);
    if (municipalResult.success) {
      await saveZoningLookup(spaceId, fullAddress, municipalResult);
      return municipalResult;
    }

    // Step 4: No automated source available
    return {
      success: false,
      confidence: 0,
      source: 'manual',
      error: 'No automated zoning data source available. Please enter manually.'
    };

  } catch (error) {
    console.error('Zoning lookup error:', error);
    return {
      success: false,
      confidence: 0,
      source: 'manual',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check cache for recent zoning lookups
 */
async function checkZoningCache(address: string): Promise<ZoningLookupResult | null> {
  const { data, error } = await supabase
    .from('zoning_lookups')
    .select('*')
    .eq('address', address)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  // Use cached data if less than 90 days old
  const ageInDays = (Date.now() - new Date(data.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (ageInDays > 90) return null;

  return {
    success: true,
    zoning_code: data.zoning_code || undefined,
    confidence: data.confidence || 80,
    source: data.source as ZoningSource || 'manual',
    raw_data: data.raw_response || undefined
  };
}

/**
 * Look up zoning via Regrid API
 * https://regrid.com/
 */
async function lookupZoningRegrid(address: string): Promise<ZoningLookupResult> {
  const apiKey = process.env.NEXT_PUBLIC_REGRID_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      confidence: 0,
      source: 'regrid',
      error: 'Regrid API key not configured'
    };
  }

  try {
    const response = await fetch(
      `https://app.regrid.com/api/v1/search/address?query=${encodeURIComponent(address)}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Regrid API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const parcel = data.results[0];

      return {
        success: true,
        zoning_code: parcel.zoning || parcel.properties?.zoning,
        zoning_description: parcel.zoning_description || parcel.properties?.zoning_description,
        confidence: 90, // Regrid is highly accurate
        source: 'regrid',
        raw_data: parcel
      };
    }

    return {
      success: false,
      confidence: 0,
      source: 'regrid',
      error: 'No parcel data found for address'
    };

  } catch (error) {
    console.error('Regrid API error:', error);
    return {
      success: false,
      confidence: 0,
      source: 'regrid',
      error: error instanceof Error ? error.message : 'Regrid API failed'
    };
  }
}

/**
 * Look up zoning via municipal/city APIs
 * This is a placeholder - each city has different APIs
 */
async function lookupZoningMunicipal(
  city: string,
  state: string,
  address: string
): Promise<ZoningLookupResult> {

  // Example: Provo, Utah has a public GIS API
  if (city.toLowerCase() === 'provo' && state.toLowerCase() === 'utah') {
    return lookupZoningProvo(address);
  }

  // Example: Salt Lake City
  if (city.toLowerCase().includes('salt lake') && state.toLowerCase() === 'utah') {
    return lookupZoningSaltLake(address);
  }

  // Add more cities as needed...

  return {
    success: false,
    confidence: 0,
    source: 'municipal',
    error: `No municipal API available for ${city}, ${state}`
  };
}

/**
 * Provo, Utah zoning lookup (example implementation)
 */
async function lookupZoningProvo(address: string): Promise<ZoningLookupResult> {
  try {
    // Provo uses ArcGIS - this is a simplified example
    const gisUrl = 'https://gis.provo.org/arcgis/rest/services/Public/Zoning/MapServer/0/query';
    const params = new URLSearchParams({
      where: `Address LIKE '%${address}%'`,
      outFields: 'ZONE_CLASS,ZONE_NAME',
      f: 'json'
    });

    const response = await fetch(`${gisUrl}?${params}`);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        success: true,
        zoning_code: feature.attributes.ZONE_CLASS,
        zoning_description: feature.attributes.ZONE_NAME,
        confidence: 85,
        source: 'municipal',
        raw_data: feature
      };
    }

    return {
      success: false,
      confidence: 0,
      source: 'municipal',
      error: 'No zoning data found in Provo GIS'
    };
  } catch (error) {
    return {
      success: false,
      confidence: 0,
      source: 'municipal',
      error: error instanceof Error ? error.message : 'Provo GIS error'
    };
  }
}

/**
 * Salt Lake City zoning lookup (placeholder)
 */
async function lookupZoningSaltLake(address: string): Promise<ZoningLookupResult> {
  // TODO: Implement Salt Lake City API
  return {
    success: false,
    confidence: 0,
    source: 'municipal',
    error: 'Salt Lake City API not yet implemented'
  };
}

/**
 * Save zoning lookup to database for caching/auditing
 */
async function saveZoningLookup(
  spaceId: string | undefined,
  address: string,
  result: ZoningLookupResult
): Promise<void> {
  try {
    await supabase
      .from('zoning_lookups')
      .insert({
        space_id: spaceId || null,
        address,
        zoning_code: result.zoning_code || null,
        raw_response: result.raw_data || null,
        source: result.source,
        confidence: result.confidence
      });
  } catch (error) {
    // Non-critical error, just log it
    console.error('Failed to save zoning lookup:', error);
  }
}

/**
 * Update space with zoning information
 */
export async function updateSpaceZoning(
  spaceId: string,
  zoningCode: string,
  zoningSource: ZoningSource,
  confidence: number,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('spaces')
      .update({
        zoning_code: zoningCode,
        zoning_source: zoningSource,
        zoning_last_checked_at: new Date().toISOString(),
        zoning_confidence: confidence,
        zoning_notes: notes || null
      })
      .eq('id', spaceId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Failed to update space zoning:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Certify that host has verified zoning is correct
 */
export async function certifyZoning(
  spaceId: string,
  certified: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('spaces')
      .update({
        host_zoning_certified: certified,
        zoning_last_checked_at: new Date().toISOString()
      })
      .eq('id', spaceId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if a use type is permitted under a zoning code
 * This is a simplified version - real implementation would need
 * to integrate with zoning ordinance databases
 */
export async function checkPermittedUse(
  zoningCode: string,
  useType: string,
  city: string,
  state: string
): Promise<{
  permitted: boolean;
  conditional: boolean;
  prohibited: boolean;
  notes?: string;
}> {
  // TODO: Integrate with zoning ordinance database
  // For now, return a placeholder

  // Example logic for common zoning codes
  const commercialZones = ['C-1', 'C-2', 'C-3', 'C-4', 'Commercial'];
  const mixedUseZones = ['MU', 'Mixed', 'MX'];
  const industrialZones = ['M-1', 'M-2', 'Industrial', 'I-1'];

  const isCommercial = commercialZones.some(z => zoningCode.includes(z));
  const isMixedUse = mixedUseZones.some(z => zoningCode.includes(z));
  const isIndustrial = industrialZones.some(z => zoningCode.includes(z));

  // Food trucks
  if (useType === 'food_truck') {
    if (isCommercial || isMixedUse) {
      return {
        permitted: true,
        conditional: false,
        prohibited: false,
        notes: 'Food trucks typically permitted in commercial zones'
      };
    }
    return {
      permitted: false,
      conditional: true,
      prohibited: false,
      notes: 'May require conditional use permit'
    };
  }

  // Warehouse/storage
  if (useType === 'warehouse_storage') {
    if (isIndustrial) {
      return {
        permitted: true,
        conditional: false,
        prohibited: false
      };
    }
    return {
      permitted: false,
      conditional: true,
      prohibited: false,
      notes: 'May require variance or conditional permit'
    };
  }

  // Default: unknown
  return {
    permitted: false,
    conditional: true,
    prohibited: false,
    notes: 'Zoning compatibility unknown - verify with local authorities'
  };
}
