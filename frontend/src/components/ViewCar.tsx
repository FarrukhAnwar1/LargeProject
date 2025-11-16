import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { buildPath } from '../utils/Path';

// Configure axios defaults for this component
axios.defaults.withCredentials = true;

type ViewCarProps = {
    carId?: string;
};

type Car = {
    _id: string;
    licensePlate: string;
    year: number;
    color: string;
    make: string;
    model: string;
    mileage: number;
    vehicleIdentificationNumber: string;
    carType: string;
    rentalStatus: string;
    warningLightIndicators: string[];
};

type RentalData = {
    _id: string;
    renterName: string;
    renterEmail: string;
    renterPhone: string;
    dateRentedOut: string;
    expectedReturnDate: string;
    actualReturnDate?: string;
    rentalRatePerDay: number;
    notes: string;
};

const ViewCar = () => {
    const { carId } = useParams<{ carId: string }>();

    const navigate = useNavigate();
    const [carData, setCarData] = useState<Car | null>(null);
    const [rentalData, setRentalData] = useState<RentalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string>('');

    const carTypeOptions: { [key: string]: string } = {
        sedan: 'Sedan',
        suv: 'SUV',
        truck: 'Truck',
        coupe: 'Coupe',
        convertible: 'Convertible',
        hatchback: 'Hatchback',
        van: 'Van',
        motorcycle: 'Motorcycle',
        other: 'Other'
    };

    const rentalStatusOptions: { [key: string]: string } = {
        available: 'Available',
        rented: 'Rented',
        maintenance: 'Maintenance'
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'available':
                return 'bg-green-600 text-green-100';
            case 'rented':
                return 'bg-red-500 text-red-100';
            case 'maintenance':
                return 'bg-yellow-500 text-black';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    useEffect(() => {
        (async () => {
            console.log("Fetching data for car ID:", carId);
            try {
                setLoading(true);

                const carRes = await axios.get<{ success: boolean; cars: Car[] }>(buildPath('api/car'));
                const car = carRes.data?.cars?.filter(c => c._id === carId?.trim())[0];
                console.log("same:" , carId, car?._id);
                if (car) {
                    setCarData(car);
                } else {
                    setMessage('Car not found.');
                    setCarData(null);
                    return;
                }
                // Get rental info if car is rented
                try {
                    const rentRes = await axios.get(buildPath(`api/rental/${carId}`));
                    const rentals = rentRes.data?.rentals;
                    if (Array.isArray(rentals) && rentals.length > 0) {
                        setRentalData(rentals[0]);
                    }
                } catch (err) {
                    console.error(err);
                    console.log('No rental data found for this car');
                }
            } catch (err) {
                console.error(err);
                setMessage('Unable to load car data.');
            } finally {
                setLoading(false);
            }
        })();
    }, [carId]);

    const formatDate = (dateString: string): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="card max-w-2xl mx-auto p-6" style={{ minWidth: 320 }}>
                <div className='text-center text-sm'>Loading...</div>
            </div>
        );
    }

    if (!carData) {
        return (
            <div className="card max-w-2xl mx-auto p-6" style={{ minWidth: 320 }}>
                <div className='text-center text-sm text-red-600'>{message || 'Car not found.'}</div>
                <div className='pt-4 text-center'>
                    <button className='px-4 py-2 bg-white border hover:bg-gray-50' onClick={() => navigate('/cars')}>
                        Back to Cars
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card max-w-2xl mx-auto p-6 relative" style={{ minWidth: 320 }}>
            <div className='absolute right-4 top-4'>
                <button className='px-3 py-2 bg-white border hover:bg-gray-50 flex items-center gap-2' onClick={() => navigate('/cars')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
            </div>

            <div className='text-center'>
                <strong className='text-2xl font-bold'>View Car</strong>
            </div>

            <hr className='my-4' />
            <div className="flex justify-center">
                <img src={new URL(`../resources/icons/${carData.carType+'.png'}`, import.meta.url).href} alt={carData.carType} className="h-32"/>
            </div>
            

            <div className='text-lg font-semibold'>Car Information</div>

            <div className='pt-4'>
                <label className='block text-sm text-gray-600 font-medium'>License Plate</label>
                <div className='p-3 bg-gray-50 rounded border'>{carData.licensePlate}</div>
            </div>

            <div className='grid grid-cols-2 gap-4 pt-4'>
                <div>
                    <label className='block text-sm text-gray-600 font-medium'>Year</label>
                    <div className='p-3 bg-gray-50 rounded border'>{carData.year}</div>
                </div>
                <div>
                    <label className='block text-sm text-gray-600 font-medium'>Mileage</label>
                    <div className='p-3 bg-gray-50 rounded border'>{carData.mileage.toLocaleString()} miles</div>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4 pt-4'>
                <div>
                    <label className='block text-sm text-gray-600 font-medium'>Make</label>
                    <div className='p-3 bg-gray-50 rounded border'>{carData.make}</div>
                </div>
                <div>
                    <label className='block text-sm text-gray-600 font-medium'>Model</label>
                    <div className='p-3 bg-gray-50 rounded border'>{carData.model}</div>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4 pt-4'>
                <div>
                    <label className='block text-sm text-gray-600 font-medium'>Color</label>
                    <div className='p-3 bg-gray-50 rounded border'>{carData.color}</div>
                </div>
                <div>
                    <label className='block text-sm text-gray-600 font-medium'>Vehicle Identification Number</label>
                    <div className='p-3 bg-gray-50 rounded border'>{carData.vehicleIdentificationNumber}</div>
                </div>
            </div>

            <div className='pt-4'>
                <label className='block text-sm text-gray-600 font-medium mb-2'>Car Type</label>
                <div className='p-3 bg-gray-50 rounded border inline-block'>
                    {carTypeOptions[carData.carType] || carData.carType}
                </div>
            </div>

            <div className='pt-4'>
                <label className='block text-sm text-gray-600 font-medium mb-2'>Rental Status</label>
                <div className={`p-3 rounded border inline-block font-medium ${getStatusColor(carData.rentalStatus)}`}>
                    {carData.rentalStatus ? (rentalStatusOptions[carData.rentalStatus] || carData.rentalStatus) : 'N/A'}
                </div>
            </div>

            {carData.warningLightIndicators && carData.warningLightIndicators.length > 0 && (
                <div className='pt-4'>
                    <div className='font-medium mb-2'>Mechanical/Electrical Issues</div>
                    <div className='space-y-2'>
                        {carData.warningLightIndicators.map((issue, idx) => (
                            <div key={idx} className='p-3 bg-yellow-50 border border-yellow-200 rounded'>
                                <span className='text-sm'>• {issue}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {carData.rentalStatus === 'rented' && rentalData && (
                <div>
                    <hr className='my-4' />

                    <div className='text-lg font-semibold'>Rental Information</div>

                    <div className='pt-3'>
                        <label className='block text-sm text-gray-600 font-medium'>Renter Name</label>
                        <div className='p-3 bg-gray-50 rounded border'>{rentalData.renterName}</div>
                    </div>

                    <div className='grid grid-cols-2 gap-4 pt-3'>
                        <div>
                            <label className='block text-sm text-gray-600 font-medium'>Renter Email</label>
                            <div className='p-3 bg-gray-50 rounded border'>{rentalData.renterEmail}</div>
                        </div>
                        <div>
                            <label className='block text-sm text-gray-600 font-medium'>Renter Phone</label>
                            <div className='p-3 bg-gray-50 rounded border'>{rentalData.renterPhone}</div>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4 pt-3'>
                        <div>
                            <label className='block text-sm text-gray-600 font-medium'>Date Rented Out</label>
                            <div className='p-3 bg-gray-50 rounded border'>{formatDate(rentalData.dateRentedOut)}</div>
                        </div>
                        <div>
                            <label className='block text-sm text-gray-600 font-medium'>Expected Return</label>
                            <div className='p-3 bg-gray-50 rounded border'>{formatDate(rentalData.expectedReturnDate)}</div>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4 pt-3'>
                        <div>
                            <label className='block text-sm text-gray-600 font-medium'>Rate Per Day</label>
                            <div className='p-3 bg-gray-50 rounded border'>${rentalData.rentalRatePerDay.toFixed(2)}</div>
                        </div>
                        <div>
                            <label className='block text-sm text-gray-600 font-medium'>Actual Return</label>
                            <div className='p-3 bg-gray-50 rounded border'>{rentalData.actualReturnDate ? formatDate(rentalData.actualReturnDate) : 'Not yet returned'}</div>
                        </div>
                    </div>

                    {rentalData.notes && (
                        <div className='pt-3'>
                            <label className='block text-sm text-gray-600 font-medium'>Notes</label>
                            <div className='p-3 bg-gray-50 rounded border whitespace-pre-wrap'>{rentalData.notes}</div>
                        </div>
                    )}
                </div>
            )}

            <div className='pt-6 flex gap-4'>
                <button
                    className='flex-1 bg-linear-65 from-[var(--primary)] to-[var(--muted)] flex items-center justify-center gap-2'
                    onClick={() => navigate(`/cars/${carId}`)}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit Car
                </button>
                <button
                    className='flex-1 px-4 py-2 bg-white border hover:bg-gray-50'
                    onClick={() => navigate('/cars')}
                >
                    Back to List
                </button>
            </div>
        </div>
    );
};

export default ViewCar;