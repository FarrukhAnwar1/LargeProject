import React, { useState, useEffect } from 'react';
import { buildPath } from '../utils/Path';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import CarCard from './CarCard';

interface Car {
    _id: string;
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
    rentalStatus: string;
    carType: string;
    companyName: string;
    mileage: number;
    currentRental?: string;
}

function CarsUI() {
    const navigate = useNavigate();
    const [cars, setCars] = useState<Car[]>([]);
    const [allCars, setAllCars] = useState<Car[]>([]); // Store all cars for filter options
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        make: '',
        model: '',
        year: '',
        carType: '',
        rentalStatus: ''
    });
    
    // load all cars initially
    useEffect(() => {
        loadAllCars();
    }, []); // Only run on load

    //  load filtered cars when filters change
    useEffect(() => {
        loadFilteredCars();
    }, [filters]); // Run when filters change

    const uniqueMakes = Array.from(new Set(allCars.map(car => car.make))).sort();
    const uniqueModels = Array.from(new Set(allCars.map(car => car.model))).sort();
    const uniqueYears = Array.from(new Set(allCars.map(car => car.year))).sort((a, b) => b - a);
    const carTypes = ['sedan', 'suv', 'truck', 'van', 'coupe', 'convertible', 'hatchback', 'other'];
    const rentalStatuses = ['available', 'rented', 'maintenance'];

    const loadAllCars = async () => {
        try {
            const response = await axios.get(buildPath('api/car'));
            if (response.data.success) {
                setAllCars(response.data.cars);
                setCars(response.data.cars); // show all cars
            } else {
                setError('Failed to load cars');
            }
        } catch (err) {
            setError('Error loading cars');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadFilteredCars = async () => {
        try {
            // Build query string from active filters
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    queryParams.append(key, value);
                }
            });
            
            const response = await axios.get(buildPath(`api/car?${queryParams}`));
            if (response.data.success) {
                setCars(response.data.cars);
            } else {
                setError('Failed to load cars');
            }
        } catch (err) {
            setError('Error loading cars');
            console.error(err);
        }
    };

    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            make: '',
            model: '',
            year: '',
            carType: '',
            rentalStatus: ''
        });
    };
    
    const addCar = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        navigate('/cars/add');
    };

    const handleCarDeleted = () => {
        loadFilteredCars();
    }

    return (
        <div className="container mx-auto p-4">
            {loading ? (
                <div>Loading cars...</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <>
                    <div id="cardUIDiv" className="bg-[var(--muted)] mx-auto p-4 rounded-lg shadow-md">
                        <div className="filter-section max-w-screen-lg mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                                <select
                                    value={filters.make}
                                    onChange={(e) => handleFilterChange('make', e.target.value)}
                                    className="p-2 border bg-white rounded"
                                >
                                    <option value="">Select Make</option>
                                    {uniqueMakes.map(make => (
                                        <option key={make} value={make}>{make}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.model}
                                    onChange={(e) => handleFilterChange('model', e.target.value)}
                                    className="p-2 border bg-white rounded"
                                >
                                    <option value="">Select Model</option>
                                    {uniqueModels.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.year}
                                    onChange={(e) => handleFilterChange('year', e.target.value)}
                                    className="p-2 border bg-white rounded"
                                >
                                    <option value="">Select Year</option>
                                    {uniqueYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.carType}
                                    onChange={(e) => handleFilterChange('carType', e.target.value)}
                                    className="p-2 border bg-white rounded"
                                >
                                    <option value="">Select Type</option>
                                    {carTypes.map(type => (
                                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.rentalStatus}
                                    onChange={(e) => handleFilterChange('rentalStatus', e.target.value)}
                                    className="p-2 border bg-white rounded"
                                >
                                    <option value="">Select Status</option>
                                    {rentalStatuses.map(status => (
                                        <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-between">
                                <button
                                    onClick={resetFilters}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Reset Filters
                                </button>
                                <button 
                                    type="button" 
                                    id="addCardButton"
                                    onClick={addCar}
                                    className="bg-green-500 text-white p-2 rounded-full"
                                >
                                    Add Car
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">Your Cars</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cars.map(car => (
                            <CarCard key={car._id} onDelete={handleCarDeleted} car={car}  />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default CarsUI;