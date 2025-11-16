import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { buildPath } from '../utils/Path';

import AvailableIcon from '../resources/icons/available.png';
import RentedIcon from '../resources/icons/rented.png';
import MaintenanceIcon from '../resources/icons/maintenance.png';
import LicensePlate from '../resources/icons/license_plate.png';
import Odometer from '../resources/icons/odometer.png';
import Keys from '../resources/icons/keys.png';
import Calendar from '../resources/icons/calendar.png';

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

type RenterInfo = {
    renterName: string;
    dateRentedOut: string;
    expectedReturnDate: string;
    _id?: string; // Rental ID for updates
};

interface CarCardProps {
    car: Car;
    onDelete: () => void;
}

const CarCard = ({car, onDelete} : CarCardProps) => {
    const navigate = useNavigate();
    const [renter, setRenter] = useState<RenterInfo | null>(null);

    const doDelete = async () => {
        try {
            // First delete all rentals associated with this car
            try {
                await axios.delete(buildPath(`api/rental/car/${car._id}`));
            } catch (err) {
                // Ignore 404 errors (no rentals found)
                if (!(err instanceof AxiosError) || err.response?.status !== 404) {
                    throw err;
                }
            }

            // Then delete the car
            await axios.delete(buildPath(`api/car/${car._id}`));

            onDelete();
        } catch (err) {
            console.error('Error during deletion:', err);
 
        } finally {
            console.log('Deletion process completed.');
        }
    };

    useEffect(() => {
        try{
            if(car.rentalStatus !== 'rented') return;
            const fetchRentalInfo = async () => {
                // Any side effects if needed
                const rentRes = await axios.get(buildPath(`api/rental/${car._id}`));
                const rentals = rentRes.data?.rentals;
                const currentRental = rentals[0];
                console.log(currentRental);
                setRenter({
                    renterName: currentRental.renterName ?? '',
                    dateRentedOut: currentRental.dateRentedOut ? new Date(currentRental.dateRentedOut).toISOString().slice(0, 10) : '',
                    expectedReturnDate: currentRental.expectedReturnDate ? new Date(currentRental.expectedReturnDate).toISOString().slice(0, 10) : '',
                    _id: currentRental._id
                });
            };
            fetchRentalInfo();
        }
        catch(err){
            console.error('Error fetching rental info:', err);
        }
        

    }, []);

    useEffect(() => {
        if(renter) {
            console.log('Renter info updated:', renter);
        }
    }, [renter]);
    
    const reformatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    const compareDates = ( dateStr: string) => {
        const date1 = new Date();
        const date2 = new Date(dateStr);
        return date1.getTime() - date2.getTime();
    }

    
    return (
        <div key={car._id} className="relative bg-white rounded-lg shadow-md p-4 pl-3 pb-2">
            <div className="absolute top-0 right-0">
                <div className="group relative">
                    <div className="p-2 transition bg-transparent hover:bg-transparent focus:outline-none">
                        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </div>
                    <div className="absolute right-0 mt-0 w-48 bg-gray-50 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <div onClick={() => navigate(`/cars/${car._id}`)} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-200 cursor-pointer">View Data</div>
                        <div className="border-t mx-2 border-gray-300"></div>
                        <div onClick={() => navigate(`/cars/${car._id.toString()}`)} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-200 cursor-pointer">Edit Data</div>
                        <div onClick={() => {if(confirm('Delete this car?')) { doDelete() }}} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer">Delete</div>
                    </div>
                </div>
            </div>
            <div className="flex justify-between w-full gap-4">
                <div>
                    <h3 className="text-xl font-semibold">{car.make} {car.model}</h3>
                    <h3 className="text-md font-medium">{car.year} {car.color} {car.carType.charAt(0).toUpperCase() + car.carType.slice(1)}</h3>
                    <div className="space-y-1">
                        <div className="flex gap-2 items-center"> 
                            <img src={LicensePlate} alt="license" className="w-6" />
                            <p>{car.licensePlate}</p>
                        </div>
                        <div className="flex gap-2 items-center"> 
                            <img src={Odometer} alt="mileage" className="w-6" />
                            <p>{car.mileage.toLocaleString('en-US')} miles</p>
                        </div>
                        
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <img src={new URL(`../resources/icons/${car.carType+'.png'}`, import.meta.url).href} alt={car.carType} className="h-24"/>
                    <div className={`text-sm px-4 py-1 text-white text-center rounded-full grid place-items-center  ${
                    car.rentalStatus === 'available' ? 'bg-green-600' :
                    car.rentalStatus === 'rented' ? 'bg-red-500' :
                    'bg-yellow-500'
                    }`}>
                        <img src={
                            car.rentalStatus === 'available' ? AvailableIcon : 
                            car.rentalStatus === 'rented' ? RentedIcon :
                            MaintenanceIcon}
                        alt="" className="invert h-5 w-5"/>
                        <p className='w-20 text-center'>{car.rentalStatus.charAt(0).toUpperCase() + car.rentalStatus.slice(1)}</p>
                    </div>
                    
                </div>
            </div>

            <div className="flex items-center gap-4 my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-gray-500 font-medium text-sm">Renter Information</span>
                <div className="flex-1 border-t border-gray-300"></div>
            </div>
            
            <div className="mt-4 space-y-3 h-24">
                {car.rentalStatus === 'rented' && renter && (
                    <>
                        <div className="flex gap-2 items-center"> 
                            <img src={Keys} alt="rented" className="w-5" />
                            <p className="text-sm font-medium">{renter.renterName}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <img src={Calendar} alt="due date" className="w-5" />
                            <div className="flex flex-col gap-1 text-sm">
                                <div className="flex gap-2">
                                    <span className="bg-blue-50 border border-blue-200 rounded px-2 py-1">{reformatDate(renter.dateRentedOut)}</span>
                                    <span className="text-gray-400">→</span>
                                    <span className="bg-blue-50 border border-blue-200 rounded px-2 py-1">{reformatDate(renter.expectedReturnDate)}</span>
                                </div>
                                <div>
                                    {compareDates(renter.expectedReturnDate) > 0 ? (
                                        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 font-semibold text-xs rounded-full border border-red-300">Overdue</span>
                                    ) : (
                                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 font-semibold text-xs rounded-full border border-green-300">On Time</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {car.rentalStatus === 'rented' && !renter && (
                    <p className="text-gray-400 text-sm italic">No renter information available</p>
                )}
                {car.rentalStatus !== 'rented' && (
                    <p className="text-gray-400 text-sm italic">No renter information available. This vehicle is not rented currently.</p>
                )}
            </div>
        </div>
  )
}

export default CarCard;