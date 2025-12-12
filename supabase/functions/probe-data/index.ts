import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { corsHeaders } from '../_shared/cors.ts'

interface ProbeData {
  point_id: number
  measured_at: string
  parameters: Record<string, number>
  metadata?: {
    probe_battery?: number
    signal_strength?: number
    firmware_version?: string
    [key: string]: any
  }
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get API key from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'API key required in Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = authHeader.replace('Bearer ', '')
    
    // Validate API key and get probe info
    const { data: probe, error: probeError } = await supabase
      .from('volunteers')
      .select('id, is_active, type')
      .eq('api_key', apiKey)
      .eq('type', 'probe')
      .single()

    if (probeError || !probe) {
      console.error('Invalid API key:', probeError)
      return new Response(
        JSON.stringify({ error: 'Invalid API key or probe not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!probe.is_active) {
      return new Response(
        JSON.stringify({ error: 'Probe is inactive' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: ProbeData = await req.json()

    // Validate required fields
    if (!body.point_id || !body.measured_at || !body.parameters) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: point_id, measured_at, parameters' 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify probe has access to this point via volunteer_points table
    const { data: authorizedPoint, error: pointError } = await supabase
      .from('volunteer_points')
      .select('point_id')
      .eq('volunteer_id', probe.id)
      .eq('point_id', body.point_id)
      .single()

    if (pointError || !authorizedPoint) {
      console.error('Probe access denied for point:', body.point_id, pointError)
      return new Response(
        JSON.stringify({ 
          error: 'Probe does not have access to this collection point' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate timestamp (not too old, not in future)
    const measuredAt = new Date(body.measured_at)
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneHourAhead = new Date(now.getTime() + 60 * 60 * 1000)

    if (measuredAt < oneDayAgo || measuredAt > oneHourAhead) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid timestamp: data cannot be older than 24 hours or in the future' 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get parameter mappings
    const { data: parameters, error: paramError } = await supabase
      .from('parameters')
      .select('id, code, conama_min, conama_max')

    if (paramError) {
      console.error('Error fetching parameters:', paramError)
      return new Response(
        JSON.stringify({ error: 'Internal error validating parameters' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const paramMap = new Map(parameters.map(p => [p.code.toLowerCase(), p]))

    // Validate parameters and prepare reading values
    const readingValues = []
    const warnings = []

    for (const [paramCode, value] of Object.entries(body.parameters)) {
      const param = paramMap.get(paramCode.toLowerCase())
      if (!param) {
        warnings.push(`Unknown parameter: ${paramCode}`)
        continue
      }

      if (typeof value !== 'number' || isNaN(value)) {
        return new Response(
          JSON.stringify({ 
            error: `Invalid value for parameter ${paramCode}: must be a number` 
          }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check CONAMA limits
      if (param.conama_min !== null && value < param.conama_min) {
        warnings.push(`${paramCode} value ${value} is below CONAMA minimum (${param.conama_min})`)
      }
      if (param.conama_max !== null && value > param.conama_max) {
        warnings.push(`${paramCode} value ${value} is above CONAMA maximum (${param.conama_max})`)
      }

      readingValues.push({
        parameter_id: param.id,
        value: value
      })
    }

    if (readingValues.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No valid parameters found in the data' 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create reading entry
    const { data: reading, error: readingError } = await supabase
      .from('readings')
      .insert({
        point_id: body.point_id,
        measured_at: body.measured_at,
        collection_type: 'automatic',
        volunteer_id: probe.id,
        context: body.metadata || {}
      })
      .select('id')
      .single()

    if (readingError) {
      console.error('Error creating reading:', readingError)
      return new Response(
        JSON.stringify({ error: 'Error saving reading data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert reading values
    const readingValuesWithId = readingValues.map(rv => ({
      ...rv,
      reading_id: reading.id
    }))

    const { error: valuesError } = await supabase
      .from('reading_values')
      .insert(readingValuesWithId)

    if (valuesError) {
      console.error('Error creating reading values:', valuesError)
      return new Response(
        JSON.stringify({ error: 'Error saving parameter values' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update probe last communication
    await supabase
      .from('volunteers')
      .update({ last_communication: new Date().toISOString() })
      .eq('id', probe.id)

    // Success response
    const response = {
      success: true,
      reading_id: reading.id,
      parameters_saved: readingValues.length,
      warnings: warnings.length > 0 ? warnings : undefined
    }

    console.log(`Probe data received successfully for probe ${probe.id}:`, response)

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in probe-data function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})