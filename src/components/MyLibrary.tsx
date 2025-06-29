import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfessionTheme } from '../types';
import { 
  BookOpen, 
  Plus, 
  Star, 
  Calendar, 
  User, 
  Heart, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  Quote,
  Award,
  Lightbulb,
  X,
  Save,
  Users,
  Library,
  Camera,
  Upload
} from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  startDate: string; // MM/YYYY format
  finishDate: string; // MM/YYYY format
  rating: number; // 1-5 stars
  keyTakeaways: string[];
  notes?: string;
  category?: string;
}

interface Hero {
  id: string;
  name: string;
  profession: string;
  description: string;
  keyTakeaways: string[];
  inspiration: string;
  imageUrl?: string;
}

interface MyLibraryProps {
  theme: ProfessionTheme;
}

type ActiveTab = 'books' | 'heroes';
type ActiveModal = 'book' | 'hero' | null;

export const MyLibrary: React.FC<MyLibraryProps> = ({ theme }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('books');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Books state
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Partial<Book>>({
    title: '',
    author: '',
    startDate: '',
    finishDate: '',
    rating: 5,
    keyTakeaways: ['', '', ''],
    notes: '',
    category: ''
  });

  // Heroes state
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [currentHero, setCurrentHero] = useState<Partial<Hero>>({
    name: '',
    profession: '',
    description: '',
    keyTakeaways: ['', '', ''],
    inspiration: '',
    imageUrl: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Generate month/year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
  const months = [
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

  // Date comparison utility
  const compareDates = (date1: string, date2: string): number => {
    if (!date1 || !date2) return 0;
    
    const [month1, year1] = date1.split('/').map(Number);
    const [month2, year2] = date2.split('/').map(Number);
    
    if (year1 !== year2) return year1 - year2;
    return month1 - month2;
  };

  const validateBook = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!currentBook.title?.trim()) {
      newErrors.title = 'Book title is required';
    }
    if (!currentBook.author?.trim()) {
      newErrors.author = 'Author name is required';
    }
    if (!currentBook.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!currentBook.finishDate) {
      newErrors.finishDate = 'Finish date is required';
    }
    
    // Date validation: finish date should not be earlier than start date
    if (currentBook.startDate && currentBook.finishDate) {
      const dateComparison = compareDates(currentBook.startDate, currentBook.finishDate);
      if (dateComparison > 0) {
        newErrors.finishDate = 'Finish date cannot be earlier than start date';
      }
    }
    
    if (currentBook.keyTakeaways?.some(takeaway => !takeaway.trim())) {
      newErrors.keyTakeaways = 'All three key takeaways are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateHero = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!currentHero.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!currentHero.profession?.trim()) {
      newErrors.profession = 'Profession is required';
    }
    if (!currentHero.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (currentHero.keyTakeaways?.some(takeaway => !takeaway.trim())) {
      newErrors.keyTakeaways = 'All three key takeaways are required';
    }
    if (!currentHero.inspiration?.trim()) {
      newErrors.inspiration = 'Inspiration is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveBook = () => {
    if (!validateBook()) return;

    const newBook: Book = {
      id: Date.now().toString(),
      title: currentBook.title!,
      author: currentBook.author!,
      startDate: currentBook.startDate!,
      finishDate: currentBook.finishDate!,
      rating: currentBook.rating || 5,
      keyTakeaways: currentBook.keyTakeaways!,
      notes: currentBook.notes,
      category: currentBook.category
    };

    setBooks([...books, newBook]);
    setCurrentBook({
      title: '',
      author: '',
      startDate: '',
      finishDate: '',
      rating: 5,
      keyTakeaways: ['', '', ''],
      notes: '',
      category: ''
    });
    setActiveModal(null);
    setErrors({});
  };

  const saveHero = () => {
    if (!validateHero()) return;

    const newHero: Hero = {
      id: Date.now().toString(),
      name: currentHero.name!,
      profession: currentHero.profession!,
      description: currentHero.description!,
      keyTakeaways: currentHero.keyTakeaways!,
      inspiration: currentHero.inspiration!,
      imageUrl: currentHero.imageUrl
    };

    setHeroes([...heroes, newHero]);
    setCurrentHero({
      name: '',
      profession: '',
      description: '',
      keyTakeaways: ['', '', ''],
      inspiration: '',
      imageUrl: ''
    });
    setActiveModal(null);
    setErrors({});
  };

  const deleteBook = (id: string) => {
    setBooks(books.filter(book => book.id !== id));
  };

  const deleteHero = (id: string) => {
    setHeroes(heroes.filter(hero => hero.id !== id));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setCurrentHero(prev => ({ ...prev, imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === null || book.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const filteredHeroes = heroes.filter(hero => 
    hero.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hero.profession.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate && onRate(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-200`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderBookModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setActiveModal(null)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
          borderColor: theme.colors.primary + '20',
          boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 20px ${theme.colors.primary}10`
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center">
            <BookOpen className="w-6 h-6 mr-3" style={{ color: theme.colors.primary }} />
            Add New Book
          </h3>
          <button
            onClick={() => setActiveModal(null)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Book Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Book Title *
            </label>
            <input
              type="text"
              value={currentBook.title || ''}
              onChange={(e) => setCurrentBook(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
              style={{
                borderColor: errors.title ? '#ef4444' : theme.colors.primary + '20',
                backgroundColor: 'rgba(255,255,255,0.9)'
              }}
              placeholder="Enter book title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Author *
            </label>
            <input
              type="text"
              value={currentBook.author || ''}
              onChange={(e) => setCurrentBook(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
              style={{
                borderColor: errors.author ? '#ef4444' : theme.colors.primary + '20',
                backgroundColor: 'rgba(255,255,255,0.9)'
              }}
              placeholder="Enter author name"
            />
            {errors.author && (
              <p className="text-red-500 text-sm mt-1">{errors.author}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Started Reading *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={currentBook.startDate?.split('/')[0] || ''}
                  onChange={(e) => {
                    const month = e.target.value;
                    const year = currentBook.startDate?.split('/')[1] || '';
                    const newStartDate = month && year ? `${month}/${year}` : month ? `${month}/` : '';
                    setCurrentBook(prev => ({ ...prev, startDate: newStartDate }));
                    
                    // Clear finish date error if dates become valid
                    if (errors.finishDate && currentBook.finishDate && newStartDate) {
                      const comparison = compareDates(newStartDate, currentBook.finishDate);
                      if (comparison <= 0) {
                        setErrors(prev => ({ ...prev, finishDate: '' }));
                      }
                    }
                  }}
                  className="px-3 py-2 rounded-lg border-2 text-sm focus:outline-none"
                  style={{
                    borderColor: errors.startDate ? '#ef4444' : theme.colors.primary + '20',
                    backgroundColor: 'rgba(255,255,255,0.9)'
                  }}
                >
                  <option value="">Month</option>
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  value={currentBook.startDate?.split('/')[1] || ''}
                  onChange={(e) => {
                    const year = e.target.value;
                    const month = currentBook.startDate?.split('/')[0] || '';
                    const newStartDate = month && year ? `${month}/${year}` : year ? `/${year}` : '';
                    setCurrentBook(prev => ({ ...prev, startDate: newStartDate }));
                    
                    // Clear finish date error if dates become valid
                    if (errors.finishDate && currentBook.finishDate && newStartDate) {
                      const comparison = compareDates(newStartDate, currentBook.finishDate);
                      if (comparison <= 0) {
                        setErrors(prev => ({ ...prev, finishDate: '' }));
                      }
                    }
                  }}
                  className="px-3 py-2 rounded-lg border-2 text-sm focus:outline-none"
                  style={{
                    borderColor: errors.startDate ? '#ef4444' : theme.colors.primary + '20',
                    backgroundColor: 'rgba(255,255,255,0.9)'
                  }}
                >
                  <option value="">Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Finished Reading *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={currentBook.finishDate?.split('/')[0] || ''}
                  onChange={(e) => {
                    const month = e.target.value;
                    const year = currentBook.finishDate?.split('/')[1] || '';
                    const newFinishDate = month && year ? `${month}/${year}` : month ? `${month}/` : '';
                    setCurrentBook(prev => ({ ...prev, finishDate: newFinishDate }));
                    
                    // Validate against start date
                    if (currentBook.startDate && newFinishDate) {
                      const comparison = compareDates(currentBook.startDate, newFinishDate);
                      if (comparison > 0) {
                        setErrors(prev => ({ ...prev, finishDate: 'Finish date cannot be earlier than start date' }));
                      } else {
                        setErrors(prev => ({ ...prev, finishDate: '' }));
                      }
                    }
                  }}
                  className="px-3 py-2 rounded-lg border-2 text-sm focus:outline-none"
                  style={{
                    borderColor: errors.finishDate ? '#ef4444' : theme.colors.primary + '20',
                    backgroundColor: 'rgba(255,255,255,0.9)'
                  }}
                >
                  <option value="">Month</option>
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  value={currentBook.finishDate?.split('/')[1] || ''}
                  onChange={(e) => {
                    const year = e.target.value;
                    const month = currentBook.finishDate?.split('/')[0] || '';
                    const newFinishDate = month && year ? `${month}/${year}` : year ? `/${year}` : '';
                    setCurrentBook(prev => ({ ...prev, finishDate: newFinishDate }));
                    
                    // Validate against start date
                    if (currentBook.startDate && newFinishDate) {
                      const comparison = compareDates(currentBook.startDate, newFinishDate);
                      if (comparison > 0) {
                        setErrors(prev => ({ ...prev, finishDate: 'Finish date cannot be earlier than start date' }));
                      } else {
                        setErrors(prev => ({ ...prev, finishDate: '' }));
                      }
                    }
                  }}
                  className="px-3 py-2 rounded-lg border-2 text-sm focus:outline-none"
                  style={{
                    borderColor: errors.finishDate ? '#ef4444' : theme.colors.primary + '20',
                    backgroundColor: 'rgba(255,255,255,0.9)'
                  }}
                >
                  <option value="">Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              {errors.finishDate && (
                <p className="text-red-500 text-sm mt-1">{errors.finishDate}</p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rating
            </label>
            {renderStars(currentBook.rating || 5, true, (rating) => 
              setCurrentBook(prev => ({ ...prev, rating }))
            )}
          </div>

          {/* Key Takeaways */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Three Key Takeaways *
            </label>
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="relative">
                  <div 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: theme.colors.primary }}
                  >
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={currentBook.keyTakeaways?.[index] || ''}
                    onChange={(e) => {
                      const newTakeaways = [...(currentBook.keyTakeaways || ['', '', ''])];
                      newTakeaways[index] = e.target.value;
                      setCurrentBook(prev => ({ ...prev, keyTakeaways: newTakeaways }));
                    }}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                    style={{
                      borderColor: errors.keyTakeaways ? '#ef4444' : theme.colors.primary + '20',
                      backgroundColor: 'rgba(255,255,255,0.9)'
                    }}
                    placeholder={`Key takeaway ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            {errors.keyTakeaways && (
              <p className="text-red-500 text-sm mt-1">{errors.keyTakeaways}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={currentBook.notes || ''}
              onChange={(e) => setCurrentBook(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none resize-none h-24"
              style={{
                borderColor: theme.colors.primary + '20',
                backgroundColor: 'rgba(255,255,255,0.9)'
              }}
              placeholder="Any additional thoughts or notes about this book..."
            />
          </div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={saveBook}
            className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg"
            style={{ 
              background: theme.gradients.primary,
              boxShadow: `0 4px 20px ${theme.colors.primary}40`
            }}
          >
            <Save className="w-5 h-5 inline mr-2" />
            Save Book
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderHeroModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setActiveModal(null)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
          borderColor: theme.colors.primary + '20',
          boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 20px ${theme.colors.primary}10`
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center">
            <Award className="w-6 h-6 mr-3" style={{ color: theme.colors.primary }} />
            Add New Hero/Mentor
          </h3>
          <button
            onClick={() => setActiveModal(null)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="text-center">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Profile Picture (Optional)
            </label>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {currentHero.imageUrl ? (
                  <img
                    src={currentHero.imageUrl}
                    alt="Hero profile"
                    className="w-24 h-24 rounded-full object-cover border-4 shadow-lg"
                    style={{ borderColor: theme.colors.primary }}
                  />
                ) : (
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 shadow-lg"
                    style={{ 
                      background: theme.gradients.primary,
                      borderColor: theme.colors.primary
                    }}
                  >
                    {currentHero.name ? currentHero.name.charAt(0).toUpperCase() : <Camera className="w-8 h-8" />}
                  </div>
                )}
                <label className="absolute -bottom-2 -right-2 p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform"
                       style={{ background: theme.colors.primary }}>
                  <Upload className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 text-center max-w-xs">
                Upload a photo or we'll use their initials
              </p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={currentHero.name || ''}
              onChange={(e) => setCurrentHero(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
              style={{
                borderColor: errors.name ? '#ef4444' : theme.colors.primary + '20',
                backgroundColor: 'rgba(255,255,255,0.9)'
              }}
              placeholder="Enter their name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Profession */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Profession/Field *
            </label>
            <input
              type="text"
              value={currentHero.profession || ''}
              onChange={(e) => setCurrentHero(prev => ({ ...prev, profession: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
              style={{
                borderColor: errors.profession ? '#ef4444' : theme.colors.primary + '20',
                backgroundColor: 'rgba(255,255,255,0.9)'
              }}
              placeholder="e.g., Entrepreneur, Scientist, Artist"
            />
            {errors.profession && (
              <p className="text-red-500 text-sm mt-1">{errors.profession}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={currentHero.description || ''}
              onChange={(e) => setCurrentHero(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none resize-none h-24"
              style={{
                borderColor: errors.description ? '#ef4444' : theme.colors.primary + '20',
                backgroundColor: 'rgba(255,255,255,0.9)'
              }}
              placeholder="Brief description of who they are and their achievements..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Key Takeaways */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Three Key Takeaways *
            </label>
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="relative">
                  <div 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: theme.colors.primary }}
                  >
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={currentHero.keyTakeaways?.[index] || ''}
                    onChange={(e) => {
                      const newTakeaways = [...(currentHero.keyTakeaways || ['', '', ''])];
                      newTakeaways[index] = e.target.value;
                      setCurrentHero(prev => ({ ...prev, keyTakeaways: newTakeaways }));
                    }}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                    style={{
                      borderColor: errors.keyTakeaways ? '#ef4444' : theme.colors.primary + '20',
                      backgroundColor: 'rgba(255,255,255,0.9)'
                    }}
                    placeholder={`Key lesson ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            {errors.keyTakeaways && (
              <p className="text-red-500 text-sm mt-1">{errors.keyTakeaways}</p>
            )}
          </div>

          {/* Inspiration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Why They Inspire You *
            </label>
            <textarea
              value={currentHero.inspiration || ''}
              onChange={(e) => setCurrentHero(prev => ({ ...prev, inspiration: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none resize-none h-24"
              style={{
                borderColor: errors.inspiration ? '#ef4444' : theme.colors.primary + '20',
                backgroundColor: 'rgba(255,255,255,0.9)'
              }}
              placeholder="What about them inspires you and motivates your journey..."
            />
            {errors.inspiration && (
              <p className="text-red-500 text-sm mt-1">{errors.inspiration}</p>
            )}
          </div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={saveHero}
            className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg"
            style={{ 
              background: theme.gradients.primary,
              boxShadow: `0 4px 20px ${theme.colors.primary}40`
            }}
          >
            <Save className="w-5 h-5 inline mr-2" />
            Save Hero/Mentor
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
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
            <Library className="w-8 h-8 mr-3" style={{ color: theme.colors.primary }} />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              My Library
            </h1>
            <Users className="w-8 h-8 ml-3" style={{ color: theme.colors.accent }} />
          </div>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Curate your collection of wisdom from books and heroes who shape your journey
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex bg-white/80 backdrop-blur-lg rounded-2xl p-2 shadow-lg border"
               style={{ borderColor: theme.colors.primary + '20' }}>
            <button
              onClick={() => setActiveTab('books')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center ${
                activeTab === 'books'
                  ? 'text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{
                background: activeTab === 'books' ? theme.gradients.primary : 'transparent'
              }}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Books ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('heroes')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center ${
                activeTab === 'heroes'
                  ? 'text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{
                background: activeTab === 'heroes' ? theme.gradients.primary : 'transparent'
              }}
            >
              <Award className="w-5 h-5 mr-2" />
              Heroes & Mentors ({heroes.length})
            </button>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 focus:outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: theme.colors.primary + '20'
              }}
              placeholder={activeTab === 'books' ? 'Search books or authors...' : 'Search heroes or professions...'}
            />
          </div>
          
          {activeTab === 'books' && (
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterRating || ''}
                onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
                className="px-4 py-3 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 focus:outline-none"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderColor: theme.colors.primary + '20'
                }}
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveModal(activeTab === 'books' ? 'book' : 'hero')}
            className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300"
            style={{ 
              background: theme.gradients.primary,
              boxShadow: `0 4px 20px ${theme.colors.primary}40`
            }}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Add {activeTab === 'books' ? 'Book' : 'Hero'}
          </motion.button>
        </motion.div>

        {/* Content - Fixed height container with scroll */}
        <div className="h-[calc(100vh-400px)] overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'books' ? (
              <motion.div
                key="books"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8"
              >
                {filteredBooks.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <BookOpen className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                    <h3 className="text-2xl font-bold text-gray-600 mb-4">
                      {books.length === 0 ? 'Start Your Reading Journey' : 'No Books Found'}
                    </h3>
                    <p className="text-gray-500 mb-8">
                      {books.length === 0 
                        ? 'Add your first book to begin building your personal library'
                        : 'Try adjusting your search or filter criteria'
                      }
                    </p>
                    {books.length === 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveModal('book')}
                        className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg"
                        style={{ background: theme.gradients.primary }}
                      >
                        <Plus className="w-5 h-5 inline mr-2" />
                        Add Your First Book
                      </motion.button>
                    )}
                  </div>
                ) : (
                  filteredBooks.map((book, index) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg hover:shadow-xl transition-all duration-300 group"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                        borderColor: theme.colors.primary + '20'
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                            {book.title}
                          </h3>
                          <p className="text-gray-600 mb-2">by {book.author}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {book.startDate} - {book.finishDate}
                            </span>
                          </div>
                          {renderStars(book.rating)}
                        </div>
                        <button
                          onClick={() => deleteBook(book.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-100 text-red-500 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-700 flex items-center">
                          <Lightbulb className="w-4 h-4 mr-2" style={{ color: theme.colors.primary }} />
                          Key Takeaways
                        </h4>
                        {book.keyTakeaways.map((takeaway, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5 flex-shrink-0"
                              style={{ background: theme.colors.primary }}
                            >
                              {idx + 1}
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{takeaway}</p>
                          </div>
                        ))}
                      </div>

                      {book.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600 italic">"{book.notes}"</p>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="heroes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8"
              >
                {filteredHeroes.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <Award className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                    <h3 className="text-2xl font-bold text-gray-600 mb-4">
                      {heroes.length === 0 ? 'Build Your Hall of Heroes' : 'No Heroes Found'}
                    </h3>
                    <p className="text-gray-500 mb-8">
                      {heroes.length === 0 
                        ? 'Add inspiring people who have shaped your thinking and values'
                        : 'Try adjusting your search criteria'
                      }
                    </p>
                    {heroes.length === 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveModal('hero')}
                        className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg"
                        style={{ background: theme.gradients.primary }}
                      >
                        <Plus className="w-5 h-5 inline mr-2" />
                        Add Your First Hero
                      </motion.button>
                    )}
                  </div>
                ) : (
                  filteredHeroes.map((hero, index) => (
                    <motion.div
                      key={hero.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg hover:shadow-xl transition-all duration-300 group"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                        borderColor: theme.colors.primary + '20'
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            {hero.imageUrl ? (
                              <img
                                src={hero.imageUrl}
                                alt={hero.name}
                                className="w-16 h-16 rounded-full object-cover border-4 mr-4 shadow-lg"
                                style={{ borderColor: theme.colors.primary }}
                              />
                            ) : (
                              <div 
                                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 shadow-lg"
                                style={{ background: theme.gradients.primary }}
                              >
                                {hero.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">{hero.name}</h3>
                              <p className="text-gray-600">{hero.profession}</p>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-4 leading-relaxed">{hero.description}</p>
                        </div>
                        <button
                          onClick={() => deleteHero(hero.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-100 text-red-500 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 flex items-center mb-3">
                            <Lightbulb className="w-4 h-4 mr-2" style={{ color: theme.colors.primary }} />
                            Key Lessons
                          </h4>
                          <div className="space-y-2">
                            {hero.keyTakeaways.map((takeaway, idx) => (
                              <div key={idx} className="flex items-start space-x-3">
                                <div 
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5 flex-shrink-0"
                                  style={{ background: theme.colors.primary }}
                                >
                                  {idx + 1}
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{takeaway}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <h4 className="font-semibold text-gray-700 flex items-center mb-2">
                            <Heart className="w-4 h-4 mr-2" style={{ color: theme.colors.accent }} />
                            Why They Inspire Me
                          </h4>
                          <p className="text-sm text-gray-600 italic leading-relaxed">"{hero.inspiration}"</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'book' && renderBookModal()}
        {activeModal === 'hero' && renderHeroModal()}
      </AnimatePresence>
    </div>
  );
};