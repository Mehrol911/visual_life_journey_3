import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, X, Calendar, Sparkles, Navigation, Globe, Plane, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfessionTheme } from '../types';
import { WORLD_CITIES, getCitiesByCountry, getAllCountries, findCityCoordinates } from '../data/worldCities';

interface Visit {
  id: string;
  city: string;
  country: string;
  date: string;
  lat?: number;
  lng?: number;
}

interface WorldMapProps {
  theme: ProfessionTheme;
  onComplete?: (visits: Visit[]) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({ theme, onComplete }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
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

  const addVisit = () => {
    if (!currentVisit.city || !currentVisit.country) {
      setDateError('Please select both country and city');
      return;
    }

    if (!validateDate()) {
      return;
    }

    const coordinates = findCityCoordinates(currentVisit.city, currentVisit.country);
    const dateString = `${currentVisit.month}/${currentVisit.year}`;

    const newVisit: Visit = {
      id: Date.now().toString(),
      city: currentVisit.city,
      country: currentVisit.country,
      date: dateString,
      lat: coordinates?.lat,
      lng: coordinates?.lng
    };
    
    setVisits([...visits, newVisit]);
    setCurrentVisit({ city: '', country: '', date: '', month: '', year: '' });
    setDateError('');
  };

  const removeVisit = (id: string) => {
    setVisits(visits.filter(v => v.id !== id));
  };

  const visualizeJourney = () => {
    setShowForm(false);
    setIsVisualizing(true);
    if (onComplete) {
      onComplete(visits);
    }
  };

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
                      ⚠️ {dateError}
                    </motion.p>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addVisit}
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg"
                  style={{ 
                    background: theme.gradients.primary,
                    boxShadow: `0 4px 20px ${theme.colors.primary}40`
                  }}
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Add Visit
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
                              <p className="text-gray-600 text-sm">{visit.date}</p>
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
                      <p className="text-xs text-gray-500 mt-1">{visit.date}</p>
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