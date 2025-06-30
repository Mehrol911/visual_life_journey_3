import React, { useState, useEffect } from 'react';
import { MapPin, Plus, X, Calendar, Sparkles, Navigation, Globe, Plane, ChevronDown, Loader, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfessionTheme } from '../types';
import { travelVisitsAPI, TravelVisit } from '../lib/database';
import { WORLD_CITIES, getCitiesByCountry, getAllCountries, findCityCoordinates } from '../data/worldCities';
import { InteractiveTravelMap } from './InteractiveTravelMap';

interface WorldMapProps {
  theme: ProfessionTheme;
  onComplete?: (visits: TravelVisit[]) => void;
}

type ViewMode = 'map' | 'timeline';

export const WorldMap: React.FC<WorldMapProps> = ({ 
  theme, 
  onComplete 
}) => {
  const [visits, setVisits] = useState<TravelVisit[]>([]);
  const [currentVisit, setCurrentVisit] = useState({ 
    city: '', 
    country: '', 
    date: '',
    month: '',
    year: ''
  });
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [dateError, setDateError] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const countries = getAllCountries();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Generate year options (from birth year + 1 to current year)
  const yearOptions = Array.from({ length: currentYear - 1950 }, (_, i) => 1951 + i);
  const monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Load visits on component mount
  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const data = await travelVisitsAPI.getAll();
      setVisits(data);
    } catch (error) {
      console.error('Error loading visits:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update available cities when country changes
  useEffect(() => {
    if (currentVisit.country) {
      const cities = getCitiesByCountry(currentVisit.country);
      setAvailableCities(cities.map(city => city.name));
      setCurrentVisit(prev => ({ ...prev, city: '' })); // Reset city when country changes
    } else {
      setAvailableCities([]);
    }
  }, [currentVisit.country]);

  // Validate date
  const validateDate = () => {
    if (!currentVisit.month || !currentVisit.year) {
      setDateError('Please select both month and year');
      return false;
    }

    const visitYear = parseInt(currentVisit.year);
    const visitMonth = parseInt(currentVisit.month);

    // Check if date is in the future
    if (visitYear > currentYear || (visitYear === currentYear && visitMonth > currentMonth)) {
      setDateError('Visit date cannot be in the future');
      return false;
    }

    // Check if date is too old (before 1950)
    if (visitYear < 1950) {
      setDateError('Please select a more recent date');
      return false;
    }

    // Check if visit is at least 1 year after birth (assuming user is at least 1 year old)
    const minVisitYear = 1951; // Simplified check
    if (visitYear < minVisitYear) {
      setDateError('Visit date must be after you were born');
      return false;
    }

    setDateError('');
    return true;
  };

  const addVisit = async () => {
    if (!currentVisit.city || !currentVisit.country) {
      setDateError('Please select both country and city');
      return;
    }

    if (!validateDate()) {
      return;
    }

    setSaving(true);
    try {
      const coordinates = findCityCoordinates(currentVisit.city, currentVisit.country);
      const dateString = `${currentVisit.month}/${currentVisit.year}`;

      const newVisit = await travelVisitsAPI.create({
        city: currentVisit.city,
        country: currentVisit.country,
        visit_date: dateString,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
        photos: []
      });
      
      setVisits([...visits, newVisit]);
      setCurrentVisit({ city: '', country: '', date: '', month: '', year: '' });
      setDateError('');
    } catch (error) {
      console.error('Error saving visit:', error);
      setErrors({ general: 'Failed to save visit. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const removeVisit = async (id: string) => {
    try {
      await travelVisitsAPI.delete(id);
      setVisits(visits.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error deleting visit:', error);
    }
  };

  const visualizeJourney = () => {
    setShowForm(false);
    setIsVisualizing(true);
    if (onComplete) {
      onComplete(visits);
    }
  };

  // Convert visits to travel data format for the interactive map
  const travelData = {
    cities: visits.map(visit => ({
      city: visit.city,
      country: visit.country,
      date: visit.visit_date,
      coordinates: [visit.longitude || 0, visit.latitude || 0] as [number, number],
      description: `Visited ${visit.city} in ${visit.visit_date}`
    })),
    countries: [...new Set(visits.map(visit => {
      // Map country names to ISO codes (simplified mapping)
      const countryCodeMap: { [key: string]: string } = {
        'United States': 'US',
        'United Kingdom': 'GB',
        'France': 'FR',
        'Germany': 'DE',
        'Italy': 'IT',
        'Spain': 'ES',
        'Japan': 'JP',
        'China': 'CN',
        'India': 'IN',
        'Australia': 'AU',
        'Brazil': 'BR',
        'Canada': 'CA',
        'Russia': 'RU',
        'South Korea': 'KR',
        'Mexico': 'MX',
        'Turkey': 'TR',
        'Thailand': 'TH',
        'United Arab Emirates': 'AE',
        'Singapore': 'SG',
        'Egypt': 'EG',
        'South Africa': 'ZA',
        'Argentina': 'AR',
        'Chile': 'CL',
        'Peru': 'PE',
        'Colombia': 'CO',
        'Uzbekistan': 'UZ',
        'Kazakhstan': 'KZ',
        'Morocco': 'MA',
        'Kenya': 'KE',
        'Nigeria': 'NG',
        'Indonesia': 'ID',
        'Malaysia': 'MY',
        'Philippines': 'PH',
        'Vietnam': 'VN'
      };
      return countryCodeMap[visit.country] || visit.country.substring(0, 2).toUpperCase();
    }))]
  };

  // If visualizing and we have visits, show the interactive map
  if (isVisualizing && visits.length > 0) {
    return (
      <InteractiveTravelMap 
        theme={theme} 
        travelData={travelData}
        onBack={() => {
          setIsVisualizing(false);
          setShowForm(true);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: theme.colors.primary }} />
          <p className="text-gray-600">Loading your travel map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-8 relative overflow-hidden">
      {/* Professional background */}
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
      
      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 w-full max-w-3xl"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: theme.gradients.primary }}
              >
                <Globe className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-4xl font-bold mb-4 text-gray-800">
                Your Life Journey
              </h2>
              <p className="text-xl text-gray-600">
                Add the places that shaped your story
              </p>
            </div>
            
            <motion.div
              className="backdrop-blur-lg rounded-3xl p-8 border shadow-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                borderColor: theme.colors.primary + '20',
                boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 20px ${theme.colors.primary}10`
              }}
            >
              {/* Error Display */}
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl border flex items-center"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderColor: '#ef4444',
                    color: '#ef4444'
                  }}
                >
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="text-sm">{errors.general}</span>
                </motion.div>
              )}

              {/* Add visit form */}
              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Country Selection */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Country
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="w-full px-4 py-3 rounded-xl border-2 text-left flex items-center justify-between transition-all duration-300 focus:outline-none"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          borderColor: currentVisit.country ? theme.colors.primary + '60' : theme.colors.primary + '20',
                          color: theme.colors.text
                        }}
                      >
                        <span className={currentVisit.country ? 'text-gray-800' : 'text-gray-500'}>
                          {currentVisit.country || 'Select a country'}
                        </span>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </button>
                      
                      <AnimatePresence>
                        {showCountryDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-20 w-full mt-2 bg-white rounded-xl border shadow-lg max-h-60 overflow-y-auto"
                            style={{ borderColor: theme.colors.primary + '20' }}
                          >
                            {countries.map((country) => (
                              <button
                                key={country}
                                onClick={() => {
                                  setCurrentVisit(prev => ({ ...prev, country }));
                                  setShowCountryDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 text-gray-800"
                              >
                                {country}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* City Selection */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      City
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => currentVisit.country && setShowCityDropdown(!showCityDropdown)}
                        disabled={!currentVisit.country}
                        className="w-full px-4 py-3 rounded-xl border-2 text-left flex items-center justify-between transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          borderColor: currentVisit.city ? theme.colors.primary + '60' : theme.colors.primary + '20',
                          color: theme.colors.text
                        }}
                      >
                        <span className={currentVisit.city ? 'text-gray-800' : 'text-gray-500'}>
                          {currentVisit.city || (currentVisit.country ? 'Select a city' : 'Select country first')}
                        </span>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </button>
                      
                      <AnimatePresence>
                        {showCityDropdown && availableCities.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-20 w-full mt-2 bg-white rounded-xl border shadow-lg max-h-60 overflow-y-auto"
                            style={{ borderColor: theme.colors.primary + '20' }}
                          >
                            {availableCities.map((city) => (
                              <button
                                key={city}
                                onClick={() => {
                                  setCurrentVisit(prev => ({ ...prev, city }));
                                  setShowCityDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 text-gray-800"
                              >
                                {city}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Visit Date
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={currentVisit.month}
                      onChange={(e) => {
                        setCurrentVisit(prev => ({ ...prev, month: e.target.value }));
                        setDateError('');
                      }}
                      className="px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderColor: currentVisit.month ? theme.colors.primary + '60' : theme.colors.primary + '20',
                        color: theme.colors.text
                      }}
                    >
                      <option value="">Select Month</option>
                      {monthOptions.map(month => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={currentVisit.year}
                      onChange={(e) => {
                        setCurrentVisit(prev => ({ ...prev, year: e.target.value }));
                        setDateError('');
                      }}
                      className="px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderColor: currentVisit.year ? theme.colors.primary + '60' : theme.colors.primary + '20',
                        color: theme.colors.text
                      }}
                    >
                      <option value="">Select Year</option>
                      {yearOptions.reverse().map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {dateError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm mt-2 flex items-center text-red-600"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {dateError}
                    </motion.p>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addVisit}
                  disabled={saving}
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: theme.gradients.primary,
                    boxShadow: `0 4px 20px ${theme.colors.primary}40`
                  }}
                >
                  {saving ? (
                    <span className="flex items-center justify-center">
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      Adding Visit...
                    </span>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 inline mr-2" />
                      Add Visit
                    </>
                  )}
                </motion.button>
              </div>
              
              {/* Visits list */}
              {visits.length > 0 && (
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Your Visits ({visits.length})
                  </h3>
                  <div className="max-h-60 overflow-y-auto space-y-3">
                    <AnimatePresence>
                      {visits.map((visit, index) => (
                        <motion.div
                          key={visit.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-xl border shadow-sm"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.7) 100%)',
                            borderColor: theme.colors.primary + '15'
                          }}
                        >
                          <div className="flex items-center space-x-4">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
                              style={{ background: theme.gradients.primary }}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-gray-800 font-semibold">
                                {visit.city}, {visit.country}
                              </p>
                              <p className="text-gray-600 text-sm">{visit.visit_date}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeVisit(visit.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
              
              {/* Visualize button */}
              {visits.length >= 1 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={visualizeJourney}
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 relative overflow-hidden group shadow-lg"
                  style={{ 
                    background: theme.gradients.primary,
                    boxShadow: `0 4px 30px ${theme.colors.primary}60`
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 flex items-center justify-center">
                    <Plane className="w-5 h-5 mr-2" />
                    Visualize My Journey
                    <Sparkles className="w-5 h-5 ml-2" />
                  </span>
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="visualization"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 w-full h-full flex flex-col items-center"
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl font-bold mb-2 text-gray-800">
                Your Journey Through Time
              </h2>
              <p className="text-xl text-gray-600">
                {visits.length} destination{visits.length !== 1 ? 's' : ''}, countless memories
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="relative backdrop-blur-lg rounded-3xl p-8 border shadow-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                borderColor: theme.colors.primary + '20',
                boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 20px ${theme.colors.primary}10`
              }}
            >
              <div className="text-center py-20">
                <Globe className="w-24 h-24 mx-auto mb-6 text-gray-400" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Interactive Map Coming Soon!
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We're building an amazing interactive world map to visualize your journey. 
                  For now, your visits are safely stored.
                </p>
                
                {/* Show visits list */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {visits.map((visit, index) => (
                    <motion.div
                      key={visit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 + index * 0.1 }}
                      className="p-4 rounded-xl border text-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.6) 100%)',
                        borderColor: theme.colors.primary + '20'
                      }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white mx-auto mb-2"
                        style={{ background: theme.colors.primary }}
                      >
                        {index + 1}
                      </div>
                      <p className="font-semibold text-gray-800">{visit.city}</p>
                      <p className="text-sm text-gray-600">{visit.country}</p>
                      <p className="text-xs text-gray-500 mt-1">{visit.visit_date}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowForm(true);
                setIsVisualizing(false);
              }}
              className="mt-8 px-8 py-3 rounded-xl font-semibold text-white border shadow-lg transition-all duration-300"
              style={{
                background: theme.gradients.primary,
                borderColor: theme.colors.primary + '20'
              }}
            >
              <Navigation className="w-5 h-5 inline mr-2" />
              Add More Destinations
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};