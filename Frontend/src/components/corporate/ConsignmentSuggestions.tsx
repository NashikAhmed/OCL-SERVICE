import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Package, 
  MapPin, 
  Calendar, 
  ChevronDown,
  Loader2
} from 'lucide-react';

interface ConsignmentSuggestion {
  consignmentNumber: string;
  destination: string;
  bookingDate: string;
  status: string;
}

interface ConsignmentSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: ConsignmentSuggestion) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

const ConsignmentSuggestions: React.FC<ConsignmentSuggestionsProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = "Enter consignment number",
  label = "Consignment Number",
  required = false,
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<ConsignmentSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search function - only search when user types
  useEffect(() => {
    if (searchTerm.length > 0) {
      const timeoutId = setTimeout(() => {
        fetchSuggestions(searchTerm);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [searchTerm]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (search: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('corporateToken');
      const response = await fetch(
        `/api/courier-complaints/consignment-suggestions?search=${encodeURIComponent(search)}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuggestions(data.suggestions);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    // Only show suggestions if user has typed something
    if (searchTerm.length > 0 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleSuggestionClick = (suggestion: ConsignmentSuggestion) => {
    onChange(suggestion.consignmentNumber);
    onSelect(suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return <Badge variant="default" className="text-xs">Delivered</Badge>;
      case 'in transit':
      case 'active':
        return <Badge variant="secondary" className="text-xs">In Transit</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-xs">Pending</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Label htmlFor="consignment-input" className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="consignment-input"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pr-10 border-0 shadow-md focus:shadow-lg transition-shadow duration-200"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border-0 max-h-60 overflow-y-auto"
        >
          {suggestions.length === 0 && !isLoading ? (
            <div className="p-2 text-center text-gray-500 text-xs">
              No consignments found
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <div
                key={suggestion.consignmentNumber}
                className={`p-3 cursor-pointer border-b border-gray-100/50 last:border-b-0 hover:bg-blue-50/50 transition-colors duration-200 ${
                  index === selectedIndex ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      <Package className="h-3 w-3 text-blue-600" />
                      <span className="font-medium text-gray-900 text-sm">
                        {suggestion.consignmentNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{suggestion.destination}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(suggestion.bookingDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-2">
                    {getStatusBadge(suggestion.status)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ConsignmentSuggestions;
