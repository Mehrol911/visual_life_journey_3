import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfessionTheme } from '../types';
import { 
  Globe, 
  MapPin, 
  Calendar, 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Clock,
  Map,
  List,
  Filter,
  Search,
  Plane,
  Camera,
  ArrowLeft
} from 'lucide-react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

interface TravelData {
  cities: Array<{
    city: string;
    country: string;
    date: string;
    coordinates: [number, number];
    description?: string;
    photos?: string[];
  }>;
  countries: string[];
}

interface InteractiveTravelMapProps {
  theme: ProfessionTheme;
  travelData?: TravelData;
  onBack?: () => void;
}

type ViewMode = 'map' | 'timeline';

export const InteractiveTravelMap: React.FC<InteractiveTravelMapProps> = ({ 
  theme, 
  travelData,
  onBack 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [worldData, setWorldData] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [showTooltip, setShowTooltip] = useState<any>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Sample travel data for demonstration
  const sampleTravelData: TravelData = travelData || {
    cities: [
      {
        city: "Los Angeles",
        country: "United States",
        date: "01/2005",
        coordinates: [-118.2437, 34.0522],
        description: "First international trip - exploring Hollywood and beaches"
      },
      {
        city: "Manchester",
        country: "United Kingdom", 
        date: "02/2005",
        coordinates: [-2.2426, 53.4808],
        description: "Business conference and exploring English culture"
      },
      {
        city: "Melbourne",
        country: "Australia",
        date: "01/2000", 
        coordinates: [144.9631, -37.8136],
        description: "Amazing coffee culture and street art scene"
      },
      {
        city: "Tokyo",
        country: "Japan",
        date: "06/2010",
        coordinates: [139.6503, 35.6762],
        description: "Incredible technology and traditional culture blend"
      },
      {
        city: "Paris",
        country: "France",
        date: "09/2012",
        coordinates: [2.3522, 48.8566],
        description: "Art, architecture, and amazing cuisine"
      },
      {
        city: "Sydney",
        country: "Australia",
        date: "03/2015",
        coordinates: [151.2093, -33.8688],
        description: "Opera House and harbor bridge views"
      },
      {
        city: "Córdoba",
        country: "Argentina",
        date: "04/2018",
        coordinates: [-64.1888, -31.4201],
        description: "Beautiful colonial architecture and vibrant culture"
      }
    ],
    countries: ["US", "GB", "AU", "JP", "FR", "AR"]
  };

  // Load world map data
  useEffect(() => {
    const loadWorldData = async () => {
      try {
        // Using a public world map TopoJSON
        const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
        const world = await response.json();
        const countries = feature(world, world.objects.countries);
        setWorldData(countries);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading world data:', error);
        setIsLoading(false);
      }
    };

    loadWorldData();
  }, []);

  // Initialize map function
  const initializeMap = useCallback(() => {
    if (!worldData || !svgRef.current || !containerRef.current || mapInitialized) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    
    // Clear previous content
    svg.selectAll("*").remove();

    const width = container.clientWidth;
    const height = Math.min(600, container.clientHeight);

    svg.attr("width", width).attr("height", height);

    // Create projection
    const projection = d3.geoNaturalEarth1()
      .scale(width / 6.5)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Create zoom behavior
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.5, 8])
      .on("zoom", (event) => {
        const { transform } = event;
        setZoom(transform.k);
        
        svg.select(".map-group")
          .attr("transform", transform);
      });

    svg.call(zoomBehavior as any);

    // Create main group for map elements
    const mapGroup = svg.append("g").attr("class", "map-group");

    // COMPREHENSIVE country mapping - includes all possible variations and common names
    const countryMapping: { [key: string]: string[] } = {
      'United States': [
        'US', 'USA', 'United States', 'United States of America', 'America', 'U.S.A.', 'U.S.',
        'United States of America', 'US1', 'USA1'
      ],
      'United Kingdom': [
        'GB', 'UK', 'GBR', 'United Kingdom', 'Britain', 'Great Britain', 'England', 'U.K.',
        'United Kingdom of Great Britain and Northern Ireland', 'GB1', 'GBR1'
      ], 
      'France': [
        'FR', 'FRA', 'France', 'French Republic', 'République française', 'FR1', 'FRA1'
      ],
      'Germany': [
        'DE', 'DEU', 'Germany', 'Deutschland', 'Federal Republic of Germany', 'DE1', 'DEU1'
      ],
      'Italy': [
        'IT', 'ITA', 'Italy', 'Italia', 'Italian Republic', 'IT1', 'ITA1'
      ],
      'Spain': [
        'ES', 'ESP', 'Spain', 'España', 'Kingdom of Spain', 'ES1', 'ESP1'
      ],
      'Japan': [
        'JP', 'JPN', 'Japan', 'Nippon', 'Nihon', 'JP1', 'JPN1'
      ],
      'China': [
        'CN', 'CHN', 'China', 'People\'s Republic of China', 'PRC', 'CN1', 'CHN1'
      ],
      'India': [
        'IN', 'IND', 'India', 'Republic of India', 'Bharat', 'IN1', 'IND1'
      ],
      'Australia': [
        'AU', 'AUS', 'Australia', 'Commonwealth of Australia', 'AU1', 'AUS1'
      ],
      'Brazil': [
        'BR', 'BRA', 'Brazil', 'Brasil', 'Federative Republic of Brazil', 'BR1', 'BRA1'
      ],
      'Canada': [
        'CA', 'CAN', 'Canada', 'CA1', 'CAN1'
      ],
      'Russia': [
        'RU', 'RUS', 'Russia', 'Russian Federation', 'USSR', 'RU1', 'RUS1'
      ],
      'South Korea': [
        'KR', 'KOR', 'Korea', 'South Korea', 'Republic of Korea', 'S. Korea', 'KR1', 'KOR1'
      ],
      'Mexico': [
        'MX', 'MEX', 'Mexico', 'México', 'United Mexican States', 'MX1', 'MEX1'
      ],
      'Turkey': [
        'TR', 'TUR', 'Turkey', 'Türkiye', 'Republic of Turkey', 'TR1', 'TUR1'
      ],
      'Thailand': [
        'TH', 'THA', 'Thailand', 'Kingdom of Thailand', 'TH1', 'THA1'
      ],
      'United Arab Emirates': [
        'AE', 'ARE', 'UAE', 'United Arab Emirates', 'U.A.E.', 'AE1', 'ARE1'
      ],
      'Singapore': [
        'SG', 'SGP', 'Singapore', 'Republic of Singapore', 'SG1', 'SGP1'
      ],
      'Egypt': [
        'EG', 'EGY', 'Egypt', 'Arab Republic of Egypt', 'EG1', 'EGY1'
      ],
      'South Africa': [
        'ZA', 'ZAF', 'South Africa', 'Republic of South Africa', 'RSA', 'ZA1', 'ZAF1'
      ],
      'Argentina': [
        'AR', 'ARG', 'Argentina', 'Argentine Republic', 'República Argentina', 'AR1', 'ARG1'
      ],
      'Chile': [
        'CL', 'CHL', 'Chile', 'Republic of Chile', 'CL1', 'CHL1'
      ],
      'Peru': [
        'PE', 'PER', 'Peru', 'Republic of Peru', 'PE1', 'PER1'
      ],
      'Colombia': [
        'CO', 'COL', 'Colombia', 'Republic of Colombia', 'CO1', 'COL1'
      ],
      'Uzbekistan': [
        'UZ', 'UZB', 'Uzbekistan', 'Republic of Uzbekistan', 'UZ1', 'UZB1'
      ],
      'Kazakhstan': [
        'KZ', 'KAZ', 'Kazakhstan', 'Republic of Kazakhstan', 'KZ1', 'KAZ1'
      ],
      'Morocco': [
        'MA', 'MAR', 'Morocco', 'Kingdom of Morocco', 'MA1', 'MAR1'
      ],
      'Kenya': [
        'KE', 'KEN', 'Kenya', 'Republic of Kenya', 'KE1', 'KEN1'
      ],
      'Nigeria': [
        'NG', 'NGA', 'Nigeria', 'Federal Republic of Nigeria', 'NG1', 'NGA1'
      ],
      'Indonesia': [
        'ID', 'IDN', 'Indonesia', 'Republic of Indonesia', 'ID1', 'IDN1'
      ],
      'Malaysia': [
        'MY', 'MYS', 'Malaysia', 'MY1', 'MYS1'
      ],
      'Philippines': [
        'PH', 'PHL', 'Philippines', 'Republic of the Philippines', 'PH1', 'PHL1'
      ],
      'Vietnam': [
        'VN', 'VNM', 'Vietnam', 'Socialist Republic of Vietnam', 'VN1', 'VNM1'
      ]
    };

    // Create a comprehensive set of visited country identifiers
    const visitedCountryIdentifiers = new Set<string>();
    
    console.log('🌍 Processing travel data:', sampleTravelData.cities);
    
    sampleTravelData.cities.forEach(city => {
      const countryName = city.country;
      console.log(`📍 Processing city: ${city.city}, ${countryName}`);
      
      const mappings = countryMapping[countryName];
      
      if (mappings) {
        // Add all possible identifiers for this country
        mappings.forEach(identifier => {
          visitedCountryIdentifiers.add(identifier.toLowerCase());
        });
        console.log(`✅ Added mappings for ${countryName}:`, mappings);
      } else {
        console.log(`⚠️ No mapping found for ${countryName}`);
      }
      
      // Also add the exact country name
      visitedCountryIdentifiers.add(countryName.toLowerCase());
    });

    console.log('🎯 Final visited country identifiers:', Array.from(visitedCountryIdentifiers));

    // Enhanced function to check if a country is visited
    const isCountryVisited = (countryFeature: any): boolean => {
      const props = countryFeature.properties;
      
      // Get all possible identifiers for this country feature
      const possibleIdentifiers = [
        props.ISO_A2,
        props.ISO_A3, 
        props.ADM0_A3,
        props.SOV_A3,
        props.WB_A2,
        props.WB_A3,
        props.NAME,
        props.NAME_EN,
        props.NAME_LONG,
        props.ADMIN,
        props.SOVEREIGNT,
        props.GEOUNIT,
        props.NAME_SORT,
        props.FORMAL_EN,
        props.FORMAL_FR,
        props.SUBUNIT,
        props.SU_A3,
        props.BRK_A3,
        props.BRK_NAME,
        props.BRK_GROUP,
        props.ABBREV,
        props.POSTAL,
        props.NAME_CIAWF
      ].filter(Boolean).map(id => String(id).toLowerCase());
      
      // Check if any identifier matches our visited countries
      const isVisited = possibleIdentifiers.some(identifier => 
        visitedCountryIdentifiers.has(identifier)
      );
      
      // Special debug logging for Argentina
      if (possibleIdentifiers.some(id => 
        id.includes('arg') || 
        id.includes('argentina') || 
        id === 'ar'
      )) {
        console.log('🇦🇷 Argentina country feature found:', {
          identifiers: possibleIdentifiers,
          isVisited,
          visitedSet: Array.from(visitedCountryIdentifiers),
          matchingIdentifiers: possibleIdentifiers.filter(id => visitedCountryIdentifiers.has(id))
        });
      }
      
      return isVisited;
    };

    // Draw countries with proper coloring
    mapGroup.selectAll(".country")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", (d: any) => {
        const isVisited = isCountryVisited(d);
        return isVisited ? theme.colors.primary : '#f3f4f6';
      })
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d: any) {
        const isVisited = isCountryVisited(d);
        
        // Change color on hover
        d3.select(this)
          .attr("fill", isVisited ? theme.colors.accent : '#e5e7eb');
        
        // Show tooltip
        setShowTooltip({
          x: event.pageX,
          y: event.pageY,
          content: {
            name: d.properties.NAME || d.properties.NAME_EN || d.properties.ADMIN,
            visited: isVisited
          }
        });
      })
      .on("mouseout", function(event, d: any) {
        const isVisited = isCountryVisited(d);
        
        // Reset color
        d3.select(this)
          .attr("fill", isVisited ? theme.colors.primary : '#f3f4f6');
        
        setShowTooltip(null);
      });

    // Draw city markers
    mapGroup.selectAll(".city-marker")
      .data(sampleTravelData.cities)
      .enter()
      .append("circle")
      .attr("class", "city-marker")
      .attr("cx", (d: any) => projection(d.coordinates)?.[0] || 0)
      .attr("cy", (d: any) => projection(d.coordinates)?.[1] || 0)
      .attr("r", 6)
      .attr("fill", theme.colors.accent)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d: any) {
        d3.select(this)
          .attr("r", 8)
          .attr("fill", theme.colors.success);
        
        setShowTooltip({
          x: event.pageX,
          y: event.pageY,
          content: {
            city: d.city,
            country: d.country,
            date: d.date,
            description: d.description
          }
        });
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("r", 6)
          .attr("fill", theme.colors.accent);
        
        setShowTooltip(null);
      })
      .on("click", function(event, d: any) {
        setSelectedCity(d);
      });

    // Add city labels for larger zoom levels
    mapGroup.selectAll(".city-label")
      .data(sampleTravelData.cities)
      .enter()
      .append("text")
      .attr("class", "city-label")
      .attr("x", (d: any) => (projection(d.coordinates)?.[0] || 0) + 10)
      .attr("y", (d: any) => (projection(d.coordinates)?.[1] || 0) - 10)
      .text((d: any) => d.city)
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("fill", theme.colors.text)
      .style("opacity", 0)
      .style("pointer-events", "none");

    setMapInitialized(true);
  }, [worldData, theme, mapInitialized, sampleTravelData]);

  // Initialize map when data is ready and view is map
  useEffect(() => {
    if (viewMode === 'map' && worldData && !isLoading) {
      // Reset map initialization when switching back to map view
      setMapInitialized(false);
      setTimeout(() => {
        initializeMap();
      }, 100);
    }
  }, [viewMode, worldData, isLoading, initializeMap]);

  // Update labels based on zoom level
  useEffect(() => {
    if (mapInitialized && svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll(".city-label")
        .style("opacity", zoom > 2 ? 1 : 0);
    }
  }, [zoom, mapInitialized]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (worldData && viewMode === 'map') {
        setMapInitialized(false);
        setTimeout(() => {
          initializeMap();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [worldData, viewMode, initializeMap]);

  const resetZoom = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition()
        .duration(750)
        .call(
          d3.zoom().transform as any,
          d3.zoomIdentity
        );
      setZoom(1);
    }
  };

  const filteredCities = sampleTravelData.cities.filter(city =>
    city.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCities = [...filteredCities].sort((a, b) => {
    const [monthA, yearA] = a.date.split('/');
    const [monthB, yearB] = b.date.split('/');
    const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1);
    const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1);
    return dateA.getTime() - dateB.getTime();
  });

  const renderMapView = () => (
    <div className="space-y-6">
      {/* Map Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center px-4 py-2 rounded-xl border-2 transition-all duration-300 hover:shadow-md"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: theme.colors.primary + '20'
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          )}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cities or countries..."
              className="pl-10 pr-4 py-2 rounded-xl border-2 transition-all duration-300 focus:outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: theme.colors.primary + '20'
              }}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('timeline')}
              className="flex items-center px-4 py-2 rounded-xl border-2 transition-all duration-300 hover:shadow-md"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: theme.colors.primary + '20'
              }}
            >
              <List className="w-4 h-4 mr-2" />
              Timeline
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={resetZoom}
            className="p-2 rounded-xl border-2 transition-all duration-300 hover:shadow-md"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderColor: theme.colors.primary + '20'
            }}
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <div className="text-sm text-gray-600 px-3 py-2 rounded-xl border"
               style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
            Zoom: {zoom.toFixed(1)}x
          </div>
        </div>
      </motion.div>

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        ref={containerRef}
        className="relative w-full h-[600px] rounded-3xl border shadow-lg overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
          borderColor: theme.colors.primary + '20'
        }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4 mx-auto"></div>
              <p className="text-gray-600">Loading world map...</p>
            </div>
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-full" />
        )}

        {/* Enhanced Legend */}
        <div className="absolute bottom-4 left-4 p-4 rounded-2xl border shadow-lg"
             style={{
               background: 'rgba(255,255,255,0.95)',
               borderColor: theme.colors.primary + '20'
             }}>
          <h3 className="text-sm font-bold text-gray-800 mb-3">Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <span className="text-xs text-gray-600">Visited Countries</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-gray-200" />
              <span className="text-xs text-gray-600">Unvisited Countries</span>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white"
                style={{ backgroundColor: theme.colors.accent }}
              />
              <span className="text-xs text-gray-600">Visited Cities</span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="absolute top-4 right-4 p-4 rounded-2xl border shadow-lg"
             style={{
               background: 'rgba(255,255,255,0.95)',
               borderColor: theme.colors.primary + '20'
             }}>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
              {new Set(sampleTravelData.cities.map(city => city.country)).size}
            </div>
            <div className="text-xs text-gray-600">Countries</div>
          </div>
          <div className="text-center mt-2">
            <div className="text-2xl font-bold" style={{ color: theme.colors.accent }}>
              {sampleTravelData.cities.length}
            </div>
            <div className="text-xs text-gray-600">Cities</div>
          </div>
        </div>
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-50 p-3 rounded-xl border shadow-lg pointer-events-none"
            style={{
              left: showTooltip.x + 10,
              top: showTooltip.y - 10,
              background: 'rgba(255,255,255,0.98)',
              borderColor: theme.colors.primary + '40'
            }}
          >
            {showTooltip.content.city ? (
              <div>
                <div className="font-bold text-gray-800">{showTooltip.content.city}</div>
                <div className="text-sm text-gray-600">{showTooltip.content.country}</div>
                <div className="text-xs text-gray-500 mt-1">{showTooltip.content.date}</div>
                {showTooltip.content.description && (
                  <div className="text-xs text-gray-600 mt-2 max-w-xs">
                    {showTooltip.content.description}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="font-bold text-gray-800">{showTooltip.content.name}</div>
                <div className="text-xs" style={{ 
                  color: showTooltip.content.visited ? theme.colors.success : '#6b7280' 
                }}>
                  {showTooltip.content.visited ? '✓ Visited' : 'Not visited'}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderTimelineView = () => (
    <div className="space-y-6">
      {/* Timeline Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <button
          onClick={() => setViewMode('map')}
          className="flex items-center px-4 py-2 rounded-xl border-2 transition-all duration-300 hover:shadow-md"
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderColor: theme.colors.primary + '20'
          }}
        >
          <Map className="w-4 h-4 mr-2" />
          Back to Map
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Travel Timeline</h2>
          <p className="text-gray-600">{sortedCities.length} destinations chronologically</p>
        </div>

        <div className="w-24" /> {/* Spacer for centering */}
      </motion.div>

      {/* Timeline with Scrollbar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative max-h-[70vh] overflow-y-auto pr-4 timeline-container"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.colors.primary}40 transparent`
        }}
      >
        {/* Custom scrollbar styles */}
        <style jsx>{`
          .timeline-container::-webkit-scrollbar {
            width: 8px;
          }
          .timeline-container::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.1);
            border-radius: 4px;
          }
          .timeline-container::-webkit-scrollbar-thumb {
            background: ${theme.colors.primary}60;
            border-radius: 4px;
          }
          .timeline-container::-webkit-scrollbar-thumb:hover {
            background: ${theme.colors.primary}80;
          }
        `}</style>
        
        <div>
          {/* Timeline line */}
          <div 
            className="absolute left-8 top-0 bottom-0 w-0.5"
            style={{ backgroundColor: theme.colors.primary + '40' }}
          />

          <div className="space-y-8 pb-8">
            {sortedCities.map((city, index) => (
              <motion.div
                key={`${city.city}-${city.date}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start space-x-6"
              >
                {/* Timeline dot */}
                <div 
                  className="w-4 h-4 rounded-full border-4 border-white shadow-lg flex-shrink-0 mt-2"
                  style={{ backgroundColor: theme.colors.primary }}
                />

                {/* Content card */}
                <div 
                  className="flex-1 p-6 rounded-2xl border shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                    borderColor: theme.colors.primary + '20'
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <MapPin className="w-5 h-5 mr-2" style={{ color: theme.colors.primary }} />
                        {city.city}
                      </h3>
                      <p className="text-gray-600">{city.country}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {city.date}
                      </div>
                    </div>
                  </div>

                  {city.description && (
                    <p className="text-gray-700 leading-relaxed">{city.description}</p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Visit #{index + 1}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCity(city);
                        setViewMode('map');
                      }}
                      className="flex items-center text-sm font-semibold transition-colors duration-200"
                      style={{ color: theme.colors.primary }}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      View on Map
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%)`
          }}
        />
        
        {/* Subtle accent elements */}
        <div 
          className="absolute top-20 right-20 w-32 h-32 rounded-full blur-2xl opacity-15"
          style={{
            background: `radial-gradient(circle, ${theme.colors.primary}60 0%, transparent 70%)`
          }}
        />
        <div 
          className="absolute bottom-32 left-32 w-24 h-24 rounded-full blur-xl opacity-10"
          style={{
            background: `radial-gradient(circle, ${theme.colors.accent}50 0%, transparent 70%)`
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 mr-3" style={{ color: theme.colors.primary }} />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Travel Map
            </h1>
            <Plane className="w-8 h-8 ml-3" style={{ color: theme.colors.accent }} />
          </div>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Explore your journey across the globe with an interactive visualization of all your travels
          </p>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {viewMode === 'map' ? (
            <motion.div key="map">
              {renderMapView()}
            </motion.div>
          ) : (
            <motion.div key="timeline">
              {renderTimelineView()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* City Detail Modal */}
        <AnimatePresence>
          {selectedCity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedCity(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                  borderColor: theme.colors.primary + '20',
                  boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 20px ${theme.colors.primary}10`
                }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                      <MapPin className="w-8 h-8 mr-3" style={{ color: theme.colors.primary }} />
                      {selectedCity.city}
                    </h2>
                    <p className="text-xl text-gray-600">{selectedCity.country}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCity(null)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span>Visited in {selectedCity.date}</span>
                  </div>

                  {selectedCity.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">About this visit</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedCity.description}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Coordinates: {selectedCity.coordinates[1].toFixed(4)}, {selectedCity.coordinates[0].toFixed(4)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};