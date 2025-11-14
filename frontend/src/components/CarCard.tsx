import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

const CarCard = (car: Car) => {
    const navigate = useNavigate();
    const [renter, setRenter] = useState<RenterInfo | null>(null);

    useEffect(() => {
        try{
            if(car.rentalStatus !== 'rented') return;
            const fetchRentalInfo = async () => {
                // Any side effects if needed
                const rentRes = await axios.get(buildPath(`api/rental/${car._id}?current=true`));
                const rentals = rentRes.data?.rentals;
                const currentRental = rentals[0];
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
        <div key={car._id} className="relative flex justify-between bg-white rounded-lg shadow-md p-4 pl-3 pb-2">
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
                    {car.rentalStatus === 'rented' && renter ?
                    <>
                        <div className="flex gap-2 items-center"> 
                            <img src={Keys} alt="rented" className="w-6" />
                            <p className="">{renter.renterName}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <img src={Calendar} alt="due date" className="w-6" />
                            <div className="flex flex-col xl:flex-row gap-1 items-center whitespace-nowrap">
                                <p className="bg-gray-300 rounded-lg p-1">{reformatDate(renter.dateRentedOut)}</p>
                                <p className="hidden xl:block">-</p>
                                <p className="bg-gray-300 rounded-lg p-1">{reformatDate(renter.expectedReturnDate)}</p>
                            </div>
                        </div>
                    </>
                    :
                    null
                    }
                </div>
                
                <div className="mt-4 flex gap-2">
                {/* <button 
                    onClick={() => navigate(`/cars/${car._id.toString()}`)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">
                    Edit
                </button> */}
            </div>
            </div>
            <div className="flex flex-col items-center">
                <img src={new URL(`../resources/icons/${car.carType+'.png'}`, import.meta.url).href} alt={car.carType} className="h-24"/>
                <div className={`text-sm px-4 py-1 text-white text-center rounded-full grid place-items-center ${
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
                {car.rentalStatus === 'rented' ? 
                    compareDates(renter ? renter.expectedReturnDate : '') > 0 ?
                        <p className="mt-2 text-red-600 font-bold text-center">Overdue</p>
                        :
                        <p className="mt-2 text-green-600 font-bold text-center">On Time</p>
                    :
                    null
                }
            </div>
            
        </div>
  )
}

export default CarCard;