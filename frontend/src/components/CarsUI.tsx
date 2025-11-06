import React, { useState, useEffect } from 'react';
import { buildPath } from '../utils/Path';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
}

function CarsUI() {
    const navigate = useNavigate();
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        loadCars();
    }, []);

    const loadCars = async () => {
        try {
            const response = await axios.get(buildPath('api/car'));
            if (response.data.success) {
                setCars(response.data.cars);
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
    
    const addCar = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        navigate('/cars/add');
    };

    return (
        <div className="container mx-auto p-4">
            {loading ? (
                <div>Loading cars...</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Your Cars (JUST FOR TESTING)</h2>
                        <button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={addCar}>
                            Add Car
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cars.map(car => (
                            <div key={car._id} className="bg-white rounded-lg shadow-md p-4">
                                <h3 className="text-xl font-semibold mb-2">{car.year} {car.make} {car.model}</h3>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Color:</span> {car.color}</p>
                                    <p><span className="font-medium">License Plate:</span> {car.licensePlate}</p>
                                    <p><span className="font-medium">Status:</span> {car.rentalStatus}</p>
                                    <p><span className="font-medium">Type:</span> {car.carType}</p>
                                    <p><span className="font-medium">Company:</span> {car.companyName}</p>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button 
                                        onClick={() => navigate(`/cars/${car._id.toString()}`)}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
export default CarsUI;